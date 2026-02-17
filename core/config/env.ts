
export const ENV = {
  // O backend de sinalização é omitido para focar na renderização local e S2S
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
  // Fix: Added missing WS_URL for signaling connection
  WS_URL: 'ws://localhost:4000/ws/signaling',
  AUDIO_IN_RATE: 16000,
  AUDIO_OUT_RATE: 24000,
  MODEL_NAME: 'gemini-2.5-flash-native-audio-preview-12-2025'
};
