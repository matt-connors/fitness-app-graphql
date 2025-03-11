import type { DB } from '@/src/types'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

// https://the-guild.dev/blog/graphql-yoga-worker

const connection = (connectionString: string) => new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString
        }),
    }),
    log: (event) => {
        console.log(event.level)
        console.log(event.query.sql)
        console.log(event.queryDurationMillis + 'ms')
    },
})

export type Context = {
    db: Kysely<DB>
}

export const createContext = (connectionString: string): Context => {
    return {
        db: connection(connectionString)
    }
}