
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
import { Zap, ToggleLeft, ToggleRight, Radio } from 'lucide-react';
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
  const [useClonedProfile, setUseClonedProfile] = useState(true);
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${useClonedProfile ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                  >
                    {useClonedProfile ? <ToggleRight size={20} className="text-blue-500" /> : <ToggleLeft size={20} />}
                    <span className="text-[11px] font-bold uppercase tracking-tight">
                      {useClonedProfile ? 'Clone On' : 'Generic Voice'}
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
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-5 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Zap className="text-white fill-white" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black text-white uppercase tracking-tight">Real-Time S2S Active</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${isCloning ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                        {isCloning ? 'DNA Identity Sync' : 'Dynamic Voice'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 font-medium">Capture delay: <span className="text-white font-bold">~64ms</span> | Processing: <span className="text-white font-bold">~25ms</span></p>
                  </div>
                </div>
                <div className="flex items-end gap-1 px-4">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-blue-400 rounded-full animate-bounce" 
                      style={{ 
                        animationDuration: `${0.6 + Math.random()}s`,
                        height: `${Math.random() * 24 + 4}px`
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
