import { builder } from '../builder';
import { DB } from '../types';

// Forward reference to break circular dependencies
export const UserType = builder.objectRef<DB['User']>('User');

// Implementation will be added in a separate file to avoid circular dependencies

// Export this to enable updating User implementation in implementations.ts
export default UserType; 