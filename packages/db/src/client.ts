import { drizzle } from 'drizzle-orm/d1'
import type { D1Database } from '@cloudflare/workers-types'

export interface CloudflareDatabaseEnv {
  DB: D1Database
}

export type DrizzleClient = ReturnType<typeof drizzle>

export function createDbClient(env: CloudflareDatabaseEnv) {
  return drizzle(env.DB)
}
