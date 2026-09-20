from typing import Dict, Any
from core.config import SimConfig

class Profile:
    def __init__(self, id: str, name: str, description: str, config: SimConfig):
        self.id = id
        self.name = name
        self.description = description
        self.config = config
        
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "config": {
                "bpr_alpha": self.config.bpr_alpha,
                "bpr_beta": self.config.bpr_beta,
                "msa_epsilon": self.config.msa_epsilon,
                "msa_max_iter": self.config.msa_max_iter,
                "city_tick_minutes": self.config.city_tick_minutes,
                "snapshot_hz": self.config.snapshot_hz,
            }
        }

CONFIG_PROFILES: Dict[str, Profile] = {
    "default": Profile(
        id="default",
        name="Standard Simulation",
        description="Balanced settings for realistic traffic flow and moderate performance.",
        config=SimConfig(
            city_tick_minutes=1,
            snapshot_hz=5,
            msa_max_iter=50
        )
    ),
    "fast_demo": Profile(
        id="fast_demo",
        name="Fast Demo",
        description="High tick rates and low precision for rapid UI demonstrations.",
        config=SimConfig(
            city_tick_minutes=5,
            snapshot_hz=2,
            msa_max_iter=10,
            msa_epsilon=0.1
        )
    ),
    "presentation": Profile(
        id="presentation",
        name="Presentation Mode",
        description="Optimized for smooth visual output over strict convergence.",
        config=SimConfig(
            city_tick_minutes=1,
            snapshot_hz=10,
            msa_max_iter=20
        )
    ),
    "academic": Profile(
        id="academic",
        name="Academic Rigour",
        description="Strict parameters and high iterations for precise traffic equilibrium.",
        config=SimConfig(
            city_tick_minutes=1,
            snapshot_hz=1,
            msa_max_iter=200,
            msa_epsilon=0.001
        )
    )
}

def get_profile(profile_id: str) -> Profile:
    return CONFIG_PROFILES.get(profile_id, CONFIG_PROFILES["default"])

def get_all_profiles() -> list[Dict[str, Any]]:
    return [p.to_dict() for p in CONFIG_PROFILES.values()]
