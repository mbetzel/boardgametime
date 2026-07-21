import { io, Socket } from 'socket.io-client';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let lobbySocket: Socket | null = null;
let matchSocket: Socket | null = null;

export function getLobbySocket(): Socket {
  if (!lobbySocket) {
    lobbySocket = io(`${WS_BASE_URL}/lobbies`, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return lobbySocket;
}

export function getMatchSocket(): Socket {
  if (!matchSocket) {
    matchSocket = io(`${WS_BASE_URL}/matches`, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return matchSocket;
}

export function disconnectSockets(): void {
  if (lobbySocket) {
    lobbySocket.disconnect();
    lobbySocket = null;
  }
  if (matchSocket) {
    matchSocket.disconnect();
    matchSocket = null;
  }
}
