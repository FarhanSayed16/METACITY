"""Equilibrium (MSA) — Method of Successive Averages for user equilibrium."""
from dataclasses import dataclass


@dataclass
class EquilibriumResult:
    """Result of the MSA equilibrium procedure."""
    method: str = "MSA"
    final_gap: float = 0.0
    iterations: int = 0
    converged: bool = False
