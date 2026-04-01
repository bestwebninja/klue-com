create or replace view public.command_center_dashboard_overview as
select di.id as dashboard_instance_id, di.business_unit_id, di.template_key, di.audience, di.trade,
  (select count(*) from public.command_center_alerts a where a.business_unit_id = di.business_unit_id and a.severity = 'high') as high_alert_count,
  (select count(*) from public.ai_agent_runs r where r.business_unit_id = di.business_unit_id and r.status = 'failed') as failed_agent_runs
from public.dashboard_instances di;
