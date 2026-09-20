export interface Project {
  id: string;
  name: string;
  description: string;
  scene_json_path: string;
  profile_id: string;
  calibration_status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateReq {
  name: string;
  description: string;
  scene_json_path: string;
  profile_id?: string;
}

export interface Template {
  name: string;
  description: string;
  filename: string;
  node_count: number;
  link_count: number;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
}
