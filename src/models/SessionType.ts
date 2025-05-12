import { builder } from '../builder';
import { DB } from '../types';

// Forward reference to break circular dependencies
export const SessionType = builder.objectRef<DB['Session']>('Session');

// Implementation will be added in a separate file to avoid circular dependencies 