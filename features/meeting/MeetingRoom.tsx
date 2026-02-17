
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSignaling, SignalMessage } from '../../hooks/useSignaling';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAudioStream } from '../../hooks/useAudioStream';
import { useLiveTranslation } from '../../hooks/useLiveTranslation';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { VideoPanel } from './components/VideoPanel';
import { ControlBar } from './components/ControlBar';
import { LanguageSelector } from './components/LanguageSelector';
import { TranscriptPanel } from './components/TranscriptPanel';

interface MeetingRoomProps {
  roomId: string;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [targetLang, setTargetLang] = useState('English');
  const [showTranscripts, setShowTranscripts] = useState(true);
  const hasInitializedPeer = useRef(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const { playChunk, stopAll, init: initAudio } = useAudioPlayer();
  const { startSession, stopSession, sendAudio, isTranslating, transcription } = useLiveTranslation(targetLang);

  const { send, isConnected } = useSignaling(roomId, useCallback((msg: SignalMessage) => {
    if (msg.type === 'signal') handleSignal(msg.payload);
  }, []));

  const onWebRTCSignal = useCallback((payload: any) => {
    send({ type: 'signal', roomId, payload });
  }, [send, roomId]);

  const { initPeer, handleSignal, remoteStream } = useWebRTC(onWebRTCSignal);

  useAudioStream(localStream, !isMuted && isTranslating, (blob) => {
    sendAudio(blob);
  });

  useEffect(() => {
    let active = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        if (active) {
          setLocalStream(stream);
        }
      } catch (e) {
        console.error("Camera access denied or hardware error", e);
      }
    };
    startCamera();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (localStream && isConnected && !hasInitializedPeer.current) {
      initPeer(localStream);
      hasInitializedPeer.current = true;
    }
  }, [localStream, isConnected, initPeer]);

  const handleMuteToggle = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle enabled state
      });
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff; // Toggle enabled state
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleScreenShareToggle = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      setIsScreenSharing(false);
      // In a full WebRTC impl, we'd swap tracks back to camera here
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
      } catch (e) {
        console.error("Screen share denied", e);
      }
    }
  };

  const handleHangUp = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    window.location.reload(); // Simple way to reset state for now
  };

  const handleToggleTranslation = async () => {
    if (isTranslating) {
      stopSession();
      stopAll();
    } else {
      initAudio();
      await startSession(playChunk);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
            <header className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  Live Meeting: {roomId}
                </h1>
                <p className="text-sm text-gray-400">Secure Peer-to-Peer Encryption</p>
              </div>
              <LanguageSelector value={targetLang} onChange={setTargetLang} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[400px]">
              <VideoPanel 
                stream={isScreenSharing ? screenStreamRef.current : localStream} 
                name={isScreenSharing ? "You (Screen)" : "You (Host)"} 
                isLocal 
                videoOff={isVideoOff && !isScreenSharing}
              />
              <VideoPanel stream={remoteStream} name="Remote Guest" />
            </div>
            
            {isTranslating && (
              <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-lg">🌍</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-400">Translation Active</p>
                  <p className="text-xs text-gray-300">Translating to {targetLang} in real-time...</p>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {showTranscripts && (
          <aside className="w-96 hidden xl:flex flex-col border-l border-gray-900 bg-gray-950/50 backdrop-blur-xl">
            <TranscriptPanel userText={transcription.user} aiText={transcription.ai} />
          </aside>
        )}
      </div>

      <ControlBar 
        isMuted={isMuted} 
        onMuteToggle={handleMuteToggle} 
        isVideoOff={isVideoOff}
        onVideoToggle={handleVideoToggle}
        isScreenSharing={isScreenSharing}
        onScreenShareToggle={handleScreenShareToggle}
        isConnected={isConnected}
        isTranslating={isTranslating}
        onToggleTranslation={handleToggleTranslation}
        onToggleTranscript={() => setShowTranscripts(!showTranscripts)}
        onHangUp={handleHangUp}
      />
    </div>
  );
};
