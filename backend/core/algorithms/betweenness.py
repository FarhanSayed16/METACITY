from collections import deque
from typing import Hashable
from .graph import DirectedGraph

def brandes_betweenness_centrality(graph: DirectedGraph) -> dict[Hashable, float]:
    """
    Brandes' algorithm for unweighted betweenness centrality.
    Returns a dict mapping nodes to their centrality score.
    """
    cb = {v: 0.0 for v in graph.nodes}
    
    for s in graph.nodes:
        S = []
        P = {w: [] for w in graph.nodes}
        sigma = {w: 0 for w in graph.nodes}
        sigma[s] = 1
        d = {w: -1 for w in graph.nodes}
        d[s] = 0
        Q = deque([s])
        
        while Q:
            v = Q.popleft()
            S.append(v)
            for w in graph.neighbors(v):
                if d[w] < 0:
                    Q.append(w)
                    d[w] = d[v] + 1
                if d[w] == d[v] + 1:
                    sigma[w] += sigma[v]
                    P[w].append(v)
                    
        delta = {v: 0.0 for v in graph.nodes}
        while S:
            w = S.pop()
            for v in P[w]:
                delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w])
            if w != s:
                cb[w] += delta[w]
                
    return cb
