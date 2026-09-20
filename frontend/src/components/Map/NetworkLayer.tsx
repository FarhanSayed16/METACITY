import React, { useMemo } from 'react';
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

const AnimatedLink = ({ link, points, metrics, selectedLinkId, setSelectedLinkId, isNightMode, ghostStyle }: any) => {
  const lineRef = React.useRef<any>(null);

  const getLinkColor = () => {
    if (ghostStyle === 'close') return GHOST_CLOSE;
    if (ghostStyle === 'modify') return GHOST_ACCENT;
    if (link.id === selectedLinkId) return CONGESTION_COLORS.selected;
    if (!metrics) return congestionColor(0, { night: isNightMode });

    const vc = metrics.capacity > 0 ? (metrics.volume / metrics.capacity) : 0;
    return congestionColor(vc, { night: isNightMode });
  };

  useFrame((_, delta) => {
    if (lineRef.current && lineRef.current.material && !ghostStyle) {
      const vol = metrics?.volume || 0;
      if (vol > 0) {
        lineRef.current.material.dashOffset -= delta * (vol * 0.05 + 1.0);
      }
    }
  });

  const isGhost = Boolean(ghostStyle);
  const lineWidth = isGhost
    ? ghostStyle === 'close'
      ? 5
      : 4
    : link.id === selectedLinkId
      ? link.lanes
        ? link.lanes * 1.5 + 2
        : 5
      : link.lanes
        ? link.lanes * 1.5
        : 3;
  const isFlowing = !isGhost && (metrics?.volume || 0) > 0;
  const dashed = isGhost || isFlowing;

  return (
    <Line
      ref={lineRef}
      points={points}
      color={getLinkColor()}
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
          setSelectedLinkId(link.id);
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
};

export const NetworkLayer: React.FC = () => {
  const { selectedLinkId, setSelectedLinkId, selectedNodeId, setSelectedNodeId, editorMode, setEditorMode, isNightMode } =
    useUIStore();
  const { sceneData, addNode, addLink } = useSceneStore();
  const link_metrics = useSimStore((state) => state.link_metrics);
  const pendingOps = useScenarioDraftStore((s) => s.pendingOps);

  const nodeMap = useMemo(() => {
    if (!sceneData?.nodes) return new Map();
    const map = new Map();
    sceneData.nodes.forEach((n: any) => map.set(n.id, n));
    return map;
  }, [sceneData]);

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
  }, [pendingOps, sceneData, nodeMap]);

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

        return (
          <AnimatedLink
            key={`link-${link.id || idx}`}
            link={link}
            points={toPoints(fromNode, toNode)}
            metrics={link_metrics[link.id]}
            selectedLinkId={selectedLinkId}
            setSelectedLinkId={setSelectedLinkId}
            isNightMode={isNightMode}
            ghostStyle={ghostStyle}
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
            <meshStandardMaterial
              color={
                isSelected
                  ? '#FFD166'
                  : useUIStore.getState().centralityScores?.[node.id] !== undefined
                    ? useUIStore.getState().centralityScores![node.id] > 0.05
                      ? '#ef4444'
                      : '#10b981'
                    : nodeColor
              }
            />
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
        if (fac.type === 'home') color = isNightMode ? '#3b82f6' : '#60a5fa';
        if (fac.type === 'office') color = isNightMode ? '#8b5cf6' : '#a78bfa';
        if (fac.type === 'school') color = isNightMode ? '#eab308' : '#fde047';

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
