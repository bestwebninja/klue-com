import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface SubRecord {
  id: string;
  user_id: string;
  user_email?: string;
  company_name: string | null;
  plan: string;
  billing_cycle: string;
  payment_path: string;
  status: string;
  shopify_checkout_ref: string | null;
  shopify_order_ref: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  active:         'bg-emerald-500 text-white',
  pending:        'bg-amber-400 text-white',
  awaiting_wire:  'bg-blue-500 text-white',
  canceled:       'bg-muted text-muted-foreground',
  past_due:       'bg-orange-500 text-white',
  failed:         'bg-red-500 text-white',
};

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter', professional: 'Professional', growth: 'Growth',
};

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Monthly', annual: 'Annual', annual_veteran: 'Annual Veteran',
};

const PATH_LABELS: Record<string, string> = {
  ach_wire: 'ACH / Wire', shopify_online: 'Shopify Online',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function exportCsv(rows: SubRecord[]) {
  const headers = [
    'ID', 'User Email', 'Company', 'Plan', 'Billing Cycle',
    'Payment Path', 'Status', 'Shopify Checkout Ref', 'Shopify Order Ref',
    'Created At', 'Updated At',
  ];
  const escape = (v: string | null | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      escape(r.id),
      escape(r.user_email ?? r.user_id),
      escape(r.company_name),
      escape(PLAN_LABELS[r.plan] ?? r.plan),
      escape(CYCLE_LABELS[r.billing_cycle] ?? r.billing_cycle),
      escape(PATH_LABELS[r.payment_path] ?? r.payment_path),
      escape(formatStatus(r.status)),
      escape(r.shopify_checkout_ref),
      escape(r.shopify_order_ref),
      escape(r.created_at),
      escape(r.updated_at),
    ].join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `janitorial-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Google Drive export is deferred.
// When implemented it should: generate the CSV server-side, upload via
// Google Drive API (service account), and return a shared Drive link.
// The file would be access-restricted to the service account's org Drive —
// it is NOT encrypted at the file level in this architecture.
// Structure is stubbed here so the feature can be added without UI changes.
function exportToDrive(_rows: SubRecord[]) {
  alert(
    'Google Drive export is not yet configured.\n\n' +
    'To enable: add a Drive API service account and a /api/export-to-drive endpoint that receives the CSV payload and uploads it.\n\n' +
    'The CSV download is available now via "Export CSV".'
  );
}

export function JanitorialSubscriptionsAdmin() {
  const [records, setRecords] = useState<SubRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPath, setFilterPath] = useState<string>('all');
  const [filterCycle, setFilterCycle] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Service role not available client-side — reads via RLS (admin must be authenticated).
      // For full admin visibility, wire this through a server function or use service role in an edge function.
      const { data, error } = await supabase
        .from('janitorial_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) { console.error(error); setLoading(false); return; }
      setRecords((data ?? []) as SubRecord[]);
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = records.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterPath !== 'all' && r.payment_path !== filterPath) return false;
    if (filterCycle !== 'all' && r.billing_cycle !== filterCycle) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (r.user_email ?? r.user_id).toLowerCase().includes(q) ||
        (r.company_name ?? '').toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([s, count]) => (
          <Badge key={s} className={STATUS_COLORS[s] ?? 'bg-muted'}>
            {formatStatus(s)}: {count}
          </Badge>
        ))}
        <Badge variant="outline">Total: {records.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by email, company, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="awaiting_wire">Awaiting Wire</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPath} onValueChange={setFilterPath}>
          <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Payment Path" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Paths</SelectItem>
            <SelectItem value="ach_wire">ACH / Wire</SelectItem>
            <SelectItem value="shopify_online">Shopify Online</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCycle} onValueChange={setFilterCycle}>
          <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Billing Cycle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cycles</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="annual_veteran">Annual Veteran</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="rounded-xl" onClick={() => exportCsv(filtered)}>
          Export CSV
        </Button>
        <Button variant="ghost" className="rounded-xl text-muted-foreground" onClick={() => exportToDrive(filtered)}>
          Google Drive ↗
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No records match the current filters.</p>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shopify Ref</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-mono max-w-[180px] truncate">
                    {r.user_email ?? r.user_id}
                  </TableCell>
                  <TableCell className="text-sm">{r.company_name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{PLAN_LABELS[r.plan] ?? r.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{CYCLE_LABELS[r.billing_cycle] ?? r.billing_cycle}</TableCell>
                  <TableCell>
                    <Badge variant={r.payment_path === 'shopify_online' ? 'default' : 'secondary'} className="text-xs whitespace-nowrap">
                      {PATH_LABELS[r.payment_path] ?? r.payment_path}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${STATUS_COLORS[r.status] ?? 'bg-muted'}`}>
                      {formatStatus(r.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {r.shopify_checkout_ref ?? r.shopify_order_ref ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Google Drive export is deferred. CSV export is available now and contains all displayed fields.
        To enable Drive: configure a server-side upload endpoint with Google Drive API service account credentials.
      </p>
    </div>
  );
}
