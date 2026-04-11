-- Extend ai_agent_runs with ReAct reasoning audit fields
alter table public.ai_agent_runs
  add column if not exists reasoning_steps jsonb not null default '[]'::jsonb,
  add column if not exists model text,
  add column if not exists iteration_count integer not null default 0;

comment on column public.ai_agent_runs.reasoning_steps is
  'Ordered array of ReAct loop steps: {iteration, thought, tool_calls:[{name,args,result}], observation}';
comment on column public.ai_agent_runs.model is
  'LLM model identifier used for this run (e.g. gpt-4.1-mini)';
comment on column public.ai_agent_runs.iteration_count is
  'Number of ReAct loop iterations executed before a final answer was produced';
