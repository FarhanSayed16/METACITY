"""Wave C: warm-start compare unit (cold vs seeded)."""
from core.schema.scene import Scene, SceneNode, SceneLink, SceneParameters, SceneZone
from core.config import SimConfig
from core.runner import run_replication


def _tiny():
    return Scene(
        name="Warm",
        nodes=[
            SceneNode(id="n1", x=0, y=0),
            SceneNode(id="n2", x=500, y=0),
            SceneNode(id="n3", x=500, y=500),
        ],
        links=[
            SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50),
            SceneLink(id="l2", from_node="n2", to_node="n3", lanes=2, speed_kph=50),
            SceneLink(id="l3", from_node="n1", to_node="n3", lanes=1, speed_kph=40),
        ],
        zones=[SceneZone(id="z1", name="Z", land_use="residential", population=50)],
        parameters=SceneParameters(total_population=50),
    )


def test_warm_start_accepts_initial_costs():
    scene = _tiny()
    config = SimConfig(msa_max_iter=3)
    cold = run_replication("warm_cold", scene, config, seed=1)
    costs = {lm["id"]: lm["travel_time"] for lm in cold.link_metrics if "travel_time" in lm}
    warm = run_replication("warm_warm", scene, config, seed=1, initial_costs=costs)
    assert warm.iterations >= 1
    assert warm.final_gap >= 0
    # Both should produce finite KPIs
    assert cold.average_travel_time_mins >= 0
    assert warm.average_travel_time_mins >= 0
