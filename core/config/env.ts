
export const ENV = {
  API_URL: window.location.origin.replace('3000', '4000'),
  WS_URL: window.location.origin.replace('http', 'ws').replace('3000', '4000') + '/ws/signaling',
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
  AUDIO_SAMPLE_RATE: 16000,
  MODEL_NAME: 'gemini-2.5-flash-native-audio-preview-12-2025'
};
