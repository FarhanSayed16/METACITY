import type { Project, ProjectCreateReq, Template, Profile, Preset } from '../types/api';

/** Backend origin — override with VITE_API_URL in non-local deploys. */
export const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:8000';

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export function wsUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = API_BASE.replace(/^http/, 'ws');
  return `${base}${p}`;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(apiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new Error('Network error or API is down.');
  }
}

export const api = {
  // Projects
  getProjects: () => fetchApi<Project[]>('/projects'),
  getProject: (id: string) => fetchApi<Project>(`/projects/${id}`),
  createProject: (req: ProjectCreateReq) =>
    fetchApi<Project>('/projects', { method: 'POST', body: JSON.stringify(req) }),

  // Resources
  getTemplates: () => fetchApi<Template[]>('/templates'),
  getProfiles: () => fetchApi<Profile[]>('/profiles'),
  getPresets: () => fetchApi<Preset[]>('/presets'),
  getPreset: (id: string) => fetchApi<any>(`/presets/${id}`),
  // Scenarios
  getScenarios: (projectId: string) => fetchApi<any[]>(`/projects/${projectId}/scenarios`),
  createScenario: (req: any) => fetchApi<any>('/scenarios', { method: 'POST', body: JSON.stringify(req) }),

  // Runs
  triggerRun: (req: any) => fetchApi<any[]>('/runs', { method: 'POST', body: JSON.stringify(req) }),
  getRun: (runId: string) => fetchApi<any>(`/runs/${runId}`),
  getRunMeta: (runId: string) => fetchApi<any>(`/runs/${runId}/meta`),
  getRunMetrics: (runId: string) => fetchApi<any>(`/runs/${runId}/metrics`),
  listProjectRuns: (projectId: string) => fetchApi<any[]>(`/projects/${projectId}/runs`),
  retryRun: (runId: string) => fetchApi<any>(`/runs/${runId}/retry`, { method: 'POST' }),

  // Health
  checkHealth: () => fetchApi<{ status: string; model_version?: string }>('/health'),

  // Comparisons
  compareScenarios: (req: any) => fetchApi<any>('/comparisons', { method: 'POST', body: JSON.stringify(req) }),

  // Tools
  getCentrality: (scene: any) => fetchApi<any>('/tools/centrality', { method: 'POST', body: JSON.stringify(scene) }),
  getBridges: (scene: any) => fetchApi<any>('/tools/bridges', { method: 'POST', body: JSON.stringify(scene) }),
  getIsolation: (scene: any) => fetchApi<any>('/tools/isolation', { method: 'POST', body: JSON.stringify(scene) }),
  getConnectivity: (scene: any) => fetchApi<any>('/tools/connectivity', { method: 'POST', body: JSON.stringify(scene) }),
  pathfind: (scene: any, start: string, goal: string) =>
    fetchApi<any>('/tools/pathfind', { method: 'POST', body: JSON.stringify({ scene, start, goal }) }),
  msaDemo: (req: any = {}) => fetchApi<any>('/tools/msa_demo', { method: 'POST', body: JSON.stringify(req) }),

  // Scene
  getScene: (projectId: string) => fetchApi<any>(`/projects/${projectId}/scene`),
  saveScene: (projectId: string, scene: any) =>
    fetchApi<any>(`/projects/${projectId}/scene`, { method: 'PUT', body: JSON.stringify(scene) }),

  // Screenshots
  uploadScreenshot: (payload: { image_base64: string; run_id?: string; slot?: string; label?: string }) =>
    fetchApi<any>('/screenshots', { method: 'POST', body: JSON.stringify(payload) }),

  // Import
  importFromOSM: (bbox: { south: number; west: number; north: number; east: number }, name: string) =>
    fetchApi<{ project_id: string; node_count: number; link_count: number; attribution: string }>(
      `/import/osm?south=${bbox.south}&west=${bbox.west}&north=${bbox.north}&east=${bbox.east}&project_name=${encodeURIComponent(name)}`,
      { method: 'POST' }
    ),

  // Calibration
  calibrateProject: (projectId: string, observations: Record<string, number>, fit = false) =>
    fetchApi<any>(`/projects/${projectId}/calibrate`, {
      method: 'POST',
      body: JSON.stringify({ observed_counts: observations, fit }),
    }),

  // Export
  exportGeoJSON: (projectId: string, runId?: string) =>
    fetchApi<any>(
      `/projects/${projectId}/geojson${runId ? `?run_id=${encodeURIComponent(runId)}` : ''}`
    ),

  // Analysis
  multiYear: (projectId: string, body: { years?: number; shift_rate?: number; seed?: number }) =>
    fetchApi<any>(`/projects/${projectId}/multi-year`, { method: 'POST', body: JSON.stringify(body) }),
  sweep: (projectId: string, body: any) =>
    fetchApi<any>(`/projects/${projectId}/sweep`, { method: 'POST', body: JSON.stringify(body) }),
  warmStartCompare: (projectId: string, body: { seed?: number; msa_max_iter?: number } = {}) =>
    fetchApi<any>(`/projects/${projectId}/warm-start-compare`, { method: 'POST', body: JSON.stringify(body) }),

  // Planner
  plannerSearch: (projectId: string, body: { n_candidates?: number; objective?: string } = {}) =>
    fetchApi<any>(`/planner/${projectId}/search`, { method: 'POST', body: JSON.stringify(body) }),
  plannerVerify: (projectId: string, body: { candidates: any[]; top_n?: number; seeds?: number[] }) =>
    fetchApi<any>(`/planner/${projectId}/verify`, { method: 'POST', body: JSON.stringify(body) }),

  // Evacuation / Hospital
  runEvacuation: (body: any) => fetchApi<any>('/evacuation/run', { method: 'POST', body: JSON.stringify(body) }),
  runEvacuationTemplate: (name: string) =>
    fetchApi<any>(`/evacuation/run/template/${name}`, { method: 'POST' }),
  compareHospital: (body: any) =>
    fetchApi<any>('/hospital/compare', { method: 'POST', body: JSON.stringify(body) }),

  // Modules
  getModules: () => fetchApi<any[]>('/modules'),
};
