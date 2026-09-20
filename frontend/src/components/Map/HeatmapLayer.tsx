import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../store/sceneStore';
import { useUIStore } from '../../store/uiStore';
import { useSimStore } from '../../store/simStore';

/** Instanced heatmap discs — avoids one React mesh per node. */
export const HeatmapLayer: React.FC<{ type: 'accessibility' | 'emissions' | 'none' }> = ({ type }) => {
  const sceneData = useSceneStore((state) => state.sceneData);
  const centralityScores = useUIStore((state) => state.centralityScores);
  // Only subscribe to metrics when emissions heatmap needs them
  const link_metrics = useSimStore((state) =>
    type === 'emissions' ? state.link_metrics : EMPTY_METRICS
  );
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const heatmapData = useMemo(() => {
    if (!sceneData || type === 'none') return [];

    const nodes = sceneData.nodes || [];
    const facilities = (sceneData.facilities || []).filter(
      (f: any) => f.type === 'hospital' || f.type === 'school' || f.type === 'office' || f.type === 'home'
    );

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

    const nodeVc: Record<string, number[]> = {};
    if (type === 'emissions' && sceneData.links) {
      for (const link of sceneData.links) {
        const m = link_metrics?.[link.id];
        const vc = m && m.capacity > 0 ? m.volume / m.capacity : 0;
        (nodeVc[link.from_node] ||= []).push(vc);
        (nodeVc[link.to_node] ||= []).push(vc);
      }
    }

    return nodes.map((node: any) => {
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
          intensity = minD < Infinity ? Math.max(0, 1 - minD / maxDist) : 0;
        } else {
          intensity = 0.2;
        }
      } else if (type === 'emissions') {
        const vals = nodeVc[node.id] || [];
        intensity = vals.length ? Math.min(1, vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      }

      const r =
        type === 'accessibility'
          ? Math.round(255 - intensity * 255)
          : Math.round(intensity * 255);
      const g =
        type === 'accessibility'
          ? Math.round(intensity * 200)
          : Math.round(120 - intensity * 80);
      const b = type === 'accessibility' ? 80 : 40;

      return {
        x: node.x - 500,
        y: node.y - 500,
        color: new THREE.Color(`rgb(${r},${g},${b})`),
        intensity,
      };
    });
  }, [sceneData, type, centralityScores, link_metrics]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || heatmapData.length === 0) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    heatmapData.forEach((pt: { x: number; y: number; color: THREE.Color }, i: number) => {
      dummy.position.set(pt.x, 0, pt.y);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.copy(pt.color);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = heatmapData.length;
  }, [heatmapData]);

  if (type === 'none' || heatmapData.length === 0) return null;

  return (
    <group position={[0, 1, 0]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, heatmapData.length]}>
        <circleGeometry args={[20, 12]} />
        <meshBasicMaterial transparent opacity={0.55} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

const EMPTY_METRICS: Record<string, any> = {};
