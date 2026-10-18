import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { withReadRetry } from "./resilient-client";

const url = process.env.DATABASE_URL ?? "postgres://localhost:5432/peeps";

// Dev reuses one client across hot reloads, keyed by URL so a changed DATABASE_URL gets a fresh one.
const globalForDb = globalThis as unknown as { pgClient?: { url: string; client: ReturnType<typeof postgres> } };
if (globalForDb.pgClient && globalForDb.pgClient.url !== url) {
  void globalForDb.pgClient.client.end();
  globalForDb.pgClient = undefined;
}

// postgres.js connects lazily, so importing this during `next build` never opens a connection.
// Idle connections are closed after 20s and recycled every 30 min: proxies (like Railway's
// public TCP proxy used in development) silently drop idle sockets, which surfaces as ECONNRESET.
const client = globalForDb.pgClient?.client ?? postgres(url, { max: 10, idle_timeout: 20, max_lifetime: 60 * 30 });

if (process.env.NODE_ENV !== "production") globalForDb.pgClient = { url, client };

export const db = drizzle({ client: withReadRetry(client), schema });
export type DB = typeof db;
