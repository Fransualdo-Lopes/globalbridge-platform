
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UnauthorizedError } from '../shared/errors';

export interface AuthRequest extends ExpressRequest {
  user?: {
    id: string;
    email: string;
  };
}

export const AuthMiddleware = (
  // Fix: Changed req type to any to resolve issues where headers property was missing from the inferred AuthRequest type
  req: any,
  res: Response,
  next: NextFunction
) => {
  // Fix: Directly access the authorization header from the headers object to avoid potential type resolution issues with the .get() method
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
