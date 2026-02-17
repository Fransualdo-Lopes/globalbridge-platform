
import { httpServer } from './app';
import { WebSocketServer } from 'ws';
import { ENV } from './config/env';
import { logger } from './shared/logger';
import { SignalingGateway } from './modules/signaling/signaling.gateway';
// Explicitly import process to ensure the Node.js type definition is used
import process from 'process';

const PORT = ENV.PORT;

// Initialize WebSocket Server for Signaling
const wss = new WebSocketServer({ server: httpServer, path: '/ws/signaling' });
new SignalingGateway(wss);

httpServer.listen(PORT, () => {
  logger.info(`🚀 GlobalBridge Backend ready at http://localhost:${PORT}`);
  logger.info(`📡 Signaling WebSocket enabled at ws://localhost:${PORT}/ws/signaling`);
});

// Handle graceful shutdown
// Explicitly use the imported process object which has correctly typed .on and .exit methods
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server...');
  httpServer.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
