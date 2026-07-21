import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const databaseUrl = process.env.DB_PATH
  ? `file:${path.resolve(process.env.DB_PATH)}`
  : process.env.DATABASE_URL || '';
if (!databaseUrl.startsWith('file:')) {
  throw new Error('This project requires a file: SQLite DATABASE_URL or DB_PATH');
}

const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
if (!existsSync(prismaCli)) throw new Error('Prisma CLI is missing; install locked dependencies first');

const result = spawnSync(
  process.execPath,
  [prismaCli, 'db', 'push', '--skip-generate', '--accept-data-loss'],
  { stdio: 'inherit', env: { ...process.env, DATABASE_URL: databaseUrl } },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
