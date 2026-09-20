import React, { useMemo, memo, useRef } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { useUIStore } from '../../store/uiStore';
import { useSimStore } from '../../store/simStore';
import { useScenarioDraftStore } from '../../store/scenarioDraftStore';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { congestionColor, CONGESTION_COLORS } from '../../lib/congestion';

const GHOST_ACCENT = CONGESTION_COLORS.selected;
const GHOST_CLOSE = '#ef4444';
const GHOST_ADD = '#2A9D8F';

type AnimatedLinkProps = {
  link: any;
  points: [number, number, number][];
  volume: number;
  capacity: number;
  selected: boolean;
  isNightMode: boolean;
  ghostStyle?: string;
  animate: boolean;
};

const AnimatedLink = memo(function AnimatedLink({
  link,
  points,
  volume,
  capacity,
  selected,
  isNightMode,
  ghostStyle,
  animate,
}: AnimatedLinkProps) {
  const lineRef = useRef<any>(null);

  const color = useMemo(() => {
    if (ghostStyle === 'close') return GHOST_CLOSE;
    if (ghostStyle === 'modify') return GHOST_ACCENT;
    if (selected) return CONGESTION_COLORS.selected;
    if (!capacity && !volume) return congestionColor(0, { night: isNightMode });
    const vc = capacity > 0 ? volume / capacity : 0;
    return congestionColor(vc, { night: isNightMode });
  }, [ghostStyle, selected, capacity, volume, isNightMode]);

  useFrame((_, delta) => {
    if (!animate || ghostStyle) return;
    if (lineRef.current?.material && volume > 0) {
      lineRef.current.material.dashOffset -= delta * (volume * 0.05 + 1.0);
    }
  });

  const isGhost = Boolean(ghostStyle);
  const lineWidth = isGhost
    ? ghostStyle === 'close'
      ? 5
      : 4
    : selected
      ? (link.lanes ? link.lanes * 1.5 + 2 : 5)
      : link.lanes
        ? link.lanes * 1.5
        : 3;
  const isFlowing = !isGhost && volume > 0;
  const dashed = isGhost || isFlowing;

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={lineWidth}
      dashed={dashed}
      dashScale={isGhost ? 20 : 50}
      dashSize={isGhost ? 12 : isFlowing ? 20 : 0}
      gapSize={isGhost ? 8 : undefined}
      dashOffset={0}
      transparent={isGhost}
      opacity={ghostStyle === 'close' ? 0.85 : 1}
      onClick={(e) => {
        if (isGhost) return;
        e.stopPropagation();
        const editorMode = useUIStore.getState().editorMode;
        if (editorMode === 'select') {
          useUIStore.getState().setSelectedLinkId(link.id);
          useUIStore.getState().setSelectedNodeId(null);
        }
      }}
      onPointerOver={(e) => {
        if (isGhost) return;
        const editorMode = useUIStore.getState().editorMode;
        if (editorMode === 'select') {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        if (isGhost) return;
        const editorMode = useUIStore.getState().editorMode;
        if (editorMode === 'select') {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }
      }}
    />
  );
});

