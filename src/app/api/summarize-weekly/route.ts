import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-pro";

// 導師叮嚀提示詞
const PROMPT_BASE = `你是一位精通薩提爾成長模式 (Satir Growth Model) 的內在智慧教練。
你的任務是分析使用者過去一週的內在覺察摘要，從中洞察本週的成長趨勢，並給予一句溫暖、精煉、且能啟發持續反思的「導師叮嚀」。

這份摘要是基於使用者過去一週的日記，包含了他探索的「情緒標籤」與「主題關鍵字」。

請分析以下數據：
---
{WEEKLY_DATA}
---

請融合薩提爾冰山理論的智慧，產出一句「導師叮嚀」。這句話需要：
- 繁體中文，少於 50 字。
- 溫暖、有同理心，避免說教。
- 鼓勵使用者看見更深層的渴望或自我。
- 直接回傳這句話的純文字，不要包含任何標籤或引號。

例如：「看見期待落空的失落，底下是否藏著對『被愛』的渴望？」或「當『焦慮』一再出現，它想提醒你去看看哪個尚未被滿足的內在需求？」
`;

export async function POST(req: NextRequest) {
  try {
    const { weeklyData } = await req.json();

    if (!weeklyData) {
      return NextResponse.json({ error: "Weekly data is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.8,
      topK: 1,
      topP: 1,
      maxOutputTokens: 256,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const parts = [{ text: PROMPT_BASE.replace('{WEEKLY_DATA}', weeklyData) }];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const mentor_prompt = result.response.text();
    return NextResponse.json({ mentor_prompt });

  } catch (error: any) {
    console.error("Error in POST /api/summarize-weekly:", error);
    const status = error.status || 500;
    const message = error.message || "An internal server error occurred.";
    return NextResponse.json({ error: message }, { status });
  }
}
