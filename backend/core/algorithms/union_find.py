class UnionFind:
    """Disjoint-set data structure with path compression and union by rank."""
    
    def __init__(self, elements: iter = None):
        self.parent = {}
        self.rank = {}
        if elements:
            for x in elements:
                self.add(x)
                
    def add(self, x):
        if x not in self.parent:
            self.parent[x] = x
            self.rank[x] = 0
            
    def find(self, x):
        if x not in self.parent:
            raise KeyError(f"Element {x} not in UnionFind")
        # Path compression
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
        
    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x != root_y:
            # Union by rank
            if self.rank[root_x] < self.rank[root_y]:
                self.parent[root_x] = root_y
            elif self.rank[root_x] > self.rank[root_y]:
                self.parent[root_y] = root_x
            else:
                self.parent[root_y] = root_x
                self.rank[root_x] += 1
                
    def get_components(self) -> list[set]:
        components = {}
        for x in self.parent:
            root = self.find(x)
            if root not in components:
                components[root] = set()
            components[root].add(x)
        return list(components.values())
