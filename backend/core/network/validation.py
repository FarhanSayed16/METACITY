"""Network validation — connectivity, dangling nodes, capacity sanity, Union-Find."""
from core.algorithms.graph import DirectedGraph
from core.algorithms.bfs import get_weakly_connected_components
from core.schema.scene import Scene
from typing import List


class UnionFind:
    """Disjoint set / Union-Find data structure for fast connectivity checks."""
    
    def __init__(self, elements: list):
        self.parent = {e: e for e in elements}
        self.rank = {e: 0 for e in elements}
    
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # Path halving
            x = self.parent[x]
        return x
    
    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True
    
    def components(self) -> dict[str, list]:
        """Returns dict of root -> [members]."""
        comps: dict[str, list] = {}
        for e in self.parent:
            root = self.find(e)
            if root not in comps:
                comps[root] = []
            comps[root].append(e)
        return comps


def validate_network_connectivity(graph: DirectedGraph) -> dict:
    """
    Check if the road network is fully connected.
    If not, identifies the largest component and the disconnected sub-islands.
    """
    components = get_weakly_connected_components(graph)
    if not components:
        return {"is_connected": True, "components": 0, "largest_size": 0}
        
    components.sort(key=len, reverse=True)
    is_connected = len(components) == 1
    
    return {
        "is_connected": is_connected,
        "components": len(components),
        "largest_size": len(components[0]),
        "isolated_nodes": sum(len(c) for c in components[1:]) if not is_connected else 0
    }


def validate_network_connectivity_uf(scene: Scene) -> dict:
    """
    Alternative connectivity check using Union-Find.
    Works directly on Scene nodes/links without building a graph first.
    """
    node_ids = [n.id for n in scene.nodes]
    if not node_ids:
        return {"is_connected": True, "components": 0, "issues": []}
    
    uf = UnionFind(node_ids)
    for link in scene.links:
        if link.from_node in uf.parent and link.to_node in uf.parent:
            uf.union(link.from_node, link.to_node)
    
    comps = uf.components()
    n_comps = len(comps)
    
    return {
        "is_connected": n_comps == 1,
        "components": n_comps,
        "largest_size": max(len(c) for c in comps.values()) if comps else 0,
        "isolated_nodes": sum(len(c) for c in sorted(comps.values(), key=len, reverse=True)[1:]) if n_comps > 1 else 0
    }


def find_dangling_nodes(scene: Scene) -> List[str]:
    """
    Find nodes that have no links connected to them (neither from nor to).
    These are likely data entry errors.
    """
    referenced = set()
    for link in scene.links:
        referenced.add(link.from_node)
        referenced.add(link.to_node)
    
    return [n.id for n in scene.nodes if n.id not in referenced]


def validate_capacity_sanity(scene: Scene) -> List[dict]:
    """
    Check for links with unreasonable capacity or speed values.
    
    Rules:
    - capacity_per_lane_per_hour should be 0 (closed) or 100–3000
    - speed_kph should be > 0 and <= 200
    - lanes should be 1–10
    """
    issues = []
    
    for link in scene.links:
        if link.capacity_per_lane_per_hour < 0:
            issues.append({
                "link_id": link.id,
                "field": "capacity_per_lane_per_hour",
                "value": link.capacity_per_lane_per_hour,
                "reason": "Negative capacity"
            })
        elif link.capacity_per_lane_per_hour > 0 and link.capacity_per_lane_per_hour < 100:
            issues.append({
                "link_id": link.id,
                "field": "capacity_per_lane_per_hour",
                "value": link.capacity_per_lane_per_hour,
                "reason": "Suspiciously low capacity (< 100 veh/lane/hr)"
            })
        elif link.capacity_per_lane_per_hour > 3000:
            issues.append({
                "link_id": link.id,
                "field": "capacity_per_lane_per_hour",
                "value": link.capacity_per_lane_per_hour,
                "reason": "Suspiciously high capacity (> 3000 veh/lane/hr)"
            })
        
        if link.speed_kph <= 0:
            issues.append({
                "link_id": link.id,
                "field": "speed_kph",
                "value": link.speed_kph,
                "reason": "Non-positive speed"
            })
        elif link.speed_kph > 200:
            issues.append({
                "link_id": link.id,
                "field": "speed_kph",
                "value": link.speed_kph,
                "reason": "Speed exceeds 200 km/h"
            })
        
        if link.lanes < 1:
            issues.append({
                "link_id": link.id,
                "field": "lanes",
                "value": link.lanes,
                "reason": "Zero or negative lanes"
            })
        elif link.lanes > 10:
            issues.append({
                "link_id": link.id,
                "field": "lanes",
                "value": link.lanes,
                "reason": "Suspiciously many lanes (> 10)"
            })
    
    return issues


def validate_scene_full(scene: Scene) -> dict:
    """
    Run all validations on a Scene and return a comprehensive report.
    """
    dangling = find_dangling_nodes(scene)
    capacity_issues = validate_capacity_sanity(scene)
    connectivity = validate_network_connectivity_uf(scene)
    ref_errors = scene.validate_references()
    
    all_valid = (
        len(dangling) == 0 and
        len(capacity_issues) == 0 and
        connectivity["is_connected"] and
        len(ref_errors) == 0
    )
    
    return {
        "valid": all_valid,
        "reference_errors": ref_errors,
        "connectivity": connectivity,
        "dangling_nodes": dangling,
        "capacity_issues": capacity_issues
    }
