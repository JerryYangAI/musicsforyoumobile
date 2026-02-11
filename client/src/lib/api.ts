const API_BASE = "/api";

export interface User {
  id: string;
  phone: string;
  credits: number;
  hasCustomVoice: boolean;
  voiceId?: string;
}

export interface Song {
  id: string;
  title: string;
  prompt: string;
  style?: string;
  mood?: string;
  duration: number;
  audioUrl?: string;
  coverUrl?: string;
  status: string;
  createdAt: string;
}

export const api = {
  auth: {
    sendCode: async (phone: string) => {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    verify: async (phone: string, code: string) => {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    logout: async () => {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },

  user: {
    getProfile: async (): Promise<User> => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },

  music: {
    generate: async (data: {
      prompt: string;
      style?: string;
      mood?: string;
      duration: number;
    }) => {
      const res = await fetch(`${API_BASE}/music/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Generation failed");
      }
      return res.json();
    },

    getSong: async (id: string): Promise<Song> => {
      const res = await fetch(`${API_BASE}/music/song/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    getLibrary: async (): Promise<{ songs: Song[] }> => {
      const res = await fetch(`${API_BASE}/music/library`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },

  voice: {
    uploadSample: async (audioFile: File, transcript: string) => {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("transcript", transcript);

      const res = await fetch(`${API_BASE}/voice/upload-sample`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
};
