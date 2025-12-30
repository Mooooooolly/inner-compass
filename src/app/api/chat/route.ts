import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, journalContent } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "金鑰尚未設定，請檢查 .env.local" }, { status: 500 });
    }

    // 🚀 使用您清單中確認可用的 "models/gemini-2.5-flash"
    // 注意：這裡直接將清單中的名稱拼接到 URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `你是一位溫暖、有洞察力的「內在探索教練」。
你的目標不是給建議或解決問題，而是透過「蘇格拉底式提問」，引導使用者自己探索內心。並且遵守 ICF 的教練準則。同時你擅長薩提爾的冰山理論、家族排列，以及後現代心理學中的敘事治療。

以下是使用者的日記內容，請以此為背景脈絡：
"""${journalContent}"""

對話守則：
1. 語氣溫柔支持，每次只問一個核心問題。
2. 答案簡短精準 (100字以內)。
3. 使用台灣繁體中文。

現在，請回應使用者的最新訊息：
"${message}"`
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json({ 
        reply: `連線發生錯誤 (${response.status})：${data.error?.message || '未知原因'}` 
      }, { status: response.status });
    }

    // 解析回傳資料
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "（教練正在深思...）";
    
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json({ reply: "系統連線異常，請稍後再試。" }, { status: 500 });
  }
}