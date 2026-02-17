
import React, { useState } from 'react';
import { 
  Video, 
  Mic, 
  Globe, 
  Settings, 
  Users, 
  MessageSquare, 
  Layout, 
  PhoneOff,
  Languages,
  Info
} from 'lucide-react';

/**
 * ARCHITECTURAL SUMMARY:
 * 
 * GlobalBridge is designed with a "Streaming-First" mindset.
 * 
 * 1. WebRTC Pipeline: Peer-to-peer video/audio with selective forwarding unit (SFU) capability for scalability.
 * 2. Translation Loop: Real-time Audio Stream -> WebSocket -> Backend -> Google STT -> Google Translate -> Google TTS -> Audio Inject.
 * 3. Monorepo: Ensures that the 'MeetingEvent' emitted by the backend matches exactly what the frontend expects.
 * 4. Enterprise Ready: Separated core logic, infrastructure-specific adapters, and feature-based UI components.
 */

// Mock Components representing the Feature-Based Structure
const VideoPanel: React.FC<{ name: string; isLocal?: boolean }> = ({ name, isLocal }) => (
  <div className="relative group aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all">
    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
      <Video size={48} />
    </div>
    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
      {isLocal && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
      {name} {isLocal && "(You)"}
    </div>
  </div>
);

const LanguageSelector: React.FC = () => (
  <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-xl border border-gray-700">
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
      <Languages size={18} />
      Translation Settings
    </div>
    <div className="grid grid-cols-2 gap-3 mt-2">
      <div>
        <label className="text-[10px] uppercase text-gray-500 font-bold">My Language</label>
        <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option>English (US)</option>
          <option>Portuguese (BR)</option>
          <option>Japanese</option>
          <option>Spanish</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] uppercase text-gray-500 font-bold">Translation To</label>
        <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option>Portuguese (BR)</option>
          <option>English (US)</option>
          <option>Japanese</option>
          <option>German</option>
        </select>
      </div>
    </div>
  </div>
);

const TranscriptPanel: React.FC = () => (
  <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
      <h3 className="font-semibold flex items-center gap-2 text-blue-400">
        <MessageSquare size={18} />
        Live Translation
      </h3>
      <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold">LIVE</span>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] text-gray-500 font-bold">SATO (JA) → YOU (EN)</p>
        <p className="text-sm bg-gray-800 p-3 rounded-lg border-l-4 border-blue-500">
          "Welcome everyone. Let's start the project overview."
        </p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-[10px] text-gray-500 font-bold">YOU (EN) → SATO (JA)</p>
        <p className="text-sm bg-blue-900/20 p-3 rounded-lg border-r-4 border-blue-600 inline-block">
          "Thank you, Sato. I'm ready to begin."
        </p>
      </div>
    </div>
  </div>
);

const ControlBar: React.FC = () => (
  <div className="h-20 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 px-8 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white">GlobalBridge Meeting</span>
        <span className="text-xs text-gray-500">Room: tech-sync-global</span>
      </div>
      <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
        <Info size={20} />
      </button>
    </div>

    <div className="flex items-center gap-4">
      <button className="w-12 h-12 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-all group">
        <Mic size={20} className="group-hover:text-blue-400" />
      </button>
      <button className="w-12 h-12 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-all group">
        <Video size={20} className="group-hover:text-blue-400" />
      </button>
      <button className="w-12 h-12 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-all group">
        <Globe size={20} className="text-blue-500" />
      </button>
      <div className="h-8 w-[1px] bg-gray-800 mx-2" />
      <button className="w-14 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-2xl transition-all shadow-lg shadow-red-500/20">
        <PhoneOff size={24} />
      </button>
    </div>

    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        <Users size={18} />
        <span>12 Participants</span>
      </button>
      <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
        <Settings size={20} />
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation / Config */}
        <aside className="w-16 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-6 gap-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
            GB
          </div>
          <nav className="flex flex-col gap-6 text-gray-500">
            <button className="hover:text-white transition-colors"><Layout size={24} /></button>
            <button className="text-blue-400"><Globe size={24} /></button>
            <button className="hover:text-white transition-colors"><Users size={24} /></button>
            <button className="hover:text-white transition-colors"><Settings size={24} /></button>
          </nav>
        </aside>

        {/* Meeting Arena */}
        <main className="flex-1 flex flex-col min-w-0 bg-black">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <VideoPanel name="You" isLocal />
                <VideoPanel name="Sato Tanaka" />
                <VideoPanel name="Elena Rodriguez" />
                <VideoPanel name="Dr. Julian" />
                <VideoPanel name="Marketing Lead" />
                <div className="aspect-video bg-gray-900/50 rounded-xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 gap-2">
                  <Users size={32} />
                  <span className="text-sm">+7 others</span>
                </div>
              </div>

              <div className="mt-8">
                <LanguageSelector />
              </div>
            </div>
          </div>
          
          <ControlBar />
        </main>

        {/* Translation Panel */}
        <aside className="w-96 hidden lg:block">
          <TranscriptPanel />
        </aside>
      </div>
    </div>
  );
};

export default App;
