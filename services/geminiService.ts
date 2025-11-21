import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize safely, handle case where key might be missing in dev but we don't want to crash app immediately
let ai: GoogleGenAI | null = null;
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Gemini Client", e);
}

export const runPythonSimulation = async (code: string): Promise<string> => {
  if (!ai) return "Error: API Key missing. Cannot execute AI simulation.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as a Python interpreter. Execute the following code and return ONLY the output. If there is an error, return the error message. Do not wrap in markdown blocks. Code: \n${code}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Runtime Error: execution failed.";
  }
};

export const askAssistant = async (prompt: string): Promise<string> => {
  if (!ai) return "Error: API Key missing.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I couldn't understand that.";
  } catch (error) {
    return "Connection error.";
  }
};