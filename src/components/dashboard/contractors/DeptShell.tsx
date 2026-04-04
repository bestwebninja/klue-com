import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus,
  CloudLightning, Lightbulb, Smartphone,
} from 'lucide-react';

export interface KpiItem {
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface AiTip {
  text: string;
  action?: string;
}

interface DeptShellProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  kpis: KpiItem[];
  aiTips?: AiTip[];
  weatherWarning?: string;
  onBack: () => void;
  children: ReactNode;
}

export function DeptShell({
  title,
  icon: Icon,
  kpis,
  aiTips,
  weatherWarning,
  onBack,
  children,
}: DeptShellProps) {
  return (
    <div className="space-y-4">
      {/* Department Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-tight">{title}</h2>
            <p className="text-[10px] text-muted-foreground">Contractors AI · Internal Department</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/40">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
          AI monitoring active
        </div>
      </div>

      {/* Weather Risk Alert */}
      {weatherWarning && (
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3.5 py-2.5">
          <CloudLightning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-400">Weather Risk — Timeline Review Recommended</div>
            <div className="text-[11px] text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">{weatherWarning}</div>
          </div>
        </div>
      )}

      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-none border-border/60">
            <CardContent className="p-3.5">
              <div className="text-[11px] text-muted-foreground mb-1 leading-tight">{kpi.label}</div>
              <div className="text-[22px] font-semibold text-foreground leading-none">{kpi.value}</div>
              <div
                className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                  kpi.trend === 'up'
                    ? 'text-emerald-600'
                    : kpi.trend === 'down'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {kpi.trend === 'neutral' && <Minus className="w-3 h-3" />}
                {kpi.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Content */}
      {children}

      {/* AI Insights Panel */}
      {aiTips && aiTips.length > 0 && (
        <Card className="shadow-none border-orange-200/60 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                AI Insights &amp; Recommendations
              </span>
            </div>
            <ul className="space-y-2">
              {aiTips.map((tip, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0 mt-0.5 text-xs">→</span>
                    <span className="text-[12px] text-muted-foreground leading-relaxed">{tip.text}</span>
                  </div>
                  {tip.action && (
                    <button className="shrink-0 text-[11px] text-orange-500 hover:text-orange-600 font-semibold whitespace-nowrap">
                      {tip.action} ↗
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Finance Ad Strip */}
      <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 text-orange-600 font-bold text-sm">
          $
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-foreground">Kluje Finance · Preferred Lender Network</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Operating capital from 6.9% APR · Bridge loans · Fix &amp; flip financing ·{' '}
            <span className="text-orange-500 cursor-pointer font-medium">Explore offers →</span>
          </div>
        </div>
        <div className="shrink-0 text-[10px] text-muted-foreground border border-border/40 px-1.5 py-0.5 rounded">
          Sponsored
        </div>
      </div>

      {/* Mobile App Banner */}
      <div className="rounded-lg border border-orange-200/40 bg-orange-50/20 dark:bg-orange-950/10 px-4 py-3 flex items-center gap-3">
        <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
        <p className="flex-1 text-[11px] text-muted-foreground">
          Manage <span className="font-medium text-foreground">{title}</span> on the go —{' '}
          <span className="font-medium text-foreground">Kluje app</span> available soon.
        </p>
        <div className="flex gap-1.5 shrink-0">
          <button className="text-[10px] px-2.5 py-1 rounded-md bg-foreground text-background font-medium hover:opacity-80 transition-opacity">
            App Store
          </button>
          <button className="text-[10px] px-2.5 py-1 rounded-md bg-foreground text-background font-medium hover:opacity-80 transition-opacity">
            Google Play
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared form primitives ─── */

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

export function Field({
  label,
  required,
  error,
  children,
  hint,
  fullWidth,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`space-y-1.5${fullWidth ? ' md:col-span-2' : ''}`}>
      <label className="text-xs font-medium text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-orange-500">*</span>}
      </label>
      <div className={error ? 'ring-2 ring-yellow-400 rounded-md' : ''}>{children}</div>
      {error && (
        <p className="text-[11px] text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
          ⚠ {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function SelectField({
  placeholder,
  options,
  value,
  onChange,
  className,
}: {
  placeholder?: string;
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full h-9 text-sm border border-input bg-background rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground ${className ?? ''}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function SimpleBarChart({
  data,
  colorClass,
}: {
  data: { label: string; value: string; pct: number }[];
  colorClass?: string;
}) {
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorClass ?? 'bg-orange-400'}`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <Card className="shadow-none border-amber-300/25 bg-[#0b2748]/95 text-slate-100">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-[13px] font-semibold text-slate-100">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="text-[11px] text-orange-500 hover:text-orange-600 font-medium"
          >
            {action.label} ↗
          </button>
        )}
      </div>
      <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>
    </Card>
  );
}

export function StatusBadge({ status, color }: { status: string; color: 'green' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const map = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    red:   'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    blue:  'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    gray:  'bg-muted text-muted-foreground',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${map[color]}`}>{status}</span>
  );
}

export function OcrBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-blue-300/40 bg-slate-900/90 px-3.5 py-2.5 text-[11px] text-slate-200">
      <span className="text-sky-300 font-bold shrink-0 mt-0.5">OCR</span>
      <span className="leading-relaxed">
        <span className="font-semibold text-slate-100">AI Document Scan active.</span>{' '}
        Uploads are checked for signature authenticity, duplicate submissions, spelling anomalies, and data format integrity. Suspicious documents trigger a review prompt with highlighted fields.
      </span>
    </div>
  );
}
