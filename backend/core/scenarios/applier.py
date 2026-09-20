from core.schema.scene import Scene, SceneNode, SceneLink, SceneFacility
from core.disasters.flood import apply_flood
from core.disasters.outage import apply_outage
import logging

logger = logging.getLogger(__name__)

def apply_scenario(base_scene: Scene, diff_ops: list[dict]) -> Scene:
    """
    Applies a list of JSON-serializable diff operations to a baseline Scene.
    Returns a newly mutated Scene object without altering the original.
    
    Supported operations:
        add_node, add_link, remove_link, set_lanes, set_speed,
        set_capacity, close_link, add_facility, flood, outage,
        global_demand_scale
    """
    new_scene = Scene.model_validate(base_scene.model_dump())
    
    for op in diff_ops:
        op_type = op.get("type")
        data = op.get("data", {})
        
        try:
            if op_type == "add_node":
                node = SceneNode(**data)
                if any(n.id == node.id for n in new_scene.nodes):
                    logger.warning(f"Node {node.id} already exists. Skipping.")
                else:
                    new_scene.nodes.append(node)
                    
            elif op_type == "add_link":
                link = SceneLink(**data)
                if any(l.id == link.id for l in new_scene.links):
                    logger.warning(f"Link {link.id} already exists. Skipping.")
                else:
                    new_scene.links.append(link)
                    
            elif op_type == "remove_link":
                link_id = data.get("id")
                if link_id:
                    new_scene.links = [l for l in new_scene.links if l.id != link_id]
                    
            elif op_type == "set_lanes":
                link_id = data.get("id")
                lanes = data.get("lanes")
                if link_id and lanes is not None:
                    for link in new_scene.links:
                        if link.id == link_id:
                            link.lanes = int(lanes)
                            break
                            
            elif op_type == "set_speed":
                link_id = data.get("id")
                speed = data.get("speed_kph")
                if link_id and speed is not None:
                    for link in new_scene.links:
                        if link.id == link_id:
                            link.speed_kph = float(speed)
                            break
                            
            elif op_type == "set_capacity":
                link_id = data.get("id")
                cap = data.get("capacity_per_lane_per_hour")
                if link_id and cap is not None:
                    for link in new_scene.links:
                        if link.id == link_id:
                            link.capacity_per_lane_per_hour = int(cap)
                            break
                            
            elif op_type == "close_link":
                link_id = data.get("id")
                if link_id:
                    for link in new_scene.links:
                        if link.id == link_id:
                            link.capacity_per_lane_per_hour = 0
                            link.speed_kph = 1.0
                            break
                            
            elif op_type == "add_facility":
                fac = SceneFacility(**data)
                if any(f.id == fac.id for f in new_scene.facilities):
                    logger.warning(f"Facility {fac.id} already exists. Skipping.")
                else:
                    new_scene.facilities.append(fac)

            elif op_type == "flood":
                water_level = float(data.get("water_level", 5.0))
                new_scene = apply_flood(new_scene, water_level)

            elif op_type == "outage":
                link_ids = data.get("link_ids")
                if isinstance(link_ids, str):
                    link_ids = [x.strip() for x in link_ids.split(",") if x.strip()]
                # Single-id convenience
                if not link_ids and data.get("id"):
                    link_ids = [data["id"]]
                new_scene = apply_outage(
                    new_scene,
                    link_ids=link_ids,
                    zone_id=data.get("zone_id"),
                )

            elif op_type == "global_demand_scale":
                scale = float(data.get("scale", 1.0))
                new_scene.parameters.total_population = max(
                    1, int(new_scene.parameters.total_population * scale)
                )

            elif op_type == "car_ownership_rate":
                rate = float(data.get("rate", new_scene.parameters.car_ownership_rate))
                new_scene.parameters.car_ownership_rate = max(0.0, min(1.0, rate))

            elif op_type == "total_population":
                pop = int(data.get("population", new_scene.parameters.total_population))
                new_scene.parameters.total_population = max(1, pop)
                    
            else:
                logger.warning(f"Unknown diff operation type: {op_type}")
                
        except Exception as e:
            logger.error(f"Failed to apply op {op_type} with data {data}: {e}")
            
    errors = new_scene.validate_references()
    if errors:
        raise ValueError(f"Scenario resulted in invalid scene: {', '.join(errors)}")
        
    return new_scene
