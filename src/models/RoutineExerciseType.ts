import { builder } from '../builder';
import { DB } from '../types';

/**
 * Set information for an exercise in a routine
 */
export interface SetInfo {
  reps?: number;
  weight?: number;
  rpe?: number;
  tempo?: number;
}

// Forward reference to break circular dependencies
export const RoutineExerciseType = builder.objectRef<DB['RoutineExercise']>('RoutineExercise');

// Implementation will be added in a separate file to avoid circular dependencies 