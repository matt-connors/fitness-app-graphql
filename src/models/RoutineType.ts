import { builder } from '../builder';
import { DB } from '../types';

// Forward reference to break circular dependencies
export const RoutineType = builder.objectRef<DB['Routine']>('Routine');

// Implementation will be added in a separate file to avoid circular dependencies 