"""Utility / network outage: close a set of links (or all links in a zone)."""
import copy

from core.schema.scene import Scene


def apply_outage(
    scene: Scene,
    *,
    link_ids: list[str] | None = None,
    zone_id: str | None = None,
) -> Scene:
    """
    Close links for an outage event.

    Provide either:
      - link_ids: explicit list of link ids to close
      - zone_id: close all links whose endpoints fall inside facilities/zones
                 that match zone_id (MVP: close links with either endpoint
                 nearest to a facility in that zone, or whose from/to nodes
                 are within the zone's bounding box if zone has center).

    Schema-safe closure matches close_link / flood.
    """
    outaged = copy.deepcopy(scene)
    targets: set[str] = set(link_ids or [])

    if zone_id:
        # Close links that touch nodes near facilities in this zone
        zone_fac_nodes: set[str] = set()
        for fac in outaged.facilities:
            if fac.zone_id == zone_id:
                # Match nearest node to facility
                best = None
                best_d = float("inf")
                for node in outaged.nodes:
                    d = (node.x - fac.x) ** 2 + (node.y - fac.y) ** 2
                    if d < best_d:
                        best_d = d
                        best = node.id
                if best:
                    zone_fac_nodes.add(best)

        for link in outaged.links:
            if link.from_node in zone_fac_nodes or link.to_node in zone_fac_nodes:
                targets.add(link.id)

        # Also: if zone has center, close links with endpoints within 200m
        for zone in outaged.zones:
            if zone.id != zone_id:
                continue
            cx, cy = zone.center_x, zone.center_y
            near = {
                n.id
                for n in outaged.nodes
                if (n.x - cx) ** 2 + (n.y - cy) ** 2 <= 200.0**2
            }
            for link in outaged.links:
                if link.from_node in near or link.to_node in near:
                    targets.add(link.id)

    for link in outaged.links:
        if link.id in targets:
            link.capacity_per_lane_per_hour = 0
            link.speed_kph = 1.0

    return outaged
