import heapq
from typing import Any

class MinHeap:
    """A min-heap priority queue wrapping the standard library heapq."""
    
    def __init__(self):
        self._heap: list[tuple[float, Any]] = []
        
    def push(self, priority: float, item: Any):
        heapq.heappush(self._heap, (priority, item))
        
    def pop(self) -> tuple[float, Any]:
        if not self._heap:
            raise IndexError("pop from an empty priority queue")
        return heapq.heappop(self._heap)
        
    def is_empty(self) -> bool:
        return len(self._heap) == 0
        
    def __len__(self) -> int:
        return len(self._heap)
