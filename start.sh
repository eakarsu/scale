#!/bin/sh
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_dir=${RUNTIME_PROJECT_SOURCE:-$script_dir}
port=${BACKEND_PORT:-${PORT:-3051}}
[ -d "$project_dir/node_modules" ] || { echo 'Dependencies are missing' >&2; exit 1; }
[ -f "$project_dir/.next/BUILD_ID" ] || { echo 'Production build missing; run npm run build' >&2; exit 1; }

if [ "${NODE_ENV:-production}" = 'test' ]; then
  [ -n "${DB_PATH:-}" ] || { echo 'DB_PATH is required for isolated test startup' >&2; exit 1; }
  DATABASE_URL="file:$DB_PATH"
  NEXUS_SESSION_SECRET=${NEXUS_SESSION_SECRET:-${SESSION_SECRET:-${JWT_SECRET:-}}}
  NEXUS_OPERATOR_EMAIL=${NEXUS_OPERATOR_EMAIL:-${ADMIN_EMAIL:-}}
  NEXUS_OPERATOR_PASSWORD=${NEXUS_OPERATOR_PASSWORD:-${ADMIN_PASSWORD:-}}
  export DATABASE_URL NEXUS_SESSION_SECRET NEXUS_OPERATOR_EMAIL NEXUS_OPERATOR_PASSWORD
fi

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${NEXUS_SESSION_SECRET:?NEXUS_SESSION_SECRET is required}"
: "${NEXUS_OPERATOR_EMAIL:?NEXUS_OPERATOR_EMAIL is required}"
if [ -z "${NEXUS_OPERATOR_PASSWORD_HASH:-}" ]; then
  [ "${NODE_ENV:-production}" = 'test' ] && [ -n "${NEXUS_OPERATOR_PASSWORD:-}" ] || { echo 'NEXUS_OPERATOR_PASSWORD_HASH is required' >&2; exit 1; }
fi
[ "${#NEXUS_SESSION_SECRET}" -ge 32 ] || { echo 'NEXUS_SESSION_SECRET must contain at least 32 characters' >&2; exit 1; }
case "$port" in *[!0-9]*|'') echo 'BACKEND_PORT must be an integer from 1024 through 65535' >&2; exit 1;; esac
[ "$port" -ge 1024 ] && [ "$port" -le 65535 ] || { echo 'BACKEND_PORT must be an integer from 1024 through 65535' >&2; exit 1; }
if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $port is already in use; no process was terminated" >&2; exit 1; fi
cd "$project_dir"
exec node "$project_dir/scripts/start-next.mjs" --hostname 127.0.0.1 --port "$port"
