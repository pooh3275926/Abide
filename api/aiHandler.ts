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
    const match = text.match(/\{[\s\S]*\}/);
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
你是一位熟悉聖經的屬靈輔導者，請生成一張福音卡片（繁體中文），格式如下：
{
  "verse": "經文內容（含章節）",
  "message": "耶穌今日對你說的話（根據經文解釋與應用）",
  "prayer": "回應禱告（以溫柔、真誠的語氣寫）"
}

規則：
1️⃣ verse 必須包含「經文原文」＋「章節」，例如：
   "verse": "若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。（哥林多後書 5:17）"
2️⃣ message 應該根據經文意思延伸，例如鼓勵、安慰或盼望。
3️⃣ prayer 應該自然回應這節經文。
4️⃣ 若使用者傳入 excludeVerses，請避免重複其中的經文：${exclude.join('、') || '無'}。
5️⃣ 請只回傳有效 JSON，不要加任何文字、說明或換行。
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
