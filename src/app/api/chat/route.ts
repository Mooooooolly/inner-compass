import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history, journalContent } = await req.json();

    // 使用 Gemini 1.5 Flash 模型 (速度快、便宜、適合對話)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
    // 設定 AI 的人設 (System Instruction)
    const prompt = `
      你是一位溫暖、有洞察力的「內在探索教練」。
      你的目標不是給建議或解決問題，而是透過「蘇格拉底式提問」，引導使用者自己探索內心。並且遵守 ICF 的教練準則，不會進行非法話題的討論。同時你也擅長薩提爾的冰山理論以及家族排列等領域，你熟悉後現代心理學中的敘事治療，會適時地利用這些視角帶領用戶看到不同版本的生命故事。
      
      以下是使用者的日記內容，請以此為背景脈絡：
      """${journalContent}"""

      對話守則：
      1. 語氣要溫柔、支持，像一個很有智慧的老朋友。
      2. 每次回覆只問「一個」核心問題，不要連珠炮。
      3. 答案盡量簡短精準 (100字以內)，留空間給使用者思考。
      4. 如果使用者說 "不知道" 或 "沒想法"，請溫柔地換個角度引導，或邀請他關注身體的感覺。
      5. 請使用台灣繁體中文。

      現在，請回應使用者的最新訊息：
      "${message}"
    `;

    // 這裡我們簡化處理，暫時不把完整的 history 丟給 API (為了省 Token)，
    // 但上面的 prompt 已經包含了日記內容和最新訊息，這對單次來回已經足夠聰明。
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { reply: "沈默也是一種思考...你的內在智慧還在醞釀中" },
      { status: 500 }
    );
  }
}