import { Music, User } from "lucide-react";

export type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number; // in seconds
  url: string; // audio url
  mood: string;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  phone: string;
  credits: number;
  hasCustomVoice: boolean;
};

// Mock Data
import cover1 from "@/assets/cover-1.png";
import cover2 from "@/assets/cover-2.png";

export const MOCK_SONGS: Song[] = [
  {
    id: "1",
    title: "Neon Rain",
    artist: "AI Composer",
    cover: cover1,
    duration: 184,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    mood: "Cyberpunk",
    createdAt: "2023-10-15",
  },
  {
    id: "2",
    title: "Lo-Fi Study Beats",
    artist: "AI Composer",
    cover: cover2,
    duration: 145,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    mood: "Chill",
    createdAt: "2023-10-14",
  },
  {
    id: "3",
    title: "Midnight Drive",
    artist: "AI Composer",
    cover: cover1,
    duration: 210,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    mood: "Synthwave",
    createdAt: "2023-10-12",
  },
];

export const MUSIC_STYLES = [
  "Cinematic", "Lo-Fi", "Cyberpunk", "Jazz", "Classical", "Rock", "Pop", "Ambient"
];

export const MOODS = [
  "Happy", "Sad", "Energetic", "Relaxed", "Focus", "Dark", "Romantic"
];
