import { builder } from '../builder';
import { DB } from '../types';

// Forward reference to break circular dependencies
export const SessionExerciseType = builder.objectRef<DB['SessionExercise']>('SessionExercise');

// Implementation will be added in a separate file to avoid circular dependencies 