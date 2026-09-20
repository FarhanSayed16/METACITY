import numpy as np
from dataclasses import dataclass

@dataclass
class GridMap:
    """
    2D Grid map for Cellular Automata (Evacuation).
    0 = Empty space
    1 = Wall / Obstacle
    2 = Exit
    """
    width: int
    height: int
    cells: np.ndarray

    @classmethod
    def create_empty(cls, width: int, height: int):
        return cls(width, height, np.zeros((width, height), dtype=np.int8))
        
    def set_wall(self, x: int, y: int):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.cells[x, y] = 1
            
    def set_exit(self, x: int, y: int):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.cells[x, y] = 2

    def set_cell(self, x: int, y: int, value: int):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.cells[x, y] = value

    def is_walkable(self, x: int, y: int) -> bool:
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.cells[x, y] != 1
        return False
        
    def get_neighbors(self, x: int, y: int, include_diagonals: bool = True) -> list[tuple[int, int]]:
        neighbors = []
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                if not include_diagonals and abs(dx) + abs(dy) > 1:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    neighbors.append((nx, ny))
        return neighbors
