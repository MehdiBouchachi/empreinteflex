#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${RESTORE_I_UNDERSTAND:?Set RESTORE_I_UNDERSTAND=YES after reviewing restore instructions}"
[[ "$RESTORE_I_UNDERSTAND" == YES ]] || exit 1
: "${AGE_IDENTITY_FILE:?Set AGE_IDENTITY_FILE to your private age identity filename}"
file="${1:?Usage: RESTORE_I_UNDERSTAND=YES AGE_IDENTITY_FILE=... ./infra/scripts/restore.sh file.dump.age}"
echo 'STOP ALL APPLICATION WRITES BEFORE RESTORING (api, worker, storefront and staff).'
read -r -p 'Type RESTORE to proceed with destructive restore: ' answer
[[ "$answer" == RESTORE ]] || exit 1
# Do NOT restore into a currently running production database with application writes.
docker compose stop api worker storefront staff
age -d -i "$AGE_IDENTITY_FILE" "$file" | docker compose exec -T postgres sh -c 'pg_restore --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
echo 'Restore completed. Run data reconciliation and application smoke tests before restarting services.'
