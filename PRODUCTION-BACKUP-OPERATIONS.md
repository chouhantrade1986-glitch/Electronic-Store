# Production Backup Operations

## Automated backups

Run backups from the backend package directory with:

```sh
npm run job:backup
```

The job backs up the configured datastore, records SHA-256 checksums and source-version metadata in the manifest, and applies retention. Set `BACKUP_ROOT_DIR`, `BACKUP_RETENTION_MAX_BACKUPS`, and `BACKUP_RETENTION_MAX_AGE_DAYS` in the deployment environment. The default retention is 14 backups and 14 days. Keep the backup directory on storage separate from the application host for production recovery.

Use the host scheduler rather than an in-process timer. This avoids duplicate backups when the API runs in multiple processes or replicas.

### Linux cron example

Run daily at 02:15 and append job output to a protected operational log:

```cron
15 2 * * * cd /srv/electromart/backend && /usr/bin/npm run job:backup >> /var/log/electromart-backup.log 2>&1
```

Use the actual deployment paths and Node/npm locations for the host. Configure the scheduler's environment to load the same backup root and retention values as the service.

### Windows Task Scheduler

Create a daily task and set:

- Program: the full path to `npm.cmd` (commonly `C:\Program Files\nodejs\npm.cmd`)
- Arguments: `run job:backup`
- Start in: the full `Electronic-Store\backend` directory
- Run whether or not the operator is logged on, using the service account that can access the datastore and backup destination

Set `BACKUP_ROOT_DIR` and retention variables for that task's service account. Configure Task Scheduler to retain task history and report non-zero exit codes.

## Restore drill

Run a non-destructive end-to-end drill against generated dummy data:

```sh
npm run job:backup:restore-drill
```

It creates a temporary JSON datastore under the OS temp directory, backs it up, verifies checksums, restores artifacts into a separate drill directory, performs smoke checks, prints a JSON report, and removes the temporary tree. It never reads or writes the live datastore. A non-zero exit code indicates failure.

For an operational drill against a real backup artifact, run:

```sh
npm run job:restore:drill
```

That command restores into the configured backup root's `restore-drills` directory and records evidence/history there; it does not replace the live datastore. Review the resulting `restore-drill-evidence.json`, checksum verification, smoke checks, and elapsed time. Run this at least monthly and after datastore or backup-format changes.