import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-pro";
const FALLBACK_MODEL_NAME = "gemini-1.5-flash";

const getModel = (modelName: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  return genAI.getGenerativeModel({ model: modelName });
};

// 薩提爾教練摘要提示詞
const PROMPT_BASE = `你是一位精通薩提爾成長模式 (Satir Growth Model) 的內在智慧教練。
你的任務是分析使用者昨天的日記內容，識別深層的情緒模式與成長洞察。

請針對以下日記內容進行分析：
---
{DIARY_CONTENT}
---

請直接回傳一個 JSON 物件，格式如下（請使用繁體中文，且不要包含任何 Markdown 標籤如 \`\`\`json）：

{
  "sentiment_tags": ["3個主要的情緒標籤"],
  "iceberg_depth": "說明覺察觸及冰山的哪個層次，僅限：'行為', '情緒', '觀點', '期待', '渴望', '自我'",
  "topic_keywords": ["3個核心關鍵字"]
}
`;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "內容是必填的" }, { status: 400 });
    }

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
      response_mime_type: "application/json",
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    
    const callApiModel = async (modelName: string) => {
      const model = getModel(modelName);
      const parts = [{ text: PROMPT_BASE.replace('{DIARY_CONTENT}', content) }];
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
      });
      return result.response.text();
    };

    let summaryJson;
    try {
      // First attempt with the primary model
      console.log(`Attempting to generate summary with ${MODEL_NAME}...`);
      summaryJson = await callApiModel(MODEL_NAME);
    } catch (error: any) {
      console.warn(`Model ${MODEL_NAME} failed. Attempting fallback to ${FALLBACK_MODEL_NAME}. Error:`, error.message);
      try {
        // Fallback attempt with the flash model
        console.log(`Attempting to generate summary with fallback model ${FALLBACK_MODEL_NAME}...`);
        summaryJson = await callApiModel(FALLBACK_MODEL_NAME);
      } catch (fallbackError: any) {
        console.error(`Fallback model ${FALLBACK_MODEL_NAME} also failed:`, fallbackError.message);
        // Throw the error from the fallback model to be caught by the outer catch block
        throw new Error(`Primary and fallback models failed. Last error: ${fallbackError.message}`);
      }
    }

    // The response from the model is already a JSON string due to response_mime_type.
    // We parse it to ensure it's valid JSON before sending it to the client.
    const parsedSummary = JSON.parse(summaryJson);
    return NextResponse.json(parsedSummary);

  } catch (error: any) {
    console.error("Error in POST /api/summarize:", error);
    const status = error.status || 500;
    const message = error.message || "An internal server error occurred.";
    return NextResponse.json({ error: message }, { status });
  }
}
