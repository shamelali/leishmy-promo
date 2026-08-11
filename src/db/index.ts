import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const globalForDb = globalThis as typeof globalThis & {
  __db?: { pool: Pool; drizzle: NodePgDatabase };
};

function getConnection() {
  if (!globalForDb.__db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is required");
    const pool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: true,
      ssl: process.env.DB_DISABLE_SSL_VERIFY === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    });

    // Neon (and most serverless Postgres proxies) close idle connections
    // server-side. Without this handler, that shows up as an *uncaught*
    // "Connection terminated unexpectedly" error that crashes the whole
    // function invocation instead of just failing the one query that hit
    // the dead connection. Swallow it here, and drop the cached pool so
    // the next request builds a fresh one instead of reusing a dead one.
    pool.on("error", (err) => {
      console.error("[db] idle client error:", err.message);
      globalForDb.__db = undefined;
    });

    globalForDb.__db = { pool, drizzle: drizzle(pool) };
  }
  return globalForDb.__db;
}

export const db = new Proxy({} as NodePgDatabase, {
  get(_, prop) {
    const conn = getConnection();
    const val = (conn.drizzle as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? (val as Function).bind(conn.drizzle) : val;
  },
});

export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    const conn = getConnection();
    const val = (conn.pool as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? (val as Function).bind(conn.pool) : val;
  },
});
