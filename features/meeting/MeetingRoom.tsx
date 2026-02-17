
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
import { Cpu, Zap, Radio, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { useVoiceProfile } from '../../core/context/VoiceProfileContext';

interface MeetingRoomProps {
  roomId: string;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [targetLang, setTargetLang] = useState('Spanish');
  const [showTranscripts, setShowTranscripts] = useState(true);
  const [useClonedProfile, setUseClonedProfile] = useState(true); // Toggle de clonagem
  const hasInitializedPeer = useRef(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const { profile } = useVoiceProfile();
  const sendRef = useRef<(msg: SignalMessage) => void>(() => {});

  const { playChunk, stopAll, init: initAudio } = useAudioPlayer();
  const { startSession, stopSession, sendAudio, isTranslating, isCloning, transcription } = useLiveTranslation(targetLang, useClonedProfile);

  const onWebRTCSignal = useCallback((payload: any) => {
    sendRef.current({ type: 'signal', roomId, payload });
  }, [roomId]);

  const { initPeer, createOffer, handleSignal, replaceTrack, remoteStream } = useWebRTC(onWebRTCSignal);

  const { send, isConnected } = useSignaling(roomId, useCallback((msg: SignalMessage) => {
    if (msg.type === 'signal') {
      if (msg.payload?.type === 'ready') {
        createOffer();
      } else {
        handleSignal(msg.payload);
      }
    } else if (msg.type === 'join' && hasInitializedPeer.current) {
      sendRef.current({ type: 'signal', roomId, payload: { type: 'ready' } });
    }
  }, [handleSignal, createOffer, roomId]));

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

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
        console.error("Camera access denied", e);
      }
    };
    startCamera();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (localStream && isConnected && !hasInitializedPeer.current) {
      initPeer(localStream);
      hasInitializedPeer.current = true;
      sendRef.current({ type: 'join', roomId });
    }
  }, [localStream, isConnected, initPeer, roomId]);

  const handleMuteToggle = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (localStream && !isScreenSharing) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
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
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) replaceTrack(videoTrack);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        const screenTrack = stream.getVideoTracks()[0];
        if (screenTrack) {
          replaceTrack(screenTrack);
          screenTrack.onended = () => {
            setIsScreenSharing(false);
            if (localStream) replaceTrack(localStream.getVideoTracks()[0]);
          };
        }
      } catch (e) {
        console.error("Screen share denied", e);
      }
    }
  };

  const handleHangUp = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    window.location.reload();
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
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    GlobalBridge <span className="text-blue-500">Live</span>
                  </h1>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Room: {roomId}</p>
                </div>
                
                {profile.isEnrolled && (
                  <button 
                    onClick={() => setUseClonedProfile(!useClonedProfile)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${useClonedProfile ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-gray-800/50 border-gray-700 text-gray-500'}`}
                  >
                    {useClonedProfile ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                      {useClonedProfile ? 'Clonagem Ativa' : 'Voz Genérica'}
                    </span>
                  </button>
                )}
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
              <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/40 p-5 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30">
                    <Zap className="text-white fill-white" size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black text-white uppercase tracking-tight">S2S Engine v2</p>
                      <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-bold">
                        {isCloning ? 'DNA CLONING' : 'DYNAMIC MIMICRY'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 font-medium">Latência de captura otimizada para <span className="text-white">~64ms</span></p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-10 px-4">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-blue-500 rounded-full animate-pulse" 
                      style={{ 
                        animationDelay: `${i * 100}ms`, 
                        height: `${Math.random() * 30 + 10}px`,
                        opacity: 0.4 + (i * 0.08)
                      }} 
                    />
                  ))}
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
