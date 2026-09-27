/**
 * Scene-driven City Twin — facilities as GLBs, roads coloured by live link_metrics.
 */
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, Line } from '@react-three/drei';
import {
  assetForFacilityType,
  getAssetById,
  hashString,
  type AssetEntry,
} from '../../assets/AssetRegistry';
import { RegisteredAsset } from '../../assets/RegisteredAsset';
import { congestionColor } from '../../lib/congestion';
import { useSimStore } from '../../store/simStore';
import { useUIStore } from '../../store/uiStore';
import { useLodStore } from '../../store/lodStore';
import { AgentsSampleLayer } from './AgentsSampleLayer';
import { AgentInspector } from './AgentInspector';
import { Users } from 'lucide-react';
import { LODManager } from '../Map/LODManager';

export type TwinSceneData = {
  nodes?: { id: string; x: number; y: number; type?: string }[];
  links?: {
    id: string;
    from_node: string;
    to_node: string;
    lanes?: number;
  }[];
  facilities?: {
    id: string;
    type: string;
    x: number;
    y: number;
    floors?: number;
    capacity?: number;
  }[];
  bounds?: { width_m?: number; height_m?: number };
  name?: string;
};

type Props = {
  scene: TwinSceneData;
};

function useSceneFrame(scene: TwinSceneData) {
  return useMemo(() => {
    const nodes = scene.nodes || [];
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    }
    for (const f of scene.facilities || []) {
      minX = Math.min(minX, f.x);
      maxX = Math.max(maxX, f.x);
      minY = Math.min(minY, f.y);
      maxY = Math.max(maxY, f.y);
    }
    if (!Number.isFinite(minX)) {
      minX = 0;
      maxX = scene.bounds?.width_m || 5000;
      minY = 0;
      maxY = scene.bounds?.height_m || 5000;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const span = Math.max(maxX - minX, maxY - minY, 500);
    const toWorld = (x: number, y: number): [number, number, number] => [
      (x - cx) * 0.02,
      0,
      (y - cy) * 0.02,
    ];
    return { cx, cy, span, toWorld, minX, maxX, minY, maxY };
  }, [scene]);
}

function RoadNetwork({
  scene,
  toWorld,
}: {
  scene: TwinSceneData;
  toWorld: (x: number, y: number) => [number, number, number];
}) {
  const link_metrics = useSimStore((s) => s.link_metrics);
  const nodeMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const n of scene.nodes || []) m.set(n.id, n);
    return m;
  }, [scene.nodes]);

  return (
    <group>
      {(scene.links || []).map((link) => {
        const a = nodeMap.get(link.from_node);
        const b = nodeMap.get(link.to_node);
        if (!a || !b) return null;
        const metrics = link_metrics?.[link.id];
        const vol = metrics?.volume || 0;
        const cap = metrics?.capacity || 0;
        const vc = cap > 0 ? vol / cap : 0;
        const color = congestionColor(vc);
        const lanes = link.lanes || 2;
        const p0 = toWorld(a.x, a.y);
        const p1 = toWorld(b.x, b.y);
        // Lift slightly above ground
        p0[1] = 0.05;
        p1[1] = 0.05;
        return (
          <Line
            key={link.id}
            points={[p0, p1]}
            color={color}
            lineWidth={Math.min(2 + lanes, 6)}
          />
        );
      })}
    </group>
  );
}

function FacilityBuildings({
  scene,
  toWorld,
}: {
  scene: TwinSceneData;
  toWorld: (x: number, y: number) => [number, number, number];
}) {
  const items = useMemo(() => {
    return (scene.facilities || []).map((fac) => {
      const seed = hashString(fac.id);
      let entry = assetForFacilityType(fac.type, seed);
      // Parks: fountain + trees nearby handled in VegetationLayer
      if (fac.type === 'park') {
        entry = getAssetById('env.fountain') || entry;
      }
      const floors = fac.floors || 1;
      // Scene is ~5000m; we scale world by 0.02 → buildings ~4–12 units tall visually
      const scale =
        fac.type === 'park'
          ? 3
          : fac.type === 'home'
            ? 3.5 + Math.min(floors, 6) * 0.35
            : fac.type === 'office'
              ? 5 + Math.min(floors, 12) * 0.45
              : 4.5 + Math.min(floors, 8) * 0.3;
      return { fac, entry, scale, seed };
    });
  }, [scene.facilities]);

  return (
    <group>
      {items.map(({ fac, entry, scale }) => {
        if (!entry) return null;
        const pos = toWorld(fac.x, fac.y);
        return (
          <RegisteredAsset
            key={fac.id}
            entry={entry}
            position={pos}
            scale={scale}
            fallbackColor={
              fac.type === 'home'
                ? '#60a5fa'
                : fac.type === 'office'
                  ? '#2A9D8F'
                  : fac.type === 'factory'
                    ? '#a16207'
                    : '#94a3b8'
            }
          />
        );
      })}
    </group>
  );
}

