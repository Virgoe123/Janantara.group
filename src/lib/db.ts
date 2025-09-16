import { Pool } from 'pg';

let pool: Pool | undefined;

if (process.env.POSTGRES_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
} 

export const db = pool;
