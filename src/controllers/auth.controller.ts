import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { RegisterDTO, LoginDTO } from '../types/index.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto: RegisterDTO = req.body;
    const session = await authService.register(dto);
    sendSuccess(res, 'Usuario registrado exitosamente en Aurum Fitness', session, 201);
  } catch (error) {
    const message = (error as Error).message || 'Error en el proceso de registro';
    const isConflict = message.toLowerCase().includes('registrado') || message.toLowerCase().includes('already');
    sendError(res, message, isConflict ? 409 : 500, message);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto: LoginDTO = req.body;
    const session = await authService.login(dto);
    sendSuccess(res, 'Inicio de sesión exitoso', session, 200);
  } catch (error) {
    const message = (error as Error).message || 'Error al iniciar sesión';
    const isUnauthorized = message.toLowerCase().includes('incorrecto') || message.toLowerCase().includes('invalid');
    sendError(res, message, isUnauthorized ? 401 : 500, message);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      sendError(res, 'Cabecera de usuario faltante', 400);
      return;
    }
    const user = await authService.getProfile(userId);
    if (!user) {
      sendError(res, 'Usuario no encontrado', 404);
      return;
    }
    sendSuccess(res, 'Perfil recuperado con éxito', user);
  } catch (error) {
    sendError(res, 'Error al recuperar perfil', 500, (error as Error).message);
  }
};
