import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

// 클라이언트 안전한 export는 styles.ts에서 가져가세요
export { STYLE_CONFIGS, buildPrompt } from "./styles";
export type { StyleConfig, RunStats } from "./styles";
