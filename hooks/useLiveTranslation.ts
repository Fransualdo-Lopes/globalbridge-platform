
import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ENV } from '../core/config/env';

export const useLiveTranslation = (targetLanguage: string) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcription, setTranscription] = useState({ user: '', ai: '' });
  const sessionRef = useRef<any>(null);

  const startSession = useCallback(async (onAudioData: (base64: string) => void) => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    const sessionPromise = ai.live.connect({
      model: ENV.MODEL_NAME,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are a real-time translator. Translate everything the user says into ${targetLanguage}. 
        Speak only the translation. Keep it natural and low-latency. Do not add meta-talk.`,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: () => setIsTranslating(true),
        onmessage: async (message) => {
          if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
            onAudioData(message.serverContent.modelTurn.parts[0].inlineData.data);
          }
          if (message.serverContent?.inputTranscription) {
            setTranscription(prev => ({ ...prev, user: prev.user + message.serverContent!.inputTranscription!.text }));
          }
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => ({ ...prev, ai: prev.ai + message.serverContent!.outputTranscription!.text }));
          }
          if (message.serverContent?.turnComplete) {
             // Turn complete logic could go here
          }
        },
        onclose: () => setIsTranslating(false),
        onerror: (e) => console.error('Translation Error:', e)
      }
    });

    sessionRef.current = await sessionPromise;
    return sessionRef.current;
  }, [targetLanguage]);

  const sendAudio = useCallback((blob: Blob) => {
    if (!sessionRef.current) return;
    
    blob.arrayBuffer().then(buffer => {
      const uint8 = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      const base64 = btoa(binary);

      sessionRef.current.sendRealtimeInput({
        media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
      });
    });
  }, []);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      // In a real scenario, we'd close the socket
      sessionRef.current = null;
      setIsTranslating(false);
    }
  }, []);

  return { startSession, stopSession, sendAudio, isTranslating, transcription };
};
