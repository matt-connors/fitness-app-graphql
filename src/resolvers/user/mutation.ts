import { builder } from '../../builder';
import { UserType } from '../../models';

// Create a new user
builder.mutationField('createUser', (t) =>
  t.field({
    type: UserType,
    args: {
      username: t.arg.string({ required: true }),
      email: t.arg.string({ required: true }),
      authProvider: t.arg.string({ required: true }),
      authProviderId: t.arg.string(),
      preferredUnits: t.arg.string({ required: true }),
      profilePictureUrl: t.arg.string(),
      gender: t.arg.string(),
      age: t.arg.int(),
      height: t.arg.float(),
      weight: t.arg.float(),
    },
    resolve: async (_, args, { db }) => {
      return db.insertInto('User')
        .values({
          username: args.username,
          email: args.email,
          authProvider: args.authProvider as any,
          authProviderId: args.authProviderId || null,
          preferredUnits: args.preferredUnits as any,
          profilePictureUrl: args.profilePictureUrl || null,
          notificationsEnabled: true,
          gender: args.gender as any || null,
          age: args.age || null,
          height: args.height || null,
          weight: args.weight || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  })
);

// Update an existing user
builder.mutationField('updateUser', (t) =>
  t.field({
    type: UserType,
    args: {
      id: t.arg.int({ required: true }),
      username: t.arg.string(),
      email: t.arg.string(),
      profilePictureUrl: t.arg.string(),
      preferredUnits: t.arg.string(),
      notificationsEnabled: t.arg.boolean(),
      gender: t.arg.string(),
      age: t.arg.int(),
      height: t.arg.float(),
      weight: t.arg.float(),
    },
    resolve: async (_, args, { db }) => {
      // Create an update object with only the provided fields
      const updateData: any = {};
      
      if (args.username !== undefined) updateData.username = args.username;
      if (args.email !== undefined) updateData.email = args.email;
      if (args.profilePictureUrl !== undefined) updateData.profilePictureUrl = args.profilePictureUrl;
      if (args.preferredUnits !== undefined) updateData.preferredUnits = args.preferredUnits;
      if (args.notificationsEnabled !== undefined) updateData.notificationsEnabled = args.notificationsEnabled;
      if (args.gender !== undefined) updateData.gender = args.gender;
      if (args.age !== undefined) updateData.age = args.age;
      if (args.height !== undefined) updateData.height = args.height;
      if (args.weight !== undefined) updateData.weight = args.weight;
      
      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();
      
      return db.updateTable('User')
        .set(updateData)
        .where('id', '=', args.id)
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  })
);

// Delete a user
builder.mutationField('deleteUser', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_, { id }, { db }) => {
      const result = await db.deleteFrom('User')
        .where('id', '=', id)
        .executeTakeFirst();
      
      return result.numDeletedRows > 0;
    },
  })
); 