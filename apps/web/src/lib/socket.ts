import { io, Socket } from 'socket.io-client';

const getRawWsBaseUrl = (): string => {
  let url = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (url.endsWith('/api')) url = url.slice(0, -4);
  return url;
};

const WS_BASE_URL = getRawWsBaseUrl();

let lobbySocket: Socket | null = null;
let matchSocket: Socket | null = null;

export function getLobbySocket(): Socket {
  if (!lobbySocket) {
    lobbySocket = io(`${WS_BASE_URL}/lobbies`, {
      autoConnect: true,
      transports: ['websocket'],
    });
  }
  return lobbySocket;
}

export function getMatchSocket(): Socket {
  if (!matchSocket) {
    matchSocket = io(`${WS_BASE_URL}/matches`, {
      autoConnect: true,
      transports: ['websocket'],
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
