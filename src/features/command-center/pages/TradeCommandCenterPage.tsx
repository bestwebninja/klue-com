import { useParams, useSearchParams } from 'react-router-dom';
import RemodelingCommandCenterPage from './RemodelingCommandCenterPage';

// (keep this import ONLY if template system is fixed)
import { getDashboardTemplate } from '../services/dashboardTemplateService';

// fallback layout components (if used)
import CommandCenterLayout from '../components/layout/CommandCenterLayout';

export default function TradeCommandCenterPage() {
  const { workspaceId, tradeKey } = useParams();
  const [searchParams] = useSearchParams();

  // ✅ FIX 1: default to "today"
  const section = searchParams.get('section') || 'today';

  // ✅ FIX 2: route remodeling to working page
  if (tradeKey === 'remodeling') {
    return <RemodelingCommandCenterPage />;
  }

  // ✅ FIX 3: safe template loading (prevents crash)
  let template = null;

  try {
    template = getDashboardTemplate(tradeKey || '');
  } catch (err) {
    console.error('Template load failed:', err);
  }

  // ✅ FAILSAFE (prevents white screen)
  if (!template) {
    return (
      <div className="p-6 text-sm text-red-500">
        Command Center template failed to load.
      </div>
    );
  }

  // ✅ Normal template rendering
  return (
    <CommandCenterLayout template={template} section={section} />
  );
}