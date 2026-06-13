const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const PG_URL = process.env.DATABASE_URL;

async function setup() {
  const pg = new Client({ connectionString: PG_URL });
  await pg.connect();
  console.log('Connected to PostgreSQL on Render\n');

  // Step 1: Drop ALL existing tables
  console.log('--- Dropping all tables ---');
  await pg.query('DROP SCHEMA public CASCADE');
  await pg.query('CREATE SCHEMA public');
  await pg.query('GRANT ALL ON SCHEMA public TO public');
  console.log('All tables dropped\n');

  // Step 2: Create tables
  console.log('--- Creating tables ---');

  await pg.query(`
    CREATE TABLE "user" (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      email VARCHAR NOT NULL UNIQUE,
      password VARCHAR NOT NULL,
      pin VARCHAR,
      "isAdmin" BOOLEAN DEFAULT FALSE,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('  Created: user');

  await pg.query(`
    CREATE TABLE wallet (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      balance DECIMAL(15,2) DEFAULT 0,
      currency VARCHAR DEFAULT 'NGN',
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('  Created: wallet');

  await pg.query(`
    CREATE TABLE transaction (
      id SERIAL PRIMARY KEY,
      "walletId" INTEGER NOT NULL REFERENCES wallet(id),
      type VARCHAR NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      reference VARCHAR NOT NULL UNIQUE,
      counterparty VARCHAR,
      status VARCHAR DEFAULT 'COMPLETED',
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('  Created: transaction');

  // Step 3: Verify everything is clean
  console.log('\n--- Verification ---');
  const users = await pg.query('SELECT COUNT(*) as count FROM "user"');
  const wallets = await pg.query('SELECT COUNT(*) as count FROM wallet');
  const txs = await pg.query('SELECT COUNT(*) as count FROM transaction');

  console.log(`Users: ${users.rows[0].count}`);
  console.log(`Wallets: ${wallets.rows[0].count}`);
  console.log(`Transactions: ${txs.rows[0].count}`);

  await pg.end();
  console.log('\nDatabase setup complete! Everything is in Render Postgres.');
}

setup().catch(e => { console.error('Setup failed:', e.message); process.exit(1); });