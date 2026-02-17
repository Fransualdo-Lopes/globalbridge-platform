
import { useEffect, useRef, useCallback, useState } from 'react';
import { ENV } from '../core/config/env';

export interface SignalMessage {
  type: 'join' | 'signal' | 'transcription' | 'error';
  roomId: string;
  from?: string;
  payload?: any;
}

export const useSignaling = (roomId: string, onMessage: (msg: SignalMessage) => void) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(ENV.WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      send({ type: 'join', roomId });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onclose = () => setIsConnected(false);

    return () => socket.close();
  }, [roomId, onMessage]);

  const send = useCallback((msg: SignalMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { isConnected, send };
};
