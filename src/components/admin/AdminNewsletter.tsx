import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Search, Download, UserCheck, UserX, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
  consent_marketing: boolean;
  source: string | null;
}

export default function AdminNewsletter() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filtered, setFiltered] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await (supabase
      .from('newsletter_subscribers' as any)
      .select('*')
      .order('subscribed_at', { ascending: false }) as any);
    if (error) {
      toast({ title: 'Error', description: (error as any).message, variant: 'destructive' });
    } else {
      setSubscribers((data ?? []) as Subscriber[]);
      setFiltered((data ?? []) as Subscriber[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? subscribers.filter(s =>
            s.email.toLowerCase().includes(q) ||
            (s.name ?? '').toLowerCase().includes(q)
          )
        : subscribers
    );
  }, [search, subscribers]);

  const toggleActive = async (sub: Subscriber) => {
    const { error } = await (supabase
      .from('newsletter_subscribers' as any)
      .update({ is_active: !sub.is_active, unsubscribed_at: sub.is_active ? new Date().toISOString() : null } as any)
      .eq('id', sub.id) as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: sub.is_active ? 'Unsubscribed' : 'Re-subscribed' });
      fetch();
    }
  };

  const exportCsv = () => {
    const active = subscribers.filter(s => s.is_active);
    const csv = [
      'Email,Name,Subscribed,Source',
      ...active.map(s =>
        `"${s.email}","${s.name ?? ''}","${s.subscribed_at}","${s.source ?? ''}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kluje-newsletter-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total subscribers', value: subscribers.length, icon: Mail, color: 'text-orange-500' },
          { label: 'Active', value: activeCount, icon: UserCheck, color: 'text-green-600' },
          { label: 'Unsubscribed', value: subscribers.length - activeCount, icon: UserX, color: 'text-red-500' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>All newsletter subscribers across Kluje.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetch}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv} disabled={activeCount === 0}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No subscribers found.</div>
          ) : (
            <div className="divide-y">
              {filtered.map(sub => (
                <div key={sub.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{sub.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.name && <span className="mr-2">{sub.name}</span>}
                      Joined {formatDistanceToNow(new Date(sub.subscribed_at), { addSuffix: true })}
                      {sub.source && <span className="ml-2 opacity-60">· {sub.source}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={sub.is_active ? 'default' : 'secondary'} className="text-xs">
                      {sub.is_active ? 'Active' : 'Unsubscribed'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(sub)}
                      className="text-xs h-7 px-2"
                    >
                      {sub.is_active ? 'Unsub' : 'Re-sub'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
