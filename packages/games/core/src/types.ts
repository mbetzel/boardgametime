export interface BasePlayerState {
  id: string;
  score: number;
}

export interface GameEngine<TState, TAction> {
  gameId: string;
  minPlayers: number;
  maxPlayers: number;
  createInitialState(playerIds: string[]): TState;
  validateAction(state: TState, action: TAction): { valid: boolean; reason?: string };
  applyAction(state: TState, action: TAction): { newState: TState; events: unknown[] };
  sanitizeStateForPlayer(state: TState, playerId: string): Partial<TState>;
}
