import { builder } from '../../builder';
import { ExerciseType } from '../../models';

// Get an exercise by ID
builder.queryField('exercise', (t) =>
  t.field({
    type: ExerciseType,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      return db.selectFrom('Exercise')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst() as any;
    },
  })
);

// Get all exercises with pagination and filters
builder.queryField('exercises', (t) =>
  t.field({
    type: [ExerciseType],
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      name: t.arg.string(),
      targetMuscle: t.arg.string(),
    },
    resolve: async (_, { skip, take, name, targetMuscle }, { db }) => {
      let query = db.selectFrom('Exercise');

      // Apply filters if provided
      if (name) {
        query = query.where('name', 'like', `%${name}%`);
      }
      
      if (targetMuscle) {
        query = query.where('targetMuscle', '=', targetMuscle as any);
      }
      
      return query
        .offset(skip || 0)
        .limit(take || 10)
        .orderBy('name', 'asc')
        .selectAll()
        .execute() as any;
    },
  })
); 