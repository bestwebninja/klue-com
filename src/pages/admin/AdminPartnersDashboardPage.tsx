import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  useLinkedContractors,
  usePartnerActionMutation,
  usePartnerDetail,
  usePartnerList,
  type PartnerFilters,
} from '@/features/partners-admin/usePartnersAdmin';
import type { PartnerRecord } from '@/features/partners-admin/types';

const statusBadge = (value?: string | null) => <Badge variant="outline">{value || 'unknown'}</Badge>;

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

export default function AdminPartnersDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PartnerFilters>({
    preferredRequested: 'all',
    linkedContractors: 'all',
    expiringDocs: 'all',
  });
  const [note, setNote] = useState('');

  const partnersQuery = usePartnerList(filters);
  const detailQuery = usePartnerDetail(selectedPartnerId);
  const linkedQuery = useLinkedContractors(selectedPartnerId);
  const actionMutation = usePartnerActionMutation();

  const rows = useMemo(() => {
    const list = partnersQuery.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (row) =>
        row.partner_id.toLowerCase().includes(q) ||
        row.legal_business_name.toLowerCase().includes(q) ||
        row.email?.toLowerCase().includes(q) ||
        row.contact_name?.toLowerCase().includes(q)
    );
  }, [partnersQuery.data, search]);

  const runAction = async (action: Parameters<typeof actionMutation.mutateAsync>[0]['action'], payload?: Record<string, unknown>) => {
    if (!selectedPartnerId) return;
    try {
      await actionMutation.mutateAsync({ action, partnerId: selectedPartnerId, payload });
      toast({ title: 'Partner updated', description: `Action ${action} completed.` });
      if (action === 'save_internal_note') {
        setNote('');
      }
    } catch (error) {
      toast({ title: 'Action failed', description: (error as Error).message, variant: 'destructive' });
    }
  };

  if (authLoading || adminLoading) {
    return <div className="p-8">Loading partner dashboard…</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Partners Dashboard (Admin)</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div>
            <Label>Search</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Partner ID, business, email..." />
          </div>
          <div>
            <Label>Partner Type</Label>
            <Input value={filters.partnerType ?? ''} onChange={(e) => setFilters((f) => ({ ...f, partnerType: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={filters.state ?? ''} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={filters.city ?? ''} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>ZIP</Label>
            <Input value={filters.zip ?? ''} onChange={(e) => setFilters((f) => ({ ...f, zip: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={filters.category ?? ''} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>Verification Tier</Label>
            <Input value={filters.verificationTier ?? ''} onChange={(e) => setFilters((f) => ({ ...f, verificationTier: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>Compliance Status</Label>
            <Input value={filters.complianceStatus ?? ''} onChange={(e) => setFilters((f) => ({ ...f, complianceStatus: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>Feed Type</Label>
            <Input value={filters.feedType ?? ''} onChange={(e) => setFilters((f) => ({ ...f, feedType: e.target.value || undefined }))} />
          </div>
          <div>
            <Label>Risk Score (min)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={typeof filters.minRiskScore === 'number' ? filters.minRiskScore : ''}
              onChange={(e) => {
                const value = e.target.value;
                setFilters((f) => ({ ...f, minRiskScore: value ? Number(value) : undefined }));
              }}
            />
          </div>
          <div>
            <Label>Preferred Requested</Label>
            <Select value={filters.preferredRequested ?? 'all'} onValueChange={(value: 'all' | 'yes' | 'no') => setFilters((f) => ({ ...f, preferredRequested: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expiring Docs (30d)</Label>
            <Select value={filters.expiringDocs ?? 'all'} onValueChange={(value: 'all' | 'yes' | 'no') => setFilters((f) => ({ ...f, expiringDocs: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Linked Contractors</Label>
            <Select value={filters.linkedContractors ?? 'all'} onValueChange={(value: 'all' | 'yes' | 'no') => setFilters((f) => ({ ...f, linkedContractors: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partners List</CardTitle>
        </CardHeader>
        <CardContent>
          {partnersQuery.isLoading && <p>Loading partners…</p>}
          {partnersQuery.isError && <p className="text-destructive">Failed to load partners.</p>}
          {!partnersQuery.isLoading && rows.length === 0 && <p>No partners found for current filters.</p>}
          {rows.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    {['partner_id','partner_type','legal_business_name','dba_name','contact_name','email','phone','primary_territory','categories','verification_tier','compliance_status','feed_status','preferred_territory_status','created_at','updated_at','risk_score','linked_contractors_count','status'].map((col) => (
                      <th key={col} className="p-2 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: PartnerRecord) => (
                    <tr key={row.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedPartnerId(row.id)}>
                      <td className="p-2">{row.partner_id}</td>
                      <td className="p-2">{row.partner_type}</td>
                      <td className="p-2">{row.legal_business_name}</td>
                      <td className="p-2">{row.dba_name || '—'}</td>
                      <td className="p-2">{row.contact_name || '—'}</td>
                      <td className="p-2">{row.email || '—'}</td>
                      <td className="p-2">{row.phone || '—'}</td>
                      <td className="p-2">{row.primary_territory || '—'}</td>
                      <td className="p-2">{row.partner_categories?.map((c) => c.category).join(', ') || '—'}</td>
                      <td className="p-2">{statusBadge(row.verification_tier)}</td>
                      <td className="p-2">{statusBadge(row.compliance_status)}</td>
                      <td className="p-2">{statusBadge(row.feed_status)}</td>
                      <td className="p-2">{statusBadge(row.preferred_territory_status)}</td>
                      <td className="p-2">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="p-2">{new Date(row.updated_at).toLocaleDateString()}</td>
                      <td className="p-2">{row.risk_score}</td>
                      <td className="p-2">{row.contractor_partner_links?.length ?? 0}</td>
                      <td className="p-2">{statusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPartnerId && (
        <Card>
          <CardHeader>
            <CardTitle>Partner Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {detailQuery.isLoading && <p>Loading detail…</p>}
            {detailQuery.isError && <p className="text-destructive">Unable to load detail view.</p>}
            {detailQuery.data && (
              <Tabs defaultValue="identity" className="space-y-4">
                <TabsList className="flex flex-wrap h-auto">
                  {['identity','compliance','territory','offerings','feed/systems','commercial','linked entities','audit log','internal notes'].map((tab) => (
                    <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="identity" className="grid md:grid-cols-2 gap-3 text-sm">
                  <p><strong>Partner ID:</strong> {detailQuery.data.partner_id}</p>
                  <p><strong>Type:</strong> {detailQuery.data.partner_type}</p>
                  <p><strong>Legal Name:</strong> {detailQuery.data.legal_business_name}</p>
                  <p><strong>DBA:</strong> {detailQuery.data.dba_name || '—'}</p>
                  <p><strong>Contact:</strong> {detailQuery.data.contact_name}</p>
                  <p><strong>Email:</strong> {detailQuery.data.email}</p>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-2 text-sm">
                  <p>Identity verified: {statusBadge(detailQuery.data.partner_verifications?.[0]?.identity_verified ? 'yes' : 'no')}</p>
                  <p>Business verified: {statusBadge(detailQuery.data.partner_verifications?.[0]?.business_verified ? 'yes' : 'no')}</p>
                  <p>License verified: {statusBadge(detailQuery.data.partner_verifications?.[0]?.license_verified ? 'yes' : 'no')}</p>
                  <p>Insurance verified: {statusBadge(detailQuery.data.partner_verifications?.[0]?.insurance_verified ? 'yes' : 'no')}</p>
                  <p>Territory reviewed: {statusBadge(detailQuery.data.preferred_territory_status)}</p>
                  <p>Feed approved: {statusBadge(detailQuery.data.feed_status)}</p>
                  <p>Preferred status: {statusBadge(detailQuery.data.preferred_requested ? 'under review' : 'not requested')}</p>
                  <p>Missing docs: {detailQuery.data.partner_documents?.length ? 'No' : 'Yes'}</p>
                  <p>Expiry warnings: {(detailQuery.data.partner_documents ?? []).some((d: { expires_at?: string | null }) => d.expires_at && new Date(d.expires_at).getTime() < Date.now() + THIRTY_DAYS_MS) ? 'Yes' : 'No'}</p>
                  <p>Risk score: {detailQuery.data.risk_score}</p>
                </TabsContent>

                <TabsContent value="territory" className="text-sm space-y-2">
                  {(detailQuery.data.partner_territories ?? []).map((t: { id: string; territory_label: string; territory_state?: string | null }) => (
                    <p key={t.id}>{t.territory_label} ({t.territory_state || 'N/A'})</p>
                  ))}
                </TabsContent>

                <TabsContent value="offerings" className="text-sm">
                  Categories: {(detailQuery.data.partner_categories ?? []).map((c: { category: string }) => c.category).join(', ') || '—'}
                </TabsContent>

                <TabsContent value="feed/systems" className="text-sm space-y-2">
                  <p>Feed status: {detailQuery.data.feed_status}</p>
                  {(detailQuery.data.partner_feed_connections ?? []).map((f: { id: string; feed_type: string; connection_status: string }) => <p key={f.id}>{f.feed_type}: {f.connection_status}</p>)}
                </TabsContent>

                <TabsContent value="commercial" className="text-sm">
                  Launch timeline: {detailQuery.data.launch_timeline || '—'}
                </TabsContent>

                <TabsContent value="linked entities" className="space-y-2 text-sm">
                  {linkedQuery.isLoading && <p>Loading linked contractors…</p>}
                  {(linkedQuery.data ?? []).map((c: { id: string; contractor_id: string; match_score: number; territory_match_score: number; category_match_score: number; compliance_match_score: number; profiles?: { full_name?: string | null } | null }) => (
                    <div key={c.id} className="rounded border p-2">
                      <p>{c.profiles?.full_name || c.contractor_id} — Match {c.match_score}</p>
                      <p className="text-muted-foreground text-xs">territory {c.territory_match_score} / category {c.category_match_score} / compliance {c.compliance_match_score}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="audit log" className="text-sm space-y-2">
                  {(detailQuery.data.partner_audit_log ?? []).map((log: { id: string; created_at: string; action: string }) => (
                    <p key={log.id}>{new Date(log.created_at).toLocaleString()} — {log.action}</p>
                  ))}
                </TabsContent>

                <TabsContent value="internal notes" className="text-sm space-y-3">
                  {(detailQuery.data.partner_internal_notes ?? []).map((n: { id: string; note: string }) => (
                    <p key={n.id} className="rounded border p-2">{n.note}</p>
                  ))}
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note" />
                  <Button onClick={() => runAction('save_internal_note', { note })}>Save note</Button>
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => runAction('approve_partner')}>Approve partner</Button>
              <Button size="sm" variant="destructive" onClick={() => runAction('reject_partner')}>Reject partner</Button>
              <Button size="sm" variant="secondary" onClick={() => runAction('request_more_info')}>Request more info</Button>
              <Button size="sm" variant="outline" onClick={() => runAction('approve_preferred_territory')}>Approve preferred territory</Button>
              <Button size="sm" variant="outline" onClick={() => runAction('reject_preferred_territory')}>Reject preferred territory</Button>
              <Button size="sm" variant="outline" onClick={() => runAction('update_verification_status', { verification_tier: 'tier-2' })}>Set verification tier</Button>
              <Button size="sm" variant="outline" onClick={() => runAction('update_compliance_status', { compliance_status: 'approved' })}>Set compliance</Button>
              <Button size="sm" variant="outline" onClick={() => runAction('refresh_contractor_links')}>Refresh contractor links</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
