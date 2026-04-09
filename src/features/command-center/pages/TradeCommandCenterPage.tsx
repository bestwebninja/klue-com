import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import RemodelingCommandCenterPage from './RemodelingCommandCenterPage';
import { dashboardTemplateService } from '../services/dashboardTemplateService';
import { CommandCenterLayout } from '../components/layout/CommandCenterLayout';
import { KPIInsightCard } from '../components/cards/KPIInsightCard';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { AgentPanel } from '../components/agents/AgentPanel';
import type { TradeKey } from '../templates/types';

export default function TradeCommandCenterPage() {
  const { workspaceId, tradeKey } = useParams();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');

  if (tradeKey === 'remodeling') {
    return <RemodelingCommandCenterPage />;
  }

  if (!section) {
    const params = new URLSearchParams(searchParams);
    params.set('section', 'today');
    return <Navigate to={`?${params.toString()}`} replace />;
  }

  const template = dashboardTemplateService.getTemplateByAudience('trade', tradeKey as TradeKey);

  if (!template) {
    return (
      <div className="p-6 text-sm text-destructive">
        Command Center template failed to load.
      </div>
    );
  }

  const { kpis, pipelineItems, agents } = template.config;

  return (
    <CommandCenterLayout workspaceId={workspaceId || 'default'} config={template.config}>
      <h1 className="text-2xl font-semibold">{template.name}</h1>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KPIInsightCard key={k.key} label={k.label} value={k.value} delta={k.delta} icon={k.icon} trend={k.trend} />
        ))}
      </div>

      {pipelineItems?.length ? <PipelineBoard items={pipelineItems} /> : null}

      {agents?.length ? <AgentPanel agents={agents} /> : null}
    </CommandCenterLayout>
  );
}
