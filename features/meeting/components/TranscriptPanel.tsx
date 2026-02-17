
import React from 'react';
import { MessageCircle, Zap, Activity } from 'lucide-react';

interface TranscriptPanelProps {
  userText: string;
  aiText: string;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ userText, aiText }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-900 flex items-center justify-between">
        <h2 className="font-bold flex items-center gap-2">
          <MessageCircle size={18} className="text-blue-500" />
          Live Transcript
        </h2>
        <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Low Latency</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {userText && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-md flex items-center justify-center text-[10px] font-bold">YOU</div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Input</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed bg-gray-900/50 p-3 rounded-xl border border-gray-800">
              {userText}
            </p>
          </div>
        )}

        {aiText && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-[10px] font-bold">AI</div>
              <span className="text-xs text-blue-500 font-bold uppercase tracking-tighter">Translation</span>
            </div>
            <div className="relative">
              <p className="text-sm text-white font-medium leading-relaxed bg-blue-600/20 p-3 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                {aiText}
              </p>
              <Zap size={14} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}

        {!userText && !aiText && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
              <Activity size={32} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-500">Transcripts will stream here<br/>in real-time.</p>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-gray-950/80 border-t border-gray-900">
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 backdrop-blur-md">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-3 tracking-widest flex items-center gap-2">
            <Activity size={12} /> Pipeline Status
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Total Round-trip</span>
            <span className="text-xs text-green-400 font-mono font-bold animate-pulse">~89ms</span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="w-[85%] h-full bg-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
          </div>
          <p className="mt-3 text-[9px] text-gray-600 italic">Optimized for global Tech-Sync clusters.</p>
        </div>
      </div>
    </div>
  );
};
