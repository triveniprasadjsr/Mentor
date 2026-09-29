import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  url?: string;
  title?: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!url) {
    return (
      <div className="aspect-video w-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6">
        <AlertCircle className="w-10 h-10 mb-2 text-slate-500" />
        <p className="text-sm font-semibold">No video source attached</p>
        <p className="text-xs text-slate-500 mt-1">Lecture may be in document or quiz format.</p>
      </div>
    );
  }

  // Check if it's YouTube
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  if (isYouTube) {
    let embedUrl = url;
    if (url.includes('watch?v=')) {
      const videoId = new URL(url).searchParams.get('v');
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }

    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={embedUrl}
          title={title || 'Lecture Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-xl group">
      <video
        ref={videoRef}
        src={url}
        controls
        controlsList="nodownload"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
