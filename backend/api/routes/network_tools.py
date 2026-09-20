from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.schema.scene import Scene
from core.network.builder import build_network_from_scene
from core.network.validation import validate_network_connectivity
from core.network.congestion_thresholds import CONGESTION_THRESHOLDS
from core.algorithms.bridges import find_bridges
from core.algorithms.betweenness import brandes_betweenness_centrality
from core.algorithms.astar import astar
from core.algorithms.bpr import bpr_delay
from core.disasters.emergency_access import compute_isolation_metrics, compute_emergency_access
import math

router = APIRouter(prefix="/tools", tags=["network-tools"])


@router.get("/congestion-legend")
def get_congestion_legend():
    """Return the shared congestion threshold legend for frontend use."""
    return {
        level: {"max_vc": data["max_vc"] if data["max_vc"] != float("inf") else None,
                "color": data["color"], "label": data["label"]}
        for level, data in CONGESTION_THRESHOLDS.items()
    }


@router.post("/connectivity")
def check_connectivity(scene: Scene):
    """Check if the road network is fully connected."""
    graph = build_network_from_scene(scene)
    result = validate_network_connectivity(graph)
    return result


@router.post("/bridges")
def detect_bridges(scene: Scene):
    """Find critical links whose removal would disconnect the network."""
    graph = build_network_from_scene(scene)
    bridges = find_bridges(graph)
    return {"bridges": bridges, "count": len(bridges)}


@router.post("/centrality")
def compute_centrality(scene: Scene):
    """Compute betweenness centrality for all nodes."""
    graph = build_network_from_scene(scene)
    scores = brandes_betweenness_centrality(graph)
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return {"centrality": dict(ranked[:20]), "total_nodes": len(scores)}


@router.post("/isolation")
def get_isolation(scene: Scene):
    """Compute isolation metrics for disaster evaluation."""
    graph = build_network_from_scene(scene)
    metrics = compute_isolation_metrics(graph)
    return metrics


@router.post("/emergency_access")
def get_emergency_access(scene: Scene):
    """Compute accessibility times to hospitals."""
    graph = build_network_from_scene(scene)
    hospitals = []
    for fac in scene.facilities:
        if fac.type == "hospital":
            best = None
            best_d = float("inf")
            for node in scene.nodes:
                d = (node.x - fac.x) ** 2 + (node.y - fac.y) ** 2
                if d < best_d:
                    best_d = d
                    best = node.id
            if best:
                hospitals.append(best)

    access = compute_emergency_access(graph, hospitals)
    return {"emergency_access_times": access, "hospitals_count": len(hospitals)}


class PathfindReq(BaseModel):
    scene: Scene
    start: str
    goal: str


@router.post("/pathfind")
def pathfind(req: PathfindReq):
    """A* shortest path demo over the scene network."""
    graph = build_network_from_scene(req.scene)
    if req.start not in graph.nodes_data or req.goal not in graph.nodes_data:
        raise HTTPException(status_code=400, detail="start or goal node not in scene")

    def heuristic(u, v):
        n1 = graph.nodes_data.get(u, {})
        n2 = graph.nodes_data.get(v, {})
        dx = n1.get("x", 0) - n2.get("x", 0)
        dy = n1.get("y", 0) - n2.get("y", 0)
        return math.hypot(dx, dy)

    def weight(u, v, d):
        return float(d.get("free_flow_time_m", d.get("weight", 1.0)))

    path, cost = astar(graph, req.start, req.goal, heuristic, weight)
    return {
        "path": path,
        "cost_mins": None if path is None else cost,
        "found": path is not None,
        "hops": 0 if path is None else max(0, len(path) - 1),
    }


class MsaDemoReq(BaseModel):
    free_flow: list[float] = [10.0, 12.0, 8.0]
    capacity: list[float] = [1000.0, 800.0, 1200.0]
    demand: float = 1500.0
    max_iters: int = 20
    alpha: float = 0.15
    beta: float = 4.0
    epsilon: float = 0.01


@router.post("/msa_demo")
def msa_demo(req: MsaDemoReq):
    """
    Toy MSA/BPR equilibrium demo on a parallel-link corridor.
    Demand splits across links; volumes smoothed with MSA; costs via BPR.
    """
    n = len(req.free_flow)
    if n == 0 or len(req.capacity) != n:
        raise HTTPException(status_code=400, detail="free_flow and capacity must match")

    volumes = [req.demand / n] * n
    gaps = []
    history = []

    for k in range(1, req.max_iters + 1):
        costs = [
            float(bpr_delay(req.free_flow[i], volumes[i], req.capacity[i], req.alpha, req.beta))
            for i in range(n)
        ]
        best = min(range(n), key=lambda i: costs[i])
        new_vols = [0.0] * n
        new_vols[best] = req.demand

        step = 1.0 / k
        volumes = [(1 - step) * volumes[i] + step * new_vols[i] for i in range(n)]

        new_costs = [
            float(bpr_delay(req.free_flow[i], volumes[i], req.capacity[i], req.alpha, req.beta))
            for i in range(n)
        ]
        tstt = sum(volumes[i] * new_costs[i] for i in range(n))
        sptt = min(new_costs) * req.demand
        gap = abs(tstt - sptt) / max(sptt, 1e-9)
        gaps.append(gap)
        history.append({
            "iter": k,
            "volumes": [round(v, 2) for v in volumes],
            "costs": [round(c, 4) for c in new_costs],
            "gap": gap,
        })
        if gap < req.epsilon:
            break

    return {
        "iterations": len(gaps),
        "final_gap": gaps[-1] if gaps else None,
        "converged": bool(gaps and gaps[-1] < req.epsilon),
        "final_volumes": [round(v, 2) for v in volumes],
        "gaps": gaps,
        "history": history,
    }
