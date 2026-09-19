from collections import defaultdict
from typing import Hashable

class DirectedGraph:
    """An adjacency list representation of a directed graph."""
    
    def __init__(self):
        # adjacency list: node -> dict of target -> attributes
        self.adj: dict[Hashable, dict[Hashable, dict]] = defaultdict(dict)
        self.nodes_data: dict[Hashable, dict] = {}
        
    def add_node(self, node_id: Hashable, **attr):
        if node_id not in self.adj:
            self.adj[node_id] = {}
        if node_id not in self.nodes_data:
            self.nodes_data[node_id] = {}
        self.nodes_data[node_id].update(attr)
        
    def add_edge(self, u: Hashable, v: Hashable, **attr):
        self.add_node(u)
        self.add_node(v)
        if v not in self.adj[u]:
            self.adj[u][v] = {}
        self.adj[u][v].update(attr)
        
    def neighbors(self, u: Hashable) -> iter:
        return iter(self.adj.get(u, {}).keys())
        
    def get_edge_data(self, u: Hashable, v: Hashable) -> dict | None:
        return self.adj.get(u, {}).get(v, None)
        
    def get_node_data(self, u: Hashable) -> dict | None:
        return self.nodes_data.get(u, None)
        
    @property
    def nodes(self) -> iter:
        return iter(self.nodes_data.keys())
        
    @property
    def edges(self) -> iter:
        for u, targets in self.adj.items():
            for v, attr in targets.items():
                yield u, v, attr
