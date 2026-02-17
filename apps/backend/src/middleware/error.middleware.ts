
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { logger } from '../shared/logger';

export const ErrorMiddleware = (
  err: Error,
  req: Request,
  // Fix: Changed res type to any because the Express Response interface may not merge status() method correctly in all environments
  res: any,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.errorCode
      }
    });
  }

  logger.error(err, 'Unhandled Exception');
  
  res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected internal error occurred.',
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
};
