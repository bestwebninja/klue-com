import { useParams, useSearchParams } from 'react-router-dom';
import RemodelingCommandCenterPage from './RemodelingCommandCenterPage';
import { dashboardTemplateService } from '../services/dashboardTemplateService';
import { CommandCenterLayout } from '../components/layout/CommandCenterLayout';

export default function TradeCommandCenterPage() {
  const { workspaceId, tradeKey } = useParams();
  const [searchParams] = useSearchParams();

  const section = searchParams.get('section') || 'today';

  if (tradeKey === 'remodeling') {
    return <RemodelingCommandCenterPage />;
  }

  const template = dashboardTemplateService.getTemplateByKey(tradeKey || '');

  if (!template) {
    return (
      <div className="p-6 text-sm text-destructive">
        Command Center template failed to load.
      </div>
    );
  }

  return (
    <CommandCenterLayout workspaceId={workspaceId || 'default'} config={template.config}>
      <div className="text-sm text-muted-foreground">
        Section: {section}
      </div>
    </CommandCenterLayout>
  );
}
