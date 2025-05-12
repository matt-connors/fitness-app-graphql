import { builder } from '../../builder';
import { SessionExerciseType } from '../../models';

// Get a session exercise by ID
builder.queryField('sessionExercise', (t) =>
  t.field({
    type: SessionExerciseType,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      return db.selectFrom('SessionExercise')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst() as any;
    },
  })
);

// Get all session exercises for a specific session
builder.queryField('sessionExercises', (t) =>
  t.field({
    type: [SessionExerciseType],
    nullable: false,
    args: {
      sessionId: t.arg.int({ required: true }),
    },
    resolve: async (_, { sessionId }, { db }) => {
      return db.selectFrom('SessionExercise')
        .where('sessionId', '=', sessionId)
        .selectAll()
        .execute() as any;
    },
  })
); 