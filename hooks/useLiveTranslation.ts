
import { useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ENV } from '../core/config/env';
import { useVoiceProfile } from '../core/context/VoiceProfileContext';

export const useLiveTranslation = (targetLanguage: string, useClonedProfile: boolean) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [transcription, setTranscription] = useState({ user: '', ai: '' });
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sessionRef = useRef<any>(null);
  const { profile } = useVoiceProfile();

  const startSession = useCallback(async (onAudioData: (base64: string) => void) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const voiceIdentity = (useClonedProfile && profile.isEnrolled)
      ? `VOCAL IDENTITY CLONE ACTIVE. You must replicate the speaker's acoustic profile: ${profile.fingerprint}. Match their original tone, emotion, and gender exactly.`
      : "STANDARD MODE. Use a natural, expressive voice for translation.";

    const sessionPromise = ai.live.connect({
      model: ENV.MODEL_NAME,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are an ultra-low latency Speech-to-Speech (S2S) translator.
        TARGET LANGUAGE: ${targetLanguage}.
        ${voiceIdentity}
        STRICT RULES:
        1. Output ONLY raw PCM audio. 
        2. No introductory text or filler.
        3. Maintain latency below 100ms. 
        4. Preserve the speaker's persona and context.`,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: () => setIsTranslating(true),
        onmessage: async (message) => {
          const audio = (message as any).serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) onAudioData(audio);
          
          if ((message as any).serverContent?.inputTranscription) {
            setTranscription(p => ({ ...p, user: p.user + ' ' + (message as any).serverContent.inputTranscription.text }));
          }
          if ((message as any).serverContent?.outputTranscription) {
            setTranscription(p => ({ ...p, ai: p.ai + ' ' + (message as any).serverContent.outputTranscription.text }));
          }
        },
        onclose: () => setIsTranslating(false),
        onerror: (e) => {
          console.error('Gemini S2S Error:', e);
          setIsTranslating(false);
        }
      }
    });

    sessionPromiseRef.current = sessionPromise;
    const session = await sessionPromise;
    sessionRef.current = session;
    setIsCloning(useClonedProfile && profile.isEnrolled);
  }, [targetLanguage, profile, useClonedProfile]);

  const sendAudio = useCallback((blob: Blob) => {
    if (!sessionPromiseRef.current) return;
    
    blob.arrayBuffer().then(buffer => {
      const uint8 = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < uint8.byteLength; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const base64 = btoa(binary);

      sessionPromiseRef.current?.then(session => {
        session.sendRealtimeInput({
          media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
      });
    });
  }, []);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      sessionPromiseRef.current = null;
    }
    setIsTranslating(false);
    setIsCloning(false);
  }, []);

  return { startSession, stopSession, sendAudio, isTranslating, isCloning, transcription };
};
