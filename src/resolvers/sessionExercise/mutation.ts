import { builder } from '../../builder';
import { SessionExerciseType } from '../../models';

// Create a new session exercise
builder.mutationField('createSessionExercise', (t) =>
  t.field({
    type: SessionExerciseType,
    args: {
      sessionId: t.arg.int({ required: true }),
      exerciseId: t.arg.int({ required: true }),
    },
    resolve: async (_, args, { db }) => {
      return db.insertInto('SessionExercise')
        .values({
          sessionId: args.sessionId,
          exerciseId: args.exerciseId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  })
);

// Delete a session exercise
builder.mutationField('deleteSessionExercise', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      // First delete all associated sets
      await db.deleteFrom('SessionSet')
        .where('sessionExerciseId', '=', id)
        .execute();
      
      // Then delete the session exercise
      const result = await db.deleteFrom('SessionExercise')
        .where('id', '=', id)
        .executeTakeFirst();
      
      return result.numDeletedRows > 0;
    },
  })
); 