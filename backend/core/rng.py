import numpy as np

class SeededRNG:
    """All randomness in the simulation goes through this."""
    def __init__(self, seed: int):
        self.seed = seed
        self._rng = np.random.default_rng(seed)

    @property
    def rng(self) -> np.random.Generator:
        return self._rng

    def child(self, name: str) -> 'SeededRNG':
        """Deterministic child stream for a subsystem."""
        child_seed = hash((self.seed, name)) % (2**31)
        return SeededRNG(child_seed)
