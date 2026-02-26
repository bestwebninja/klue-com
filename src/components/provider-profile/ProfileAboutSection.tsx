import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileAboutSectionProps {
  bio: string | null;
}

export const ProfileAboutSection = ({ bio }: ProfileAboutSectionProps) => {
  if (!bio) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        This provider hasn't added an about section yet.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">About Us</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {bio}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
