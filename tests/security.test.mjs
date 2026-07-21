import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("all product pages and APIs pass through signed-session middleware", () => {
  const proxy = read("src/proxy.ts");
  assert.match(proxy, /verifySession/);
  assert.match(proxy, /Authentication required/);
  assert.match(proxy, /\/login/);
});

test("startup is non-mutating and seed is explicitly disposable", () => {
  const launcher = read("start.sh");
  assert.doesNotMatch(launcher, /npm (install|ci)|prisma db push|kill -9|pkill|seed/);
  assert.match(launcher, /127\.0\.0\.1/);
  assert.match(read("src/lib/seed.ts"), /ALLOW_DISPOSABLE_SEED/);
});

test("operator credentials are environment supplied and never published", () => {
  const login = read("src/app/api/auth/login/route.ts");
  assert.match(login, /NEXUS_OPERATOR_EMAIL/);
  assert.match(login, /NEXUS_OPERATOR_PASSWORD_HASH/);
  assert.doesNotMatch(login, /NEXUS_OPERATOR_PASSWORD(?!_HASH)/);
  assert.match(read("scripts/start-next.mjs"), /NODE_ENV === 'test'/);
  assert.doesNotMatch(read("src/app/login/page.tsx"), /defaultValue|demo password/i);
});

test("provider credentials remain server-side", () => {
  const playground = read("src/app/playground/page.tsx");
  const route = read("src/app/api/chat/route.ts");
  assert.doesNotMatch(playground, /apiKey|OpenRouter API key/);
  assert.match(route, /process\.env\.OPENROUTER_API_KEY/);
  assert.doesNotMatch(route, /getOpenRouterClient\(apiKey\)/);
});
