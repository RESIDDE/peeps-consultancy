import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

// postgres.js connects lazily, so importing this during `next build` never opens a connection.
const client = globalForDb.pg ?? postgres(process.env.DATABASE_URL ?? "postgres://localhost:5432/peeps", { max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle({ client, schema });
export type DB = typeof db;
