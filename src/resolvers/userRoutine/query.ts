import { builder } from '../../builder';
import { UserRoutineType, UserType, RoutineType } from '../../models';

// Define types for the UserRoutines response
builder.objectType('UserRoutinesRoutine', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    type: t.exposeString('type'),
    skillLevel: t.exposeString('skillLevel', { nullable: true }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (routine) => new Date(routine.createdAt),
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (routine) => new Date(routine.updatedAt),
    }),
    exerciseCount: t.exposeInt('exerciseCount'),
    userRoutines: t.field({
      type: [UserRoutineType],
      resolve: async (routine, _, { db }) => {
        return db.selectFrom('UserRoutine')
          .where('routineId', '=', routine.id)
          .selectAll()
          .execute() as any;
      },
    }),
  }),
});

builder.objectType('UserRoutinesResult', {
  fields: (t) => ({
    routines: t.field({
      type: ['UserRoutinesRoutine'],
      resolve: (parent) => parent.routines,
    }),
    totalCount: t.exposeInt('totalCount'),
    hasMore: t.exposeBoolean('hasMore'),
  }),
});

// Get all routines for a specific user with pagination
builder.queryField('userRoutines', (t) =>
  t.field({
    type: 'UserRoutinesResult',
    args: {
      userId: t.arg.int({ required: true }),
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      type: t.arg.string(),
      skillLevel: t.arg.string(),
    },
    resolve: async (_, { userId, skip, take, type, skillLevel }, { db }) => {
      const skipValue = skip || 0;
      const takeValue = take || 10;
      
      // First get the user's routines with join to Routine table
      let query = db.selectFrom('UserRoutine')
        .innerJoin('Routine', 'UserRoutine.routineId', 'Routine.id')
        .where('UserRoutine.userId', '=', userId);
      
      // Apply filters if provided
      if (type) {
        query = query.where('Routine.type', '=', type as any);
      }
      
      if (skillLevel) {
        query = query.where('Routine.skillLevel', '=', skillLevel as any);
      }
      
      // Count total number of routines matching the filters
      const countQuery = db.selectFrom('UserRoutine')
        .innerJoin('Routine', 'UserRoutine.routineId', 'Routine.id')
        .where('UserRoutine.userId', '=', userId);
        
      // Apply the same filters to count query
      if (type) {
        countQuery.where('Routine.type', '=', type as any);
      }
      
      if (skillLevel) {
        countQuery.where('Routine.skillLevel', '=', skillLevel as any);
      }
      
      const totalCountResult = await countQuery
        .select(db.fn.count('UserRoutine.routineId').as('count'))
        .executeTakeFirst();
      
      const totalCount = Number(totalCountResult?.count || 0);
      
      // Get the routines with pagination
      const userRoutines = await query
        .select('Routine.id as id')
        .select('Routine.name as name')
        .select('Routine.type as type')
        .select('Routine.skillLevel as skillLevel')
        .select('Routine.createdAt as createdAt')
        .select('Routine.updatedAt as updatedAt')
        .select('UserRoutine.role as role')
        .orderBy('Routine.createdAt', 'desc')
        .offset(skipValue)
        .limit(takeValue + 1) // Fetch one extra to check if there are more
        .execute();
      
      // Check if there are more results
      const hasMore = userRoutines.length > takeValue;
      const routines = hasMore ? userRoutines.slice(0, takeValue) : userRoutines;
      
      // Get the full Routine objects for each routine
      const routineIds = routines.map(r => r.id);
      
      if (routineIds.length === 0) {
        return {
          routines: [],
          totalCount: 0,
          hasMore: false
        };
      }
      
      const fullRoutines = await db.selectFrom('Routine')
        .where('id', 'in', routineIds)
        .selectAll()
        .execute();
      
      // Add exerciseCount field to each routine
      const routineExerciseCounts = await db.selectFrom('RoutineExercise')
        .where('routineId', 'in', routineIds)
        .select('routineId')
        .select(db.fn.count('exerciseId').as('count'))
        .groupBy('routineId')
        .execute();
      
      const routineExerciseCountMap = new Map();
      routineExerciseCounts.forEach(rec => {
        routineExerciseCountMap.set(rec.routineId, Number(rec.count));
      });
      
      const enrichedRoutines = fullRoutines.map(routine => ({
        ...routine,
        exerciseCount: routineExerciseCountMap.get(routine.id) || 0
      }));
      
      return {
        routines: enrichedRoutines,
        totalCount,
        hasMore,
      };
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