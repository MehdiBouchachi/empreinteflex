#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo "Node.js 22+ required for credential generation."; exit 1; fi
if ! command -v docker >/dev/null; then echo "Docker Engine + Compose required."; exit 1; fi
node infra/scripts/setup.mjs
docker compose up --build -d
printf '\nStorefront: http://localhost:8080/fr\nStaff dashboard: http://localhost:8081\nHealth: http://localhost:8080/health/ready\n'
