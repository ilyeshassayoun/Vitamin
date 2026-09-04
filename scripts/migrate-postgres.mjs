import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: process.env.DATABASE_SSL === 'disable' ? false : 'require',
});

try {
  await sql`CREATE TABLE IF NOT EXISTS vitamin_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;
  const directory = join(process.cwd(), 'postgres', 'migrations');
  const files = (await readdir(directory))
    .filter((name) => name.endsWith('.sql'))
    .sort();
  for (const name of files) {
    const migration = await readFile(join(directory, name), 'utf8');
    await sql.begin(async (transaction) => {
      await transaction`SELECT pg_advisory_xact_lock(726498163)`;
      const existing =
        await transaction`SELECT 1 FROM vitamin_migrations WHERE name = ${name}`;
      if (existing.length) return;
      await transaction.unsafe(migration);
      await transaction`INSERT INTO vitamin_migrations (name) VALUES (${name})`;
      console.log(`Applied ${name}`);
    });
  }
} finally {
  await sql.end();
}
