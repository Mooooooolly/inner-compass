import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 🌟 根據妳的名單，使用最穩定的 2.5 系列作為文字大腦
const MODEL_TEXT = "gemini-2.5-flash"; 
// 🌟 根據名單，這才是 Nano Banana 2 的完整正式身分證
const MODEL_IMAGE = "models/gemini-3.1-flash-image-preview"; 

const PLANT_SPECIFICS: Record<string, string> = {
  "堅韌多肉": "a single, centered succulent with thick, overlapping leaves.",
  "探尋之蔓": "a lone, elegant vine winding upwards from the bottom.",
  "靜謐之蕨": "a single, symmetrical fern frond with delicate leaflets.",
  "輕盈苔蘚": "a soft, organic cluster of moss with tiny leafy textures.",
  "守護之木": "a graceful tree with organic, curving branches."
};

const PROMPT_BASE = `你是一位精通薩提爾成長模式的內在智慧教練。
分析數據並回傳 JSON 格式：
{
  "plant_name": "植物名稱",
  "weekly_insight": "120字內的文案",
  "turning_point": "描述本週深刻瞬間..."
}
數據：{WEEKLY_DATA}`;

export async function POST(req: NextRequest) {
  try {
    const { weeklyData } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    // --- 1. 生成文案 (使用 2.5-flash) ---
    const textModel = genAI.getGenerativeModel({ model: MODEL_TEXT });
    const textResult = await textModel.generateContent({
      contents: [{ role: "user", parts: [{ text: PROMPT_BASE.replace('{WEEKLY_DATA}', weeklyData) }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    // 強力解析 JSON，確保標籤被過濾
    const responseText = textResult.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const reportData = JSON.parse(cleanJson);
    
    let image_url = "";

    // --- 2. 生成圖片 (Nano Banana 2) ---
    try {
      const plantDesc = PLANT_SPECIFICS[reportData.plant_name] || PLANT_SPECIFICS["堅韌多肉"];
      const imagePrompt = `A delicate botanical watercolor of ${plantDesc}. #2D4628 lines, soft green washes, cream background #F9F9F7. Zen style.`;

      const imageModel = genAI.getGenerativeModel({ model: MODEL_IMAGE });
      const imageResult = await imageModel.generateContent(imagePrompt);
      
      const base64 = imageResult.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        image_url = `data:image/png;base64,${base64}`;
      }
    } catch (imgErr: any) {
      console.warn("🎨 圖片發芽失敗，但我們保住了文案內容:", imgErr.message);
    }

    return NextResponse.json({ ...reportData, image_url });

  } catch (error: any) {
    // 回傳詳細錯誤，讓妳在 Network 分頁能一眼抓出兇手
    return NextResponse.json({ 
      error: error.message,
      target_model: MODEL_TEXT 
    }, { status: 500 });
  }
}