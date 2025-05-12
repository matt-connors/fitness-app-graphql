import { builder } from '../../builder';
import { SessionSetType } from '../../models';

// Get a session set by ID
builder.queryField('sessionSet', (t) =>
  t.field({
    type: SessionSetType,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      return db.selectFrom('SessionSet')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst() as any;
    },
  })
);

// Get all sets for a specific session exercise
builder.queryField('sessionSets', (t) =>
  t.field({
    type: [SessionSetType],
    nullable: false,
    args: {
      sessionExerciseId: t.arg.int({ required: true }),
    },
    resolve: async (_, { sessionExerciseId }, { db }) => {
      return db.selectFrom('SessionSet')
        .where('sessionExerciseId', '=', sessionExerciseId)
        .orderBy('setNumber', 'asc')
        .selectAll()
        .execute() as any;
    },
  })
); 