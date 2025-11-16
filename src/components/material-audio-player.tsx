"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function MaterialAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const audio = new Audio("/bgMusic.mp3");
    audio.loop = true;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    const tryAutoplay = async () => {
      try {
        await audio.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      }
    };

    void tryAutoplay();

    return () => {
      audio.pause();
      audioRef.current = null;
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setAutoplayBlocked(false))
        .catch(() => setAutoplayBlocked(true));
    } else {
      audio.pause();
    }
  };

  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const statusText = autoplayBlocked
    ? "Tap play to enable audio"
    : isPlaying
      ? "Now playing"
      : "Paused";

  return (
    <div className="pointer-events-none fixed bottom-10 right-3 z-50 flex max-w-[calc(100vw-1rem)] justify-end px-2 md:bottom-6 md:right-6">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/20 bg-[#02101e]/85 px-3 py-2 text-white shadow-[0_16px_50px_rgba(0,0,0,0.65)] backdrop-blur">
        <div className="relative flex size-8 items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#004369] via-[#507a83] to-[#5c887c] opacity-60 blur-xl ${
              isPlaying ? "breathing-glow" : ""
            }`}
          />
          <button
            type="button"
            onClick={handleTogglePlay}
            title={statusText}
            aria-label={isPlaying ? "Pause background music" : "Play background music"}
            className={`relative z-10 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#004369] via-[#507a83] to-[#5c887c] text-[#fff7ec] shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
              isPlaying ? "breathing-button" : "hover:scale-105"
            }`}
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute background music" : "Mute background music"}
          className="rounded-full border border-white/25 bg-white/5 p-2 text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
