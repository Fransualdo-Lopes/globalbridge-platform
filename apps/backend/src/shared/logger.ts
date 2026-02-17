
import pino from 'pino';
import { ENV } from '../config/env';

export const logger = pino({
  level: ENV.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: ENV.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined,
  base: {
    service: 'globalbridge-backend',
    env: ENV.NODE_ENV
  }
});
