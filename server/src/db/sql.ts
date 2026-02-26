import sql from 'mssql';

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (pool) return pool;

  pool = await new sql.ConnectionPool({
    server: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 1433),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      trustServerCertificate: true,
      encrypt: false
    }
  }).connect();

  return pool;
}

export { sql };
