# Data Model

Core entities: `business_units`, `business_unit_members`, `dashboard_templates`, `dashboard_instances`, `trade_profiles`, jobs/quotes/alerts, agent runs, documents/entities, risk scores, benchmark snapshots, simulations, integration connections.

RLS uses `public.is_business_unit_member(uuid)` to scope row access.
