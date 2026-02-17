
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
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play().catch(e => console.error("Error playing video:", e));
      };
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLocal ? 'scale-x-[-1]' : ''} ${(videoOff || !stream) ? 'opacity-0' : 'opacity-100'}`}
      />

      {(videoOff || !stream) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 bg-gray-900">
          {videoOff ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <VideoOff size={40} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Camera Disabled</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative">
                <Video size={64} className="mb-4 animate-pulse opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                </div>
              </div>
              <span className="text-sm font-medium opacity-20">Awaiting Connection...</span>
            </div>
          )}
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold border border-white/10 flex items-center gap-2 shadow-xl">
          {isLocal ? (
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          ) : (
            <span className={`w-2 h-2 rounded-full inline-block ${stream ? 'bg-green-500' : 'bg-gray-600'}`} />
          )}
          <span className="uppercase tracking-tight">{name}</span>
          {videoOff && <span className="text-[9px] bg-red-500 text-white px-1 rounded ml-1">OFF</span>}
        </div>
      </div>
    </div>
  );
};
