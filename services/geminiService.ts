import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { AIAnalysisResult } from '../types';

let genAI: GoogleGenAI | null = null;

export const getGenAI = () => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.warn("API_KEY not found in environment.");
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return genAI;
};

// 1. Existing Analysis
export const analyzeEmergencyCall = async (transcript: string): Promise<AIAnalysisResult | null> => {
  try {
    const ai = getGenAI();
    const model = 'gemini-3-flash-preview'; 
    const response = await ai.models.generateContent({
      model: model,
      contents: transcript,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return null;

    try {
      const data = JSON.parse(text) as AIAnalysisResult;
      if (!data.location.lat) {
        data.location.lat = 40.7128 + (Math.random() - 0.5) * 0.05;
        data.location.lng = -74.0060 + (Math.random() - 0.5) * 0.05;
      }
      return data;
    } catch (e) {
      console.error("Failed to parse JSON from Gemini", e);
      return null;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// 2. Transcribe Audio (Gemini 3 Flash)
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Audio } },
        { text: "Transcribe this audio exactly as spoken." }
      ]
    }
  });
  return response.text || "";
};

// 3. Generate Speech (Gemini 2.5 Flash TTS)
export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        // Changed to 'Puck' for a more authoritative/reassuring tone
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
      }
    }
  });
  // Return the base64 audio string
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// 4. Rapid Triage (Gemini 2.5 Flash Lite)
export const rapidTriage = async (text: string): Promise<string> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest', // Alias for flash-lite
    contents: `Rapidly assess this emergency situation in 1 sentence providing immediate action: "${text}"`,
  });
  return response.text || "";
};

// 5. Chat with Assistant (Gemini 3 Pro)
export const createChat = (systemInstruction: string) => {
  const ai = getGenAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction }
  });
};

// 6. Maps Grounding (Gemini 2.5 Flash)
export const queryWithMaps = async (query: string, location?: {lat: number, lng: number}) => {
  const ai = getGenAI();
  const config: any = {
    tools: [{ googleMaps: {} }],
  };
  
  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: { latitude: location.lat, longitude: location.lng }
      }
    };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Must use 2.5 for Maps
    contents: query,
    config: config
  });

  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};