
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { MeetingRoutes } from './modules/meetings/meeting.routes';
import { AuthRoutes } from './modules/auth/auth.routes';
import { ErrorMiddleware } from './middleware/error.middleware';

/**
 * PRODUCTION-READY BACKEND ARCHITECTURE
 * 
 * Scalability Strategy:
 * 1. Express handles standard REST (Auth, Meeting Management).
 * 2. Socket.io / WebSocket Server handles real-time signaling.
 * 3. Feature-based modularity: Auth, Signaling, Translation, Meetings.
 */

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Modular Routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/meetings', MeetingRoutes);

// Global Error Handler
app.use(ErrorMiddleware);

export { app, httpServer };
