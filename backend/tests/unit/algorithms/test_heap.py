from hypothesis import given, strategies as st, settings, HealthCheck
from core.algorithms.heap import MinHeap
import heapq

@settings(suppress_health_check=[HealthCheck.too_slow])
@given(st.lists(st.floats(allow_nan=False, allow_infinity=False)))
def test_heap_property(items):
    h = MinHeap()
    for item in items:
        h.push(item, str(item))
        
    popped = []
    while not h.is_empty():
        popped.append(h.pop()[0])
        
    # The popped items should be in strictly ascending order
    assert popped == sorted(items)
