import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import time
from core.evacuation.grid import GridMap
from core.evacuation.fire import FireCA
from core.evacuation.crowd import CrowdModel

def run_visual_evacuation():
    print("--- Evacuation ASCII Runner ---")
    grid = GridMap.create_empty(20, 10)
    grid.set_exit(19, 9)
    for x in range(5, 15):
        grid.set_wall(x, 4)
        
    fire = FireCA(grid)
    fire.ignite(2, 2)
    
    crowd = CrowdModel(grid)
    for i in range(5):
        crowd.add_agent(2, 8 + i%2)
        
    for tick in range(20):
        print(f"\nTick {tick}:")
        fire.step(spread_prob=0.3)
        crowd.step(fire.fire_cells)
        
        agent_positions = {(a.x, a.y) for a in crowd.agents if not a.escaped}
        
        # Render
        for y in range(grid.height):
            row = ""
            for x in range(grid.width):
                if (x, y) in agent_positions:
                    row += "A "
                elif fire.fire_cells[x, y]:
                    row += "F "
                elif grid.cells[x, y] == 1:
                    row += "# "
                elif grid.cells[x, y] == 2:
                    row += "E "
                else:
                    row += ". "
            print(row)
            
        time.sleep(0.2)
        if len(agent_positions) == 0:
            print("Everyone escaped!")
            break

if __name__ == "__main__":
    run_visual_evacuation()
