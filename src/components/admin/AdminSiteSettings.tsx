import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RefreshCw, UserX, Mail, Settings2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SiteSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

interface SignupAttempt {
  id: string;
  email: string;
  user_type: string | null;
  attempted_at: string;
  notified: boolean;
}

export default function AdminSiteSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({});
  const [attempts, setAttempts] = useState<SignupAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await (supabase.from('site_settings' as any).select('*') as any);
    if (data) {
      const map: Record<string, SiteSetting> = {};
      for (const row of data as any[]) map[row.key] = row as SiteSetting;
      setSettings(map);
      const ne = map['signup_notification_email'];
      if (ne) setNotifyEmail(String(ne.value).replace(/"/g, ''));
    }
    setLoading(false);
  };

  const fetchAttempts = async () => {
    const { data } = await (supabase
      .from('signup_attempts' as any)
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(50) as any);
    if (data) setAttempts(data as SignupAttempt[]);
  };

  useEffect(() => {
    fetchSettings();
    fetchAttempts();
  }, []);

  const toggleSetting = async (key: string, current: boolean) => {
    setSaving(key);
    const { error } = await (supabase
      .from('site_settings' as any)
      .update({ value: (!current) as unknown as never, updated_at: new Date().toISOString() } as any)
      .eq('key', key) as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${key} updated.` });
      fetchSettings();
    }
    setSaving(null);
  };

  const saveNotifyEmail = async () => {
    setSaving('email');
    const { error } = await (supabase
      .from('site_settings' as any)
      .update({ value: `"${notifyEmail}"` as unknown as never, updated_at: new Date().toISOString() } as any)
      .eq('key', 'signup_notification_email') as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Notification email updated.' });
    }
    setSaving(null);
  };

  const signupsRestricted = Boolean(settings['signups_restricted']?.value);
  const maintenance = Boolean(settings['site_maintenance']?.value);

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading settings…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-orange-500" />
            Site Controls
          </CardTitle>
          <CardDescription>Toggle platform-wide settings. Changes take effect immediately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Signup restriction */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3">
              <UserX className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Restrict new signups</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Blocks new account creation. Signup attempts are logged and you're notified by email.
                </p>
              </div>
            </div>
            <Switch
              checked={signupsRestricted}
              onCheckedChange={() => toggleSetting('signups_restricted', signupsRestricted)}
              disabled={saving === 'signups_restricted'}
              className="ml-4 shrink-0"
            />
          </div>

          {/* Maintenance mode */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3">
              <Settings2 className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Maintenance mode</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Shows a maintenance notice to non-admin visitors.
                </p>
              </div>
            </div>
            <Switch
              checked={maintenance}
              onCheckedChange={() => toggleSetting('site_maintenance', maintenance)}
              disabled={saving === 'site_maintenance'}
              className="ml-4 shrink-0"
            />
          </div>

          {/* Notification email */}
          <div className="p-4 rounded-lg border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              <p className="font-medium">Signup notification email</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive an email here whenever someone tries to sign up while signups are restricted.
            </p>
            <div className="flex gap-2">
              <Input
                value={notifyEmail}
                onChange={e => setNotifyEmail(e.target.value)}
                placeholder="marcus@kluje.com"
                type="email"
                className="max-w-xs"
              />
              <Button
                onClick={saveNotifyEmail}
                disabled={saving === 'email'}
                size="sm"
              >
                {saving === 'email' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signup attempts log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Signup Attempts
              </CardTitle>
              <CardDescription>Users who tried to register while signups were restricted.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => { fetchAttempts(); }}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No signup attempts recorded.</p>
          ) : (
            <div className="divide-y">
              {attempts.map(a => (
                <div key={a.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.attempted_at), { addSuffix: true })}
                      {a.user_type && ` · ${a.user_type}`}
                    </p>
                  </div>
                  <Badge variant={a.notified ? 'secondary' : 'outline'} className="shrink-0">
                    {a.notified ? 'Notified' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
