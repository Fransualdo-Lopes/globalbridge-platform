
import React, { useEffect, useRef } from 'react';
import { Video } from 'lucide-react';

interface VideoPanelProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({ stream, name, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
          <Video size={64} className="mb-4 animate-pulse" />
          <span className="text-sm font-medium">Waiting for video...</span>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
          {isLocal && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2 animate-pulse" />}
          {name}
        </div>
      </div>
    </div>
  );
};
