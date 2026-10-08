import { Request, Response } from 'express';
import { workoutService } from '../services/workout.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getRoutines = (_req: Request, res: Response): void => {
  try {
    const routines = workoutService.getAllRoutines();
    sendSuccess(res, 'Rutinas obtenidas exitosamente', routines);
  } catch (error) {
    sendError(res, 'Error al obtener rutinas', 500, (error as Error).message);
  }
};

export const getRoutineById = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const routine = workoutService.getRoutineById(id);
    if (!routine) {
      sendError(res, `Rutina con ID '${id}' no encontrada`, 404);
      return;
    }
    sendSuccess(res, 'Rutina obtenida exitosamente', routine);
  } catch (error) {
    sendError(res, 'Error al buscar rutina', 500, (error as Error).message);
  }
};

export const createRoutine = (req: Request, res: Response): void => {
  try {
    const { title, description, difficulty, durationMinutes, exercises, targetCaloriesBurn } = req.body;
    if (!title || !difficulty) {
      sendError(res, 'Campos requeridos faltantes: title, difficulty', 400);
      return;
    }

    const created = workoutService.createRoutine({
      title,
      description: description || '',
      difficulty,
      durationMinutes: Number(durationMinutes) || 45,
      targetCaloriesBurn: Number(targetCaloriesBurn) || 300,
      exercises: exercises || [],
    });

    sendSuccess(res, 'Rutina creada con éxito', created, 210);
  } catch (error) {
    sendError(res, 'Error al crear rutina', 500, (error as Error).message);
  }
};
