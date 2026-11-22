#!/usr/bin/env bash
# Host-side backup. Requires age, rclone, Docker Compose. Private AGE identity key is NOT stored here.
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${AGE_RECIPIENT:?Set AGE_RECIPIENT to a safe age PUBLIC recipient key}"
: "${RCLONE_REMOTE:?Set RCLONE_REMOTE to an offsite rclone destination, e.g. ef-r2:backups}"
command -v docker >/dev/null && command -v age >/dev/null && command -v rclone >/dev/null
mkdir -p ./backups
chmod 700 ./backups
file="./backups/empreinteflex-$(date -u +%Y%m%dT%H%M%SZ).dump.age"
# pg_dump custom format, authenticated encryption to offsite public key, never plaintext written to disk.
docker compose exec -T -e PGPASSWORD="$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)" postgres \
  sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' | age -r "$AGE_RECIPIENT" -o "$file"
rclone copy "$file" "$RCLONE_REMOTE"
echo "Encrypted offsite backup uploaded: $(basename "$file")"
# Local encrypted backups older than 7 days are deleted; configure remote retention separately.
find ./backups -maxdepth 1 -name '*.age' -mtime +7 -delete
