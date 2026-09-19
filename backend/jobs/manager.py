import concurrent.futures
from workers.replication_worker import worker_run_replication

class JobManager:
    """
    A simple in-memory job manager using a ProcessPoolExecutor.
    In a real production environment, this would be Celery + Redis.
    """
    def __init__(self, pool_size: int = 4):
        self.executor = concurrent.futures.ProcessPoolExecutor(max_workers=pool_size)
        self.futures = {}
        
    def enqueue(self, run_id: str):
        """Submit a simulation run to the background pool."""
        future = self.executor.submit(worker_run_replication, run_id)
        self.futures[run_id] = future
        
    def shutdown(self):
        """Shutdown the executor gracefully."""
        self.executor.shutdown(wait=True)
        
# Global singleton instance managed by FastAPI lifespan
job_manager = JobManager(pool_size=4)
