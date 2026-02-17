
import { SpeechClient as GCPSpeechClient } from '@google-cloud/speech';
import { logger } from '../../shared/logger';

export class SpeechClient {
  // Fix: Use the imported SpeechClient type directly instead of referencing it as a namespace member
  private client: GCPSpeechClient;

  constructor() {
    this.client = new GCPSpeechClient();
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
      .on('error', (err: Error) => logger.error(err, 'STT Stream Error'))
      .on('data', (data: any) => {
        const result = data.results[0];
        if (result && result.alternatives[0]) {
          onData(result.alternatives[0].transcript);
        }
      });

    return recognizeStream;
  }
}
