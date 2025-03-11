import { builder } from '@/src/builder';

export * from '@/models/.'
export * from '@/resolvers/.'

export const schema = builder.toSchema()