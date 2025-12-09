"use client";

import { useRef, useEffect, useState } from 'react';

export default function AdPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    // Auto-play on load
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked - user needs to interact
      });
    }
  }, []);

  // Placeholder content when no video is uploaded
  if (!hasVideo) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Upload your DevLink ad video to:</p>
          <code className="bg-white/10 px-4 py-2 rounded-lg text-lg">
            /public/ad/devlink-ad.mp4
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Fullscreen video player */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onError={() => setHasVideo(false)}
      >
        <source src="/ad/devlink-ad.mp4" type="video/mp4" />
        <source src="/ad/devlink-ad.webm" type="video/webm" />
      </video>

      {/* Click anywhere to unmute (browsers block autoplay with sound) */}
      <button
        onClick={() => {
          if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
          }
        }}
        className="absolute bottom-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        aria-label="Toggle sound"
      >
        <SoundIcon />
      </button>
    </div>
  );
}

function SoundIcon() {
  return (
    <svg 
      className="w-6 h-6 text-white" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
      />
    </svg>
  );
}
