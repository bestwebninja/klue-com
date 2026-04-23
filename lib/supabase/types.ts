export type UUID = string;

export interface Walkthrough {
  id: UUID;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WalkthroughFloor {
  id: UUID;
  walkthrough_id: UUID;
  floor_name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WalkthroughArea {
  id: UUID;
  floor_id: UUID;
  area_name: string;
  sq_ft: number;
  scope_value: number;
  priority_value: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WalkthroughTask {
  id: UUID;
  walkthrough_id: UUID;
  task_name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WalkthroughAreaTaskStatus {
  id: UUID;
  area_id: UUID;
  task_id: UUID;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalkthroughSettings {
  id: UUID;
  walkthrough_id: UUID;
  labor_rate: number;
  sq_ft_per_staff_unit: number;
  cleaning_rate_per_hour: number;
  scope_multipliers: Record<string, number>;
  priority_multipliers: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface WalkthroughWithChildren extends Walkthrough {
  floors: WalkthroughFloor[];
  areas: WalkthroughArea[];
  tasks: WalkthroughTask[];
  areaTaskStatus: WalkthroughAreaTaskStatus[];
  settings: WalkthroughSettings | null;
}

export interface AreaUpdateInput {
  area_name?: string;
  sq_ft?: number;
  scope_value?: number;
  priority_value?: number;
  sort_order?: number;
}

export interface LaborSettingsUpdateInput {
  labor_rate?: number;
  sq_ft_per_staff_unit?: number;
  cleaning_rate_per_hour?: number;
  scope_multipliers?: Record<string, number>;
  priority_multipliers?: Record<string, number>;
}
