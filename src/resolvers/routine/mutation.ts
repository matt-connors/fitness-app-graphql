import { builder } from '../../builder';
import { RoutineType } from '../../models';
import { YogaRequestContext } from '../../definitions';

// Define input types
const RoutineExerciseInputType = builder.inputType('RoutineExerciseInput', {
  fields: (t) => ({
    exerciseId: t.field({ type: 'Int', required: true }),
    sets: t.field({ type: 'JSONObject', required: true }),
    restTime: t.field({ type: 'Int' }),
    order: t.field({ type: 'Int', required: true }),
    rir: t.field({ type: 'Int' }),
    notes: t.field({ type: 'String' }),
  }),
});

const CreateRoutineInputType = builder.inputType('CreateRoutineInput', {
  fields: (t) => ({
    name: t.field({ type: 'String', required: true }),
    type: t.field({ type: 'String', required: true }),
    skillLevel: t.field({ type: 'String' }),
    routineExercises: t.field({ type: [RoutineExerciseInputType], required: true }),
  }),
});

const UpdateRoutineInputType = builder.inputType('UpdateRoutineInput', {
  fields: (t) => ({
    name: t.field({ type: 'String' }),
    type: t.field({ type: 'String' }),
    skillLevel: t.field({ type: 'String' }),
    routineExercises: t.field({ type: [RoutineExerciseInputType] }),
  }),
});

// Create a new routine with exercises
builder.mutationField('createRoutine', (t) =>
  t.field({
    type: RoutineType,
    args: {
      input: t.arg({ type: CreateRoutineInputType, required: true }),
    },
    resolve: async (_, { input }, context) => {
      const { db } = context;
      // Get userId from context - it's added by the auth middleware
      // Cast context.userId to any since the Context type definition might be incomplete
      const userId = (context as any).userId;
      
      if (!userId) {
        throw new Error('Authentication required');
      }
      
      // Use a transaction to create the routine and its exercises
      return db.transaction().execute(async (trx) => {
        // Create the routine first
        const routine = await trx.insertInto('Routine')
          .values({
            name: input.name,
            type: input.type as any,
            skillLevel: input.skillLevel as any || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        
        // Then create all of the routine exercises
        if (input.routineExercises && input.routineExercises.length > 0) {
          await trx.insertInto('RoutineExercise')
            .values(
              input.routineExercises.map(ex => ({
                routineId: routine.id,
                exerciseId: ex.exerciseId,
                sets: JSON.stringify(ex.sets),
                restTime: ex.restTime || null,
                order: ex.order,
                rir: ex.rir || null,
                notes: ex.notes || null,
              }))
            )
            .execute();
        }
        
        // Associate the routine with the authenticated user
        await trx.insertInto('UserRoutine')
          .values({
            userId: userId as any, // Cast to any to avoid type issues
            routineId: routine.id,
            role: 'Creator' as any, // Set the authenticated user as the creator
            joinedAt: new Date(),
          })
          .execute();
        
        return routine as any;
      });
    },
  })
);

// Update an existing routine
builder.mutationField('updateRoutine', (t) =>
  t.field({
    type: RoutineType,
    args: {
      id: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateRoutineInputType, required: true }),
    },
    resolve: async (_, { id, input }, { db }) => {
      return db.transaction().execute(async (trx) => {
        // Update routine fields if provided
        if (input.name !== undefined || input.type !== undefined || input.skillLevel !== undefined) {
          // Create an update object with only the provided fields
          const updateData: any = { updatedAt: new Date() };
          
          if (input.name !== undefined) updateData.name = input.name;
          if (input.type !== undefined) updateData.type = input.type;
          if (input.skillLevel !== undefined) updateData.skillLevel = input.skillLevel;
          
          await trx.updateTable('Routine')
            .set(updateData)
            .where('id', '=', id)
            .execute();
        }
        
        // Update exercises if provided
        if (input.routineExercises !== undefined) {
          // Delete all existing routine exercises
          await trx.deleteFrom('RoutineExercise')
            .where('routineId', '=', id)
            .execute();
          
          // Insert new routine exercises
          if (input.routineExercises && input.routineExercises.length > 0) {
            await trx.insertInto('RoutineExercise')
              .values(
                input.routineExercises.map(ex => ({
                  routineId: id,
                  exerciseId: ex.exerciseId,
                  sets: JSON.stringify(ex.sets),
                  restTime: ex.restTime || null,
                  order: ex.order,
                  rir: ex.rir || null,
                  notes: ex.notes || null,
                }))
              )
              .execute();
          }
        }
        
        // Return the updated routine
        return trx.selectFrom('Routine')
          .where('id', '=', id)
          .selectAll()
          .executeTakeFirstOrThrow() as any;
      });
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