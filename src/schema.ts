import { builder } from '@/src/builder';

// Import all model types
import '@/src/models';

// Import all resolvers
import '@/src/resolvers';

export const schema = builder.toSchema()