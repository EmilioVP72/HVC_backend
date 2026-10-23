import { WorkoutRoutine } from '../types/index.js';
import { IWorkoutRepository, workoutRepository } from '../repositories/workout.repository.js';

export class WorkoutService {
  private repository: IWorkoutRepository;

  constructor(repository: IWorkoutRepository = workoutRepository) {
    this.repository = repository;
  }

  public async getAllRoutines(): Promise<WorkoutRoutine[]> {
    return await this.repository.getAll();
  }

  public async getRoutineById(id: string): Promise<WorkoutRoutine | null> {
    return await this.repository.getById(id);
  }

  public async createRoutine(routineData: Omit<WorkoutRoutine, 'id' | 'createdAt'>): Promise<WorkoutRoutine> {
    return await this.repository.create(routineData);
  }
}

export const workoutService = new WorkoutService();
