
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSignaling } from '../../hooks/useSignaling';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAudioStream } from '../../hooks/useAudioStream';
import { useLiveTranslation } from '../../hooks/useLiveTranslation';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { VideoPanel } from './components/VideoPanel';
import { ControlBar } from './components/ControlBar';
import { LanguageSelector } from './components/LanguageSelector';
import { TranscriptPanel } from './components/TranscriptPanel';
import { Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { useVoiceProfile } from '../../core/context/VoiceProfileContext';

export const MeetingRoom: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [targetLang, setTargetLang] = useState('Spanish');
  const [useClonedProfile, setUseClonedProfile] = useState(true);
  
  // Fix: Added missing state for screen sharing and transcript visibility to satisfy ControlBar requirements
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  const { profile } = useVoiceProfile();
  const { playChunk, stopAll, init: initAudio } = useAudioPlayer();
  const { startSession, stopSession, sendAudio, isTranslating, isCloning, transcription } = useLiveTranslation(targetLang, useClonedProfile);

  // Mock de sinalização para permitir renderização sem servidor
  const isConnected = true; 

  useAudioStream(localStream, !isMuted && isTranslating, (blob) => {
    sendAudio(blob);
  });

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(setLocalStream)
      .catch(console.error);
  }, []);

  const handleToggleTranslation = async () => {
    if (isTranslating) {
      stopSession();
      stopAll();
    } else {
      initAudio();
      await startSession(playChunk);
    }
  };

  // Fix: Added missing hang up handler for ControlBar
  const handleHangUp = useCallback(() => {
    stopSession();
    stopAll();
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
  }, [stopSession, stopAll, localStream]);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      <header className="p-4 border-b border-gray-900 flex justify-between items-center bg-gray-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              GlobalBridge <span className="text-blue-500 italic">Live</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Room: {roomId}</p>
          </div>
          
          {profile.isEnrolled && (
            <button 
              onClick={() => setUseClonedProfile(!useClonedProfile)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${useClonedProfile ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
            >
              {useClonedProfile ? <ToggleRight size={18} className="text-blue-500" /> : <ToggleLeft size={18} />}
              <span className="text-[10px] font-black uppercase">Voice Cloning</span>
            </button>
          )}
        </div>
        <LanguageSelector value={targetLang} onChange={setTargetLang} />
      </header>

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <VideoPanel stream={localStream} name="You (Host)" isLocal videoOff={isVideoOff} />
            <VideoPanel stream={null} name="Awaiting Guest..." />
          </div>
          
          {isTranslating && (
            <div className="bg-gray-900/50 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="text-white fill-white" size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">S2S Native Engaged</p>
                  <p className="text-[10px] text-gray-400">Mode: <span className="text-blue-400 font-bold">{isCloning ? 'CLONED' : 'STANDARD'}</span></p>
                </div>
              </div>
              <div className="flex items-end gap-1 h-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s`, height: '60%' }} />
                ))}
              </div>
            </div>
          )}
        </main>

        {showTranscript && (
          <aside className="w-80 border-l border-gray-900 bg-gray-950/30 backdrop-blur-sm">
            <TranscriptPanel userText={transcription.user} aiText={transcription.ai} />
          </aside>
        )}
      </div>

      <ControlBar 
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        isVideoOff={isVideoOff}
        onVideoToggle={() => setIsVideoOff(!isVideoOff)}
        isScreenSharing={isScreenSharing}
        onScreenShareToggle={() => setIsScreenSharing(!isScreenSharing)}
        isTranslating={isTranslating}
        onToggleTranslation={handleToggleTranslation}
        onToggleTranscript={() => setShowTranscript(!showTranscript)}
        onHangUp={handleHangUp}
        isConnected={isConnected}
      />
    </div>
  );
};
