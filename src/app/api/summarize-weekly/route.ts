import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_PRO = "gemini-2.5-pro";
const MODEL_FLASH = "gemini-2.5-flash";

const PROMPT_BASE = `你是一位精通薩提爾成長模式的內在智慧教練。
你的任務是分析使用者過去一週的內在覺察數據，為其生成一份週度「內在溫室 (The Inner Greenhouse)」報告。

### 1. 植物判定規則 (Trigger Mapping)：
根據數據中的關鍵字權重，選定以下五種植物之一：
- 堅韌多肉 (Succulent)：關鍵字偏向 工作、壓力、成就感、專業認同。
- 探尋之蔓 (Seeking Vine)：關鍵字偏向 關係、衝突、渴望連結、溝通、認同。
- 靜謐之蕨 (Quiet Fern)：關鍵字偏向 自我懷疑、遺憾、憂鬱、恐懼、覺察。
- 輕盈苔蘚 (Airy Moss)：關鍵字偏向 創意、靈感、生活實驗、自由、好奇。
- 守護之木 (Guardian Oak)：關鍵字偏向 核心價值觀、邊界感、誠實、勇氣。

### 2. 分析數據並轉換敘事：
- 將日記次數轉化為「灌溉」。
- 語氣需具備『洞察力』而非『分析感』。

### 3. 輸出規範：
請直接回傳一個 JSON 物件（不要包含 Markdown 標籤）：
{
  "plant_name": "植物名稱",
  "weekly_insight": "120字內的英雄之旅文案",
  "turning_point": "描述本週最深刻的瞬間..."
}

數據如下：
---
{WEEKLY_DATA}
---
`;

export async function POST(req: NextRequest) {
  try {
    const { weeklyData } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const generationConfig = { temperature: 0.8, response_mime_type: "application/json" };

    const callModel = async (modelName: string) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: PROMPT_BASE.replace('{WEEKLY_DATA}', weeklyData) }] }],
        generationConfig,
      });
      return result.response.text();
    };

    try {
      const response = await callModel(MODEL_PRO);
      return NextResponse.json(JSON.parse(response));
    } catch (error: any) {
      const response = await callModel(MODEL_FLASH);
      return NextResponse.json(JSON.parse(response));
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}