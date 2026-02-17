
import { useRef, useCallback, useState } from 'react';
import { ENV } from '../core/config/env';

export const useWebRTC = (onSignal: (payload: any) => void) => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const initPeer = useCallback((localStream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers: ENV.ICE_SERVERS });
    peerRef.current = pc;

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onSignal({ type: 'candidate', candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return pc;
  }, [onSignal]);

  const handleSignal = useCallback(async (payload: any) => {
    if (!peerRef.current) return;

    if (payload.type === 'offer') {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      onSignal({ type: 'answer', answer });
    } else if (payload.type === 'answer') {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
    } else if (payload.type === 'candidate') {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  }, [onSignal]);

  return { initPeer, handleSignal, remoteStream };
};
