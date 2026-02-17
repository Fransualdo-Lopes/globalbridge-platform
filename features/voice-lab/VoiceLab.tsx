
import React, { useState } from 'react';
import { Mic, Shield, CheckCircle, ArrowRight, Trash2, Loader2, Info, Fingerprint, Activity } from 'lucide-react';
import { useVoiceProfile } from '../../core/context/VoiceProfileContext';
import { useVoiceEnrollment } from '../../hooks/useVoiceEnrollment';

export const VoiceLab: React.FC = () => {
  const { profile, setConsent, completeEnrollment, resetProfile } = useVoiceProfile();
  const { isRecording, duration, samples, startRecording, stopRecording, resetEnrollment } = useVoiceEnrollment();
  const [isProcessing, setIsProcessing] = useState(false);

  const REQUIRED_SECONDS = 180; // 3 minutes
  const progress = Math.min(100, (duration / REQUIRED_SECONDS) * 100);

  const handleEnroll = async () => {
    setIsProcessing(true);
    
    // Simula análise de características vocais (DNA Vocal)
    const fingerprints = [
      "Voz barítona profunda, ressonância peitoral forte, cadência pausada e articulada.",
      "Voz soprano brilhante, timbre aveludado, ritmo acelerado e entonação ascendente.",
      "Voz tenor média, textura levemente rouca, projeção frontal clara.",
      "Voz metálica, frequência fundamental alta, dicção precisa e seca."
    ];
    const detectedFingerprint = fingerprints[Math.floor(Math.random() * fingerprints.length)];

    setTimeout(() => {
      completeEnrollment(
        `v-${Math.random().toString(36).substr(2, 9)}`, 
        ['mock-url'],
        detectedFingerprint
      );
      setIsProcessing(false);
    }, 3000);
  };

  if (!profile.consentGiven) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8">
            <Shield className="text-blue-500" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Consentimento de Clonagem</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Nossa tecnologia <b>S2S Native</b> exige uma "Impressão Digital Acústica" para garantir que a tradução soe como você.
          </p>
          <button 
            onClick={() => setConsent(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
          >
            Aceitar e Iniciar Captura
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (profile.isEnrolled) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 animate-in fade-in zoom-in-95">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
            <Fingerprint size={240} />
          </div>
          
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Perfil Vocal Aplicado</h2>
          <p className="text-blue-400 text-sm font-mono mb-8 uppercase tracking-widest">ID: {profile.voiceId}</p>
          
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 text-left mb-8 backdrop-blur-sm">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={14} /> DNA Acústico Detectado
            </h4>
            <p className="text-gray-200 text-sm italic leading-relaxed">
              "{profile.fingerprint}"
            </p>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-5 text-left mb-10 flex gap-4 items-center">
            <Info className="text-blue-400 shrink-0" size={20} />
            <p className="text-xs text-gray-400">
              Este perfil será injetado em cada tradução para garantir consistência identitária em qualquer idioma.
            </p>
          </div>

          <button 
            onClick={() => { resetProfile(); resetEnrollment(); }}
            className="w-full border border-gray-800 hover:bg-red-500/10 hover:border-red-500/50 text-gray-500 hover:text-red-500 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={20} /> Descartar e Gravar Novo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Captura de Identidade</h2>
          <p className="text-gray-500">Grave sua voz para extrairmos seu perfil acústico.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-blue-500">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</p>
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">Tempo de Amostragem</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-10 text-center">
             <p className="text-sm text-gray-400 mb-6 px-10">
               Leia um texto qualquer em voz alta. Evite ruídos de fundo para uma clonagem mais precisa.
             </p>
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto transition-all ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'bg-blue-600 hover:scale-105 shadow-[0_0_40px_rgba(37,99,235,0.3)]'}`}
            >
              {isRecording ? <Activity size={40} className="text-white animate-pulse" /> : <Mic size={44} className="text-white" />}
            </button>
          </div>

          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-12">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button 
            disabled={duration < 10 || isRecording || isProcessing}
            onClick={handleEnroll}
            className={`w-full font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-2 ${duration < 10 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/20'}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Gerando DNA Vocal...
              </>
            ) : (
              <>
                Finalizar e Ativar Clonagem
                <Fingerprint size={22} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
