insert into public.dashboard_templates(template_key, audience, trade, version, name, config) values
('trade_plumbing_v1','trade','plumbing','v1','Plumbing Command Center','{"kpis":["emergency_ratio","avg_ticket","material_cost_variance","leak_roi"],"pipelineViews":["board","calendar","map"]}'),
('trade_electrical_v1','trade','electrical','v1','Electrical Command Center','{"kpis":["panel_upgrade_close_rate","ev_solar_opportunity_score","nec_compliance_score"],"pipelineViews":["board","map"]}'),
('trade_hvac_v1','trade','hvac','v1','HVAC Command Center','{"kpis":["throughput"],"pipelineViews":["board"]}'),
('trade_roofing_v1','trade','roofing','v1','Roofing Command Center','{"kpis":["throughput"],"pipelineViews":["board"]}'),
('trade_remodeling_v1','trade','remodeling','v1','Remodeling Command Center','{"kpis":["throughput"],"pipelineViews":["board"]}'),
('trade_finishing_v1','trade','finishing','v1','Finishing Command Center','{"kpis":["throughput"],"pipelineViews":["board"]}'),
('trade_landscaping_v1','trade','landscaping','v1','Landscaping Command Center','{"kpis":["throughput"],"pipelineViews":["board"]}'),
('trade_windows_doors_v1','trade','windows_doors','v1','Windows & Doors Command Center','{"kpis":["throughput"],"pipelineViews":["board","map"]}'),
('finance_lender_v1','finance',null,'v1','Finance Lender Command Center','{"kpis":["portfolio_risk_score","draw_approval_time","default_probability"],"pipelineViews":["board","calendar"]}'),
('title_ops_v1','title',null,'v1','Title Ops Command Center','{"kpis":["days_to_close","document_error_rate","nps"],"pipelineViews":["board","calendar"]}')
on conflict (template_key) do update set config = excluded.config, updated_at = now();

insert into public.ai_agents(agent_key,name,metadata) values
('leak_hunter','Leak Hunter','{"domain":"trade"}'),('code_guardian','Code Guardian','{"domain":"trade"}'),('rebate_maximizer','Rebate Maximizer','{"domain":"trade"}'),('storm_scout','Storm Scout','{"domain":"trade"}'),('draw_guardian','Draw Guardian','{"domain":"finance"}'),('document_whisperer','Document Whisperer','{"domain":"title"}'),('escrow_automator','Escrow Automator','{"domain":"title"}')
on conflict (agent_key) do nothing;
