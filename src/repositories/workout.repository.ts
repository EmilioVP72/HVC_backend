import { getSupabase } from '../config/supabase.js';
import { WorkoutRoutine, Exercise } from '../types/index.js';

const INITIAL_FALLBACK_ROUTINES: WorkoutRoutine[] = [
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

export interface IWorkoutRepository {
  getAll(): Promise<WorkoutRoutine[]>;
  getById(id: string): Promise<WorkoutRoutine | null>;
  create(data: Omit<WorkoutRoutine, 'id' | 'createdAt'>): Promise<WorkoutRoutine>;
}

export class SupabaseWorkoutRepository implements IWorkoutRepository {
  private inMemoryRoutines: WorkoutRoutine[] = [...INITIAL_FALLBACK_ROUTINES];

  public async getAll(): Promise<WorkoutRoutine[]> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('routines')
          .select('*, exercises(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description || '',
            difficulty: r.difficulty,
            durationMinutes: r.duration_minutes,
            targetCaloriesBurn: r.target_calories_burn,
            createdAt: new Date(r.created_at),
            exercises: (r.exercises || []).map((e: Record<string, unknown>) => ({
              id: e.id as string,
              name: e.name as string,
              muscleGroup: e.muscle_group as Exercise['muscleGroup'],
              sets: Number(e.sets),
              reps: Number(e.reps),
              weightKg: e.weight_kg ? Number(e.weight_kg) : undefined,
            })),
          }));
        }
      } catch (err) {
        console.warn('⚠️ No se pudieron cargar rutinas desde Supabase, usando fallback:', err);
      }
    }

    return this.inMemoryRoutines;
  }

  public async getById(id: string): Promise<WorkoutRoutine | null> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('routines')
          .select('*, exercises(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            title: data.title,
            description: data.description || '',
            difficulty: data.difficulty,
            durationMinutes: data.duration_minutes,
            targetCaloriesBurn: data.target_calories_burn,
            createdAt: new Date(data.created_at),
            exercises: (data.exercises || []).map((e: Record<string, unknown>) => ({
              id: e.id as string,
              name: e.name as string,
              muscleGroup: e.muscle_group as Exercise['muscleGroup'],
              sets: Number(e.sets),
              reps: Number(e.reps),
              weightKg: e.weight_kg ? Number(e.weight_kg) : undefined,
            })),
          };
        }
      } catch (err) {
        console.warn('⚠️ No se pudo cargar rutina por id desde Supabase:', err);
      }
    }

    return this.inMemoryRoutines.find((r) => r.id === id) || null;
  }

  public async create(routineData: Omit<WorkoutRoutine, 'id' | 'createdAt'>): Promise<WorkoutRoutine> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data: routineRow, error: routineError } = await supabase
          .from('routines')
          .insert({
            title: routineData.title,
            description: routineData.description,
            difficulty: routineData.difficulty,
            duration_minutes: routineData.durationMinutes,
            target_calories_burn: routineData.targetCaloriesBurn,
            is_public: true,
          })
          .select()
          .single();

        if (routineError || !routineRow) {
          throw new Error(routineError?.message || 'Error al insertar rutina en Supabase');
        }

        const exercisesToInsert = (routineData.exercises || []).map((ex, idx) => ({
          routine_id: routineRow.id,
          name: ex.name,
          muscle_group: ex.muscleGroup,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weightKg || 0,
          order_index: idx + 1,
        }));

        if (exercisesToInsert.length > 0) {
          const { error: exError } = await supabase.from('exercises').insert(exercisesToInsert);
          if (exError) console.warn('Advertencia al insertar ejercicios:', exError);
        }

        return {
          id: routineRow.id,
          ...routineData,
          createdAt: new Date(routineRow.created_at),
        };
      } catch (err) {
        console.warn('⚠️ Fallo inserción en Supabase, guardando en memoria:', err);
      }
    }

    const newRoutine: WorkoutRoutine = {
      ...routineData,
      id: `routine-${Date.now()}`,
      createdAt: new Date(),
    };
    this.inMemoryRoutines.unshift(newRoutine);
    return newRoutine;
  }
}

export const workoutRepository = new SupabaseWorkoutRepository();
