import { GoogleGenAI, Type } from "@google/genai";
import { DocType } from "../types";

// Access environment variables safely for Vite
// @ts-ignore
const apiKey = (import.meta.env && import.meta.env.VITE_API_KEY) || "";

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a structured outline for a document or presentation based on the topic.
 */
export const generateOutline = async (topic: string, type: DocType): Promise<string[]> => {
  if (!apiKey) {
    console.error("API Key is missing. Please set VITE_API_KEY in your .env file.");
    throw new Error("API Key is missing");
  }

  const model = "gemini-2.5-flash";
  
  const systemInstruction = type === DocType.DOCX 
    ? "You are an expert document architect. Create a structured outline for a professional business document. Return only a JSON array of section titles."
    : "You are an expert presentation designer. Create a list of slide titles for a professional presentation. Return only a JSON array of slide titles.";

  const prompt = `Create a ${type === DocType.DOCX ? '5-7 section outline' : '5-8 slide deck outline'} for the topic: "${topic}".`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return ["Introduction", "Market Analysis", "Conclusion"];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Outline Error:", error);
    // Fallback for demo stability if API fails
    return type === DocType.DOCX 
      ? ["Executive Summary", "Problem Statement", "Solution Overview", "Market Analysis", "Conclusion"]
      : ["Title Slide", "Agenda", "Market Overview", "Strategic Plan", "Next Steps"];
  }
};

/**
 * Generates detailed content for a specific section or slide.
 */
export const generateSectionContent = async (
  topic: string, 
  sectionTitle: string, 
  type: DocType
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  
  // Specific instruction tweaks for PPT to ensure it works well with the exporter
  const pptInstruction = "Write 4-6 concise, high-impact bullet points for a presentation slide. Do not use markdown headers. Each point should be a separate line.";
  const docInstruction = "Use comprehensive paragraphs and professional formatting. Do not include the section title.";

  const prompt = `
    Topic: ${topic}
    Current Section: ${sectionTitle}
    
    Task: Write detailed content for this section of a ${type === DocType.DOCX ? 'business document' : 'presentation slide'}.
    
    Style Guide:
    ${type === DocType.PPTX ? pptInstruction : docInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Content generation failed. Please try again.";
  } catch (error) {
    console.error("Gemini Content Error:", error);
    return "Error generating content. Please check your API key and try again.";
  }
};

/**
 * Refines existing content based on user instructions.
 */
export const refineContent = async (
  currentContent: string, 
  instruction: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  
  const prompt = `
    Original Content:
    ${currentContent}

    User Instruction: ${instruction}

    Rewrite the content above following the user instruction. Maintain professional tone unless specified otherwise.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || currentContent;
  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    return currentContent;
  }
};