
import React, { useEffect, useRef } from 'react';
import { Video, VideoOff } from 'lucide-react';

interface VideoPanelProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  videoOff?: boolean;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({ stream, name, isLocal, videoOff }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      // Re-associa o stream sempre que ele mudar ou quando o componente for montado
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* O vídeo permanece no DOM para manter a conexão ativa, mas oculto se videoOff for true */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${videoOff ? 'hidden' : 'block'}`}
        />
      )}

      {/* Placeholder visível apenas quando não há stream ou o vídeo está desligado */}
      {(!stream || videoOff) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 bg-gray-900">
          {videoOff ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <VideoOff size={40} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Camera is off</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Video size={64} className="mb-4 animate-pulse opacity-20" />
              <span className="text-sm font-medium opacity-20">Waiting for video...</span>
            </div>
          )}
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-2">
          {isLocal && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse" />}
          {name}
          {videoOff && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-tighter">OFF</span>}
        </div>
      </div>
    </div>
  );
};
