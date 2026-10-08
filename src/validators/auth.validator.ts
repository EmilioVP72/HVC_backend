import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const registerSchema = z.object({
  firstName: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z
    .string({ required_error: 'Los apellidos son obligatorios' })
    .trim()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email('Formato de correo electrónico inválido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email('Formato de correo electrónico inválido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña no puede estar vacía'),
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const message = issue ? `${issue.path.join('.')}: ${issue.message}` : 'Datos de entrada inválidos';
      sendError(res, message, 400);
      return;
    }
    req.body = result.data;
    next();
  };
};
