import { io } from 'socket.io-client';

export function createSocket() {
  const wsBaseUrl = (window as any).VOICECHATS_WS_URL || 'http://localhost:3000';
  return io(wsBaseUrl, { autoConnect: false });
}
