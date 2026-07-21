import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserDTO,
  CreateLobbyRequest,
  JoinLobbyRequest,
  ToggleReadyRequest,
  LobbyDTO,
  MatchDTO,
  SubmitActionRequest,
  MatchEventDTO,
} from '@boardgametime/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bgt_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bgt_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bgt_token');
    localStorage.removeItem('bgt_user');
  }
}

export function getStoredUser(): UserDTO | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('bgt_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserDTO): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bgt_user', JSON.stringify(user));
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const path = endpoint.startsWith('/api/') || endpoint === '/api'
    ? endpoint
    : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || `API request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth API
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetchApi<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.token) setAuthToken(res.token);
  if (res.user) setStoredUser(res.user);
  return res;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetchApi<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.token) setAuthToken(res.token);
  if (res.user) setStoredUser(res.user);
  return res;
}

export async function getMe(): Promise<UserDTO> {
  const user = await fetchApi<UserDTO>('/api/auth/me');
  if (user) setStoredUser(user);
  return user;
}

// Lobbies API
export async function listLobbies(): Promise<LobbyDTO[]> {
  return fetchApi<LobbyDTO[]>('/api/lobbies');
}

export async function createLobby(data: CreateLobbyRequest): Promise<LobbyDTO> {
  return fetchApi<LobbyDTO>('/api/lobbies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function joinLobby(id: string, data?: JoinLobbyRequest): Promise<LobbyDTO> {
  return fetchApi<LobbyDTO>(`/api/lobbies/${id}/join`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export async function toggleReady(id: string, data: ToggleReadyRequest): Promise<LobbyDTO> {
  return fetchApi<LobbyDTO>(`/api/lobbies/${id}/ready`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function startGame(id: string): Promise<{ matchId: string; match: MatchDTO }> {
  return fetchApi<{ matchId: string; match: MatchDTO }>(`/api/lobbies/${id}/start`, {
    method: 'POST',
  });
}

// Matches API
export async function getMatch(id: string): Promise<MatchDTO> {
  return fetchApi<MatchDTO>(`/api/matches/${id}`);
}

export async function submitAction(id: string, data: SubmitActionRequest): Promise<MatchDTO> {
  return fetchApi<MatchDTO>(`/api/matches/${id}/action`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMatchEvents(id: string): Promise<MatchEventDTO[]> {
  return fetchApi<MatchEventDTO[]>(`/api/matches/${id}/events`);
}
