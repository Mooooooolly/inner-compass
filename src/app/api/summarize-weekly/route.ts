import { GoogleGenerativeAI, Part, Content, GenerateContentResponse, FinishReason, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to extract JSON from markdown more robustly
function extractJsonFromMarkdown(text: string): string {
  return text.replace(/```json|```/g, "").trim();
}

// Type guards
function isInlineData(part: Part): part is { inlineData: { mimeType: string; data: string } } {
    return 'inlineData' in part && part.inlineData !== null && typeof part.inlineData === 'object';
}
function hasContent(candidate: any): candidate is { content: Content } {
    return 'content' in candidate && candidate.content !== null && typeof candidate.content === 'object';
}

// Error response helper
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

    // 1. Text Generation
    console.log("Attempting text generation with models/gemini-2.5-flash...");
    const textModel = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    const textPrompt = `
    Analyze the following weekly user journal data. Based on the data, generate a real-world plant name (in Traditional Chinese only, no pinyin) that metaphorically represents the user's emotional journey for the week. Also, provide a concise visual description (in English) for a botanical illustration of this plant, a 50-word insightful text (in Traditional Chinese), and a turning point moment. The output must be a valid JSON object.

    **Weekly Data:**
    ${weeklyData}

    **JSON Output Format:**
    \`\`\`json
    {
      "plant_name": "[一個真實存在的植物中文名，不要附上拼音]",
      "visual_description": "[給繪圖工具的英文視覺描述]",
      "weekly_insight": "[50字文案]",
      "turning_point": "[轉折點]"
    }
    \`\`\`
    `;
    
    const textResult = await textModel.generateContent(textPrompt);
    const textResponse = await textResult.response;
    const rawText = textResponse.text();
    const jsonText = extractJsonFromMarkdown(rawText);
    const analysis = JSON.parse(jsonText);
    console.log("Text generation successful.");

    // 2. Image Generation with Nano Banana 2, relaxed safety, and robust data extraction
    let imageUrl = ''; 
    try {
        console.log("Attempting image generation with models/gemini-3.1-flash-image-preview...");
        const imageModel = genAI.getGenerativeModel({ model: 'models/gemini-3.1-flash-image-preview' });
        const imagePrompt = `A delicate botanical watercolor illustration of ${analysis.visual_description}. Organic, hand-drawn fine-line art in deep green #2D4628, soft transparent watercolor washes in low-saturation greens, warm cream background #F9F9F7, minimalist zen style.`;
        
        const safetySettings = [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        const imageResult = await imageModel.generateContent({ contents: [{ role: 'user', parts: [{ text: imagePrompt }] }], safetySettings });

        const candidates = imageResult.response.candidates;
        if (candidates && candidates[0]?.content?.parts) {
            const imagePart = candidates[0].content.parts.find(p => isInlineData(p));
            if (imagePart && isInlineData(imagePart)) { // Type guard check
                imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                console.log('Generated image_url start:', imageUrl.substring(0, 40)); // Debug Log
            }
        }
    } catch (error: any) {
        console.error("Image generation failed. This might be a 429 quota error or a content policy issue. Returning empty image_url.", error.message);
    }
    
    // 3. Combine and Respond
    const finalResponse = {
        ...analysis,
        image_url: imageUrl
    };

    return new Response(JSON.stringify(finalResponse), { status: 200 });

  } catch (error: any) {
    return createErrorResponse('Failed to generate weekly summary', 500, error.message);
  }
}
