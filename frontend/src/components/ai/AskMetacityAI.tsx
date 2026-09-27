import { useEffect, useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSceneStore } from '../../store/sceneStore';
import { useScenarioDraftStore } from '../../store/scenarioDraftStore';
import { useSimStore } from '../../store/simStore';
import { api } from '../../lib/api';
import { featureFlags } from '../../lib/featureFlags';
import { answerGroundedQuestion, PRESET_QUESTIONS, type GroundedContext } from '../../lib/askGrounded';
import { Button } from '../ui/Button';

type ChatMsg = {
  sender: 'user' | 'ai';
  text: string;
  metrics?: Record<string, string | number>;
  label?: string;
};

/**
 * Ask METACITY — guided templates grounded on run meta / KPIs / scene.
 * Labelled honestly: not an LLM (Phase 6 / E-M3 later).
 */
export function AskMetacityAI() {
  const open = useUIStore((s) => s.showAskAI);
  const setOpen = useUIStore((s) => s.setShowAskAI);
  const projectId = useUIStore((s) => s.activeProjectId);
  const sceneData = useSceneStore((s) => s.sceneData);
  const pendingOps = useScenarioDraftStore((s) => s.pendingOps);
  const activeRunId = useSimStore((s) => s.activeRunId);

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: 'ai',
      text: 'Ask about run status, congestion, network size, disaster drafts, or isolation. Answers are guided templates bound to your artefacts — not an LLM.',
      label: 'Guided template (not an LLM)',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [ctxCache, setCtxCache] = useState<GroundedContext | null>(null);

  useEffect(() => {
    if (!open || !projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const runs = await api.listProjectRuns(projectId);
        const latest = [...(runs || [])].sort((a, b) =>
          String(b.created_at || '').localeCompare(String(a.created_at || ''))
        )[0];
        const runId = activeRunId || latest?.id;
        let latestMeta: any = null;
        let latestMetrics: any = null;
        if (runId) {
          try {
            latestMeta = await api.getRunMeta(runId);
          } catch {
            /* optional */
          }
          try {
            latestMetrics = await api.getRunMetrics(runId);
          } catch {
            /* optional */
          }
        }
        let isolation: any = null;
        if (sceneData) {
          try {
            isolation = await api.getIsolation(sceneData);
          } catch {
            /* optional */
          }
        }
        if (!cancelled) {
          setCtxCache({
            projectId,
            scene: sceneData,
            runs: runs || [],
            latestMeta,
            latestMetrics,
            pendingOps,
            isolation,
          });
        }
      } catch {
        if (!cancelled) {
          setCtxCache({
            projectId,
            scene: sceneData,
            runs: [],
            pendingOps,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, projectId, sceneData, pendingOps, activeRunId]);

  if (!featureFlags.aiCommand || !open) return null;

  const handleAsk = async (raw: string) => {
    const q = raw.trim();
    if (!q || !projectId) return;
    setQuestion('');
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setLoading(true);
    try {
      const ctx: GroundedContext = ctxCache || {
        projectId,
        scene: sceneData,
        pendingOps,
      };
      // Refresh lightly if asking about isolation and we have scene
      if (q.toLowerCase().includes('isolation') && sceneData) {
        try {
          ctx.isolation = await api.getIsolation(sceneData);
        } catch {
          /* keep cache */
        }
      }
      const ans = answerGroundedQuestion(q, ctx);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: ans.text,
          metrics: ans.metrics,
          label: ans.label,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--bg-chrome)]/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-ai-title"
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-chrome)] text-[var(--text-inverse)]">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="h-5 w-5 text-[var(--accent)]" />
            <div>
              <h3 id="ask-ai-title" className="text-sm font-bold tracking-wide">
                Ask METACITY
              </h3>
              <p className="text-[11px] text-white/55">Guided answers from run artefacts · not an LLM</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/70"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {!projectId && (
            <p className="text-sm text-[var(--text-secondary)]">Open a project so answers can bind to runs and scene.</p>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] rounded-lg p-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
                }`}
              >
                <p>{m.text}</p>
                {m.label && m.sender === 'ai' && (
                  <p className="mt-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{m.label}</p>
                )}
                {m.metrics && Object.keys(m.metrics).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="text-[var(--text-muted)]">Evidence:</span>
                    {Object.entries(m.metrics).map(([k, v]) => (
                      <span
                        key={k}
                        className="bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--accent)]"
                      >
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--accent)]">
              <Sparkles size={14} className="animate-soft-pulse" />
              Reading run artefacts…
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((pq) => (
            <button
              key={pq}
              type="button"
              onClick={() => handleAsk(pq)}
              className="text-[10px] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              {pq}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="p-3 border-t border-[var(--border-subtle)] flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about runs, congestion, isolation…"
            className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)]"
            disabled={!projectId}
          />
          <Button type="submit" size="sm" disabled={loading || !question.trim() || !projectId}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
