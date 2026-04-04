import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Shield, LogOut, Settings, Home as HomeIcon, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { MessageBadge } from '@/components/MessageBadge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  isSubscribed: boolean;
  isAdmin: boolean;
  onSignOut: () => void;
  showContractorIdentity?: boolean;
}

export function DashboardHeader({
  userName,
  userEmail,
  isSubscribed,
  isAdmin,
  onSignOut,
  showContractorIdentity = false,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const [contractorType, setContractorType] = useState('');
  const [serviceNames, setServiceNames] = useState<string[]>([]);

  useEffect(() => {
    if (!showContractorIdentity || !user) return;

    const ct = user.user_metadata?.contractor_type;
    if (ct) setContractorType(ct);

    const fetchServices = async () => {
      const { data } = await supabase
        .from('provider_services')
        .select('category_id, custom_name, service_categories:category_id(name)')
        .eq('provider_id', user.id);

      if (data) {
        const names = data
          .map((s: any) => s.service_categories?.name || s.custom_name || '')
          .filter(Boolean);
        setServiceNames(names);
      }
    };

    fetchServices();
  }, [showContractorIdentity, user]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-primary/20 backdrop-blur-sm ${
        showContractorIdentity
          ? 'bg-gradient-to-r from-[#0a2344]/95 via-[#0d294f]/95 to-[#0a2344]/95'
          : 'bg-[hsl(222,47%,11%)]/95'
      }`}
    >
      <div className={`px-4 ${showContractorIdentity ? 'py-2' : 'py-1'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle - desktop only */}
            <SidebarTrigger className="hidden sm:flex text-white/80 hover:text-white hover:bg-white/10" />
            
            {/* Mobile: Show logo */}
            <a href="/" className="sm:hidden text-xl font-bold text-primary">Kluje</a>
            
            {/* Desktop: Show page title */}
            <span className="hidden sm:inline text-white font-semibold leading-none text-sm">Provider Dashboard</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3">
            <NotificationBell className="text-white hover:text-white/80 hover:bg-white/10" />
            <MessageBadge className="text-white hover:text-white/80 hover:bg-white/10" />
            {isAdmin && (
              <Link to="/admin" className="hidden sm:block">
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10">
                  <Shield className="w-4 h-4 sm:mr-2" />
                  <span className="hidden md:inline">AD-Dashboard</span>
                </Button>
              </Link>
            )}
            {isSubscribed && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" />
                <span className="hidden sm:inline">Pro</span>
              </span>
            )}
            <Link to="/settings/notifications" className="hidden sm:block">
              <Button variant="ghost" size="icon" title="Notification Settings" className="text-white/70 hover:text-white hover:bg-white/10">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={onSignOut} className="text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showContractorIdentity && (
          <div className="mt-2 rounded-xl border border-primary/25 bg-slate-950/55 px-3 py-2 sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
                  <HomeIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-sm font-semibold text-white">Contractors — kluje.com</div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-200/90 min-w-0">
                {contractorType && (
                  <Badge variant={contractorType === 'general' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                    {contractorType === 'general' ? 'General Contractor' : 'Sub Contractor'}
                  </Badge>
                )}
                <span className="truncate">
                    {contractorType === 'general' ? 'General' : contractorType === 'sub' ? 'Sub' : 'Contractor'} Contractor AI Agent · kluje.com
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-300/20 bg-blue-400/10 text-blue-100 px-2 py-1">
                  <Radio className="w-3.5 h-3.5" />
                  AI monitoring active
                </span>
              </div>
            </div>
            {serviceNames.length > 0 && (
              <div className="mt-1 text-[10px] text-slate-300/65 truncate">
                Services: {serviceNames.slice(0, 3).join(', ')}{serviceNames.length > 3 ? ` +${serviceNames.length - 3} more` : ''}
              </div>
            )}
          </div>
        )}

        {/* Mobile-only: User info row */}
        <div className="flex items-center justify-between mt-2 sm:hidden">
          <span className="text-sm text-white/70 truncate max-w-[200px]">
            {userName || userEmail}
          </span>
          <div className="flex items-center gap-2">
            {isSubscribed && (
              <span className="flex items-center gap-1 text-xs text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" />
                Pro
              </span>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10 h-7 px-2 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  AD-Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
