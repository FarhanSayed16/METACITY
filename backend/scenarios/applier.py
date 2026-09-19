from core.schema.scene import Scene, SceneLink, SceneNode
from copy import deepcopy

def apply_scenario(scene: Scene, ops: list[dict]) -> Scene:
    """
    Takes a baseline Scene and applies a list of mutation operations.
    Returns a newly mutated Scene object without modifying the original.
    """
    # Create a deep copy of the scene to mutate safely
    mutated = scene.model_copy(deep=True)
    
    # Fast lookups
    link_idx = {link.id: idx for idx, link in enumerate(mutated.links)}
    
    for op in ops:
        op_type = op.get("op")
        
        if op_type == "add_link":
            # For simplicity, assuming the op dictionary has all required SceneLink kwargs
            op_kwargs = {k: v for k, v in op.items() if k != "op"}
            new_link = SceneLink(**op_kwargs)
            mutated.links.append(new_link)
            # Update index
            link_idx[new_link.id] = len(mutated.links) - 1
            
        elif op_type == "remove_link":
            l_id = op.get("id")
            if l_id in link_idx:
                idx = link_idx[l_id]
                mutated.links.pop(idx)
                # Rebuild index
                link_idx = {link.id: i for i, link in enumerate(mutated.links)}
                
        elif op_type == "update_link":
            l_id = op.get("id")
            if l_id in link_idx:
                idx = link_idx[l_id]
                link = mutated.links[idx]
                if "lanes" in op: link.lanes = op["lanes"]
                if "speed_kph" in op: link.speed_kph = op["speed_kph"]
                
        elif op_type == "add_node":
            op_kwargs = {k: v for k, v in op.items() if k != "op"}
            new_node = SceneNode(**op_kwargs)
            mutated.nodes.append(new_node)
            
    return mutated
