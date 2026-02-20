import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamGeminiResponse = async (
  prompt: string, 
  history: { role: string; parts: { text: string }[] }[]
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are 'Net Chi AI', a helpful, futuristic assistant for an internet cafe platform. You speak Persian (Farsi). You help users find cafes, troubleshoot connection speeds, and explain technical terms simply. Keep answers concise, friendly, and use emojis.",
      },
      history: history
    });

    const result = await chat.sendMessageStream({ message: prompt });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};