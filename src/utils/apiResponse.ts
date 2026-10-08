import { Response } from 'express';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | null;
}

export const sendSuccess = <T>(res: Response, message: string, data?: T, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, message: string, statusCode = 500, error?: string): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || null,
  });
};
