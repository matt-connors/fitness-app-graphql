import { builder } from '../../builder';
import { RoutineExerciseType } from '../../models';

// Add an exercise to a routine
builder.mutationField('addExerciseToRoutine', (t) =>
  t.field({
    type: RoutineExerciseType,
    args: {
      routineId: t.arg.int({ required: true }),
      exerciseId: t.arg.int({ required: true }),
      sets: t.arg.string({ required: true }), // JSON string of sets data
      notes: t.arg.string(),
      restTime: t.arg.int(),
      order: t.arg.int({ required: true }),
      rir: t.arg.int(),
    },
    resolve: async (_, args, { db }) => {
      // Parse the sets JSON string
      const sets = JSON.parse(args.sets);
      
      // Check if the relationship already exists
      const existing = await db.selectFrom('RoutineExercise')
        .where('routineId', '=', args.routineId)
        .where('exerciseId', '=', args.exerciseId)
        .selectAll()
        .executeTakeFirst();
      
      if (existing) {
        // Update the existing relationship
        return db.updateTable('RoutineExercise')
          .set({
            sets,
            notes: args.notes || null,
            restTime: args.restTime || null,
            order: args.order,
            rir: args.rir || null,
          })
          .where('routineId', '=', args.routineId)
          .where('exerciseId', '=', args.exerciseId)
          .returningAll()
          .executeTakeFirstOrThrow() as any;
      }
      
      // Create a new relationship
      return db.insertInto('RoutineExercise')
        .values({
          routineId: args.routineId,
          exerciseId: args.exerciseId,
          sets,
          notes: args.notes || null,
          restTime: args.restTime || null,
          order: args.order,
          rir: args.rir || null,
        })
        .returningAll()
        .executeTakeFirstOrThrow() as any;
    },
  })
);

// Update an exercise in a routine
builder.mutationField('updateRoutineExercise', (t) =>
  t.field({
    type: RoutineExerciseType,
    args: {
      routineId: t.arg.int({ required: true }),
      exerciseId: t.arg.int({ required: true }),
      sets: t.arg.string(), // JSON string of sets data
      notes: t.arg.string(),
      restTime: t.arg.int(),
      order: t.arg.int(),
      rir: t.arg.int(),
    },
    resolve: async (_, args, { db }) => {
      // Create an update object with only the provided fields
      const updateData: any = {};
      
      if (args.sets !== undefined && args.sets !== null) {
        updateData.sets = JSON.parse(args.sets);
      }
      if (args.notes !== undefined) updateData.notes = args.notes;
      if (args.restTime !== undefined) updateData.restTime = args.restTime;
      if (args.order !== undefined) updateData.order = args.order;
      if (args.rir !== undefined) updateData.rir = args.rir;
      
      // Update the relationship
      return db.updateTable('RoutineExercise')
        .set(updateData)
        .where('routineId', '=', args.routineId)
        .where('exerciseId', '=', args.exerciseId)
        .returningAll()
        .executeTakeFirstOrThrow() as any;
    },
  })
);

// Remove an exercise from a routine
builder.mutationField('removeExerciseFromRoutine', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      routineId: t.arg.int({ required: true }),
      exerciseId: t.arg.int({ required: true }),
    },
    resolve: async (_, { routineId, exerciseId }, { db }) => {
      // Delete the relationship
      const result = await db.deleteFrom('RoutineExercise')
        .where('routineId', '=', routineId)
        .where('exerciseId', '=', exerciseId)
        .executeTakeFirst();
      
      return result.numDeletedRows > 0;
    },
  })
); 