
import { useRef, useCallback } from 'react';

export const useAudioPlayer = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const init = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0; // Resetar cursor
    }
  }, []);

  const playChunk = useCallback(async (base64Data: string) => {
    if (!audioCtxRef.current) init();
    const ctx = audioCtxRef.current!;

    // Resume context se estiver suspenso (comum em navegadores)
    if (ctx.state === 'suspended') await ctx.resume();

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    // Agendamento agressivo: Se o tempo agendado ficou no passado, usa o tempo atual
    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    
    sourcesRef.current.add(source);
    source.onended = () => {
      sourcesRef.current.delete(source);
      // Pequena limpeza se a fila estiver vazia e muito tempo tiver passado
      if (sourcesRef.current.size === 0 && ctx.currentTime > nextStartTimeRef.current + 1) {
        nextStartTimeRef.current = ctx.currentTime;
      }
    };
  }, [init]);

  const stopAll = useCallback(() => {
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  return { playChunk, stopAll, init };
};
