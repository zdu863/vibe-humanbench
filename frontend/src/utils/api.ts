import { User, Score, UserStats, LeaderboardEntry, TestType } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// User API
export async function createOrGetUser(username: string): Promise<User> {
  return fetchJson<User>(`${API_BASE}/users`, {
    method: 'POST',
    body: JSON.stringify({ username })
  });
}

export async function getUser(id: string): Promise<User> {
  return fetchJson<User>(`${API_BASE}/users/${id}`);
}

// Score API
export async function submitScore(
  userId: string,
  testType: TestType,
  score: number,
  isDaily: boolean = false
): Promise<Score> {
  return fetchJson<Score>(`${API_BASE}/scores`, {
    method: 'POST',
    body: JSON.stringify({ userId, testType, score, isDaily })
  });
}

export async function getUserScores(
  userId: string,
  testType?: TestType,
  limit?: number
): Promise<Score[]> {
  const params = new URLSearchParams();
  if (testType) params.set('testType', testType);
  if (limit) params.set('limit', limit.toString());
  
  return fetchJson<Score[]>(`${API_BASE}/scores/${userId}?${params}`);
}

// Stats API
export async function getUserStats(userId: string, testType?: TestType): Promise<UserStats | UserStats[]> {
  const params = testType ? `?testType=${testType}` : '';
  return fetchJson<UserStats | UserStats[]>(`${API_BASE}/stats/${userId}${params}`);
}

// Leaderboard API
export async function getLeaderboard(
  testType: TestType,
  limit?: number,
  daily?: boolean
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit.toString());
  if (daily) params.set('daily', 'true');
  
  return fetchJson<LeaderboardEntry[]>(`${API_BASE}/leaderboard/${testType}?${params}`);
}

// Daily challenge API
export async function getDailyInfo(): Promise<{ seed: string; date: string }> {
  return fetchJson<{ seed: string; date: string }>(`${API_BASE}/daily`);
}

export async function checkDailyPlayed(
  userId: string,
  testType: TestType
): Promise<{ played: boolean; seed: string }> {
  return fetchJson<{ played: boolean; seed: string }>(
    `${API_BASE}/daily/check/${userId}/${testType}`
  );
}
