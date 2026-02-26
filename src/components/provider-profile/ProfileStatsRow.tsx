import { ThumbsUp, Star, Wrench, FileText, MessageCircle } from 'lucide-react';

interface ProfileStatsRowProps {
  likedCount?: number;
  ratingsCount: number;
  skillAreasCount: number;
  blogCount?: number;
  answeredCount: number;
}

export const ProfileStatsRow = ({ 
  likedCount = 0, 
  ratingsCount, 
  skillAreasCount, 
  blogCount = 0, 
  answeredCount 
}: ProfileStatsRowProps) => {
  const stats = [
    { label: 'LIKED', value: likedCount, icon: ThumbsUp },
    { label: 'RATINGS', value: ratingsCount, icon: Star },
    { label: 'SKILL AREAS', value: skillAreasCount, icon: Wrench },
    { label: 'BLOG', value: blogCount, icon: FileText },
    { label: 'ANSWERED', value: answeredCount, icon: MessageCircle },
  ];

  return (
    <section className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-lg md:text-2xl font-bold text-foreground">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
