import { Pool } from 'pg';

/**
 * PostgreSQL connection pool for BRRP.IO
 * Uses DATABASE_URL environment variable
 */

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      // Connection pool configuration
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  return pool;
}

/**
 * Close the database pool (useful for cleanup in tests or graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
