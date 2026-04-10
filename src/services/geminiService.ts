import { GoogleGenAI } from "@google/genai";
import { Habit, HabitLog } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function getHabitInsights(habits: Habit[], logs: HabitLog[], userName: string) {
  try {
    if (!ai) {
      return "Add VITE_GEMINI_API_KEY in your .env file to enable AI insights.";
    }

    const habitSummary = habits.map(h => {
      const completions = logs.filter(l => l.habitId === h.id).length;
      return `${h.title}: ${completions} completions, ${h.currentStreak} day streak`;
    }).join('\n');

    const prompt = `
      User: ${userName}
      Habits:
      ${habitSummary}

      Based on this data, provide a single, short (max 2 sentences), supportive, and actionable insight. 
      Focus on patterns, encouragement, or a small suggestion for improvement.
      Keep the tone calm, elegant, and non-judgmental.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a supportive habit coach for a minimalist app called Pure Habit.",
      },
    });

    return response.text || "Keep up the great work! Every small step counts towards your long-term goals.";
  } catch (error) {
    console.error("Error getting AI insights:", error);
    return "Focus on one small win today. Consistency is the key to building lasting routines.";
  }
}
