"""Wave C: evacuation trapped + bottlenecks."""
from core.evacuation.grid import GridMap
from core.evacuation.runner import run_evacuation


def test_evacuation_reports_trapped_and_bottlenecks():
    grid = GridMap.create_empty(20, 20)
    for x in range(20):
        grid.set_wall(x, 0)
        grid.set_wall(x, 19)
    for y in range(20):
        grid.set_wall(0, y)
        grid.set_wall(19, y)
    grid.set_exit(10, 0)

    result = run_evacuation(
        grid,
        fire_starts=[(5, 5)],
        agent_starts=[(8, 10), (9, 10), (10, 10), (11, 10), (12, 10)],
        max_ticks=80,
        spread_prob=0.05,
    )
    assert result.total_agents == 5
    assert result.escaped_count + result.trapped_count == result.total_agents
    assert isinstance(result.bottleneck_cells, list)
