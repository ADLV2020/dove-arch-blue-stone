// src/lib/db.ts (ejemplo orientativo)
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está definida. Configúrala en Vercel (y en .env local).",
  );
}

// Un pool por proceso de la función (reutilizable en Fluid Compute)
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

export const pool =
  globalForDb.__pgPool ??
  new Pool({
    connectionString,
    // Neon recomienda SSL
    ssl: connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5, // límite razonable en serverless
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pgPool = pool;
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[],
) {
  const result = await pool.query(text, params);
  return result;
}
