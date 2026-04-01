# Command Center Architecture

The Command Center is implemented in the existing Vite React app under `src/features/command-center`, routed through `src/app/routes/commandCenterRoutes.tsx` and wrapped by `CommandCenterProvider`.

- Config-driven templates in `templates/` control KPIs, nav, quick actions, agents, integrations, pipeline views, and simulator presets.
- UI shell uses shared layout components for header/sidebar/right rail/footer.
- Supabase access is isolated in `src/integrations/supabase/command-center`.
- External vendors are abstracted by adapter interfaces with mock providers.
- AI orchestration is server-side via `supabase/functions/command-center-ai`.
