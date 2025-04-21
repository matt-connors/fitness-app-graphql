import { builder } from '../../builder';
import { ExerciseType } from '../../models';

// Create a new exercise
builder.mutationField('createExercise', (t) =>
  t.field({
    type: ExerciseType,
    args: {
      name: t.arg.string({ required: true }),
      targetMuscle: t.arg.string({ required: true }),
      iconUrl: t.arg.string({ required: true }),
      posterUrl: t.arg.string({ required: true }),
      instructions: t.arg.string(),
      cues: t.arg.string(),
      overview: t.arg.string(),
    },
    resolve: async (_, args, { db }) => {
      // Parse JSON strings for instructions and cues if provided
      const instructions = args.instructions ? JSON.parse(args.instructions) : null;
      const cues = args.cues ? JSON.parse(args.cues) : null;
      
      return db.insertInto('Exercise')
        .values({
          name: args.name,
          targetMuscle: args.targetMuscle as any,
          iconUrl: args.iconUrl,
          posterUrl: args.posterUrl,
          instructions,
          cues,
          overview: args.overview || null,
        })
        .returningAll()
        .executeTakeFirstOrThrow() as any;
    },
  })
);

// Update an existing exercise
builder.mutationField('updateExercise', (t) =>
  t.field({
    type: ExerciseType,
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      targetMuscle: t.arg.string(),
      iconUrl: t.arg.string(),
      posterUrl: t.arg.string(),
      instructions: t.arg.string(),
      cues: t.arg.string(),
      overview: t.arg.string(),
    },
    resolve: async (_, args, { db }) => {
      // Create an update object with only the provided fields
      const updateData: any = {};
      
      if (args.name !== undefined) updateData.name = args.name;
      if (args.targetMuscle !== undefined) updateData.targetMuscle = args.targetMuscle;
      if (args.iconUrl !== undefined) updateData.iconUrl = args.iconUrl;
      if (args.posterUrl !== undefined) updateData.posterUrl = args.posterUrl;
      
      // Parse JSON strings for instructions and cues if provided
      if (args.instructions !== undefined) {
        updateData.instructions = args.instructions ? JSON.parse(args.instructions) : null;
      }
      if (args.cues !== undefined) {
        updateData.cues = args.cues ? JSON.parse(args.cues) : null;
      }
      if (args.overview !== undefined) updateData.overview = args.overview;
      
      return db.updateTable('Exercise')
        .set(updateData)
        .where('id', '=', args.id)
        .returningAll()
        .executeTakeFirstOrThrow() as any;
    },
  })
);

// Delete an exercise
builder.mutationField('deleteExercise', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      // Start a transaction to handle the cascading deletes
      const result = await db.transaction().execute(async (trx) => {
        // First delete associated RoutineExercises
        await trx.deleteFrom('RoutineExercise')
          .where('exerciseId', '=', id)
          .execute();
        
        // Then delete the exercise itself
        return trx.deleteFrom('Exercise')
          .where('id', '=', id)
          .executeTakeFirst();
      });
      
      return result.numDeletedRows > 0;
    },
  })
); 