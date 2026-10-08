import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('[Unhandled Error]:', err);
  const status = 500;
  const message = err.message || 'Internal Server Error';
  sendError(res, message, status);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404);
};
