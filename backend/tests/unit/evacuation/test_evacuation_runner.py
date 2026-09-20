from core.evacuation.grid import GridMap
from core.evacuation.runner import run_evacuation

def test_evacuation_smoke_test():
    # 1. Create a 10x10 room
    grid = GridMap.create_empty(10, 10)
    
    # 2. Add an exit at the bottom right
    grid.set_exit(9, 9)
    
    # 3. Add a wall in the middle
    for x in range(3, 7):
        grid.set_wall(x, 5)
        
    # 4. Start a fire in the top left
    fire_starts = [(1, 1)]
    
    # 5. Place an agent in the middle left
    agent_starts = [(1, 5)]
    
    # Run
    res = run_evacuation(grid, fire_starts, agent_starts, max_ticks=100)
    
    assert res.escaped_count == 1, "Agent should have escaped."
    assert res.total_fire_cells > 1, "Fire should have spread."
    assert res.avg_stress >= 0.0, "Agent should have valid stress metric."
