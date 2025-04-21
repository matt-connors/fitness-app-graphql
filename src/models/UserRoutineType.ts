import { builder } from '../builder';
import { DB } from '../types';

// Forward reference to break circular dependencies
export const UserRoutineType = builder.objectRef<DB['UserRoutine']>('UserRoutine');

// Implementation will be added in a separate file to avoid circular dependencies 