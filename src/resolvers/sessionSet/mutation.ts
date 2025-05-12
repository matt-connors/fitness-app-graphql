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
    resolve: async (_, args, { db }) => {
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
    resolve: async (_, args, { db }) => {
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
    resolve: async (_, { id }, { db }) => {
      const result = await db.deleteFrom('SessionSet')
        .where('id', '=', id)
        .executeTakeFirst();
      
      return result.numDeletedRows > 0;
    },
  })
); 