import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/utils/appError.js';

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'Route not found'));
}

export function errorHandler(error: Error | AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error.message || 'Internal server error';
  res.status(statusCode).json({ message });
}