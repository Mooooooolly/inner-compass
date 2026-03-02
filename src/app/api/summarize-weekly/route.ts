import { GoogleGenerativeAI, Part, Content, GenerateContentResponse, FinishReason } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to extract JSON from markdown
function extractJsonFromMarkdown(text: string): string {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  return match ? match[1] : text;
}

// Type guard for fileData
function isFileData(part: Part): part is { fileData: { mimeType: string; fileUri: string } } {
    return 'fileData' in part && part.fileData !== null && typeof part.fileData === 'object';
}

// Type guard for content
function hasContent(candidate: any): candidate is { content: Content } {
    return 'content' in candidate && candidate.content !== null && typeof candidate.content === 'object';
}

// A more detailed error response
function createErrorResponse(message: string, status: number, details?: any) {
    console.error('API Error:', message, details || '');
    return new Response(JSON.stringify({ error: message, details }), { status });
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return createErrorResponse('API key not configured', 500);
  }

  try {
    const { weeklyData } = await req.json();

    const modelName = 'gemini-2.5-flash'; 
    const model = genAI.getGenerativeModel({ model: modelName });

    // 1. Text Generation
    const textPrompt = `
    Analyze the following weekly user journal data. Based on the data, generate a unique and creative plant name that metaphorically represents the user's emotional journey for the week. Also, provide a concise visual description (in English) for a botanical illustration of this plant, a 80-word insightful text (in Traditional Chinese), and a turning point moment. The output must be a valid JSON object, enclosed in markdown format (\`\`\`json ... \`\`\`).

    **Weekly Data:**
    ${weeklyData}

    **JSON Output Format:**
    \`\`\`json
    {
      "plant_name": "[自創植物名]",
      "visual_description": "[給繪圖工具的英文視覺描述]",
      "weekly_insight": "[80字文案]",
      "turning_point": "[轉折點]"
    }
    \`\`\`
    `;

    const textResult = await model.generateContent(textPrompt);
    const textResponse = await textResult.response;
    if (textResponse.promptFeedback?.blockReason) {
        return createErrorResponse('Text generation blocked', 500, { reason: textResponse.promptFeedback.blockReason });
    }

    const rawText = textResponse.text();
    const jsonText = extractJsonFromMarkdown(rawText);
    let analysis;
    try {
        analysis = JSON.parse(jsonText);
    } catch(e: any) {
        return createErrorResponse('Failed to parse JSON from text model', 500, { error: e.message, rawText, jsonText });
    }
    
    // 2. Image Generation Attempt with Graceful Fallback
    const imagePrompt = `A delicate botanical watercolor illustration of ${analysis.visual_description}. Organic, hand-drawn fine-line art in deep green #2D4628, soft transparent watercolor washes in low-saturation greens, warm cream background #F9F9F7, minimalist zen style.`;
    
    const imageResult = await model.generateContent(imagePrompt);
    const imageResponse = await imageResult.response;

    let imageUrl = 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'; // Default placeholder

    const firstCandidate = imageResponse?.candidates?.[0];
    if (firstCandidate?.finishReason === FinishReason.STOP && hasContent(firstCandidate) && firstCandidate.content.parts.length > 0) {
        const firstPart = firstCandidate.content.parts[0];
        if (isFileData(firstPart)) {
            // Success! The model returned an actual image file.
            imageUrl = firstPart.fileData.fileUri;
        } else {
            // The model returned text instead of an image. Log it and use the placeholder.
            console.warn('Image generation model returned text instead of a file. Using placeholder. Text received:', (firstPart as any).text);
        }
    } else {
      // The generation failed for other reasons. Log it and use the placeholder.
      console.warn('Image generation failed or did not finish correctly. Using placeholder. Reason:', firstCandidate?.finishReason);
    }

    // 3. Combine and Respond
    const finalResponse = {
        ...analysis,
        image_url: imageUrl,
    };

    return new Response(JSON.stringify(finalResponse), { status: 200 });

  } catch (error: any) {
    return createErrorResponse('Failed to generate weekly summary', 500, error.message);
  }
}
