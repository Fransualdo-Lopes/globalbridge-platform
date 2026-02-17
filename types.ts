export enum MeetingStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED'
}

export interface User {
  id: string;
  name: string;
  preferredLanguage: string;
  avatarUrl?: string;
}

export interface MeetingSession {
  id: string;
  participants: User[];
  startTime: Date;
  status: MeetingStatus;
}

export interface TranscriptionEvent {
  userId: string;
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  targetLanguage: string;
  timestamp: number;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  from: string;
  to: string;
}