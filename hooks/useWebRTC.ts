
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
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    return pc;
  }, [onSignal]);

  const createOffer = useCallback(async () => {
    if (!peerRef.current) return;
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    onSignal({ type: 'offer', offer });
  }, [onSignal]);

  const handleSignal = useCallback(async (payload: any) => {
    if (!peerRef.current) return;

    try {
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
    } catch (e) {
      console.error("WebRTC Signaling Error:", e);
    }
  }, [onSignal]);

  const replaceTrack = useCallback(async (newTrack: MediaStreamTrack) => {
    if (!peerRef.current) return;
    const senders = peerRef.current.getSenders();
    const sender = senders.find(s => s.track?.kind === newTrack.kind);
    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  }, []);

  return { initPeer, createOffer, handleSignal, replaceTrack, remoteStream };
};
