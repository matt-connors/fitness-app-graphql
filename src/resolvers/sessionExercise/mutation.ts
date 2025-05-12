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
    resolve: async (_, args, { db, userId }) => {
      // Verify the session belongs to the current user
      const session = await db.selectFrom('Session')
        .where('id', '=', args.sessionId)
        .where('userId', '=', userId)
        .selectAll()
        .executeTakeFirst();
        
      if (!session) {
        throw new Error('Session not found or you do not have permission to add exercises to it');
      }
      
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
    resolve: async (_, { id }, { db, userId }) => {
      // Check if the session exercise belongs to the user's session
      const sessionExercise = await db.selectFrom('SessionExercise')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst();
        
      if (!sessionExercise) {
        return false;
      }
      
      // Verify session ownership
      const session = await db.selectFrom('Session')
        .where('id', '=', sessionExercise.sessionId)
        .where('userId', '=', userId)
        .selectAll()
        .executeTakeFirst();
        
      if (!session) {
        return false; // Not the user's session
      }
      
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