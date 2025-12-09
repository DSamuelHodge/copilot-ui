import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "../types";

const apiKey = process.env.API_KEY || '';
// Initialize safe client (will fail gracefully if no key, but UI handles this)
const ai = new GoogleGenAI({ apiKey });

export const sendMessageToGemini = async (
  prompt: string, 
  model: GeminiModel,
  history: {role: string, parts: {text: string}[]}[]
): Promise<string> => {
  try {
    if (!apiKey) {
      // Simulation mode for UI demo purposes if no key provided
      await new Promise(resolve => setTimeout(resolve, 1500));
      return "I'm in UI Demo mode because no API key was found. I would normally process your request: \"" + prompt + "\". The UI is fully interactive!";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: h.parts
        })),
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};
