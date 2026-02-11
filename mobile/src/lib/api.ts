import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://musicsforyou.replit.app/api';

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

let authToken: string | null = null;

async function getAuthToken(): Promise<string | null> {
  if (authToken) return authToken;
  try {
    authToken = await SecureStore.getItemAsync('auth_token');
    return authToken;
  } catch {
    return null;
  }
}

async function setAuthToken(token: string): Promise<void> {
  authToken = token;
  try {
    await SecureStore.setItemAsync('auth_token', token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
}

async function clearAuthToken(): Promise<void> {
  authToken = null;
  try {
    await SecureStore.deleteItemAsync('auth_token');
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers: any = {
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export const api = {
  auth: {
    sendCode: async (phone: string) => {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    verify: async (phone: string, code: string) => {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const data = await res.json();
      
      if (data.token) {
        await setAuthToken(data.token);
      } else if (data.user?.id) {
        await setAuthToken(data.user.id);
      }
      
      return data;
    },

    logout: async () => {
      try {
        await fetchWithAuth(`${API_BASE}/auth/logout`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
      await clearAuthToken();
      return { success: true };
    },
  },

  user: {
    getProfile: async (): Promise<User> => {
      const res = await fetchWithAuth(`${API_BASE}/user/profile`);
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
      const res = await fetchWithAuth(`${API_BASE}/music/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Generation failed');
      }
      return res.json();
    },

    getSong: async (id: string): Promise<Song> => {
      const res = await fetchWithAuth(`${API_BASE}/music/song/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    getLibrary: async (): Promise<{ songs: Song[] }> => {
      const res = await fetchWithAuth(`${API_BASE}/music/library`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },

  voice: {
    uploadSample: async (audioUri: string, transcript: string) => {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice-sample.m4a',
      } as any);
      formData.append('transcript', transcript);

      const res = await fetchWithAuth(`${API_BASE}/voice/upload-sample`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
};
