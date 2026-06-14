const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const PG_URL = process.env.DATABASE_URL;

async function resetDatabase() {
  const pg = new Client({ connectionString: PG_URL });

  await pg.connect();
  console.log('Connected to PostgreSQL');

  // Drop all tables to clear old data
  await pg.query('DROP SCHEMA public CASCADE');
  await pg.query('CREATE SCHEMA public');
  await pg.query('GRANT ALL ON SCHEMA public TO public');
  console.log('Cleared all old tables');
  
  await pg.end();
  console.log('Database reset complete!');
}

resetDatabase().catch(e => { console.error('Reset failed:', e); process.exit(1); });
