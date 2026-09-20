#!/bin/bash
# Backup script for METACITY database and simulation runs.
# Retains the 5 most recent backups and deletes older ones.

BACKUP_DIR="data/backups"
DB_FILE="data/metacity.db"
RUNS_DIR="data/runs"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="$BACKUP_DIR/metacity_backup_$TIMESTAMP.tar.gz"

echo "Creating backup: $ARCHIVE_NAME"
tar -czf "$ARCHIVE_NAME" "$DB_FILE" "$RUNS_DIR" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Backup successful."
else
    echo "Warning: Backup completed with errors (some files may not exist)."
fi

# Keep only the last 5 backups
echo "Cleaning up old backups (keeping last 5)..."
ls -1t "$BACKUP_DIR"/metacity_backup_*.tar.gz | tail -n +6 | xargs -I {} rm -- {}

echo "Backup process completed."
