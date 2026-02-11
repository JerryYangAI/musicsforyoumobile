import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Audio } from 'expo-av';
import type { Song } from './api';

interface AudioPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playSong: (song: Song) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSong = async (song: Song) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      if (!song.audioUrl) {
        console.error('No audio URL for song');
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play song:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const pause = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resume = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setCurrentSong(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    }
  };

  const seekTo = async (positionMs: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMs);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        position,
        duration,
        playSong,
        pause,
        resume,
        stop,
        seekTo,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}
