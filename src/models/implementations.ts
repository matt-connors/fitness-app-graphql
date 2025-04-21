import { UserType } from './UserType';
import { RoutineType } from './RoutineType';
import { ExerciseType } from './ExerciseType';
import { UserRoutineType } from './UserRoutineType';
import { RoutineExerciseType } from './RoutineExerciseType';

// Implement User type
UserType.implement({
  fields: (t) => ({
    id: t.field({
      type: 'ID',
      resolve: (user) => String(user.id),
    }),
    username: t.field({
      type: 'String',
      resolve: (user) => user.username,
    }),
    email: t.field({
      type: 'String',
      resolve: (user) => user.email,
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (user) => new Date(user.createdAt as any),
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (user) => new Date(user.updatedAt as any),
    }),
    profilePictureUrl: t.field({
      type: 'String',
      nullable: true,
      resolve: (user) => user.profilePictureUrl,
    }),
    authProvider: t.field({
      type: 'String',
      resolve: (user) => user.authProvider,
    }),
    authProviderId: t.field({
      type: 'String',
      nullable: true,
      resolve: (user) => user.authProviderId,
    }),
    preferredUnits: t.field({
      type: 'String',
      resolve: (user) => user.preferredUnits,
    }),
    notificationsEnabled: t.field({
      type: 'Boolean',
      resolve: (user) => Boolean(user.notificationsEnabled),
    }),
    gender: t.field({
      type: 'String',
      nullable: true,
      resolve: (user) => user.gender,
    }),
    age: t.field({
      type: 'Int',
      nullable: true,
      resolve: (user) => user.age,
    }),
    height: t.field({
      type: 'Float',
      nullable: true,
      resolve: (user) => user.height,
    }),
    weight: t.field({
      type: 'Float',
      nullable: true,
      resolve: (user) => user.weight,
    }),
    
    // Relations - actual implementation
    userRoutines: t.field({
      type: [UserRoutineType],
      nullable: true,
      resolve: async (user, _, context) => {
        if (!user.id) return [];
        
        return context.db.selectFrom('UserRoutine')
          .where('userId', '=', user.id as any)
          .selectAll()
          .execute() as any;
      },
    }),
  }),
});

// Implement Routine type
RoutineType.implement({
  fields: (t) => ({
    id: t.field({
      type: 'ID',
      resolve: (routine) => String(routine.id),
    }),
    name: t.field({
      type: 'String',
      resolve: (routine) => routine.name,
    }),
    type: t.field({
      type: 'String',
      resolve: (routine) => routine.type,
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (routine) => new Date(routine.createdAt as any),
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (routine) => new Date(routine.updatedAt as any),
    }),
    skillLevel: t.field({
      type: 'String',
      nullable: true,
      resolve: (routine) => routine.skillLevel,
    }),
    
    // Relations with actual resolvers
    userRoutines: t.field({
      type: [UserRoutineType],
      nullable: true,
      resolve: async (routine, _, context) => {
        if (!routine.id) return [];
        
        return context.db.selectFrom('UserRoutine')
          .where('routineId', '=', routine.id as any)
          .selectAll()
          .execute() as any;
      },
    }),
    routineExercises: t.field({
      type: [RoutineExerciseType],
      nullable: true,
      resolve: async (routine, _, context) => {
        if (!routine.id) return [];
        
        return context.db.selectFrom('RoutineExercise')
          .where('routineId', '=', routine.id as any)
          .orderBy('order', 'asc')
          .selectAll()
          .execute() as any;
      },
    }),
  }),
});

// Implement Exercise type
ExerciseType.implement({
  fields: (t) => ({
    id: t.field({
      type: 'ID',
      resolve: (exercise) => String(exercise.id),
    }),
    name: t.field({
      type: 'String',
      resolve: (exercise) => exercise.name,
    }),
    targetMuscle: t.field({
      type: 'String',
      resolve: (exercise) => exercise.targetMuscle,
    }),
    iconUrl: t.field({
      type: 'String',
      resolve: (exercise) => exercise.iconUrl,
    }),
    posterUrl: t.field({
      type: 'String',
      resolve: (exercise) => exercise.posterUrl,
    }),
    instructions: t.field({
      type: 'JSONObject',
      nullable: true,
      resolve: (exercise) => exercise.instructions ? JSON.parse(JSON.stringify(exercise.instructions)) : null,
    }),
    cues: t.field({
      type: 'JSONObject',
      nullable: true,
      resolve: (exercise) => exercise.cues ? JSON.parse(JSON.stringify(exercise.cues)) : null,
    }),
    overview: t.field({
      type: 'String',
      nullable: true,
      resolve: (exercise) => exercise.overview,
    }),
    
    // Relations - will be handled by resolvers
    routineExercises: t.field({
      type: [RoutineExerciseType],
      nullable: true,
      resolve: async (parent, _, { db }) => {
        if (!parent.id) return [];
        
        return db.selectFrom('RoutineExercise')
          .where('exerciseId', '=', parent.id as any)
          .selectAll()
          .execute();
      },
    }),
  }),
});

// Implement UserRoutine type
UserRoutineType.implement({
  fields: (t) => ({
    userId: t.field({
      type: 'Int',
      resolve: (userRoutine) => userRoutine.userId,
    }),
    routineId: t.field({
      type: 'Int',
      resolve: (userRoutine) => userRoutine.routineId,
    }),
    role: t.field({
      type: 'String',
      resolve: (userRoutine) => userRoutine.role,
    }),
    joinedAt: t.field({
      type: 'DateTime',
      resolve: (userRoutine) => new Date(userRoutine.joinedAt as any),
    })
    // The user and routine fields are implemented in src/resolvers/userRoutine/query.ts
  }),
});

// Implement RoutineExercise type
RoutineExerciseType.implement({
  fields: (t) => ({
    routineId: t.field({
      type: 'Int',
      resolve: (routineExercise) => routineExercise.routineId,
    }),
    exerciseId: t.field({
      type: 'Int',
      resolve: (routineExercise) => routineExercise.exerciseId,
    }),
    notes: t.field({
      type: 'String',
      nullable: true,
      resolve: (routineExercise) => routineExercise.notes,
    }),
    sets: t.field({
      type: 'JSONObject',
      resolve: (routineExercise) => JSON.parse(JSON.stringify(routineExercise.sets)),
    }),
    restTime: t.field({
      type: 'Int',
      nullable: true,
      resolve: (routineExercise) => routineExercise.restTime,
    }),
    order: t.field({
      type: 'Int',
      resolve: (routineExercise) => routineExercise.order,
    }),
    rir: t.field({
      type: 'Int',
      nullable: true,
      resolve: (routineExercise) => routineExercise.rir,
    })
    // The routine and exercise fields are implemented in src/resolvers/routineExercise/query.ts
  }),
}); 