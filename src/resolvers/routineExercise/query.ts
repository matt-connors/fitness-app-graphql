import { builder } from '../../builder';
import { RoutineExerciseType, RoutineType, ExerciseType } from '../../models';

// Export for circular references
export { RoutineExerciseType };

// Get all exercises for a specific routine
builder.queryField('routineExercises', (t) =>
  t.field({
    type: [RoutineExerciseType],
    args: {
      routineId: t.arg.int({ required: true }),
    },
    resolve: async (_, { routineId }, { db }) => {
      return db.selectFrom('RoutineExercise')
        .where('routineId', '=', routineId)
        .orderBy('order', 'asc')
        .selectAll()
        .execute() as any;
    },
  })
);

// Get a specific exercise in a routine
builder.queryField('routineExercise', (t) =>
  t.field({
    type: RoutineExerciseType,
    nullable: true,
    args: {
      routineId: t.arg.int({ required: true }),
      exerciseId: t.arg.int({ required: true }),
    },
    resolve: async (_, { routineId, exerciseId }, { db }) => {
      return db.selectFrom('RoutineExercise')
        .where('routineId', '=', routineId)
        .where('exerciseId', '=', exerciseId)
        .selectAll()
        .executeTakeFirst() as any;
    },
  })
);

// Add field resolvers for relationships
builder.objectType(RoutineExerciseType, {
  fields: (t) => ({
    routine: t.field({
      type: RoutineType,
      resolve: async (parent, _, { db }) => {
        if (!parent.routineId) return null;
        
        return db.selectFrom('Routine')
          .where('id', '=', parent.routineId)
          .selectAll()
          .executeTakeFirst() as any;
      },
    }),
    exercise: t.field({
      type: ExerciseType,
      resolve: async (parent, _, { db }) => {
        if (!parent.exerciseId) return null;
        
        return db.selectFrom('Exercise')
          .where('id', '=', parent.exerciseId)
          .selectAll()
          .executeTakeFirst() as any;
      },
    }),
  }),
}); 