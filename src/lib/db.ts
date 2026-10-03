/**
 * src/lib/db.ts
 *
 * Producción (Vercel): Postgres real vía DATABASE_URL (Neon, Supabase, etc.)
 * Local sin DATABASE_URL: PGLite en memoria (solo para pruebas; no comparte salas entre usuarios)
 *
 * Uso típico:
 *   import { query, ensureDbReady, pool } from "@/lib/db";
 *   await ensureDbReady();
 *   const { rows } = await query("SELECT * FROM rooms WHERE code = $1", [code]);
 */

import { Pool, type QueryResult, type QueryResultRow } from "pg";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const connectionString = process.env.DATABASE_URL?.trim() || "";

/** true = usamos Postgres real (Neon / Vercel / local con Docker, etc.) */
export const isRemotePostgres = connectionString.length > 0;

// ---------------------------------------------------------------------------
// Pool de Postgres (serverless-friendly)
// ---------------------------------------------------------------------------

type GlobalDb = typeof globalThis & {
  __fiboPgPool?: Pool;
};

const globalForDb = globalThis as GlobalDb;

function createPool(): Pool {
  if (!connectionString) {
    throw new Error(
      "[db] DATABASE_URL no está definida. " +
        "Configúrala en Vercel → Settings → Environment Variables " +
        "(y en .env / .env.local para desarrollo).",
    );
  }

  return new Pool({
    connectionString,
    // Neon y la mayoría de Postgres gestionados requieren SSL
    ssl: connectionString.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
    // Límite bajo: en serverless cada instancia mantiene su propio pool
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });
}

/**
 * Pool reutilizable. En desarrollo se guarda en globalThis para no
 * abrir un pool nuevo en cada HMR.
 */
export const pool: Pool = (() => {
  if (!isRemotePostgres) {
    // Placeholder: no se usará si solo hay PGLite local
    return null as unknown as Pool;
  }
  if (process.env.NODE_ENV !== "production") {
    if (!globalForDb.__fiboPgPool) {
      globalForDb.__fiboPgPool = createPool();
    }
    return globalForDb.__fiboPgPool;
  }
  return createPool();
})();

// ---------------------------------------------------------------------------
// PGLite (solo fallback local, sin DATABASE_URL)
// ---------------------------------------------------------------------------

type PGliteLike = {
  query: <T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: T[]; rowCount: number | null }>;
  exec: (sql: string) => Promise<unknown>;
  close?: () => Promise<void>;
};

let pglite: PGliteLike | null = null;
let readyPromise: Promise<void> | null = null;

async function initPGlite(): Promise<PGliteLike> {
  // Import dinámico para no cargar WASM en el bundle de Vercel cuando hay DATABASE_URL
  const { PGlite } = await import("@electric-sql/pglite");

  // memory:// evita rutas de fichero (/var/task/_libs/pglite.data) en serverless
  // y también funciona en local sin crear carpetas.
  const db = await PGlite.create("memory://");

  return {
    query: async <T extends QueryResultRow = QueryResultRow>(
      sql: string,
      params?: unknown[],
    ) => {
      const result = await db.query<T>(sql, params ?? []);
      return {
        rows: result.rows as T[],
        rowCount: result.rows?.length ?? null,
      };
    },
    exec: async (sql: string) => db.exec(sql),
    close: async () => {
      await db.close();
    },
  };
}

// ---------------------------------------------------------------------------
// ensureDbReady — llámalo una vez antes de usar la DB
// ---------------------------------------------------------------------------

/**
 * Inicializa la conexión.
 * - Con DATABASE_URL: comprueba que el pool responde.
 * - Sin DATABASE_URL: arranca PGLite en memoria y aplica un esquema mínimo
 *   (ajusta las tablas a las de tus migraciones).
 */
export async function ensureDbReady(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    if (isRemotePostgres) {
      // Smoke test: falla pronto si la URL está mal o la DB no acepta conexiones
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
      } finally {
        client.release();
      }
      return;
    }

    // Fallback local (solo desarrollo / demos sin Neon)
    console.warn(
      "[db] DATABASE_URL ausente → usando PGLite en memoria. " +
        "Las salas NO se compartirán entre usuarios ni entre recargas. " +
        "Para producción en Vercel define DATABASE_URL (Neon).",
    );
    pglite = await initPGlite();

    // Esquema mínimo de ejemplo para Planning Poker.
    // Sustituye / amplía con el SQL real de tus migraciones.
    await pglite.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id          TEXT PRIMARY KEY,
        code        TEXT UNIQUE NOT NULL,
        name        TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS participants (
        id          TEXT PRIMARY KEY,
        room_id     TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        is_host     BOOLEAN NOT NULL DEFAULT FALSE,
        vote        TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_participants_room
        ON participants(room_id);
    `);
  })();

  return readyPromise;
}

// ---------------------------------------------------------------------------
// API de consultas
// ---------------------------------------------------------------------------

/**
 * Ejecuta una consulta parametrizada ($1, $2, …).
 * Compatible con el estilo de `pg` y con el fallback PGLite.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  await ensureDbReady();

  if (isRemotePostgres) {
    return pool.query<T>(text, params);
  }

  if (!pglite) {
    throw new Error("[db] PGLite no inicializado");
  }

  const result = await pglite.query<T>(text, params);
  // Adaptamos al shape de QueryResult de `pg`
  return {
    rows: result.rows,
    rowCount: result.rowCount,
    command: "",
    oid: 0,
    fields: [],
  } as QueryResult<T>;
}

/**
 * Atajo: devuelve solo las filas.
 */
export async function queryRows<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Transacción simple (solo con Postgres real).
 * Con PGLite ejecuta el callback sin transacción real.
 */
export async function withTransaction<T>(
  fn: (q: typeof query) => Promise<T>,
): Promise<T> {
  await ensureDbReady();

  if (!isRemotePostgres) {
    return fn(query);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const txQuery = (async <R extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: unknown[],
    ) => client.query<R>(text, params)) as typeof query;

    const value = await fn(txQuery);
    await client.query("COMMIT");
    return value;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Helpers de salas (opcionales; ajústalos a tu esquema real)
// ---------------------------------------------------------------------------

export async function createRoom(input: {
  id: string;
  code: string;
  name?: string;
}) {
  await query(
    `INSERT INTO rooms (id, code, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (code) DO NOTHING`,
    [input.id, input.code, input.name ?? null],
  );
  return getRoomByCode(input.code);
}

export async function getRoomByCode(code: string) {
  const rows = await queryRows<{
    id: string;
    code: string;
    name: string | null;
    created_at: Date;
    updated_at: Date;
  }>("SELECT * FROM rooms WHERE code = $1 LIMIT 1", [code]);
  return rows[0] ?? null;
}

export async function addParticipant(input: {
  id: string;
  roomId: string;
  name: string;
  isHost?: boolean;
}) {
  await query(
    `INSERT INTO participants (id, room_id, name, is_host)
     VALUES ($1, $2, $3, $4)`,
    [input.id, input.roomId, input.name, input.isHost ?? false],
  );
}

export async function listParticipants(roomId: string) {
  return queryRows<{
    id: string;
    room_id: string;
    name: string;
    is_host: boolean;
    vote: string | null;
    created_at: Date;
  }>(
    `SELECT * FROM participants
     WHERE room_id = $1
     ORDER BY created_at ASC`,
    [roomId],
  );
}
