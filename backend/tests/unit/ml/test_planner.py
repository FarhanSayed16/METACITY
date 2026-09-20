from unittest.mock import MagicMock, patch

from core.ml.planner import greedy_search, hill_climb
from core.ml.verifier import verify_top_candidates, _apply_candidate_params
from core.schema.scene import Scene, SceneNode, SceneLink, SceneParameters
from core.config import SimConfig


def test_greedy_search():
    model_path = "data/surrogate.pth"
    candidates = greedy_search(
        model_path=model_path,
        base_params=[1.0, 1.0, 0.0],
        parameter_ranges=[(0.5, 1.5), (0.5, 1.0), (0.0, 0.3)],
        n_candidates=10,
        objective="minimize_travel_time"
    )
    
    assert len(candidates) == 10
    for c in candidates:
        assert "parameters" in c
        assert "predicted_kpis" in c
        assert "avg_travel_time" in c["predicted_kpis"]

def test_hill_climb():
    model_path = "data/surrogate.pth"
    res = hill_climb(
        model_path=model_path,
        start_params=[1.0, 1.0, 0.0],
        step_sizes=[0.1, 0.1, 0.05],
        max_steps=10,
        objective="minimize_travel_time"
    )
    
    assert "best_params" in res
    assert "predicted_kpis" in res
    assert "steps_taken" in res


def _tiny_scene():
    return Scene(
        name="VerifyTest",
        nodes=[
            SceneNode(id="n1", x=0, y=0),
            SceneNode(id="n2", x=500, y=0),
        ],
        links=[
            SceneLink(
                id="l1",
                from_node="n1",
                to_node="n2",
                lanes=2,
                speed_kph=50,
                capacity_per_lane_per_hour=1800,
            )
        ],
        parameters=SceneParameters(total_population=100),
    )


def test_apply_candidate_params():
    scene = _tiny_scene()
    mutated = _apply_candidate_params(scene, [2.0, 0.5, 0.5])
    assert mutated.parameters.total_population == 200
    assert mutated.links[0].capacity_per_lane_per_hour == 900
    assert mutated.links[0].speed_kph == 25.0
    # original unchanged
    assert scene.parameters.total_population == 100
    assert scene.links[0].capacity_per_lane_per_hour == 1800


def test_verifier():
    scene = _tiny_scene()
    candidates = [
        {"parameters": [1.0, 1.0, 0.0], "predicted_kpis": {"avg_travel_time": 10.5}}
    ]

    mock_result = MagicMock()
    mock_result.average_travel_time_mins = 12.0

    with patch("core.ml.verifier.run_replication", return_value=mock_result) as mock_run:
        verified = verify_top_candidates(
            candidates=candidates,
            scene=scene,
            top_n=1,
            seeds=[42],
            config=SimConfig(msa_max_iter=1),
        )

    assert len(verified) == 1
    assert "verified_kpis" in verified[0]
    assert verified[0]["verified_kpis"]["avg_travel_time"] == 12.0
    assert "prediction_error_pct" in verified[0]
    assert verified[0]["seeds_tested"] == 1

    # Correct signature: run_id, scene, config, seed=
    assert mock_run.call_count == 1
    args, kwargs = mock_run.call_args
    assert args[0].startswith("verify_")
    assert isinstance(args[1], Scene)
    assert isinstance(args[2], SimConfig)
    assert kwargs.get("seed") == 42 or (len(args) > 3 and args[3] == 42)
