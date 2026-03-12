import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to extract JSON from markdown more robustly
function extractJsonFromMarkdown(text: string): string {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : text.trim();
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

    // 1. Text Generation with new constraints
    console.log("Attempting text generation with models/gemini-2.0-flash...");
    const textModel = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });

    const validPlantKeys = ["succulent", "sunflower", "fern", "vine", "silk_tree", "ancient_tree", "rose", "pine", "bamboo", "sprout"];

    const textPrompt = `
    Analyze the following weekly user journal data. Your task is to select a plant that metaphorically represents the user's emotional journey for the week.

    You MUST choose a 'plant_key' from this exact list: ${JSON.stringify(validPlantKeys)}.

    Based on your choice, provide the corresponding Traditional Chinese plant name and a concise, insightful text (within 120 characters) in Traditional Chinese.

    The output must be a valid JSON object with ONLY the following three keys: "plant_key", "plant_name", and "weekly_insight". Do not include any other fields.

    **Weekly Data:**
    ${weeklyData}

    **JSON Output Format:**
    '''json
    {
      "plant_key": "[從提供的列表中選擇的英文標籤]",
      "plant_name": "[對應的植物中文名]",
      "weekly_insight": "[120字內的精煉文案]"
    }
    '''
    `;

    const textResult = await textModel.generateContent(textPrompt);
    const textResponse = await textResult.response;
    const rawText = textResponse.text();
    const jsonText = extractJsonFromMarkdown(rawText);
    const analysis = JSON.parse(jsonText);
    console.log("Text generation successful. Received:", analysis);

    // 2. Validate the response to ensure stability
    if (!analysis.plant_key || !validPlantKeys.includes(analysis.plant_key)) {
        console.error("Validation Error: 'plant_key' is missing or invalid. Falling back to default.", analysis);
        analysis.plant_key = 'sprout'; // Safe fallback
        analysis.plant_name = analysis.plant_name || '新芽';
        analysis.weekly_insight = analysis.weekly_insight || '即使在不明朗的一週，新的開始仍在醞釀。';
    }

    // 3. Respond with the generated text analysis
    return new Response(JSON.stringify(analysis), { status: 200 });

  } catch (error: any) {
    return createErrorResponse('Failed to generate weekly summary', 500, error.message);
  }
}
