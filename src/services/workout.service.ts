import { WorkoutRoutine } from '../types/index.js';

// Datos iniciales demostrativos de alta calidad
const INITIAL_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'routine-gold-1',
    title: 'Hipertrofia Gold: Torso Superior',
    description: 'Rutina de alto impacto diseñada para hipertrofia y fuerza en pecho, espalda y hombros.',
    difficulty: 'avanzado',
    durationMinutes: 60,
    targetCaloriesBurn: 550,
    createdAt: new Date(),
    exercises: [
      { id: 'ex-1', name: 'Press de Banca Plano con Barra', muscleGroup: 'pecho', sets: 4, reps: 8, weightKg: 80 },
      { id: 'ex-2', name: 'Dominadas con Lastre', muscleGroup: 'espalda', sets: 4, reps: 6, weightKg: 10 },
      { id: 'ex-3', name: 'Press Militar con Mancuernas', muscleGroup: 'hombros', sets: 3, reps: 10, weightKg: 24 },
      { id: 'ex-4', name: 'Remo con Barra T', muscleGroup: 'espalda', sets: 4, reps: 10, weightKg: 70 },
      { id: 'ex-5', name: 'Fondos en Paralelas', muscleGroup: 'pecho', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'routine-gold-2',
    title: 'Fuerza & Potencia: Tren Inferior',
    description: 'Enfoque biomecánico en cuádriceps, glúteos e isquiotibiales con sobrecarga progresiva.',
    difficulty: 'elite',
    durationMinutes: 70,
    targetCaloriesBurn: 620,
    createdAt: new Date(),
    exercises: [
      { id: 'ex-6', name: 'Sentadilla Trasera Profunda', muscleGroup: 'piernas', sets: 5, reps: 5, weightKg: 120 },
      { id: 'ex-7', name: 'Peso Muerto Rumano', muscleGroup: 'piernas', sets: 4, reps: 8, weightKg: 100 },
      { id: 'ex-8', name: 'Prensa Inclinada 45°', muscleGroup: 'piernas', sets: 4, reps: 12, weightKg: 200 },
      { id: 'ex-9', name: 'Elevación de Talones en Máquina', muscleGroup: 'piernas', sets: 4, reps: 15, weightKg: 80 },
    ],
  },
  {
    id: 'routine-gold-3',
    title: 'Acondicionamiento & Core Dorado',
    description: 'Circuito funcional dinámico para máxima quema calórica y estabilidad de core.',
    difficulty: 'intermedio',
    durationMinutes: 45,
    targetCaloriesBurn: 480,
    createdAt: new Date(),
    exercises: [
      { id: 'ex-10', name: 'Kettlebell Swings', muscleGroup: 'core', sets: 4, reps: 20, weightKg: 24 },
      { id: 'ex-11', name: 'Plancha Abdominal Activa', muscleGroup: 'core', sets: 4, reps: 60 },
      { id: 'ex-12', name: 'Rueda Abdominal (Ab Wheel)', muscleGroup: 'core', sets: 3, reps: 12 },
    ],
  },
];

export class WorkoutService {
  private routines: WorkoutRoutine[] = [...INITIAL_ROUTINES];

  public getAllRoutines(): WorkoutRoutine[] {
    return this.routines;
  }

  public getRoutineById(id: string): WorkoutRoutine | undefined {
    return this.routines.find((r) => r.id === id);
  }

  public createRoutine(routineData: Omit<WorkoutRoutine, 'id' | 'createdAt'>): WorkoutRoutine {
    const newRoutine: WorkoutRoutine = {
      ...routineData,
      id: `routine-${Date.now()}`,
      createdAt: new Date(),
    };
    this.routines.unshift(newRoutine);
    return newRoutine;
  }
}

export const workoutService = new WorkoutService();
