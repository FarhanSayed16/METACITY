import asyncio
import concurrent.futures
import multiprocessing
import logging
from collections import defaultdict
from typing import Callable, Dict, List
from workers.replication_worker import worker_run_replication
from persistence.db import get_db_connection
from persistence.repositories import RunRepository

class JobManager:
    """
    A multiprocess job manager using ProcessPoolExecutor and a Queue for IPC.
    """
    def __init__(self, pool_size: int = 4):
        self.executor = concurrent.futures.ProcessPoolExecutor(max_workers=pool_size)
        self.futures = {}
        # Use Manager to create a queue that works seamlessly across Windows/Unix processes
        self.manager = multiprocessing.Manager()
        self.progress_queue = self.manager.Queue()
        self.subscribers: Dict[str, List[Callable[[dict], None]]] = defaultdict(list)
        self._poll_task = None
        self._is_running = False

    def enqueue(self, run_id: str):
        """Submit a simulation run to the background pool."""
        future = self.executor.submit(worker_run_replication, run_id, self.progress_queue)
        self.futures[run_id] = future
        
    def subscribe(self, run_id: str, callback: Callable[[dict], None]):
        self.subscribers[run_id].append(callback)
        
    def unsubscribe(self, run_id: str, callback: Callable[[dict], None]):
        if callback in self.subscribers[run_id]:
            self.subscribers[run_id].remove(callback)

    async def start_polling(self):
        self._is_running = True
        self._poll_task = asyncio.create_task(self._poll_loop())
        
    async def _poll_loop(self):
        loop = asyncio.get_running_loop()
        while self._is_running:
            try:
                # Drain the queue completely to avoid lagging behind
                latest_snapshots = {}
                while True:
                    item = await loop.run_in_executor(None, _queue_get_nowait, self.progress_queue)
                    if not item:
                        break
                    run_id, progress = item
                    latest_snapshots[run_id] = progress
                
                # Publish only the latest snapshot per run_id
                for run_id, progress in latest_snapshots.items():
                    for cb in self.subscribers.get(run_id, []):
                        try:
                            cb(progress)
                        except Exception as e:
                            logging.error(f"Error in progress subscriber: {e}")
            except Exception as e:
                logging.error(f"Error polling progress queue: {e}")
            await asyncio.sleep(0.1) # 10 Hz rate limit

    def shutdown(self):
        """Shutdown the executor gracefully."""
        self._is_running = False
        if self._poll_task:
            self._poll_task.cancel()
        self.executor.shutdown(wait=True)
        self.manager.shutdown()

def _queue_get_nowait(q):
    import queue
    try:
        return q.get_nowait()
    except queue.Empty:
        return None

# Global singleton instance
job_manager = JobManager(pool_size=4)
