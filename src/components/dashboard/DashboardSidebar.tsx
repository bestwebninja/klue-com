import { Link } from 'react-router-dom';
import { Crown, Shield, LogOut, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSubscribed: boolean;
  isAdmin: boolean;
  userId: string;
  userName?: string;
  unreadMessages: number;
  onSignOut: () => void;
}

export function DashboardSidebar({
  items,
  activeTab,
  onTabChange,
  isSubscribed,
  isAdmin,
  userId,
  userName,
  unreadMessages,
  onSignOut,
}: DashboardSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Group items for better organization
  const mainItems = items.filter(item =>
    ['home', 'gc-command', 'quotes', 'messages'].includes(item.value)
  );
  const profileItems = items.filter(item => 
    ['profile', 'services', 'locations', 'portfolio'].includes(item.value)
  );
  const advancedItems = items.filter(item =>
    ['reviews', 'verification', 'blog', 'expert', 'subscription'].includes(item.value)
  );
  const adminItems = items.filter(item =>
    ['admin-users', 'admin-roles', 'admin-newsletter', 'admin-settings'].includes(item.value)
  );

  const renderMenuItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.value;
    const showBadge = item.value === 'messages' && unreadMessages > 0;

    return (
      <SidebarMenuItem key={item.value}>
        <SidebarMenuButton
          onClick={() => onTabChange(item.value)}
          className={cn(
            'w-full justify-start cursor-pointer transition-colors',
            isActive 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
          tooltip={isCollapsed ? item.label : undefined}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </>
          )}
          {isCollapsed && showBadge && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link to="/" className="flex items-center gap-2">
          <span className={cn(
            "font-bold text-primary transition-all",
            isCollapsed ? "text-lg" : "text-xl"
          )}>
            {isCollapsed ? 'K' : 'Kluje'}
          </span>
        </Link>
        {!isCollapsed && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground truncate">
              {userName || 'Provider'}
            </p>
            <div className="flex items-center gap-2">
              {isSubscribed && (
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Crown className="w-3 h-3" />
                  Pro
                </span>
              )}
              {isAdmin && (
                <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Profile & Services
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Advanced
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {advancedItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-red-400/70 uppercase tracking-wider">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={isCollapsed ? 'Admin Panel' : undefined}>
                <Link to="/admin" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                  <Shield className="h-4 w-4" />
                  {!isCollapsed && <span>Full Admin Panel</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={isCollapsed ? 'View Profile' : undefined}>
              <Link to={`/service-provider/${userId}`} className="text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-4 w-4" />
                {!isCollapsed && <span>View Public Profile</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={isCollapsed ? 'Settings' : undefined}>
              <Link to="/settings/notifications" className="text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onSignOut}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              tooltip={isCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
