import { builder } from '../builder';
import { DB } from '../types';
import { RoutineExerciseType } from './RoutineExerciseType';

/**
 * Step instructions for an exercise
 */
export interface ExerciseInstructionStep {
  steps: string[];
  image: string;
}

// Forward reference to break circular dependencies
export const ExerciseType = builder.objectRef<DB['Exercise']>('Exercise');

// Implementation will be added in a separate file to avoid circular dependencies 