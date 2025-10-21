import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function handler(event: any) {
  try {
    const { action, payload } = JSON.parse(event.body || '{}');

    if (!API_KEY) {
      return {
        statusCode: 200,
        body: JSON.stringify({ result: "AI 功能目前不可用。" })
      };
    }

    let result: any;

    switch (action) {
      // 產生情境禱告
      case 'situationalPrayer': {
        const prompt = `請根據以下的使用者情況，生成一段真誠、有同理心且帶有盼望的禱告詞（使用繁體中文）。情況：「${payload.situation || payload.highlights || ''}」`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        result = response.text;
        break;
      }

      // 產生經文解析
      case 'scriptureAnalysis': {
        const prompt = `請為以下經文生成經文摘要解析（使用繁體中文）：${payload.book} ${payload.chapter}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        result = response.text;
        break;
      }

      // 產生應用建議
      case 'applicationHelper': {
        const prompt = `請根據以下經文生成實用的應用建議（使用繁體中文）：${payload.book} ${payload.chapter}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        result = response.text;
        break;
      }

      // 快速讀經
      case 'quickRead': {
        const prompt = `你是一位聖經研究助理。請根據使用者輸入「${payload.userInput}」生成 JSON：{ analysis, application, prayer }`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                analysis: { type: Type.STRING },
                application: { type: Type.STRING },
                prayer: { type: Type.STRING }
              },
              required: ['analysis','application','prayer']
            }
          }
        });
        result = JSON.parse(response.text.trim());
        break;
      }

      // 福音卡片
      case 'jesusSaidCard': {
        const prompt = `生成福音卡片 JSON: {verse, message, prayer}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verse: { type: Type.STRING },
                message: { type: Type.STRING },
                prayer: { type: Type.STRING }
              },
              required: ['verse','message','prayer']
            }
          }
        });
        result = JSON.parse(response.text.trim());
        break;
      }

      default:
        return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ result }) };

  } catch (err: any) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'AI 生成失敗' }) };
  }
}

