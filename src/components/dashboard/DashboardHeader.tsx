import { Link } from 'react-router-dom';
import { Crown, Shield, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { MessageBadge } from '@/components/MessageBadge';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  isSubscribed: boolean;
  isAdmin: boolean;
  onSignOut: () => void;
}

export function DashboardHeader({
  userName,
  userEmail,
  isSubscribed,
  isAdmin,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <header className="bg-[hsl(222,47%,11%)]/95 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/20">
      <div className="px-4 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle - desktop only */}
            <SidebarTrigger className="hidden sm:flex text-white/80 hover:text-white hover:bg-white/10" />
            
            {/* Mobile: Show logo */}
            <a href="/" className="sm:hidden text-xl font-bold text-primary">Kluje</a>
            
            {/* Desktop: Show page title */}
            <span className="hidden sm:inline text-white font-semibold leading-none text-sm">Provider Dashboard</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3">
            <NotificationBell />
            <MessageBadge />
            {isAdmin && (
              <Link to="/admin" className="hidden sm:block">
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10">
                  <Shield className="w-4 h-4 sm:mr-2" />
                  <span className="hidden md:inline">Admin</span>
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
              <Button variant="ghost" size="icon" title="Notification Settings" className="text-black hover:text-black hover:bg-black/10">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={onSignOut} className="text-black hover:text-black hover:bg-black/10">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile-only: User info row */}
        <div className="flex items-center justify-between mt-2 sm:hidden">
          <span className="text-sm text-black/70 truncate max-w-[200px]">
            {userName || userEmail}
          </span>
          <div className="flex items-center gap-2">
            {isSubscribed && (
              <span className="flex items-center gap-1 text-xs text-black bg-black/10 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" />
                Pro
              </span>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10 h-7 px-2 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
