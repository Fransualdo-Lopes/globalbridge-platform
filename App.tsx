
import React, { useState } from 'react';
import { MeetingRoom } from './features/meeting/MeetingRoom';
import { VoiceLab } from './features/voice-lab/VoiceLab';
import { Layout, Globe, Users, Settings, Mic2 } from 'lucide-react';
import { VoiceProfileProvider } from './core/context/VoiceProfileContext';

const App: React.FC = () => {
  const [roomId] = useState('tech-sync-global'); 
  const [activeTab, setActiveTab] = useState<'meeting' | 'voicelab'>('meeting');

  return (
    <VoiceProfileProvider>
      <div className="h-screen flex overflow-hidden bg-gray-950">
        {/* Navigation Sidebar */}
        <aside className="w-20 bg-gray-950 border-r border-gray-900 flex flex-col items-center py-8 gap-10 z-50">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
            GB
          </div>
          <nav className="flex flex-col gap-8">
            <button 
              onClick={() => setActiveTab('meeting')}
              className={`transition-all ${activeTab === 'meeting' ? 'text-blue-500' : 'text-gray-600 hover:text-white'}`}
            >
              <Layout size={26} />
            </button>
            <button 
              onClick={() => setActiveTab('voicelab')}
              className={`transition-all ${activeTab === 'voicelab' ? 'text-blue-500' : 'text-gray-600 hover:text-white'}`}
            >
              <Mic2 size={26} />
            </button>
            <button className="text-gray-600 hover:text-white transition-all"><Users size={26} /></button>
            <div className="h-px w-8 bg-gray-800" />
            <button className="text-gray-600 hover:text-white transition-all"><Settings size={26} /></button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-y-auto">
          {activeTab === 'meeting' ? (
            <MeetingRoom roomId={roomId} />
          ) : (
            <div className="min-h-full bg-gray-950 flex flex-col items-center justify-start py-12">
              <VoiceLab />
            </div>
          )}
        </div>
      </div>
    </VoiceProfileProvider>
  );
};

export default App;
