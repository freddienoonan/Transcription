import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptSegment } from '../types';

// FIX: Switched to gemini-2.5-flash as it's more suitable and cost-effective for audio transcription.
const MODEL_NAME = "gemini-2.5-flash";

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<TranscriptSegment[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType,
    },
  };

  const systemInstruction = `You are an expert audio transcription service. 
    Your task is to transcribe the provided audio file accurately.
    Identify different speakers and label them as 'Speaker 1', 'Speaker 2', and so on. 
    Provide timestamps for each segment of speech. Segments should be around 5 seconds long but should end at natural sentence breaks.
    The output must be a valid JSON array adhering to the provided schema.`;
  
  // FIX: Removed redundant text part from the prompt as systemInstruction is sufficient.
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [audioPart] },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            startTime: {
              type: Type.STRING,
              description: "Start time of the segment in HH:MM:SS format.",
            },
            endTime: {
              type: Type.STRING,
              description: "End time of the segment in HH:MM:SS format.",
            },
            speaker: {
              type: Type.STRING,
              description: "The identified speaker label, e.g., 'Speaker 1'.",
            },
            text: {
              type: Type.STRING,
              description: "The transcribed text for this segment.",
            },
          },
          required: ["startTime", "endTime", "speaker", "text"],
        },
      },
    }
  });

  const jsonString = response.text.trim();
  try {
    const parsedJson = JSON.parse(jsonString);
    return parsedJson as TranscriptSegment[];
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonString);
    throw new Error("The API returned an invalid JSON format.");
  }
};