import { builder } from '../../builder';
import { UserType } from '../../models';

// Get a user by ID
builder.queryField('user', (t) =>
  t.field({
    type: UserType,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      return db.selectFrom('User')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst() as any;
    },
  })
);

// Get all users with pagination and optional filters
builder.queryField('users', (t) =>
  t.field({
    type: [UserType],
    nullable: false,
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      username: t.arg.string({ required: false }),
      email: t.arg.string({ required: false }),
    },
    resolve: async (_, { skip, take, username, email }, { db }) => {
      let query = db.selectFrom('User');

      // Apply filters if provided
      if (username) {
        query = query.where('username', 'like', `%${username}%`);
      }
      
      if (email) {
        query = query.where('email', 'like', `%${email}%`);
      }
      
      return query
        .offset(skip || 0)
        .limit(take || 10)
        .orderBy('createdAt', 'desc')
        .selectAll()
        .execute() as any;
    },
  })
); 