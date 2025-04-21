import { builder } from '../../builder';
import { RoutineType } from '../../models';

// Get a routine by ID
builder.queryField('routine', (t) =>
  t.field({
    type: RoutineType,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      // Cast the result to help with TypeScript compatibility
      return db.selectFrom('Routine')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst() as any;
    },
  })
);

// Get all routines with pagination and filters
builder.queryField('routines', (t) =>
  t.field({
    type: [RoutineType],
    nullable: false,
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      name: t.arg.string(),
      type: t.arg.string(),
      skillLevel: t.arg.string(),
    },
    resolve: async (_, { skip, take, name, type, skillLevel }, { db }) => {
      let query = db.selectFrom('Routine');

      // Apply filters if provided
      if (name) {
        query = query.where('name', 'like', `%${name}%`);
      }
      
      if (type) {
        query = query.where('type', '=', type as any);
      }
      
      if (skillLevel) {
        query = query.where('skillLevel', '=', skillLevel as any);
      }
      
      // Cast the result to help with TypeScript compatibility
      return query
        .offset(skip || 0)
        .limit(take || 10)
        .orderBy('createdAt', 'desc')
        .selectAll()
        .execute() as any;
    },
  })
); 