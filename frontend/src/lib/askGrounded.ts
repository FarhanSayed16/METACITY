/**
 * Guided / template answers grounded on project runs + scene stats.
 * Explicitly NOT an LLM — Level-1 honest for Phase 6.
 */

export interface GroundedContext {
  projectId: string;
  scene?: any | null;
  runs?: any[];
  latestMeta?: any | null;
  latestMetrics?: any | null;
  pendingOps?: Array<{ type: string; data: Record<string, any> }>;
  isolation?: {
    isolation_ratio?: number;
    component_count?: number;
    isolated_nodes?: string[];
  } | null;
}

export interface GroundedAnswer {
  text: string;
  metrics: Record<string, string | number>;
  source: 'run_meta' | 'run_metrics' | 'scene' | 'draft' | 'isolation' | 'none';
  label: 'Guided template (not an LLM)';
}

function fmt(n: unknown, digits = 2): string {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(digits) : '—';
}

function latestRun(ctx: GroundedContext): any | null {
  if (!ctx.runs?.length) return null;
  return [...ctx.runs].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0];
}

export const PRESET_QUESTIONS = [
  'What is the latest run status and travel time?',
  'How congested was the last completed run?',
  'Summarize the network size for this project.',
  'Are there disaster draft ops pending?',
  'What is the current isolation ratio?',
] as const;

export function answerGroundedQuestion(question: string, ctx: GroundedContext): GroundedAnswer {
  const q = question.toLowerCase();
  const run = latestRun(ctx);
  const meta = ctx.latestMeta;
  const metrics = ctx.latestMetrics;
  const kpis = meta?.kpis || meta?.summary || metrics?.kpis || {};

  if (q.includes('isolation') || q.includes('fragment')) {
    if (ctx.isolation) {
      const ratio = Number(ctx.isolation.isolation_ratio ?? 0);
      const comps = Number(ctx.isolation.component_count ?? 0);
      const isolated = ctx.isolation.isolated_nodes?.length ?? 0;
      return {
        text: `Current scene isolation ratio is ${fmt(ratio, 3)} across ${comps} components (${isolated} isolated nodes). Higher ratio means more fragmentation — use Disaster Lab flood/outage/close_link, then Compare for isolation Δ after a full run.`,
        metrics: {
          isolation_ratio: Number(ratio.toFixed(3)),
          component_count: comps,
          isolated_nodes: isolated,
        },
        source: 'isolation',
        label: 'Guided template (not an LLM)',
      };
    }
    return {
      text: 'No isolation snapshot yet. Open the Network map and run isolation (toolbar) or Measure isolation in Disaster Lab.',
      metrics: {},
      source: 'none',
      label: 'Guided template (not an LLM)',
    };
  }

  if (q.includes('disaster') || q.includes('draft') || q.includes('hazard') || q.includes('flood') || q.includes('pending')) {
    const ops = ctx.pendingOps || [];
    const hazard = ops.filter((o) => ['flood', 'outage', 'close_link', 'remove_link'].includes(o.type));
    if (hazard.length === 0) {
      return {
        text: 'No disaster draft ops are pending. Open Disaster Lab on the Network map to queue flood, outage, or close_link — then Preview / Save & run.',
        metrics: { pending_hazard_ops: 0 },
        source: 'draft',
        label: 'Guided template (not an LLM)',
      };
    }
    const types = hazard.map((o) => o.type).join(', ');
    return {
      text: `${hazard.length} hazard op(s) in the ghost draft: ${types}. Preview on the map (red dashed closures) or Save & run to measure isolation after simulation.`,
      metrics: { pending_hazard_ops: hazard.length, types },
      source: 'draft',
      label: 'Guided template (not an LLM)',
    };
  }

  if (q.includes('network') || q.includes('scene') || q.includes('size') || q.includes('links') || q.includes('nodes')) {
    const nodes = ctx.scene?.nodes?.length ?? 0;
    const links = ctx.scene?.links?.length ?? 0;
    const facilities = ctx.scene?.facilities?.length ?? 0;
    if (!nodes && !links) {
      return {
        text: 'Scene is not loaded in this session. Open the project Network map to hydrate scene stats.',
        metrics: {},
        source: 'none',
        label: 'Guided template (not an LLM)',
      };
    }
    return {
      text: `This project scene has ${nodes} nodes, ${links} links, and ${facilities} facilities. Network Evidence edits the graph; City Twin presents the same scene with GLBs.`,
      metrics: { nodes, links, facilities },
      source: 'scene',
      label: 'Guided template (not an LLM)',
    };
  }

  if (q.includes('congest') || q.includes('bottleneck') || q.includes('volume') || q.includes('link_metric')) {
    const linkMetrics = metrics?.link_metrics || metrics?.links || meta?.link_metrics;
    if (linkMetrics && typeof linkMetrics === 'object') {
      const entries = Object.entries(linkMetrics as Record<string, any>)
        .map(([id, m]) => ({
          id,
          volume: Number(m?.volume ?? m?.flow ?? 0),
          cong: Number(m?.congestion ?? m?.voc ?? m?.v_c ?? 0),
        }))
        .sort((a, b) => b.cong - a.cong || b.volume - a.volume)
        .slice(0, 5);
      if (entries.length) {
        const top = entries.map((e) => `${e.id} (cong ${fmt(e.cong, 2)}, vol ${fmt(e.volume, 0)})`).join('; ');
        return {
          text: `Top congested links from the latest metrics: ${top}. These come from your run artefacts — open Compare for multi-seed confidence.`,
          metrics: {
            top_link: entries[0].id,
            top_congestion: Number(entries[0].cong.toFixed(2)),
            links_scored: entries.length,
          },
          source: 'run_metrics',
          label: 'Guided template (not an LLM)',
        };
      }
    }
    return {
      text: 'No link_metrics on the latest run yet. Enqueue a run from overview or Disaster Lab, then ask again.',
      metrics: { runs: ctx.runs?.length ?? 0 },
      source: 'none',
      label: 'Guided template (not an LLM)',
    };
  }

  // Default: latest run status / travel time
  if (run || meta || Object.keys(kpis).length) {
    const status = run?.status || meta?.status || 'unknown';
    const tt = kpis.avg_travel_time ?? kpis.mean_travel_time ?? meta?.avg_travel_time;
    const vkt = kpis.total_vkt ?? kpis.vkt;
    const runId = run?.id || meta?.run_id || '—';
    return {
      text: `Latest run ${runId} is "${status}". Avg travel time ${fmt(tt)} · VKT ${fmt(vkt, 1)}. Answers are read from your run meta/KPIs — not generated by an LLM. Use Planner → Verify to re-check candidates with the full sim path.`,
      metrics: {
        run_id: String(runId),
        status: String(status),
        avg_travel_time: tt != null ? Number(fmt(tt)) : '—',
        vkt: vkt != null ? Number(fmt(vkt, 1)) : '—',
      },
      source: meta ? 'run_meta' : 'run_metrics',
      label: 'Guided template (not an LLM)',
    };
  }

  return {
    text: `No run artefacts found for project ${ctx.projectId}. Create a scenario, enqueue seeds, then ask about travel time, congestion, or isolation.`,
    metrics: { project_id: ctx.projectId },
    source: 'none',
    label: 'Guided template (not an LLM)',
  };
}