export const NetworkLayer: React.FC = () => {
  const selectedLinkId = useUIStore((s) => s.selectedLinkId);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const editorMode = useUIStore((s) => s.editorMode);
  const isNightMode = useUIStore((s) => s.isNightMode);
  const centralityScores = useUIStore((s) => s.centralityScores);
  const setSelectedNodeId = useUIStore((s) => s.setSelectedNodeId);
  const setSelectedLinkId = useUIStore((s) => s.setSelectedLinkId);
  const setEditorMode = useUIStore((s) => s.setEditorMode);

  const sceneData = useSceneStore((s) => s.sceneData);
  const addNode = useSceneStore((s) => s.addNode);
  const addLink = useSceneStore((s) => s.addLink);
  const link_metrics = useSimStore((s) => s.link_metrics);
  const pendingOps = useScenarioDraftStore((s) => s.pendingOps);

  const nodeMap = useMemo(() => {
    if (!sceneData?.nodes) return new Map();
    const map = new Map();
    sceneData.nodes.forEach((n: any) => map.set(n.id, n));
    return map;
  }, [sceneData?.nodes]);

  const ghost = useMemo(() => {
    const closed = new Set<string>();
    const modified = new Set<string>();
    const extraNodes: any[] = [];
    const extraLinks: any[] = [];
    const map = new Map(nodeMap);

    for (const op of pendingOps) {
      const d = op.data || {};
      switch (op.type) {
        case 'close_link':
        case 'remove_link':
          if (d.id) closed.add(d.id);
          break;
        case 'outage': {
          const ids = Array.isArray(d.link_ids)
            ? d.link_ids
            : typeof d.link_ids === 'string'
              ? d.link_ids.split(',').map((x: string) => x.trim()).filter(Boolean)
              : d.id
                ? [d.id]
                : [];
          ids.forEach((id: string) => closed.add(id));
          break;
        }
        case 'set_lanes':
        case 'set_speed':
        case 'set_capacity':
          if (d.id) modified.add(d.id);
          break;
        case 'add_node':
          if (d.id != null && d.x != null && d.y != null) {
            extraNodes.push(d);
            map.set(d.id, d);
          }
          break;
        case 'add_link':
          if (d.id && d.from_node && d.to_node) extraLinks.push(d);
          break;
        case 'flood':
          sceneData?.links?.forEach((l: any) => {
            const from = map.get(l.from_node);
            const to = map.get(l.to_node);
            if (!from || !to) return;
            if (Math.abs(from.x - 500) < 200 || Math.abs(to.x - 500) < 200) {
              closed.add(l.id);
            }
          });
          break;
        default:
          break;
      }
    }
    return { closed, modified, extraNodes, extraLinks, map };
  }, [pendingOps, sceneData?.links, nodeMap]);

  // Cap animated edges — only top-N by volume animate (FPS)
  const animateIds = useMemo(() => {
    const entries = Object.entries(link_metrics || {})
      .map(([id, m]: [string, any]) => [id, m?.volume || 0] as const)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 48);
    return new Set(entries.map(([id]) => id));
  }, [link_metrics]);

  if (!sceneData?.nodes) return null;

  const nodeColor = isNightMode ? '#2A9D8F' : '#E76F51';
  const lookup = ghost.map.size ? ghost.map : nodeMap;

  const toPoints = (fromNode: any, toNode: any): [number, number, number][] => [
    [fromNode.x - 500, 0.2, fromNode.y - 500],
    [toNode.x - 500, 0.2, toNode.y - 500],
  ];

  return (
    <group>
      {sceneData?.links?.map((link: any, idx: number) => {
        const fromNode = lookup.get(link.from_node);
        const toNode = lookup.get(link.to_node);
        if (!fromNode || !toNode) return null;

        let ghostStyle: string | undefined;
        if (ghost.closed.has(link.id)) ghostStyle = 'close';
        else if (ghost.modified.has(link.id)) ghostStyle = 'modify';

        const m = link_metrics[link.id];
        const volume = m?.volume || 0;
        const capacity = m?.capacity || 0;

        return (
          <AnimatedLink
            key={`link-${link.id || idx}`}
            link={link}
            points={toPoints(fromNode, toNode)}
            volume={volume}
            capacity={capacity}
            selected={link.id === selectedLinkId}
            isNightMode={isNightMode}
            ghostStyle={ghostStyle}
            animate={animateIds.has(link.id)}
          />
        );
      })}

      {ghost.extraLinks.map((link: any, idx: number) => {
        const fromNode = lookup.get(link.from_node);
        const toNode = lookup.get(link.to_node);
        if (!fromNode || !toNode) return null;
        return (
          <Line
            key={`ghost-link-${link.id || idx}`}
            points={toPoints(fromNode, toNode)}
            color={GHOST_ADD}
            lineWidth={4}
            dashed
            dashScale={15}
            dashSize={10}
            gapSize={6}
          />
        );
      })}

      {sceneData.nodes.map((node: any, idx: number) => {
        const isSelected = node.id === selectedNodeId;
        const cent = centralityScores?.[node.id];
        let color = nodeColor;
        if (isSelected) color = '#FFD166';
        else if (cent !== undefined) color = cent > 0.05 ? '#ef4444' : '#10b981';

        return (
          <mesh
            key={`node-${node.id || idx}`}
            position={[node.x - 500, 0.5, node.y - 500]}
            onClick={(e) => {
              e.stopPropagation();
              if (editorMode === 'select') {
                setSelectedNodeId(node.id);
                setSelectedLinkId(null);
              } else if (editorMode === 'addLink') {
                if (!selectedNodeId) {
                  setSelectedNodeId(node.id);
                } else if (selectedNodeId !== node.id) {
                  const newLinkId = `link_${Math.floor(Math.random() * 1000000)}`;
                  addLink({
                    id: newLinkId,
                    from_node: selectedNodeId,
                    to_node: node.id,
                    lanes: 2,
                    speed_kph: 50,
                    capacity_per_lane_per_hour: 1800,
                    road_class: 'local',
                    oneway: false,
                  });
                  setSelectedNodeId(null);
                  setEditorMode('select');
                }
              }
            }}
            onPointerOver={(e) => {
              if (editorMode === 'select' || editorMode === 'addLink') {
                e.stopPropagation();
                document.body.style.cursor = 'crosshair';
              }
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'auto';
            }}
          >
            <cylinderGeometry args={[isSelected ? 5 : 4, isSelected ? 5 : 4, 1, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}

      {ghost.extraNodes.map((node: any, idx: number) => (
        <mesh key={`ghost-node-${node.id || idx}`} position={[node.x - 500, 0.8, node.y - 500]}>
          <cylinderGeometry args={[6, 6, 1.2, 16]} />
          <meshStandardMaterial color={GHOST_ADD} transparent opacity={0.75} />
        </mesh>
      ))}

      {sceneData.facilities?.map((fac: any, idx: number) => {
        const floors = fac.floors || 1;
        const height = floors * 3;
        const size = fac.type === 'home' ? 10 : fac.type === 'office' ? 20 : 15;

        let color = '#a1a1aa';
        if (fac.type === 'home') color = isNightMode ? '#1d4ed8' : '#60a5fa';
        if (fac.type === 'office') color = isNightMode ? '#0f766e' : '#2A9D8F';
        if (fac.type === 'school') color = isNightMode ? '#a16207' : '#fde047';

        return (
          <mesh key={`fac-${fac.id || idx}`} position={[fac.x - 500, height / 2, fac.y - 500]}>
            <boxGeometry args={[size, height, size]} />
            <meshStandardMaterial color={color} opacity={0.9} transparent />
          </mesh>
        );
      })}

      {editorMode === 'addNode' && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            const newId = `node_${Math.floor(Math.random() * 1000000)}`;
            addNode({
              id: newId,
              x: Math.round(e.point.x + 500),
              y: Math.round(e.point.z + 500),
              type: 'intersection',
            });
            setSelectedNodeId(newId);
            setEditorMode('select');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'crosshair';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[10000, 10000]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
    </group>
  );
};
