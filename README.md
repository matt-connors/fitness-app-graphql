## Commands

### Prisma

**Any** - Generate and instaniate Prisma Client (updates /prisma/client code and schema):\
```npx prisma generate```

**Dev** - When making changes to the Prisma schema, migrate the changes to the db:\
```npx prisma migrate dev --name <migration-name>```

**Dev** - During prototyping and testing, the db can be updated an alternative way:\
```npx prisma db push --accept-data-loss```

**Dev** - Drops the database/schema and reapplies all migrations:\
```npx prisma migrate reset --force```

**Dev** - Update the state of the database to match the Prisma schema:\
```npx prisma db push```

**Prod** - Deploy changes to the database (usually automated in CI/CD pipeline):\
```npx prisma migrate deploy```


### Snaplet

**Dev** - Seed the database with test data:\
```npx prisma db seed```

**Dev** - Sync the snaplet schema with the database:\
```npx @snaplet/seed sync```