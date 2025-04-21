import { builder } from '../../builder';
import { UserRoutineType, UserType, RoutineType } from '../../models';

// Get all routines for a specific user
builder.queryField('userRoutines', (t) =>
  t.field({
    type: [UserRoutineType],
    args: {
      userId: t.arg.int({ required: true }),
    },
    resolve: async (_, { userId }, { db }) => {
      return db.selectFrom('UserRoutine')
        .where('userId', '=', userId)
        .selectAll()
        .execute() as any;
    },
  })
);

// Get all users for a specific routine
builder.queryField('routineUsers', (t) =>
  t.field({
    type: [UserRoutineType],
    args: {
      routineId: t.arg.int({ required: true }),
    },
    resolve: async (_, { routineId }, { db }) => {
      return db.selectFrom('UserRoutine')
        .where('routineId', '=', routineId)
        .selectAll()
        .execute() as any;
    },
  })
);

// Add field resolvers for relationships
builder.objectType(UserRoutineType, {
  fields: (t) => ({
    user: t.field({
      type: UserType,
      resolve: async (parent, _, { db }) => {
        if (!parent.userId) return null;
        
        return db.selectFrom('User')
          .where('id', '=', parent.userId)
          .selectAll()
          .executeTakeFirst() as any;
      },
    }),
    routine: t.field({
      type: RoutineType,
      resolve: async (parent, _, { db }) => {
        if (!parent.routineId) return null;
        
        return db.selectFrom('Routine')
          .where('id', '=', parent.routineId)
          .selectAll()
          .executeTakeFirst() as any;
      },
    }),
  }),
}); 