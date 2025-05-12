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
    resolve: async (_, { id }, { db, userId }) => {
      return db.selectFrom('Session')
        .where('id', '=', id)
        .where('userId', '=', userId) // Only allow access to user's own sessions
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
      routineId: t.arg.int({ required: false }),
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      fromDate: t.arg.string({ required: false }),
      toDate: t.arg.string({ required: false }),
    },
    resolve: async (_, { routineId, skip, take, fromDate, toDate }, { db, userId }) => {
      let query = db.selectFrom('Session')
        .where('userId', '=', userId); // Always filter by the authenticated user

      // Apply additional filters if provided
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