"""Shared fixed-window rate limiter used by HTTP middleware and WebSocket guards."""
import time
from collections import defaultdict
from threading import Lock


class FixedWindowLimiter:
    """Thread-safe fixed-window counter keyed by client id."""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._clients: dict[str, list] = defaultdict(lambda: [0.0, 0])
        self._lock = Lock()

    def allow(self, client_id: str) -> bool:
        """Return True if the request is allowed; False if rate-limited."""
        now = time.time()
        with self._lock:
            record = self._clients[client_id]
            window_start, count = record
            if now - window_start > self.window_seconds:
                record[0] = now
                record[1] = 1
                return True
            if count >= self.max_requests:
                return False
            record[1] = count + 1
            return True

    def reset(self) -> None:
        with self._lock:
            self._clients.clear()


# Shared instances
http_limiter = FixedWindowLimiter(max_requests=100, window_seconds=60)
# WS: max 20 new connections per IP per minute
ws_connect_limiter = FixedWindowLimiter(max_requests=20, window_seconds=60)

# Concurrent subscribers per run (hard cap)
MAX_WS_SUBSCRIBERS_PER_RUN = 8
