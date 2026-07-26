// User & Auth DTOs & Payloads
export type UserRole = 'USER' | 'ADMIN';

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
  role?: UserRole;
  gameTurnReminders?: boolean;
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
  role?: UserRole;
  iat?: number;
  exp?: number;
}

export interface SystemHealthDTO {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  databaseStatus: 'connected' | 'disconnected';
  databaseLatencyMs: number;
  timestamp: string;
}

export interface AdminStatsDTO {
  activeGames: number;
  completedGames: number;
  abandonedGames: number;
  totalUserAccounts: number;
  activeUsers: number;
  totalLobbies: number;
  waitingLobbies: number;
  totalMatchEvents: number;
  systemHealth: SystemHealthDTO;
}

export interface AdminUserDetailDTO {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  isOnline: boolean;
  gameTurnReminders: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMatchDetailDTO {
  id: string;
  gameId: string;
  mode: PlayMode;
  status: MatchStatus;
  currentTurnPlayerId: string | null;
  players: {
    userId: string;
    username: string;
    seatIndex: number;
    avatarUrl?: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminLobbyDetailDTO {
  id: string;
  code: string;
  gameId: string;
  mode: PlayMode;
  visibility: LobbyVisibility;
  status: LobbyStatus;
  hostId: string;
  hostUsername: string;
  playersCount: number;
  maxPlayers: number;
  minPlayers: number;
  createdAt: string;
}

export interface AdminEventDetailDTO {
  id: string | number;
  matchId: string;
  sequenceNum: number;
  playerId: string;
  playerUsername?: string;
  actionType: string;
  actionPayload: unknown;
  createdAt: string;
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

// Game Status & Registry Types
export type GameStatus = 'production' | 'beta' | 'coming_soon';

export interface GameDefinition {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  author?: string;
  year?: number;
  minPlayers: number;
  maxPlayers: number;
  status: GameStatus;
}

export const GAME_DEFINITIONS: Record<string, GameDefinition> = {
  kingdoms: {
    id: 'kingdoms',
    name: 'Kingdoms',
    subtitle: 'REINER KNIZIA 2002',
    description: "Reiner Knizia's classic tile placement game of strategy, territory expansion, and math calculations (Fantasy Flight Games 2002 Edition).",
    author: 'Reiner Knizia',
    year: 2002,
    minPlayers: 2,
    maxPlayers: 4,
    status: 'production',
  },
  'dungeons-dice-danger': {
    id: 'dungeons-dice-danger',
    name: 'Dungeons, Dice & Danger',
    subtitle: 'RICHARD GARFIELD 2022',
    description: "Richard Garfield's roll-and-write dungeon crawler. Roll dice, form pairs, explore 4 distinct dungeons, fight monsters, and collect treasure.",
    author: 'Richard Garfield',
    year: 2022,
    minPlayers: 1,
    maxPlayers: 4,
    status: 'beta',
  },
};

export function isGameAvailable(
  gameId: string,
  isProduction: boolean = process.env.NODE_ENV === 'production'
): boolean {
  const game = GAME_DEFINITIONS[gameId];
  if (!game) return false;
  if (game.status === 'production') return true;
  if (game.status === 'beta') {
    const isBetaEnabled =
      process.env.NEXT_PUBLIC_ENABLE_BETA_GAMES === 'true' ||
      process.env.ENABLE_BETA_GAMES === 'true';
    return !isProduction || isBetaEnabled;
  }
  return false;
}

