import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 環境變數
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// 輔助函式：嘗試從文字中抓 JSON
function tryParseJSON(text: string, defaultValue: any = {}) {
  if (!text) return defaultValue;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return defaultValue;
  }
}

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

      // 5️⃣ 快速讀經（保持不動）
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

        const parsedResult = tryParseJSON(response.text, {
          analysis: 'AI 暫無回應',
          application: 'AI 暫無回應',
          prayer: 'AI 暫無回應'
        });

        result = {
          analysis: parsedResult.analysis,
          application: parsedResult.application,
          prayer: parsedResult.prayer
        };
        break;
      }

      // 6️⃣ 福音卡片（避開重複經文版本）
      case 'jesusSaidCard': {
        const exclude = payload?.excludeVerses || [];

        const prompt = `
生成一張福音卡片（繁體中文），請回傳有效 JSON：
{
  "verse": "經文（書卷章節）",
  "message": "耶穌今日對你說的話",
  "prayer": "對應禱告"
}
注意：
1. verse 欄位請包含完整經文與章節，例如 "該章節經文內容（詩篇121:7）"。
2. message 與 prayer 必須根據該經文內容撰寫。
3. 請勿重複以下經文：${exclude.length > 0 ? exclude.join('、') : '（目前無已抽過經文）'}。
4. 請確保輸出內容為乾淨 JSON，不要多餘文字、說明或換行。
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const parsedResult = tryParseJSON(response.text, {});
        result = {
          verse: parsedResult.verse || '今日經文暫無',
          message: parsedResult.message || '耶穌對你說暫無內容',
          prayer: parsedResult.prayer || '回應禱告暫無'
        };
        break;
      }

      // 7️⃣ 小組討論題目生成
      case 'smallGroupTopics': {
        const scripture = payload?.scripture || '';
        if (!scripture) {
          return res.status(400).json({ error: '請提供 scripture 參數' });
        }

        const prompt = `
你是一位小組長的得力助手。請根據以下經文章節，提供 3 個有意義、有深度，但是簡潔扼要、言簡意賅，且明確且能引發思考的小組討論問題（使用繁體中文）。
請確保問題是開放式的，能鼓勵成員分享個人經歷和見解。
經文章節：「${scripture}」
請以 JSON 陣列格式回傳，陣列中只包含問題字串。例如：["問題一？", "問題二？", "問題三？"]
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const topics = tryParseJSON(response.text, []);
        result = Array.isArray(topics) ? topics : [];
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
