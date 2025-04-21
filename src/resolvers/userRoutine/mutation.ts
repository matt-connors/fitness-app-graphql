import { builder } from '../../builder';
import { UserRoutineType } from '../../models';

// Add a user to a routine
builder.mutationField('addUserToRoutine', (t) =>
  t.field({
    type: UserRoutineType,
    args: {
      userId: t.arg.int({ required: true }),
      routineId: t.arg.int({ required: true }),
      role: t.arg.string({ required: true }), // "Creator" or "Participant"
    },
    resolve: async (_, args, { db }) => {
      // Check if the relationship already exists
      const existing = await db.selectFrom('UserRoutine')
        .where('userId', '=', args.userId)
        .where('routineId', '=', args.routineId)
        .selectAll()
        .executeTakeFirst();
      
      if (existing) {
        // If it exists, update the role if different
        if (existing.role !== args.role) {
          return db.updateTable('UserRoutine')
            .set({ 
              role: args.role as any,
              // Don't update joinedAt when just changing role
            })
            .where('userId', '=', args.userId)
            .where('routineId', '=', args.routineId)
            .returningAll()
            .executeTakeFirstOrThrow() as any;
        }
        
        // If no change, return the existing relationship
        return existing as any;
      }
      
      // Create a new relationship
      return db.insertInto('UserRoutine')
        .values({
          userId: args.userId,
          routineId: args.routineId,
          role: args.role as any,
          joinedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow() as any;
    }
  })
);

// Remove a user from a routine
builder.mutationField('removeUserFromRoutine', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      userId: t.arg.int({ required: true }),
      routineId: t.arg.int({ required: true }),
    },
    resolve: async (_, { userId, routineId }, { db }) => {
      // Fetch the relationship to check if the user is the creator
      const userRoutine = await db.selectFrom('UserRoutine')
        .where('userId', '=', userId)
        .where('routineId', '=', routineId)
        .selectAll()
        .executeTakeFirst();
      
      if (!userRoutine) {
        return false; // Nothing to delete
      }
      
      // Check if this user is the creator of the routine
      if (userRoutine.role === 'Creator') {
        // Count how many creators this routine has
        const creatorCount = await db.selectFrom('UserRoutine')
          .where('routineId', '=', routineId)
          .where('role', '=', 'Creator')
          .select(db.fn.count('userId').as('count'))
          .executeTakeFirst();
        
        // If this is the only creator, don't allow removal
        if (creatorCount && Number(creatorCount.count) <= 1) {
          throw new Error('Cannot remove the only creator of a routine');
        }
      }
      
      // Delete the relationship
      const result = await db.deleteFrom('UserRoutine')
        .where('userId', '=', userId)
        .where('routineId', '=', routineId)
        .executeTakeFirst();
      
      return result.numDeletedRows > 0;
    },
  })
); 