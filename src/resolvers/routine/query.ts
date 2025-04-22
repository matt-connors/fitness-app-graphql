import { builder } from '../../builder';
import { RoutineType } from '../../models';

// Get a routine by ID
builder.queryField('routine', (t) =>
  t.field({
    type: RoutineType,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      const routine = await db.selectFrom('Routine')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst();
      
      if (!routine) return null;
      
      // Get exercise count
      const exerciseCountResult = await db.selectFrom('RoutineExercise')
        .where('routineId', '=', id)
        .select(db.fn.count('exerciseId').as('count'))
        .executeTakeFirst();
      
      return {
        ...routine,
        exerciseCount: Number(exerciseCountResult?.count || 0)
      } as any;
    },
  })
);

// Get all routines with pagination and filters
builder.queryField('routines', (t) =>
  t.field({
    type: [RoutineType],
    nullable: false,
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      name: t.arg.string(),
      type: t.arg.string(),
      skillLevel: t.arg.string(),
    },
    resolve: async (_, { skip, take, name, type, skillLevel }, { db }) => {
      let query = db.selectFrom('Routine');

      // Apply filters if provided
      if (name) {
        query = query.where('name', 'like', `%${name}%`);
      }
      
      if (type) {
        query = query.where('type', '=', type as any);
      }
      
      if (skillLevel) {
        query = query.where('skillLevel', '=', skillLevel as any);
      }
      
      const routines = await query
        .offset(skip || 0)
        .limit(take || 10)
        .orderBy('createdAt', 'desc')
        .selectAll()
        .execute();
      
      // Get exercise counts for each routine
      const routineIds = routines.map(r => r.id);
      
      if (routineIds.length === 0) {
        return [];
      }
      
      const exerciseCounts = await db.selectFrom('RoutineExercise')
        .where('routineId', 'in', routineIds)
        .select('routineId')
        .select(db.fn.count('exerciseId').as('count'))
        .groupBy('routineId')
        .execute();
      
      const exerciseCountMap = new Map();
      exerciseCounts.forEach(ec => {
        exerciseCountMap.set(ec.routineId, Number(ec.count));
      });
      
      // Add exercise count to each routine
      const enrichedRoutines = routines.map(routine => ({
        ...routine,
        exerciseCount: exerciseCountMap.get(routine.id) || 0
      }));
      
      return enrichedRoutines as any;
    },
  })
); 