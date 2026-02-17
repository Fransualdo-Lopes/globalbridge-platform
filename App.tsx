
import React, { useState } from 'react';
import { MeetingRoom } from './features/meeting/MeetingRoom';
import { Layout, Globe, Users, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [roomId] = useState('tech-sync-global'); // In a real app, this would come from the URL router

  return (
    <div className="h-screen flex overflow-hidden bg-gray-950">
      {/* Navigation Sidebar */}
      <aside className="w-20 bg-gray-950 border-r border-gray-900 flex flex-col items-center py-8 gap-10">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
          GB
        </div>
        <nav className="flex flex-col gap-8 text-gray-600">
          <button className="hover:text-white transition-all"><Layout size={26} /></button>
          <button className="text-blue-500"><Globe size={26} /></button>
          <button className="hover:text-white transition-all"><Users size={26} /></button>
          <div className="h-px w-8 bg-gray-800" />
          <button className="hover:text-white transition-all"><Settings size={26} /></button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <MeetingRoom roomId={roomId} />
      </div>
    </div>
  );
};

export default App;
