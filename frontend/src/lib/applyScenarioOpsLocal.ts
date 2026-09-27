import type { ScenarioDraftOp } from '../store/scenarioDraftStore';

/** Mirror backend flood elevation: dist from x=500 * 0.05 */
function nodeElevation(x: number): number {
  return Math.abs(x - 500) * 0.05;
}

/**
 * Client-side apply of disaster ops for ghost isolation preview.
 * Matches backend close_link / outage / flood semantics closely enough for KPIs.
 */
export function applyScenarioOpsLocal(scene: any, ops: ScenarioDraftOp[]): any {
  if (!scene) return scene;
  const s = JSON.parse(JSON.stringify(scene));
  if (!Array.isArray(s.links)) return s;

  const closeLink = (id: string) => {
    const link = s.links.find((l: any) => l.id === id);
    if (link) {
      link.capacity_per_lane_per_hour = 0;
      link.speed_kph = 1;
      link._closed = true;
    }
  };

  for (const op of ops) {
    const d = op.data || {};
    switch (op.type) {
      case 'close_link':
      case 'remove_link':
        if (d.id) closeLink(String(d.id));
        break;
      case 'outage': {
        const ids = Array.isArray(d.link_ids)
          ? d.link_ids
          : typeof d.link_ids === 'string'
            ? d.link_ids.split(',').map((x: string) => x.trim()).filter(Boolean)
            : d.id
              ? [d.id]
              : [];
        ids.forEach((id: string) => closeLink(String(id)));
        break;
      }
      case 'flood': {
        const water = Number(d.water_level) || 5;
        const inundated = new Set<string>();
        for (const n of s.nodes || []) {
          if (nodeElevation(Number(n.x)) < water) inundated.add(n.id);
        }
        for (const l of s.links) {
          if (inundated.has(l.from_node) || inundated.has(l.to_node)) {
            l.capacity_per_lane_per_hour = 0;
            l.speed_kph = 1;
            l._closed = true;
          }
        }
        break;
      }
      default:
        break;
    }
  }
  return s;
}

export function countClosedLinks(scene: any): number {
  if (!scene?.links) return 0;
  return scene.links.filter(
    (l: any) => l._closed || Number(l.capacity_per_lane_per_hour) <= 0
  ).length;
}

/** Map Disaster Lab severity (1–5) → flood water_level */
export function severityToWaterLevel(severity: number): number {
  const map: Record<number, number> = { 1: 2, 2: 5, 3: 10, 4: 15, 5: 25 };
  return map[severity] ?? 10;
}

/** Pick N links nearest scene centre for outage severity */
export function pickCentralLinks(scene: any, count: number): string[] {
  if (!scene?.links?.length || !scene?.nodes?.length) return [];
  const nodeMap = new Map(scene.nodes.map((n: any) => [n.id, n]));
  const scored = scene.links.map((l: any) => {
    const a = nodeMap.get(l.from_node) as any;
    const b = nodeMap.get(l.to_node) as any;
    if (!a || !b) return { id: l.id, dist: Infinity };
    const mx = (Number(a.x) + Number(b.x)) / 2;
    const my = (Number(a.y) + Number(b.y)) / 2;
    return { id: l.id as string, dist: Math.hypot(mx - 500, my - 500) };
  });
  scored.sort((a: any, b: any) => a.dist - b.dist);
  return scored.slice(0, count).map((x: any) => x.id);
}
