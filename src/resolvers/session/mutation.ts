import { builder } from '../../builder';
import { SessionType } from '../../models';

// Create a new session
builder.mutationField('createSession', (t) =>
  t.field({
    type: SessionType,
    args: {
      routineId: t.arg.int({ required: false }),
      name: t.arg.string({ required: false }),
      date: t.arg.string({ required: false }),
      duration: t.arg.int({ required: false }),
      notes: t.arg.string({ required: false }),
    },
    resolve: async (_, args, { db, userId }) => {
      const date = args.date ? new Date(args.date) : new Date();
      
      return db.insertInto('Session')
        .values({
          userId,
          routineId: args.routineId || null,
          name: args.name || null,
          date: date,
          duration: args.duration || null,
          notes: args.notes || null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  })
);

// Update an existing session
builder.mutationField('updateSession', (t) =>
  t.field({
    type: SessionType,
    args: {
      id: t.arg.int({ required: true }),
      routineId: t.arg.int({ required: false }),
      name: t.arg.string({ required: false }),
      date: t.arg.string({ required: false }),
      duration: t.arg.int({ required: false }),
      notes: t.arg.string({ required: false }),
    },
    resolve: async (_, args, { db, userId }) => {
      // Create an update object with only the provided fields
      const updateData: any = {};
      
      if (args.routineId !== undefined) updateData.routineId = args.routineId;
      if (args.name !== undefined) updateData.name = args.name;
      if (args.date !== undefined) updateData.date = new Date(args.date);
      if (args.duration !== undefined) updateData.duration = args.duration;
      if (args.notes !== undefined) updateData.notes = args.notes;
      
      return db.updateTable('Session')
        .set(updateData)
        .where('id', '=', args.id)
        .where('userId', '=', userId)
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  })
);

// Delete a session
builder.mutationField('deleteSession', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db, userId }) => {
      // Check if the session belongs to the user
      const session = await db.selectFrom('Session')
        .where('id', '=', id)
        .where('userId', '=', userId)
        .selectAll()
        .executeTakeFirst();
        
      if (!session) {
        return false; // Session not found or doesn't belong to user
      }
      
      // First delete all associated sessionSets
      await db.deleteFrom('SessionSet')
        .where(
          'sessionExerciseId', 'in', 
          db.selectFrom('SessionExercise')
            .select('id')
            .where('sessionId', '=', id)
        )
        .execute();
      
      // Then delete the sessionExercises
      await db.deleteFrom('SessionExercise')
        .where('sessionId', '=', id)
        .execute();
      
      // Finally delete the session
      const result = await db.deleteFrom('Session')
        .where('id', '=', id)
        .where('userId', '=', userId)
        .executeTakeFirst();
      
      return result.numDeletedRows > 0;
    },
  })
); 