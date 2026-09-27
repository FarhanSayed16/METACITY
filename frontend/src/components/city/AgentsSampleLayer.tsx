/**
 * City Twin agents layer — renders WS `agents_sample` as simple meshes.
 * Level-1 honest: sampled MSA trip positions, NOT microsimulation / FSM citizens.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimStore } from '../../store/simStore';
import { useUIStore } from '../../store/uiStore';
import { useLodStore } from '../../store/lodStore';

const MODE_COLOR: Record<string, string> = {
  car: '#2A9D8F',
  walk: '#F59E0B',
  transit: '#3B82F6',
};

const MAX_AGENTS = 200;

type ToWorld = (x: number, y: number) => [number, number, number];

export function AgentsSampleLayer({ toWorld }: { toWorld: ToWorld }) {
  const agents = useSimStore((s) => s.agents_sample);
  const lodTier = useLodStore((s) => s.tier);
  const selectedId = useUIStore((s) => s.selectedAgentId);
  const setSelectedAgentId = useUIStore((s) => s.setSelectedAgentId);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const prevPos = useRef<Map<string, THREE.Vector3>>(new Map());

  const sample = useMemo(() => {
    const all = agents || [];
    const cap = lodTier >= 2 ? 0 : lodTier === 1 ? 80 : MAX_AGENTS;
    return all.slice(0, cap);
  }, [agents, lodTier]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.count = sample.length;
    sample.forEach((a, i) => {
      const mode = String(a.mode || 'car').toLowerCase();
      tempColor.set(MODE_COLOR[mode] || '#94a3b8');
      if (a.id === selectedId) tempColor.set('#EF4444');
      mesh.setColorAt(i, tempColor);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [sample, selectedId, tempColor]);

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const lerp = Math.min(1, dt * 8);
    const alive = new Set<string>();

    sample.forEach((a, i) => {
      const id = String(a.id);
      alive.add(id);
      const [tx, , tz] = toWorld(Number(a.x), Number(a.y));
      const targetY = 0.55;
      let cur = prevPos.current.get(id);
      if (!cur) {
        cur = new THREE.Vector3(tx, targetY, tz);
        prevPos.current.set(id, cur);
      } else {
        cur.x += (tx - cur.x) * lerp;
        cur.y += (targetY - cur.y) * lerp;
        cur.z += (tz - cur.z) * lerp;
      }
      const scale = a.id === selectedId ? 1.35 : 1;
      tempObj.position.copy(cur);
      tempObj.scale.set(scale, scale * 1.4, scale);
      tempObj.updateMatrix();
      mesh.setMatrixAt(i, tempObj.matrix);
    });

    // Drop stale lerp state
    for (const id of prevPos.current.keys()) {
      if (!alive.has(id)) prevPos.current.delete(id);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.count = sample.length;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const idx = e.instanceId;
    if (idx == null || idx < 0 || idx >= sample.length) return;
    const id = String(sample[idx].id);
    setSelectedAgentId(selectedId === id ? null : id);
  };

  if (sample.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_AGENTS]}
      onClick={onClick}
      castShadow
      frustumCulled={false}
    >
      <capsuleGeometry args={[0.22, 0.35, 4, 8]} />
      <meshStandardMaterial vertexColors metalness={0.15} roughness={0.55} />
    </instancedMesh>
  );
}
