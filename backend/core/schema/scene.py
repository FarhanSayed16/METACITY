"""Scene schema and validation."""
from pydantic import BaseModel, Field
from typing import Literal

class SceneNode(BaseModel):
    id: str
    x: float
    y: float
    type: str = "intersection"

class SceneLink(BaseModel):
    id: str
    from_node: str
    to_node: str
    lanes: int = Field(ge=1, le=8, default=2)
    speed_kph: float = Field(ge=5, le=200, default=50)
    capacity_per_lane_per_hour: int = Field(ge=100, le=3000, default=1800)
    road_class: str = "local"
    oneway: bool = False
    length_m: float | None = None

class SceneFacility(BaseModel):
    id: str
    type: str
    zone_id: str
    capacity: int = 100
    x: float
    y: float
    floors: int = 1

class SceneZone(BaseModel):
    id: str
    name: str
    land_use: str
    population_target: int = 0

class SceneTransitLine(BaseModel):
    id: str
    name: str
    mode: str = "bus"
    stop_node_ids: list[str]
    headway_minutes: int = 10

class SceneParameters(BaseModel):
    total_population: int = 1000
    car_ownership_rate: float = 0.5
    simulation_days: int = 1

class Scene(BaseModel):
    schema_version: str = "1.0.0"
    name: str
    description: str = ""
    calibration_status: Literal[
        "synthetic_uncalibrated",
        "partially_calibrated",
        "calibrated"
    ] = "synthetic_uncalibrated"
    bounds: dict = {"width_m": 5000.0, "height_m": 5000.0}
    nodes: list[SceneNode]
    links: list[SceneLink]
    zones: list[SceneZone] = []
    facilities: list[SceneFacility] = []
    transit_lines: list[SceneTransitLine] = []
    parameters: SceneParameters = SceneParameters()

    def validate_references(self) -> list[str]:
        """Check that all links reference existing nodes, facilities ref zones, etc."""
        errors = []
        node_ids = {n.id for n in self.nodes}
        for link in self.links:
            if link.from_node not in node_ids:
                errors.append(f"Link {link.id}: from_node '{link.from_node}' not found")
            if link.to_node not in node_ids:
                errors.append(f"Link {link.id}: to_node '{link.to_node}' not found")
        
        zone_ids = {z.id for z in self.zones}
        for fac in self.facilities:
            if fac.zone_id not in zone_ids:
                errors.append(f"Facility {fac.id}: zone_id '{fac.zone_id}' not found")
        
        return errors
