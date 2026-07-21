import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const environment = { ...process.env };
if (environment.NODE_ENV === 'test' && !environment.NEXUS_OPERATOR_PASSWORD_HASH && environment.NEXUS_OPERATOR_PASSWORD) {
  environment.NEXUS_OPERATOR_PASSWORD_HASH = bcrypt.hashSync(environment.NEXUS_OPERATOR_PASSWORD, 12);
}
delete environment.NEXUS_OPERATOR_PASSWORD;

const nextCli = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
if (!existsSync(nextCli)) throw new Error('Next.js CLI is missing; install locked dependencies first');
const result = spawnSync(process.execPath, [nextCli, 'start', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: environment,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
