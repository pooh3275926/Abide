import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 環境變數
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action, payload } = req.body || {};

  if (!action || !payload) {
    return res.status(400).json({ error: 'Missing action or payload' });
  }

  try {
    if (!API_KEY) {
      return res.status(200).json({ result: "AI 功能目前不可用。" });
    }

    let result: any;

    switch (action) {
      // 1️⃣ 使用者情境禱告
      case 'situationalPrayer': {
        const situationText = payload.situation || payload.highlights || '無特定情況';
        const prompt = `請根據以下使用者情況生成一段真誠、有同理心且帶有盼望的禱告詞（繁體中文）：${situationText}`;
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        result = response.text?.trim() || '生成禱告時發生錯誤，請稍後再試';
        break;
      }

      // 2️⃣ 靈修禱告（經文 + 亮光）
      case 'devotionalPrayer': {
        const book = payload.book || '';
        const chapter = payload.chapter || '';
        const highlightsText = payload.highlights || '無特定亮光';
        const prompt = `根據聖經章節 ${book} 第 ${chapter} 章以及以下靈修亮光：「${highlightsText}」，生成一段真誠、有同理心且帶有盼望的禱告詞（繁體中文）。`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        result = response.text?.trim() || '生成禱告時發生錯誤，請稍後再試';
        break;
      }

      // 3️⃣ 經文解析
      case 'scriptureAnalysis': {
        const book = payload.book || '';
        const chapter = payload.chapter || '';
        const prompt = `請為以下經文生成摘要式的經文解析（繁體中文）：${book} ${chapter}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        result = response.text?.trim() || 'AI 生成失敗，請稍後再試';
        break;
      }

      // 4️⃣ 應用建議
      case 'applicationHelper': {
        const book = payload.book || '';
        const chapter = payload.chapter || '';
        const prompt = `請根據以下經文生成實用的應用建議（繁體中文）：${book} ${chapter}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        result = response.text?.trim() || 'AI 生成失敗，請稍後再試';
        break;
      }

      // 5️⃣ 快速讀經（只改這個）
      case 'quickRead': {
        const userInput = payload.userInput || '';
        const prompt = `
你是一位聖經研究助理。
請根據使用者輸入（繁體中文）「${userInput}」生成 JSON：
{
  "analysis": "提供經文摘要與解析",
  "application": "提供實用應用建議",
  "prayer": "提供對應禱告"
}
請確保整個回傳內容是有效 JSON，不要加多餘文字或說明。
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        // 使用正則抓取 {} 內的 JSON，避免多餘文字導致解析失敗
        const match = response.text?.match(/\{[\s\S]*\}/);
        let parsedResult: any = {};
        try {
          parsedResult = match ? JSON.parse(match[0]) : {};
        } catch {
          parsedResult = {};
        }

        result = {
          analysis: parsedResult.analysis || 'AI 暫無回應',
          application: parsedResult.application || 'AI 暫無回應',
          prayer: parsedResult.prayer || 'AI 暫無回應'
        };
        break;
      }

      // 6️⃣ 福音卡片
      case 'jesusSaidCard': {
        const prompt = `生成福音卡片（繁體中文） JSON: {verse, message, prayer}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verse: { type: Type.STRING },
                message: { type: Type.STRING },
                prayer: { type: Type.STRING }
              }
            }
          }
        });

        let parsedResult: any = {};
        try {
          parsedResult = JSON.parse(response.text?.trim() || '{}');
        } catch {
          parsedResult = {};
        }

        result = {
          verse: parsedResult.verse || '',
          message: parsedResult.message || '',
          prayer: parsedResult.prayer || ''
        };
        break;
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(200).json({ result });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'AI 生成失敗' });
  }
}
