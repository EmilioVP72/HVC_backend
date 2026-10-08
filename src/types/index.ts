export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'trainer' | 'admin';
  fitnessGoal?: 'muscle_gain' | 'fat_loss' | 'endurance' | 'maintenance';
  createdAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'pecho' | 'espalda' | 'piernas' | 'hombros' | 'brazos' | 'core';
  sets: number;
  reps: number;
  weightKg?: number;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado' | 'elite';
  durationMinutes: number;
  exercises: Exercise[];
  targetCaloriesBurn: number;
  createdAt: Date;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
}
