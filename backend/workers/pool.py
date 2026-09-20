"""
Worker pool entry point for docker-compose.

Usage:
    python -m workers.pool

Polls the database for pending runs and executes them using the
replication_worker. This is the standalone worker process that runs
independently of the API server.
"""
import time
import logging
import sys

from persistence.db import init_db, get_db_connection
from persistence.repositories import RunRepository
from workers.replication_worker import worker_run_replication

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 2


def main():
    """Poll for pending runs and execute them sequentially."""
    logger.info("METACITY Worker Pool starting...")
    init_db()

    # Mark any orphaned runs from previous crashes
    with get_db_connection() as conn:
        RunRepository(conn).mark_orphans_interrupted()
    logger.info("Orphan recovery complete.")

    while True:
        try:
            with get_db_connection() as conn:
                repo = RunRepository(conn)
                # Find oldest pending run
                row = conn.execute(
                    "SELECT id FROM runs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1"
                ).fetchone()

            if row:
                run_id = row["id"]
                logger.info(f"Picked up run {run_id}, executing...")
                worker_run_replication(run_id)
                logger.info(f"Run {run_id} finished.")
            else:
                time.sleep(POLL_INTERVAL_SECONDS)

        except KeyboardInterrupt:
            logger.info("Worker pool shutting down (SIGINT).")
            break
        except Exception:
            logger.exception("Worker pool error, will retry...")
            time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
