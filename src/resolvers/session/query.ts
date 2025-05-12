import { builder } from '../../builder';
import { SessionType } from '../../models';

// Get a session by ID
builder.queryField('session', (t) =>
  t.field({
    type: SessionType,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      return db.selectFrom('Session')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst() as any;
    },
  })
);

// Get all sessions with pagination and optional filters
builder.queryField('sessions', (t) =>
  t.field({
    type: [SessionType],
    nullable: false,
    args: {
      userId: t.arg.int({ required: false }),
      routineId: t.arg.int({ required: false }),
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      fromDate: t.arg.string({ required: false }),
      toDate: t.arg.string({ required: false }),
    },
    resolve: async (_, { userId, routineId, skip, take, fromDate, toDate }, { db }) => {
      let query = db.selectFrom('Session');

      // Apply filters if provided
      if (userId) {
        query = query.where('userId', '=', userId);
      }
      
      if (routineId) {
        query = query.where('routineId', '=', routineId);
      }
      
      if (fromDate) {
        query = query.where('date', '>=', new Date(fromDate));
      }
      
      if (toDate) {
        query = query.where('date', '<=', new Date(toDate));
      }
      
      return query
        .offset(skip || 0)
        .limit(take || 10)
        .orderBy('date', 'desc')
        .selectAll()
        .execute() as any;
    },
  })
); 