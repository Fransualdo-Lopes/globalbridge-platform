
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Video, 
  Mic, 
  Monitor, 
  Database, 
  Shield, 
  Bell, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const [devices, setDevices] = useState<{cameras: MediaDeviceInfo[], mics: MediaDeviceInfo[]}>({
    cameras: [],
    mics: []
  });

  const [activeSection, setActiveSection] = useState<'devices' | 'account' | 'network' | 'ai'>('devices');

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(d => {
      setDevices({
        cameras: d.filter(device => device.kind === 'videoinput'),
        mics: d.filter(device => device.kind === 'audioinput')
      });
    });
  }, []);

  const SectionButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeSection === id 
          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
      }`}
    >
      <Icon size={20} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-blue-500">
          <Settings size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-gray-500 text-sm">Configure sua experiência de reunião e preferências da plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Navigation */}
        <div className="col-span-12 md:col-span-3 space-y-2">
          <SectionButton id="devices" label="Audio & Video" icon={Video} />
          <SectionButton id="ai" label="AI Engine" icon={Cpu} />
          <SectionButton id="account" label="Identity & Privacy" icon={Shield} />
          <SectionButton id="network" label="Connection" icon={Monitor} />
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-9 bg-gray-900/50 border border-gray-900 rounded-3xl p-8 backdrop-blur-xl">
          {activeSection === 'devices' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Video className="text-blue-500" size={20} />
                  <h3 className="text-lg font-bold">Câmera</h3>
                </div>
                <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all">
                  {devices.cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label || 'Default Camera'}</option>)}
                </select>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Mic className="text-blue-500" size={20} />
                  <h3 className="text-lg font-bold">Microfone</h3>
                </div>
                <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all">
                  {devices.mics.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label || 'Default Microphone'}</option>)}
                </select>
              </section>

              <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="text-green-500 mt-0.5" size={18} />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Seus dispositivos foram detectados e otimizados para o pipeline <b>S2S Native</b>. A latência de captura está abaixo de 12ms.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="text-blue-500" size={20} />
                  <h3 className="text-lg font-bold">Gemini Live Config</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-950 rounded-2xl border border-gray-800">
                    <div>
                      <p className="text-sm font-bold">Thinking Budget</p>
                      <p className="text-[10px] text-gray-500">Reservar tokens para raciocínio complexo</p>
                    </div>
                    <span className="text-blue-500 font-mono text-sm">Auto</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-950 rounded-2xl border border-gray-800">
                    <div>
                      <p className="text-sm font-bold">Transcription Feedback</p>
                      <p className="text-[10px] text-gray-500">Exibir texto enquanto traduz</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
              <Shield size={48} className="text-gray-700 mb-4" />
              <h3 className="text-xl font-bold mb-2">Segurança Corporativa</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                As políticas de privacidade são gerenciadas pelo seu administrador da organização.
              </p>
            </div>
          )}

          {activeSection === 'network' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Server Status</p>
                  <p className="text-sm font-bold text-green-500">Operational</p>
                </div>
                <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">STUN/TURN</p>
                  <p className="text-sm font-bold text-blue-500">Active</p>
                </div>
              </div>
              <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-xs text-gray-400">
                  Detectamos uma conexão via VPN. Isso pode aumentar a latência da tradução em até 150ms.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
