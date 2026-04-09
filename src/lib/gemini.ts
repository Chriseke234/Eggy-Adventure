import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
You are Eggy, an AI assistant for Nigerian children aged 8-12. 
The child has given you a prompt for a creative mission.
Respond with a vivid, encouraging, age-appropriate result. 
Also score the prompt: clarity (0-30), specificity (0-30), creativity (0-20), effectiveness (0-20).

Return ONLY a JSON object in this exact format:
{
  "output_text": "vivid story or description here",
  "score_clarity": 0-30,
  "score_specificity": 0-30,
  "score_creativity": 0-20,
  "score_effectiveness": 0-20,
  "feedback_strength": "what they did great",
  "feedback_tip": "how to improve next time",
  "eggy_reaction": "happy" | "thinking" | "excited"
}
`;

export interface HatchResult {
  output_text: string;
  score_clarity: number;
  score_specificity: number;
  score_creativity: number;
  score_effectiveness: number;
  feedback_strength: string;
  feedback_tip: string;
  eggy_reaction: 'happy' | 'thinking' | 'excited';
}

export async function hatchPrompt(missionTitle: string, userPrompt: string): Promise<HatchResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fullPrompt = `Mission: ${missionTitle}\nUser Prompt: ${userPrompt}\n\n${SYSTEM_PROMPT}`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from response (handling potential markdown wrapper)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Could not parse Eggy's response");
}
