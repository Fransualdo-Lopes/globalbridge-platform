
import React, { createContext, useContext, useState, useEffect } from 'react';

interface VoiceProfile {
  voiceId: string | null;
  isEnrolled: boolean;
  consentGiven: boolean;
  samplesUrl: string[];
  fingerprint: string | null; // Descrição acústica para o modelo
}

interface VoiceProfileContextType {
  profile: VoiceProfile;
  setConsent: (val: boolean) => void;
  completeEnrollment: (id: string, samples: string[], fingerprint: string) => void;
  resetProfile: () => void;
}

const VoiceProfileContext = createContext<VoiceProfileContextType | undefined>(undefined);

export const VoiceProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<VoiceProfile>(() => {
    const saved = localStorage.getItem('gb_voice_profile');
    return saved ? JSON.parse(saved) : {
      voiceId: null,
      isEnrolled: false,
      consentGiven: false,
      samplesUrl: [],
      fingerprint: null
    };
  });

  useEffect(() => {
    localStorage.setItem('gb_voice_profile', JSON.stringify(profile));
  }, [profile]);

  const setConsent = (val: boolean) => setProfile(p => ({ ...p, consentGiven: val }));
  
  const completeEnrollment = (id: string, samples: string[], fingerprint: string) => {
    setProfile(p => ({
      ...p,
      voiceId: id,
      isEnrolled: true,
      samplesUrl: samples,
      fingerprint
    }));
  };

  const resetProfile = () => {
    setProfile({
      voiceId: null,
      isEnrolled: false,
      consentGiven: false,
      samplesUrl: [],
      fingerprint: null
    });
  };

  return (
    <VoiceProfileContext.Provider value={{ profile, setConsent, completeEnrollment, resetProfile }}>
      {children}
    </VoiceProfileContext.Provider>
  );
};

export const useVoiceProfile = () => {
  const context = useContext(VoiceProfileContext);
  if (!context) throw new Error('useVoiceProfile must be used within VoiceProfileProvider');
  return context;
};
