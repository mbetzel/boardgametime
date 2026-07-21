export interface UserDTO {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export type PlayMode = 'REALTIME' | 'ASYNC';
export type LobbyVisibility = 'PUBLIC' | 'PRIVATE';

export interface LobbyDTO {
  id: string;
  hostId: string;
  gameId: string;
  mode: PlayMode;
  visibility: LobbyVisibility;
  inviteCode?: string;
  minPlayers: number;
  maxPlayers: number;
  players: { userId: string; username: string; isReady: boolean }[];
  createdAt: string;
}

export interface MatchDTO {
  id: string;
  gameId: string;
  mode: PlayMode;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  currentTurnPlayerId: string;
  stateSnapshot: unknown;
  updatedAt: string;
}
