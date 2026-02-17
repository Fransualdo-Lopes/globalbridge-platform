
import { useEffect, useRef, useCallback } from 'react';
import { ENV } from '../core/config/env';

export const useAudioStream = (stream: MediaStream | null, isActive: boolean, onAudioChunk: (blob: Blob) => void) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const stopStreaming = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
    }
  }, []);

  const startStreaming = useCallback(async () => {
    if (!stream || !isActive) return;

    try {
      // Fix: Use AUDIO_IN_RATE from ENV as AUDIO_SAMPLE_RATE is not defined in core/config/env.ts
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: ENV.AUDIO_IN_RATE,
      });
      audioCtxRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // Latência Crítica: 1024 samples @ 16kHz = ~64ms de buffer local
      const processor = audioContext.createScriptProcessor(1024, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Buffer = new Int16Array(inputData.length);
        
        for (let i = 0; i < inputData.length; i++) {
          int16Buffer[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }

        const blob = new Blob([int16Buffer.buffer], { type: 'audio/pcm' });
        onAudioChunk(blob);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      console.error('Audio processing setup failed:', error);
    }
  }, [stream, isActive, onAudioChunk]);

  useEffect(() => {
    if (isActive && stream) {
      startStreaming();
    } else {
      stopStreaming();
    }
    return () => stopStreaming();
  }, [isActive, stream, startStreaming, stopStreaming]);

  return { stopStreaming };
};
