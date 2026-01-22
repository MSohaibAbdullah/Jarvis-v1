
import { GoogleGenAI, Type, Modality, GenerateContentResponse, LiveServerMessage } from "@google/genai";
import { Project, ChatMessage, ReasoningMode, Thread } from "../types";

const SYSTEM_INSTRUCTION = `Persona: You are Jarvis, a high-intelligence system assistant. 

Mandatory Protocol: Jarvis is an independent AI assistant that relies exclusively on user-provided data; it must not reference, imply, compare to, or claim usage of any other AI systems, models, or external knowledge sources, and must present all outputs as its own analysis based solely on the given data.

Operational Guidelines:
1. Contextual Priority: Always analyze and prioritize information from the provided project files/data. 
2. Structural Integrity: Deliver information using professional technical formatting. Use Markdown for:
   - TABLES: Mandatory for categorical, comparative, or list-based data. Ensure proper | Header | Header | format.
   - CODE BLOCKS: Use for technical snippets or structured JSON/XML data.
   - HEADERS: Use #, ##, ### for logical separation.
3. Communication Style: Concise, factual, and analytical. Do not narrate your own behavior.
4. Language Protocol: 
   - Primary: English.
   - Secondary: Romanized Urdu (Hinglish).
   - Prohibition: No Devanagari or pure Hindi scripts.`;

export class GeminiService {
  private getAI(customApiKey?: string) {
    const key = customApiKey || process.env.API_KEY || '';
    return new GoogleGenAI({ apiKey: key });
  }

  async *generateTextStream(
    project: Project,
    thread: Thread,
    prompt: string,
    mode: ReasoningMode,
    customApiKey?: string
  ) {
    const ai = this.getAI(customApiKey);
    
    const fileParts = project.files.map(f => ({
      inlineData: {
        mimeType: f.type,
        data: f.content.split(',')[1] || f.content
      }
    }));

    const historyParts = thread.history.slice(-15).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    let effectivePrompt = prompt;
    if (mode === 'High Reasoning') {
      effectivePrompt = `[MODE: DEEP RESEARCH. EXHAUSTIVE ANALYSIS REQUIRED.] ${prompt}`;
    }

    const contents = [
      ...historyParts,
      {
        role: 'user',
        parts: [...fileParts, { text: effectivePrompt }]
      }
    ];

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1,
    };

    if (mode === 'High Reasoning') {
      config.thinkingConfig = { thinkingBudget: 24576 };
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }

  async processVoiceMessage(
    audioBase64: string, 
    mimeType: string, 
    project: Project,
    thread: Thread,
    customApiKey?: string
  ): Promise<{ transcription: string; reply: string }> {
    const ai = this.getAI(customApiKey);
    
    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType
      }
    };

    const fileParts = project.files.map(f => ({
      inlineData: {
        mimeType: f.type,
        data: f.content.split(',')[1] || f.content
      }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            ...fileParts,
            audioPart,
            { text: "Transcribe the audio then provide a structural technical response in JSON format following the Jarvis protocol." }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            reply: { type: Type.STRING }
          },
          required: ["transcription", "reply"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return { transcription: "Audio processed.", reply: response.text || "Communication relay error." };
    }
  }

  async generateTitle(history: ChatMessage[], customApiKey?: string): Promise<string> {
    const ai = this.getAI(customApiKey);
    const text = history.map(m => m.content).join('\n').slice(0, 1000);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a concise 3-word title for this context in Roman script: ${text}`,
    });
    
    let title = response.text || "Node Analysis";
    title = title.replace(/[#\*`"'\.\(\)\[\]]/g, '').trim();
    if (title.length > 30) title = title.substring(0, 27) + '...';
    
    return title;
  }

  async generateImage(prompt: string, customApiKey?: string): Promise<string> {
    const ai = this.getAI(customApiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Asset generation failed.");
  }
}

export const gemini = new GeminiService();
