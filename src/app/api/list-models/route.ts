import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // 只萃取我們關心的模型名稱與支援功能
    const models = data.models?.map((m: any) => ({
      name: m.name,
      displayName: m.displayName,
      supportedMethods: m.supportedGenerationMethods
    })) || [];

    return NextResponse.json({ 
      count: models.length,
      models: models 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}