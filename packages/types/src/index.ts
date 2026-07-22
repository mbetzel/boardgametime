// User & Auth DTOs & Payloads
export interface EmailPreferencesDTO {
  gameTurnReminders: boolean;
  matchUpdates: boolean;
  newsletter: boolean;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  authProvider?: 'credentials' | 'google' | 'oauth' | string;
  isOAuth?: boolean;
  preferences?: EmailPreferencesDTO;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export interface UpdateEmailPreferencesRequest {
  gameTurnReminders?: boolean;
  matchUpdates?: boolean;
  newsletter?: boolean;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Lobby DTOs & Payloads
export type PlayMode = 'REALTIME' | 'ASYNC';
export type LobbyVisibility = 'PUBLIC' | 'PRIVATE';
export type LobbyStatus = 'WAITING' | 'IN_GAME' | 'CANCELLED';

export interface LobbyPlayerDTO {
  id?: string;
  lobbyId?: string;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  isReady: boolean;
  joinedAt?: string;
}

export interface LobbyDTO {
  id: string;
  code: string;
  hostId: string;
  gameId: string;
  mode: PlayMode;
  visibility: LobbyVisibility;
  status: LobbyStatus;
  minPlayers: number;
  maxPlayers: number;
  players: LobbyPlayerDTO[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLobbyRequest {
  gameId?: string;
  mode: PlayMode;
  visibility: LobbyVisibility;
  maxPlayers?: number;
  minPlayers?: number;
}

export interface JoinLobbyRequest {
  code?: string;
}

export interface ToggleReadyRequest {
  isReady: boolean;
}

// Match DTOs & Payloads
export type MatchStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface MatchPlayerDTO {
  id?: string;
  matchId?: string;
  userId: string;
  username: string;
  seatIndex: number;
  avatarUrl?: string | null;
}

export interface MatchDTO {
  id: string;
  gameId: string;
  mode: PlayMode;
  status: MatchStatus;
  currentTurnPlayerId: string | null;
  stateSnapshot: unknown;
  players: MatchPlayerDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchEventDTO {
  id: string | number;
  matchId: string;
  sequenceNum: number;
  playerId: string;
  actionType: string;
  actionPayload: unknown;
  createdAt: string;
}

export interface SubmitActionRequest {
  actionType: string;
  actionPayload: unknown;
}

// Socket Event Interfaces
export interface ServerToClientEvents {
  lobby_updated: (lobby: LobbyDTO) => void;
  match_started: (data: { matchId: string }) => void;
  match_updated: (match: MatchDTO) => void;
  action_applied: (event: MatchEventDTO) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (lobbyId: string) => void;
  leave_room: (lobbyId: string) => void;
  join_match: (matchId: string) => void;
  leave_match: (matchId: string) => void;
  game_action: (data: { matchId: string; actionType: string; actionPayload: unknown }) => void;
}
