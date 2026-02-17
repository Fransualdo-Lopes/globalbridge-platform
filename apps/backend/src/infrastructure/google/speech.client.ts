
import speech from '@google-cloud/speech';
import { logger } from '../../shared/logger';

export class SpeechClient {
  private client: speech.SpeechClient;

  constructor() {
    this.client = new speech.SpeechClient();
  }

  createRecognizeStream(languageCode: string, onData: (text: string) => void) {
    const request = {
      config: {
        encoding: 'LINEAR16' as const,
        sampleRateHertz: 16000,
        languageCode,
        enableAutomaticPunctuation: true,
      },
      interimResults: true,
    };

    const recognizeStream = this.client
      .streamingRecognize(request)
      .on('error', (err) => logger.error(err, 'STT Stream Error'))
      .on('data', (data) => {
        const result = data.results[0];
        if (result && result.alternatives[0]) {
          onData(result.alternatives[0].transcript);
        }
      });

    return recognizeStream;
  }
}
