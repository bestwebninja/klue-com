import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import RemodelingCommandCenterPage from './RemodelingCommandCenterPage';
import { dashboardTemplateService } from '../services/dashboardTemplateService';
import { CommandCenterLayout } from '../components/layout/CommandCenterLayout';
import { KPIInsightCard } from '../components/cards/KPIInsightCard';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { AgentPanel } from '../components/agents/AgentPanel';
import { NeuralCommandBar } from '../components/supervisor/NeuralCommandBar';
import { SupervisorSession } from '../components/supervisor/SupervisorSession';
import { useSupervisor } from '../hooks/useSupervisor';
import type { TradeKey } from '../templates/types';

export default function TradeCommandCenterPage() {
  const { workspaceId, tradeKey } = useParams();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');

  const { messages, isThinking, sendQuery, error } = useSupervisor({
    businessUnitId: workspaceId,
    defaultPayload: { tradeKey },
  });

  if (tradeKey === 'remodeling') {
    return <RemodelingCommandCenterPage />;
  }

  if (!section) {
    const params = new URLSearchParams(searchParams);
    params.set('section', 'today');
    return <Navigate to={`?${params.toString()}`} replace />;
  }

  const template = tradeKey
    ? dashboardTemplateService.getTemplateByAudience('trade', tradeKey as TradeKey)
    : null;

  if (!template) {
    return (
      <div className="p-6 text-sm text-destructive">
        Command Center template failed to load.
      </div>
    );
  }

  const { kpis, pipelineItems, agents } = template.config;
  const lastIntent = messages.findLast((m) => m.role === 'assistant')?.data?.intent;

  return (
    <CommandCenterLayout workspaceId={workspaceId || 'default'} config={template.config}>
      {/* Neural Command OS — command bar + conversation */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/60 p-4 space-y-3">
        <NeuralCommandBar
          onSend={sendQuery}
          isThinking={isThinking}
          lastIntent={lastIntent}
          hasMessages={messages.length > 0}
        />
        <SupervisorSession
          messages={messages}
          isThinking={isThinking}
        />
        {error && (
          <p className="text-xs text-destructive pl-1">{error}</p>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KPIInsightCard key={k.key} label={k.label} value={k.value} delta={k.delta} icon={k.icon} trend={k.trend} />
        ))}
      </div>

      {pipelineItems?.length ? <PipelineBoard items={pipelineItems} /> : null}

      {agents?.length ? (
        <AgentPanel agents={agents} businessUnitId={workspaceId} />
      ) : null}
    </CommandCenterLayout>
  );
}
