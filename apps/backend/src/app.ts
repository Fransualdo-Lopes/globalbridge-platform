
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
// Fix: Cast middleware results to any to resolve overload resolution errors in certain TypeScript/Express environments
app.use(cors() as any);
app.use(express.json() as any);

// Modular Routes
// Fix: Cast routes to any to ensure compatibility with Express's app.use overloads
app.use('/api/v1/auth', AuthRoutes as any);
app.use('/api/v1/meetings', MeetingRoutes as any);

// Global Error Handler
app.use(ErrorMiddleware as any);

export { app, httpServer };
