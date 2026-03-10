const BASE = '/api';

let token: string | null = localStorage.getItem('token');

export function setToken(t: string) {
  token = t;
  localStorage.setItem('token', t);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  auth: (initData: string) =>
    request<{ token: string; user: User }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    }),
  me: () => request<MeResponse>('/me'),
  waterFlower: (userFlowerId: number) =>
    request<{ success: boolean }>(`/flowers/${userFlowerId}/water`, { method: 'POST' }),
  leaderboard: () => request<User[]>('/leaderboard'),
  seeds: () => request<Seed[]>('/seeds'),
  shareSeeds: (toUserId: number, flowerId: number, quantity: number) =>
    request('/seeds/share', { method: 'POST', body: JSON.stringify({ toUserId, flowerId, quantity }) }),
};

export interface User {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string;
  fdBalance: number;
}

export interface UserFlower {
  id: number;
  userId: number;
  flowerId: number;
  day: number;
  lastWateredAt: string | null;
  isDried: boolean;
  wateredToday: boolean;
  flower: { id: number; season: number; imagePath: string };
}

export interface MeResponse {
  user: User;
  flower: UserFlower | null;
  seeds: Seed[];
}

export interface Seed {
  id: number;
  userId: number;
  flowerId: number;
  quantity: number;
}
