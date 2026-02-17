import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws/signaling' });

// Signaling logic for real-time WebRTC coordination
const rooms: Map<string, Set<string>> = new Map();
const connections: Map<string, WebSocket> = new Map();

wss.on('connection', (socket) => {
  const connectionId = uuidv4();
  connections.set(connectionId, socket);

  logger.info({ connectionId }, 'New signaling client connected');

  socket.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      const { type, roomId, payload } = msg;

      switch (type) {
        case 'join':
          if (!rooms.has(roomId)) rooms.set(roomId, new Set());
          rooms.get(roomId)?.add(connectionId);
          logger.debug({ connectionId, roomId }, 'User joined room');
          break;
        case 'signal':
          const room = rooms.get(roomId);
          if (room) {
            room.forEach((participantId) => {
              if (participantId !== connectionId) {
                const targetSocket = connections.get(participantId);
                if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                  targetSocket.send(JSON.stringify({
                    type: 'signal',
                    from: connectionId,
                    payload
                  }));
                }
              }
            });
          }
          break;
      }
    } catch (error) {
      logger.error(error, 'Error handling socket message');
    }
  });

  socket.on('close', () => {
    connections.delete(connectionId);
    rooms.forEach((participants, roomId) => {
      if (participants.has(connectionId)) {
        participants.delete(connectionId);
        if (participants.size === 0) rooms.delete(roomId);
      }
    });
    logger.info({ connectionId }, 'Signaling client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  logger.info(`🚀 GlobalBridge Platform ready at http://localhost:${PORT}`);
  logger.info(`📡 Signaling WebSocket enabled at ws://localhost:${PORT}/ws/signaling`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server...');
  httpServer.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});