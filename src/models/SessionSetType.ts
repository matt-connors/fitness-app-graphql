import { builder } from '../builder';
import { DB } from '../types';

// Forward reference to break circular dependencies
export const SessionSetType = builder.objectRef<DB['SessionSet']>('SessionSet');

// Implementation will be added in a separate file to avoid circular dependencies 