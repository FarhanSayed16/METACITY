"""Wave B: network tools pathfind + MSA demo."""
from core.schema.scene import Scene, SceneNode, SceneLink
from api.routes.network_tools import pathfind, PathfindReq, msa_demo, MsaDemoReq


def _demo_scene():
    return Scene(
        name="Demo",
        nodes=[
            SceneNode(id="A", x=0, y=0),
            SceneNode(id="B", x=100, y=0),
            SceneNode(id="C", x=200, y=0),
        ],
        links=[
            SceneLink(id="AB", from_node="A", to_node="B", lanes=1, speed_kph=50),
            SceneLink(id="BC", from_node="B", to_node="C", lanes=1, speed_kph=50),
        ],
    )


def test_pathfind_finds_route():
    res = pathfind(PathfindReq(scene=_demo_scene(), start="A", goal="C"))
    assert res["found"] is True
    assert res["path"] == ["A", "B", "C"]
    assert res["hops"] == 2
    assert res["cost_mins"] is not None and res["cost_mins"] > 0


def test_msa_demo_converges():
    res = msa_demo(MsaDemoReq(max_iters=30, epsilon=0.05))
    assert res["iterations"] >= 1
    assert res["final_gap"] is not None
    assert len(res["gaps"]) == res["iterations"]
    assert len(res["final_volumes"]) == 3
