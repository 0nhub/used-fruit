#!/bin/bash
set -euo pipefail
umask 077
backup_root=/var/backups/used-fruit/databases
mkdir -p "$backup_root/daily" "$backup_root/weekly"
exec 9>/run/lock/used-fruit-backup.lock
flock -n 9 || exit 0
backup_stamp=$(date -u +%Y-%m-%d)
for db in usedfruit_prod usedfruit_staging; do
  target="$backup_root/daily/$db-$backup_stamp.dump"
  sudo -u postgres pg_dump -Fc --no-owner --no-acl "$db" > "$target.tmp"
  pg_restore --list "$target.tmp" >/dev/null
  mv "$target.tmp" "$target"
  if [ "$(date -u +%u)" = 7 ]; then cp "$target" "$backup_root/weekly/$(basename "$target")"; fi
done
find "$backup_root/daily" -maxdepth 1 -name '*.dump' -type f -mtime +6 -delete
find "$backup_root/weekly" -maxdepth 1 -name '*.dump' -type f -mtime +27 -delete
# Root-only key/config snapshot is needed to recover encrypted Apple credentials.
# Never copy this archive into the application release or source repository.
config_root=/var/backups/used-fruit/config
mkdir -p "$config_root"
tar -czf "$config_root/used-fruit-config.tar.gz.tmp" -C /etc used-fruit
mv "$config_root/used-fruit-config.tar.gz.tmp" "$config_root/used-fruit-config.tar.gz"
date -u +%FT%TZ > "$backup_root/last-success"
