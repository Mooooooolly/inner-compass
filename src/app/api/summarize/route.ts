import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// 根據 2026-02-25 獲取的可用模型清單進行對齊
const MODEL_NAME = "gemini-2.5-pro";      // 清單中的最新穩定 Pro 模型
const FALLBACK_MODEL_NAME = "gemini-2.5-flash"; // 清單中的最新穩定 Flash 模型

const getModel = (modelName: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  return genAI.getGenerativeModel({ model: modelName });
};

const PROMPT_BASE = `你是一位精通薩提爾成長模式的內在智慧教練。
你的任務是分析使用者昨天的日記內容，識別深層的情緒模式與成長洞察。

請針對以下內容進行分析：
---
{DIARY_CONTENT}
---

請直接回傳一個 JSON 物件，格式如下（使用繁體中文，不包含 Markdown 標籤）：

{
  "sentiment_tags": ["3個主要的情緒標籤"],
  "iceberg_depth": "僅限：'行為', '情緒', '觀點', '期待', '渴望', '自我'",
  "topic_keywords": ["3個核心關鍵字"]
}
`;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "內容是必填的" }, { status: 400 });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
      response_mime_type: "application/json",
    };

    const callApiModel = async (modelName: string) => {
      const model = getModel(modelName);
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: PROMPT_BASE.replace('{DIARY_CONTENT}', content) }] }],
        generationConfig,
      });
      return result.response.text();
    };

    try {
      const summaryJson = await callApiModel(MODEL_NAME);
      return NextResponse.json(JSON.parse(summaryJson));
    } catch (error: any) {
      console.warn(`優先模型 ${MODEL_NAME} 失敗，嘗試備援。`);
      const summaryJson = await callApiModel(FALLBACK_MODEL_NAME);
      return NextResponse.json(JSON.parse(summaryJson));
    }
  } catch (error: any) {
    console.error("API 錯誤:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}