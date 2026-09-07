import pg from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
if (new URL(process.env.DATABASE_URL).pathname === '/usedfruit_prod' && process.env.USED_FRUIT_ALLOW_PRODUCTION_MIGRATION !== 'approved-after-acceptance') {
  throw new Error('Production migration is gated on Web/iPhone acceptance');
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("SELECT pg_advisory_lock(hashtext('used-fruit-migrations'))");
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  for (const name of (await readdir(new URL('../migrations/', import.meta.url))).filter(n => /^\d+_.+\.sql$/.test(n)).sort()) {
    const source = await readFile(new URL('../migrations/' + name, import.meta.url), 'utf8');
    const checksum = createHash('sha256').update(source).digest('hex');
    const existing = await client.query('SELECT checksum FROM schema_migrations WHERE name=$1', [name]);
    if (existing.rows.length) {
      if (existing.rows[0].checksum !== checksum) throw new Error('Previously applied migration changed: ' + name);
      continue;
    }
    await client.query('BEGIN');
    try {
      await client.query(source);
      await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [name, checksum]);
      await client.query('COMMIT');
      console.log('Applied', name);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }
} finally { await client.end(); }
