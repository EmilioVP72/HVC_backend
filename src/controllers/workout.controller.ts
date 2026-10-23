import { Request, Response } from 'express';
import { workoutService } from '../services/workout.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getRoutines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const routines = await workoutService.getAllRoutines();
    sendSuccess(res, 'Rutinas obtenidas exitosamente', routines);
  } catch (error) {
    sendError(res, 'Error al obtener rutinas', 500, (error as Error).message);
  }
};

export const getRoutineById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const routine = await workoutService.getRoutineById(id);
    if (!routine) {
      sendError(res, `Rutina con ID '${id}' no encontrada`, 404);
      return;
    }
    sendSuccess(res, 'Rutina obtenida exitosamente', routine);
  } catch (error) {
    sendError(res, 'Error al buscar rutina', 500, (error as Error).message);
  }
};

export const createRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, difficulty, durationMinutes, exercises, targetCaloriesBurn } = req.body;
    if (!title || !difficulty) {
      sendError(res, 'Campos requeridos faltantes: title, difficulty', 400);
      return;
    }

    const created = await workoutService.createRoutine({
      title,
      description: description || '',
      difficulty,
      durationMinutes: Number(durationMinutes) || 45,
      targetCaloriesBurn: Number(targetCaloriesBurn) || 300,
      exercises: exercises || [],
    });

    sendSuccess(res, 'Rutina creada con éxito', created, 201);
  } catch (error) {
    sendError(res, 'Error al crear rutina', 500, (error as Error).message);
  }
};
