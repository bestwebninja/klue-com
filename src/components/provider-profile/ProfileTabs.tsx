import { cn } from '@/lib/utils';

export type ProfileTabId = 'about' | 'skills' | 'gallery' | 'answers' | 'blogs' | 'reviews';

interface ProfileTab {
  id: ProfileTabId;
  label: string;
  count?: number;
}

interface ProfileTabsProps {
  tabs: ProfileTab[];
  activeTab: ProfileTabId;
  onTabChange: (tabId: ProfileTabId) => void;
}

export const ProfileTabs = ({ tabs, activeTab, onTabChange }: ProfileTabsProps) => {
  return (
    <section className="bg-muted border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-shrink-0 px-4 md:px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 text-xs">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
