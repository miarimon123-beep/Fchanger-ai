import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' is automatically injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

export const analyzeImageForMetadata = async (
  base64Data: string,
  originalMimeType: string
): Promise<AIAnalysisResult> => {
  try {
    const model = 'gemini-3-flash-preview'; // Efficient model for multimodal tasks

    const prompt = `
      Analyze this image. 
      1. Create a short, SEO-friendly, hyphenated filename (without extension).
      2. Write a concise alt text (max 125 chars) for accessibility.
      3. Write a brief description of the visual content.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: originalMimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedFilename: {
              type: Type.STRING,
              description: "A clean, SEO-friendly filename using hyphens, e.g., 'sunset-ocean-view'",
            },
            altText: {
              type: Type.STRING,
              description: "Accessibility text for the image",
            },
            description: {
              type: Type.STRING,
              description: "A short description of the image content",
            },
          },
          required: ["suggestedFilename", "altText", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};