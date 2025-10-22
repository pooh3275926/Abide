import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node'; // 導入 Vercel 類型

// 環境變數
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Vercel Serverless Function 的入口點
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Functions 預設會處理 POST 請求的 JSON body
  // 所以可以直接從 req.body 獲取 action 和 payload
  const { action, payload } = req.body;

  try {
    if (!API_KEY) {
      return res.status(200).json({ result: "AI 功能目前不可用。" });
    }

    let result: any;

    switch (action) {
      // 產生情境禱告
      case 'situationalPrayer': {
        const prompt = `請根據以下的使用者情況，生成一段真誠、有同理心且帶有盼望的禱告詞（使用繁體中文）。情況：「${payload.situation || payload.highlights || ''}」`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }], // 使用 Gemini 建議的內容格式
        });
        result = response.text;
        break;
      }

      // 產生經文解析
      case 'scriptureAnalysis': {
        const prompt = `請為以下經文生成摘要式的經文解析（使用繁體中文）：${payload.book} ${payload.chapter}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        result = response.text?.trim() || 'AI 生成失敗，請稍後再試';
        break;
      }

      // 產生應用建議
      case 'applicationHelper': {
        const prompt = `請根據以下經文生成實用的應用建議（使用繁體中文）：${payload.book} ${payload.chapter}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        result = response.text;
        break;
      }

      // 快速讀經
      case 'quickRead': {
        const prompt = `你是一位聖經研究助理。請根據使用者輸入（使用繁體中文）「${payload.userInput}」生成 JSON：{ analysis, application, prayer }`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { // config 應該是 generationConfig
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
        const prompt = `生成福音卡片（使用繁體中文） JSON: {verse, message, prayer}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { // config 應該是 generationConfig
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verse: { type: Type.STRING },
                message: { type: Type.STRING },
              },
              required: ['verse','message'] // 修正了這裡，prayer不是required，但在後端統一返回
            }
          }
        });
        // 確保結果是包含所有預期字段的對象，即使模型沒有全部生成
        const parsedResult = JSON.parse(response.text.trim());
        result = {
            verse: parsedResult.verse || '',
            message: parsedResult.message || '',
            prayer: parsedResult.prayer || '', // 即使 schema 中沒有，這裡也試圖獲取
        };
        break;
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(200).json({ result });

  } catch (err: any) {
    console.error(err);
    // 在 Vercel Function 中，使用 res.status().json() 返回錯誤
    return res.status(500).json({ error: err.message || 'AI 生成失敗' });
  }
}