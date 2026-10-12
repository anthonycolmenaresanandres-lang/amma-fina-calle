import React, {useEffect, useRef, useState} from 'react';

export interface BackgroundMusicProps {
  readonly url: string;
  readonly isPlaying: boolean;
  readonly isMuted?: boolean;
  readonly volume?: number;
}

const DEFAULT_VOLUME = 0.2;

export function BackgroundMusic({
  url,
  isPlaying,
  isMuted = false,
  volume = DEFAULT_VOLUME,
}: BackgroundMusicProps): React.ReactElement | null {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined' && url) {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;
    }
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    if (isPlaying && !isMuted) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, isMuted, volume]);

  useEffect(() => {
    const unlock = () => {
      const audio = audioRef.current;
      if (audio && isPlaying && !isMuted) {
        void audio.play().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unlock, {once: true});
    window.addEventListener('keydown', unlock, {once: true});
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [isPlaying, isMuted]);

  return null;
}

export default BackgroundMusic;