/** Sparse trees / street props — capped for FPS; culled at LOD 2 */
function AmbienceLayer({
  scene,
  toWorld,
}: {
  scene: TwinSceneData;
  toWorld: (x: number, y: number) => [number, number, number];
}) {
  const lodTier = useLodStore((s) => s.tier);
  const props = useMemo(() => {
    if (lodTier >= 2) return [];
    const out: { key: string; entry: AssetEntry; pos: [number, number, number]; scale: number }[] =
      [];
    const treeIds = ['env.tree_oak', 'env.tree_birch', 'env.tree_pine', 'env.bush'] as const;
    const light = getAssetById('street.light');
    const bench = getAssetById('street.bench');
    const maxProps = lodTier === 1 ? 36 : 80;

    for (const fac of scene.facilities || []) {
      if (fac.type !== 'park' && fac.type !== 'home') continue;
      const n = fac.type === 'park' ? (lodTier === 1 ? 2 : 5) : 2;
      for (let i = 0; i < n; i++) {
        const h = hashString(`${fac.id}-t${i}`);
        const entry = getAssetById(treeIds[h % treeIds.length]);
        if (!entry) continue;
        const ox = ((h % 200) - 100) * 0.8;
        const oy = (((h >> 8) % 200) - 100) * 0.8;
        out.push({
          key: `${fac.id}-tree-${i}`,
          entry,
          pos: toWorld(fac.x + ox, fac.y + oy),
          scale: 2.2 + (h % 10) * 0.15,
        });
      }
    }

    const nodes = scene.nodes || [];
    const step = Math.max(1, Math.floor(nodes.length / (lodTier === 1 ? 10 : 16)));
    for (let i = 0; i < nodes.length && out.length < maxProps; i += step) {
      const n = nodes[i];
      if (light) {
        out.push({
          key: `light-${n.id}`,
          entry: light,
          pos: toWorld(n.x + 15, n.y + 15),
          scale: 2.5,
        });
      }
      if (bench && i % (step * 2) === 0) {
        out.push({
          key: `bench-${n.id}`,
          entry: bench,
          pos: toWorld(n.x - 20, n.y + 10),
          scale: 2,
        });
      }
    }

    return out.slice(0, maxProps);
  }, [scene, toWorld, lodTier]);

  if (props.length === 0) return null;

  return (
    <group>
      {props.map((p) => (
        <RegisteredAsset key={p.key} entry={p.entry} position={p.pos} scale={p.scale} />
      ))}
    </group>
  );
}

function IntersectionDots({
  scene,
  toWorld,
}: {
  scene: TwinSceneData;
  toWorld: (x: number, y: number) => [number, number, number];
}) {
  return (
    <group>
      {(scene.nodes || []).map((n) => {
        const [x, , z] = toWorld(n.x, n.y);
        return (
          <mesh key={n.id} position={[x, 0.08, z]}>
            <cylinderGeometry args={[0.25, 0.25, 0.12, 10]} />
            <meshStandardMaterial color="#1B2430" />
          </mesh>
        );
      })}
    </group>
  );
}

export const CityTwinScene: React.FC<Props> = ({ scene }) => {
  const { toWorld, span } = useSceneFrame(scene);
  const camDist = Math.min(90, Math.max(25, span * 0.02 * 0.85));
  const status = useSimStore((s) => s.status);
  const agents = useSimStore((s) => s.agents_sample);
  const setSelectedAgentId = useUIStore((s) => s.setSelectedAgentId);
  const agentCount = agents?.length || 0;

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={{ position: [camDist * 0.7, camDist * 0.55, camDist * 0.7], fov: 45, near: 0.1, far: 800 }}
        shadows
        onPointerMissed={() => setSelectedAgentId(null)}
      >
        <color attach="background" args={['#dfe8ef']} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[60, 80, 40]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Grid
          infiniteGrid
          fadeDistance={camDist * 3}
          cellSize={2}
          sectionSize={10}
          cellColor="#c5d0db"
          sectionColor="#9aabbc"
        />
        <RoadNetwork scene={scene} toWorld={toWorld} />
        <IntersectionDots scene={scene} toWorld={toWorld} />
        <FacilityBuildings scene={scene} toWorld={toWorld} />
        <AmbienceLayer scene={scene} toWorld={toWorld} />
        <AgentsSampleLayer toWorld={toWorld} />
        <LODManager />
        <ContactShadows opacity={0.3} scale={200} blur={2.5} far={40} />
        <Environment preset="city" />
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.08}
          minDistance={8}
          maxDistance={camDist * 2.5}
          target={[0, 0, 0]}
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 z-10 space-y-2 max-w-sm">
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)]/95 backdrop-blur-sm px-3 py-2 text-xs text-[var(--text-secondary)] shadow-sm">
          <div className="font-semibold text-[var(--text-primary)] mb-0.5">
            {scene.name || 'City Twin'}
          </div>
          <p>
            {(scene.facilities || []).length} facilities · {(scene.links || []).length} links ·{' '}
            {(scene.nodes || []).length} nodes
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <Users size={12} className="text-[var(--accent)]" />
            {status === 'connected'
              ? `${agentCount} sampled agents streaming (viz · not microsim)`
              : 'Idle — open map with ?run_id= to stream agents'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2A9D8F]" /> car
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> walk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> transit
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <AgentInspector />
      </div>
    </div>
  );
};
