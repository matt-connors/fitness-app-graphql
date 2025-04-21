import { builder } from '../../builder';
import { RoutineType } from '../../models';

// Create a new routine
builder.mutationField('createRoutine', (t) =>
  t.field({
    type: RoutineType,
    args: {
      name: t.arg.string({ required: true }),
      type: t.arg.string({ required: true }),
      skillLevel: t.arg.string(),
    },
    resolve: async (_, args, { db }) => {
      return db.insertInto('Routine')
        .values({
          name: args.name,
          type: args.type as any, // Cast to RoutineType enum
          skillLevel: args.skillLevel as any || null, // Cast to SkillLevel enum or null
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow() as any;
    },
  })
);

// Update an existing routine
builder.mutationField('updateRoutine', (t) =>
  t.field({
    type: RoutineType,
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      type: t.arg.string(),
      skillLevel: t.arg.string(),
    },
    resolve: async (_, args, { db }) => {
      // Create an update object with only the provided fields
      const updateData: any = {};
      
      if (args.name !== undefined) updateData.name = args.name;
      if (args.type !== undefined) updateData.type = args.type;
      if (args.skillLevel !== undefined) updateData.skillLevel = args.skillLevel;
      
      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();
      
      return db.updateTable('Routine')
        .set(updateData)
        .where('id', '=', args.id)
        .returningAll()
        .executeTakeFirstOrThrow() as any;
    },
  })
);

// Delete a routine
builder.mutationField('deleteRoutine', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      // Start a transaction to handle the cascading deletes
      const result = await db.transaction().execute(async (trx) => {
        // First delete associated UserRoutines
        await trx.deleteFrom('UserRoutine')
          .where('routineId', '=', id)
          .execute();
          
        // Then delete associated RoutineExercises
        await trx.deleteFrom('RoutineExercise')
          .where('routineId', '=', id)
          .execute();
        
        // Finally delete the routine itself
        return trx.deleteFrom('Routine')
          .where('id', '=', id)
          .executeTakeFirst();
      });
      
      return result.numDeletedRows > 0;
    },
  })
); 