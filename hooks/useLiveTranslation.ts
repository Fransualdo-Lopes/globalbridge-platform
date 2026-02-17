
import { useEffect, useRef, useState, useCallback } from 'react';
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Identity Enforcement via System Instruction
    const voiceConstraint = (useClonedProfile && profile.isEnrolled && profile.fingerprint)
      ? `CLONING REQ: You MUST perfectly mimic this vocal signature: ${profile.fingerprint}. Use the input audio as the primary reference for emotion and prosody.`
      : "MODE: Generic vocal mimicry of input tone.";

    const sessionPromise = ai.live.connect({
      model: ENV.MODEL_NAME,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `S2S TRANSLATION ENGINE. 
        TARGET LANG: ${targetLanguage}. 
        ${voiceConstraint}
        Strict: Output PCM audio only. Zero text. Optimize for sub-100ms latency.`,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: () => {
          setIsTranslating(true);
          setIsCloning(useClonedProfile && profile.isEnrolled);
        },
        onmessage: async (message) => {
          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            onAudioData(message.serverContent.modelTurn.parts[0].inlineData.data);
          }
          if (message.serverContent?.inputTranscription) {
            setTranscription(prev => ({ ...prev, user: prev.user + ' ' + message.serverContent!.inputTranscription!.text }));
          }
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => ({ ...prev, ai: prev.ai + ' ' + message.serverContent!.outputTranscription!.text }));
          }
        },
        onclose: () => {
          setIsTranslating(false);
          setIsCloning(false);
        },
        onerror: (e) => {
          console.error('Translation Error:', e);
          setIsCloning(false);
        }
      }
    });

    sessionPromiseRef.current = sessionPromise;
    sessionRef.current = await sessionPromise;
    return sessionRef.current;
  }, [targetLanguage, profile, useClonedProfile]);

  const sendAudio = useCallback((blob: Blob) => {
    if (!sessionPromiseRef.current) return;
    
    blob.arrayBuffer().then(buffer => {
      const uint8 = new Uint8Array(buffer);
      // Faster binary-to-base64 conversion for small chunks
      let binary = '';
      const len = uint8.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const base64 = btoa(binary);

      sessionPromiseRef.current?.then((session) => {
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
      setIsTranslating(false);
      setIsCloning(false);
    }
  }, []);

  return { startSession, stopSession, sendAudio, isTranslating, isCloning, transcription };
};
