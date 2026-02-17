
import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../../shared/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * PRODUCTION SIGNALING STRATEGY
 * 
 * In a scaled environment, use Redis Pub/Sub to broadcast signals across nodes.
 * This implementation tracks local connections for MVP.
 */
export class SignalingGateway {
  private rooms: Map<string, Set<string>> = new Map(); // RoomId -> Set of ConnectionIds
  private connections: Map<string, WebSocket> = new Map(); // ConnectionId -> Socket

  constructor(private wss: WebSocketServer) {
    this.init();
  }

  private init() {
    this.wss.on('connection', (socket) => {
      const connectionId = uuidv4();
      this.connections.set(connectionId, socket);

      logger.info({ connectionId }, 'New signaling client connected');

      socket.on('message', (data) => this.handleMessage(connectionId, data.toString()));
      socket.on('close', () => this.handleDisconnect(connectionId));
    });
  }

  private handleMessage(connectionId: string, message: string) {
    try {
      const data = JSON.parse(message);
      const { type, roomId, payload } = data;

      switch (type) {
        case 'join':
          this.joinRoom(connectionId, roomId);
          break;
        case 'signal':
          this.relaySignal(connectionId, roomId, payload);
          break;
        default:
          logger.warn({ type }, 'Unknown signal type received');
      }
    } catch (error) {
      logger.error(error, 'Error handling socket message');
    }
  }

  private joinRoom(connectionId: string, roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)?.add(connectionId);
    logger.debug({ connectionId, roomId }, 'User joined room');
  }

  private relaySignal(senderId: string, roomId: string, payload: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.forEach((participantId) => {
      if (participantId !== senderId) {
        const socket = this.connections.get(participantId);
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'signal',
            from: senderId,
            payload
          }));
        }
      }
    });
  }

  private handleDisconnect(connectionId: string) {
    this.connections.delete(connectionId);
    this.rooms.forEach((participants, roomId) => {
      if (participants.has(connectionId)) {
        participants.delete(connectionId);
        if (participants.size === 0) this.rooms.delete(roomId);
      }
    });
    logger.info({ connectionId }, 'Signaling client disconnected');
  }
}
