import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateScriptureAnalysis = async (book: string, chapter: number): Promise<string> => {
  if (!API_KEY) return "AI 功能目前不可用。";
  try {
    const prompt = `請針對聖經 ${book} 第 ${chapter} 章，提供一段簡潔深刻的經文解析，幫助讀者理解其核心信息與背景。`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating scripture analysis:", error);
    return "無法生成經文解析，請稍後再試。";
  }
};

export const generateApplication = async (book: string, chapter: number): Promise<string> => {
  if (!API_KEY) return "AI 功能目前不可用。";
  try {
    const prompt = `根據聖經章節 ${book} 第 ${chapter} 章，為日常生活提供一個簡潔、鼓勵人心的實際應用建議。`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating application:", error);
    return "無法生成應用建議，請稍後再試。";
  }
};

export const generatePrayer = async (book: string, chapter: number, highlights: string): Promise<string> => {
  if (!API_KEY) return "AI 功能目前不可用。";
  try {
    const prompt = `根據聖經章節 ${book} 第 ${chapter} 章以及以下靈修亮光：「${highlights}」，生成一段真誠的禱告詞。`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating prayer:", error);
    return "無法生成禱告詞，請稍後再試。";
  }
};

export const generateSituationalPrayer = async (situation: string): Promise<string> => {
  if (!API_KEY) return "AI 功能目前不可用。";
  if (!situation.trim()) return "請輸入您的狀況。";
  try {
    const prompt = `請根據以下的使用者情況，生成一段真誠、有同理心且帶有盼望的禱告詞（使用繁體中文）。情況：「${situation}」`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating situational prayer:", error);
    return "無法生成禱告詞，請稍後再試。";
  }
};

export const generateRandomVerse = async (): Promise<string> => {
    if (!API_KEY) return "AI 功能目前不可用。";
    try {
      const prompt = `請隨機生成一句聖經金句（包含書卷、章節），風格簡潔有力。請直接回傳經文本身，不要加上任何多餘的文字、引言或解釋。`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating random verse:", error);
      return "無法生成經文，請稍後再試。";
    }
};

export const generateJesusSaidCard = async (): Promise<{ verse: string; message: string; prayer: string; }> => {
  if (!API_KEY) throw new Error("AI 功能目前不可用。");
  try {
    const prompt = `請生成一張福音卡片，包含三個部分：
1.  今日經文：隨機選擇一句來自聖經的、充滿鼓勵與盼望的經文。
2.  耶穌對你說：根據這句經文，以耶穌的第一人稱視角，對讀者說一段溫暖、個人化的鼓勵話語。
3.  回應禱告：根據這句經文，寫一段簡短的回應禱告。

請以繁體中文回答，並嚴格遵循以下的 JSON 格式。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: {
              type: Type.STRING,
              description: '一句充滿鼓勵與盼望的聖經經文，包含出處。例如：「凡勞苦擔重擔的人，可以到我這裏來，我就使你們得安息。（馬太福音 11:28）」'
            },
            message: {
              type: Type.STRING,
              description: '以耶穌的第一人稱視角，對讀者說的鼓勵話語。'
            },
            prayer: {
              type: Type.STRING,
              description: '一段簡短的回應禱告。'
            }
          },
          required: ['verse', 'message', 'prayer']
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating Jesus Said card:", error);
    throw new Error("無法生成卡片，請稍後再試。");
  }
};
