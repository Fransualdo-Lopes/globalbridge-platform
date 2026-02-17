
import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Globe, MessageSquare, Monitor } from 'lucide-react';

interface ControlBarProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  isConnected: boolean;
  isTranslating: boolean;
  onToggleTranslation: () => void;
  onToggleTranscript: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  onMuteToggle,
  isConnected,
  isTranslating,
  onToggleTranslation,
  onToggleTranscript
}) => {
  return (
    <div className="bg-gray-900 border-t border-gray-800 p-6 flex items-center justify-between px-12 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected && 'animate-pulse'}`} />
          {isConnected ? 'SIGNALING READY' : 'RECONNECTING...'}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onMuteToggle}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <button className="w-12 h-12 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center hover:bg-gray-700 transition-all">
          <Video size={22} />
        </button>
        <button className="w-12 h-12 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center hover:bg-gray-700 transition-all">
          <Monitor size={22} />
        </button>
        
        <div className="w-px h-8 bg-gray-800 mx-2" />

        <button 
          onClick={onToggleTranslation}
          className={`px-6 h-12 rounded-full flex items-center gap-2 font-bold transition-all ${isTranslating ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 text-blue-500 hover:bg-gray-700 border border-blue-500/30'}`}
        >
          <Globe size={20} className={isTranslating ? 'animate-spin-slow' : ''} />
          {isTranslating ? 'Stop Translation' : 'Start Translation'}
        </button>

        <button className="w-14 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-lg shadow-red-600/20 ml-4">
          <PhoneOff size={22} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleTranscript}
          className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
        >
          <MessageSquare size={24} />
        </button>
      </div>
    </div>
  );
};
