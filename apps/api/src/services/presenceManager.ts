export class PresenceManager {
  private static instance: PresenceManager;

  // Map of userId -> Set of active socket IDs
  private userSockets: Map<string, Set<string>> = new Map();

  // Map of matchId -> Map of userId -> Set of socket IDs in match room
  private matchSockets: Map<string, Map<string, Set<string>>> = new Map();

  private constructor() {}

  public static getInstance(): PresenceManager {
    if (!PresenceManager.instance) {
      PresenceManager.instance = new PresenceManager();
    }
    return PresenceManager.instance;
  }

  // Socket connected
  public registerSocket(userId: string, socketId: string): void {
    if (!userId || !socketId) return;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  // Socket disconnected
  public unregisterSocket(userId: string, socketId: string): void {
    if (!userId || !socketId) return;

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    // Also remove from match rooms
    for (const [matchId, playerMap] of this.matchSockets.entries()) {
      const userSocketsInMatch = playerMap.get(userId);
      if (userSocketsInMatch) {
        userSocketsInMatch.delete(socketId);
        if (userSocketsInMatch.size === 0) {
          playerMap.delete(userId);
        }
      }
      if (playerMap.size === 0) {
        this.matchSockets.delete(matchId);
      }
    }
  }

  // User joined match room
  public joinMatchRoom(userId: string, matchId: string, socketId: string): void {
    if (!userId || !matchId || !socketId) return;

    if (!this.matchSockets.has(matchId)) {
      this.matchSockets.set(matchId, new Map());
    }

    const playerMap = this.matchSockets.get(matchId)!;
    if (!playerMap.has(userId)) {
      playerMap.set(userId, new Set());
    }
    playerMap.get(userId)!.add(socketId);
  }

  // User left match room
  public leaveMatchRoom(userId: string, matchId: string, socketId: string): void {
    if (!userId || !matchId || !socketId) return;

    const playerMap = this.matchSockets.get(matchId);
    if (playerMap) {
      const userSocketsInMatch = playerMap.get(userId);
      if (userSocketsInMatch) {
        userSocketsInMatch.delete(socketId);
        if (userSocketsInMatch.size === 0) {
          playerMap.delete(userId);
        }
      }
      if (playerMap.size === 0) {
        this.matchSockets.delete(matchId);
      }
    }
  }

  // Check if user is connected anywhere on site
  public isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return Boolean(sockets && sockets.size > 0);
  }

  // Check if user is actively in the match room
  public isUserActiveInMatch(userId: string, matchId: string): boolean {
    const playerMap = this.matchSockets.get(matchId);
    if (!playerMap) return false;
    const userSocketsInMatch = playerMap.get(userId);
    return Boolean(userSocketsInMatch && userSocketsInMatch.size > 0);
  }

  // Clear all presence (useful for testing)
  public clear(): void {
    this.userSockets.clear();
    this.matchSockets.clear();
  }
}

export const presenceManager = PresenceManager.getInstance();
