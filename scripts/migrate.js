const { Client } = require('pg');

const PG_URL = 'postgresql://wallet_2fpp_user:W1akUPUiiHqle0QmwzsWT5yK2txzCnj1@dpg-d8mfr0kvikkc73bqfoa0-a.frankfurt-postgres.render.com/wallet_2fpp?sslmode=require';

async function resetDatabase() {
  const pg = new Client({ connectionString: PG_URL });

  await pg.connect();
  console.log('Connected to PostgreSQL');

  // Clear existing data
  await pg.query('TRUNCATE TABLE "user", wallet, transaction RESTART IDENTITY');
  console.log('Cleared all tables');
  
  // [Add any Postgres-specific initialization here]
  
  await pg.end();
  console.log('Database reset complete!');
}

resetDatabase().catch(e => { console.error('Reset failed:', e); process.exit(1); });
