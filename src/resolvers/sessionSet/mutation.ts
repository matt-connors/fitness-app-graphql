import { builder } from '../../builder';
import { SessionSetType } from '../../models';

// Create a new session set
builder.mutationField('createSessionSet', (t) =>
  t.field({
    type: SessionSetType,
    args: {
      sessionExerciseId: t.arg.int({ required: true }),
      setNumber: t.arg.int({ required: true }),
      reps: t.arg.int({ required: false }),
      weight: t.arg.float({ required: false }),
    },
    resolve: async (_, args, { db, userId }) => {
      // Verify the session exercise belongs to a session that belongs to the user
      const sessionExercise = await db.selectFrom('SessionExercise')
        .where('id', '=', args.sessionExerciseId)
        .selectAll()
        .executeTakeFirst();
        
      if (!sessionExercise) {
        throw new Error('Session exercise not found');
      }
      
      // Check if the session belongs to the user
      const session = await db.selectFrom('Session')
        .where('id', '=', sessionExercise.sessionId)
        .where('userId', '=', userId)
        .selectAll()
        .executeTakeFirst();
        
      if (!session) {
        throw new Error('You do not have permission to add sets to this exercise');
      }
      
      return db.insertInto('SessionSet')
        .values({
          sessionExerciseId: args.sessionExerciseId,
          setNumber: args.setNumber,
          reps: args.reps || null,
          weight: args.weight || null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  })
);

// Update an existing session set
builder.mutationField('updateSessionSet', (t) =>
  t.field({
    type: SessionSetType,
    args: {
      id: t.arg.int({ required: true }),
      reps: t.arg.int({ required: false }),
      weight: t.arg.float({ required: false }),
    },
    resolve: async (_, args, { db, userId }) => {
      // Verify this set belongs to a session owned by the user
      const set = await db.selectFrom('SessionSet')
        .where('id', '=', args.id)
        .selectAll()
        .executeTakeFirst();
        
      if (!set) {
        throw new Error('Set not found');
      }
      
      // Get the session exercise
      const sessionExercise = await db.selectFrom('SessionExercise')
        .where('id', '=', set.sessionExerciseId)
        .selectAll()
        .executeTakeFirst();
        
      if (!sessionExercise) {
        throw new Error('Session exercise not found');
      }
      
      // Check if the session belongs to the user
      const session = await db.selectFrom('Session')
        .where('id', '=', sessionExercise.sessionId)
        .where('userId', '=', userId)
        .selectAll()
        .executeTakeFirst();
        
      if (!session) {
        throw new Error('You do not have permission to update this set');
      }
      
      // Create an update object with only the provided fields
      const updateData: any = {};
      
      if (args.reps !== undefined) updateData.reps = args.reps;
      if (args.weight !== undefined) updateData.weight = args.weight;
      
      return db.updateTable('SessionSet')
        .set(updateData)
        .where('id', '=', args.id)
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  })
);

// Delete a session set
builder.mutationField('deleteSessionSet', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db, userId }) => {
      // Verify this set belongs to a session owned by the user
      const set = await db.selectFrom('SessionSet')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst();
        
      if (!set) {
        return false;
      }
      
      // Get the session exercise
      const sessionExercise = await db.selectFrom('SessionExercise')
        .where('id', '=', set.sessionExerciseId)
        .selectAll()
        .executeTakeFirst();
        
      if (!sessionExercise) {
        return false;
      }
      
      // Check if the session belongs to the user
      const session = await db.selectFrom('Session')
        .where('id', '=', sessionExercise.sessionId)
        .where('userId', '=', userId)
        .selectAll()
        .executeTakeFirst();
        
      if (!session) {
        return false;
      }
      
      const result = await db.deleteFrom('SessionSet')
        .where('id', '=', id)
        .executeTakeFirst();
      
      return result.numDeletedRows > 0;
    },
  })
); 