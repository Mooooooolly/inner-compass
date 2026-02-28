import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_PRO = "gemini-2.5-pro";
const MODEL_FLASH = "gemini-2.5-flash"; // 備援模型，額度通常較大

const PROMPT_BASE = `你是一位精通薩提爾成長模式的內在智慧教練。
分析使用者過去一段時間的摘要數據，產出一段「導師叮嚀」。
要求：繁體中文，少於 50 字，務必確保句子完整結束，不要有未完結的語句，溫暖且具啟發性。直接回傳文字，不要標籤。

數據如下：
---
{WEEKLY_DATA}
---
`;

export async function POST(req: NextRequest) {
  try {
    const { weeklyData } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    const callModel = async (modelName: string) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: PROMPT_BASE.replace('{WEEKLY_DATA}', weeklyData) }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1500 },
      });
      return result.response.text();
    };

    try {
      // 嘗試 1：優先使用 Pro
      const mentor_prompt = await callModel(MODEL_PRO);
      return NextResponse.json({ mentor_prompt });
    } catch (error: any) {
      // 捕捉 429 或其他錯誤
      console.warn(`優先模型 ${MODEL_PRO} 請求失敗 (${error.status})，切換至備援模型...`);
      
      // 嘗試 2：使用 Flash 備援
      const mentor_prompt = await callModel(MODEL_FLASH);
      return NextResponse.json({ mentor_prompt, is_fallback: true });
    }

  } catch (error: any) {
    console.error("週報 API 徹底失敗:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}