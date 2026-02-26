import { useState, useRef, useEffect } from 'react';
import { LucideIcon, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  badges?: Record<string, number>;
}

export const MobileBottomNav = ({ items, activeTab, onTabChange, badges = {} }: MobileBottomNavProps) => {
  // For provider dashboard with many tabs, show first 4 + more option
  const showMoreButton = items.length > 5;
  const visibleItems = showMoreButton ? items.slice(0, 4) : items;
  const moreItems = showMoreButton ? items.slice(4) : [];
  const isMoreActive = moreItems.some(item => item.value === activeTab);
  
  // Sum up badges for items in the "More" menu
  const moreBadgeCount = moreItems.reduce((sum, item) => sum + (badges[item.value] || 0), 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border sm:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.value;
          const badgeCount = badges[item.value] || 0;
          
          return (
            <button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative min-w-[60px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-primary-foreground bg-destructive rounded-full">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate max-w-[60px]">
                {item.label}
              </span>
            </button>
          );
        })}
        
        {showMoreButton && (
          <div className="relative flex-1 h-full">
            <MoreMenu 
              items={moreItems} 
              activeTab={activeTab} 
              onTabChange={onTabChange}
              isActive={isMoreActive}
              badges={badges}
              totalBadgeCount={moreBadgeCount}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

interface MoreMenuProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  isActive: boolean;
  badges: Record<string, number>;
  totalBadgeCount: number;
}

const MoreMenu = ({ items, activeTab, onTabChange, isActive, badges, totalBadgeCount }: MoreMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeItem = items.find(item => item.value === activeTab);

  return (
    <div ref={menuRef} className="h-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors",
          isActive 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="relative">
          {activeItem ? (
            <activeItem.icon className="w-5 h-5" />
          ) : (
            <MoreHorizontal className="w-5 h-5" />
          )}
          {totalBadgeCount > 0 && !isActive && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-primary-foreground bg-destructive rounded-full">
              {totalBadgeCount > 99 ? '99+' : totalBadgeCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium truncate max-w-[60px]">
          {activeItem ? activeItem.label : 'More'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 mr-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
          {items.map((item) => {
            const Icon = item.icon;
            const itemIsActive = activeTab === item.value;
            const badgeCount = badges[item.value] || 0;
            
            return (
              <button
                key={item.value}
                onClick={() => {
                  onTabChange(item.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors",
                  itemIsActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center text-[9px] font-bold text-primary-foreground bg-destructive rounded-full">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
