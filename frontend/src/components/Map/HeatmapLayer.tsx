import React, { useMemo } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { useUIStore } from '../../store/uiStore';
import { useSimStore } from '../../store/simStore';

export const HeatmapLayer: React.FC<{ type: 'accessibility' | 'emissions' | 'none' }> = ({ type }) => {
  const sceneData = useSceneStore((state) => state.sceneData);
  const centralityScores = useUIStore((state) => state.centralityScores);
  const link_metrics = useSimStore((state) => state.link_metrics);

  const heatmapData = useMemo(() => {
    if (!sceneData || type === 'none') return [];

    const nodes = sceneData.nodes || [];
    const facilities = (sceneData.facilities || []).filter(
      (f: any) => f.type === 'hospital' || f.type === 'school' || f.type === 'office' || f.type === 'home'
    );

    // Precompute max distance for normalization (facility accessibility)
    let maxDist = 1;
    if (type === 'accessibility' && !centralityScores && facilities.length > 0) {
      for (const node of nodes) {
        let minD = Infinity;
        for (const fac of facilities) {
          const d = Math.hypot(node.x - fac.x, node.y - fac.y);
          if (d < minD) minD = d;
        }
        if (minD < Infinity) maxDist = Math.max(maxDist, minD);
      }
    }

    // Emissions: mean V/C of incident links
    const nodeVc: Record<string, number[]> = {};
    if (type === 'emissions' && sceneData.links) {
      for (const link of sceneData.links) {
        const m = link_metrics?.[link.id];
        const vc = m && m.capacity > 0 ? m.volume / m.capacity : 0;
        (nodeVc[link.from_node] ||= []).push(vc);
        (nodeVc[link.to_node] ||= []).push(vc);
      }
    }

    return nodes.map((node: any, idx: number) => {
      let intensity = 0;

      if (type === 'accessibility') {
        if (centralityScores && centralityScores[node.id] !== undefined) {
          intensity = Math.min(1.0, centralityScores[node.id] * 5);
        } else if (facilities.length > 0) {
          let minD = Infinity;
          for (const fac of facilities) {
            const d = Math.hypot(node.x - fac.x, node.y - fac.y);
            if (d < minD) minD = d;
          }
          // Near facility = high accessibility (green)
          intensity = minD < Infinity ? Math.max(0, 1 - minD / maxDist) : 0;
        } else {
          intensity = 0.2;
        }
      } else if (type === 'emissions') {
        const vals = nodeVc[node.id] || [];
        intensity = vals.length ? Math.min(1, vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      }

      const color =
        type === 'accessibility'
          ? `rgba(${Math.round(255 - intensity * 255)}, ${Math.round(intensity * 200)}, 80, 0.55)`
          : `rgba(${Math.round(intensity * 255)}, ${Math.round(120 - intensity * 80)}, 40, 0.55)`;

      return {
        id: node.id || idx,
        x: node.x - 500,
        y: node.y - 500,
        color,
      };
    });
  }, [sceneData, type, centralityScores, link_metrics]);

  if (type === 'none') return null;

  return (
    <group position={[0, 1, 0]}>
      {heatmapData.map((pt: any) => (
        <mesh key={pt.id} position={[pt.x, 0, pt.y]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[20, 16]} />
          <meshBasicMaterial color={pt.color} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};
