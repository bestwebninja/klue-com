-- Walk Through operations dashboard schema

create table if not exists public.walkthroughs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.walkthrough_floors (
  id uuid primary key default gen_random_uuid(),
  walkthrough_id uuid not null references public.walkthroughs(id) on delete cascade,
  floor_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (walkthrough_id, floor_name),
  unique (walkthrough_id, sort_order)
);

create table if not exists public.walkthrough_areas (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.walkthrough_floors(id) on delete cascade,
  area_name text not null,
  sq_ft numeric(12,2) not null default 0,
  scope_value numeric(10,2) not null default 1,
  priority_value numeric(10,2) not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (floor_id, area_name),
  unique (floor_id, sort_order)
);

create table if not exists public.walkthrough_tasks (
  id uuid primary key default gen_random_uuid(),
  walkthrough_id uuid not null references public.walkthroughs(id) on delete cascade,
  task_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (walkthrough_id, task_name),
  unique (walkthrough_id, sort_order)
);

create table if not exists public.walkthrough_area_task_status (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.walkthrough_areas(id) on delete cascade,
  task_id uuid not null references public.walkthrough_tasks(id) on delete cascade,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (area_id, task_id)
);

create table if not exists public.walkthrough_settings (
  id uuid primary key default gen_random_uuid(),
  walkthrough_id uuid not null unique references public.walkthroughs(id) on delete cascade,
  labor_rate numeric(10,2) not null default 30,
  sq_ft_per_staff_unit numeric(10,2) not null default 1000,
  cleaning_rate_per_hour numeric(10,2) not null default 500,
  scope_multipliers jsonb not null default '{"1":1,"2":1.1,"3":1.25,"4":1.4,"5":1.6}'::jsonb,
  priority_multipliers jsonb not null default '{"1":1,"2":1.15,"3":1.35,"4":1.6,"5":1.9}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.walkthrough_area_metrics (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null unique references public.walkthrough_areas(id) on delete cascade,
  total_tasks integer not null default 0,
  completed_tasks integer not null default 0,
  estimated_hours numeric(10,2) not null default 0,
  estimated_cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_walkthrough_floors_walkthrough_id
  on public.walkthrough_floors(walkthrough_id);
create index if not exists idx_walkthrough_areas_floor_id
  on public.walkthrough_areas(floor_id);
create index if not exists idx_walkthrough_tasks_walkthrough_id
  on public.walkthrough_tasks(walkthrough_id);
create index if not exists idx_walkthrough_area_task_status_area_id
  on public.walkthrough_area_task_status(area_id);
create index if not exists idx_walkthrough_area_task_status_task_id
  on public.walkthrough_area_task_status(task_id);
create index if not exists idx_walkthrough_settings_walkthrough_id
  on public.walkthrough_settings(walkthrough_id);

create or replace function public.set_walkthrough_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_walkthroughs_updated_at on public.walkthroughs;
create trigger trg_walkthroughs_updated_at
before update on public.walkthroughs
for each row execute function public.set_walkthrough_updated_at();

drop trigger if exists trg_walkthrough_floors_updated_at on public.walkthrough_floors;
create trigger trg_walkthrough_floors_updated_at
before update on public.walkthrough_floors
for each row execute function public.set_walkthrough_updated_at();

drop trigger if exists trg_walkthrough_areas_updated_at on public.walkthrough_areas;
create trigger trg_walkthrough_areas_updated_at
before update on public.walkthrough_areas
for each row execute function public.set_walkthrough_updated_at();

drop trigger if exists trg_walkthrough_tasks_updated_at on public.walkthrough_tasks;
create trigger trg_walkthrough_tasks_updated_at
before update on public.walkthrough_tasks
for each row execute function public.set_walkthrough_updated_at();

drop trigger if exists trg_walkthrough_area_task_status_updated_at on public.walkthrough_area_task_status;
create trigger trg_walkthrough_area_task_status_updated_at
before update on public.walkthrough_area_task_status
for each row execute function public.set_walkthrough_updated_at();

drop trigger if exists trg_walkthrough_settings_updated_at on public.walkthrough_settings;
create trigger trg_walkthrough_settings_updated_at
before update on public.walkthrough_settings
for each row execute function public.set_walkthrough_updated_at();

drop trigger if exists trg_walkthrough_area_metrics_updated_at on public.walkthrough_area_metrics;
create trigger trg_walkthrough_area_metrics_updated_at
before update on public.walkthrough_area_metrics
for each row execute function public.set_walkthrough_updated_at();
