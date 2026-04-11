import { CheckCircle2, ClipboardList, Store, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const onboardingSteps = [
  {
    title: 'Business details',
    description: 'Share your company profile, service areas, and contact information.',
    icon: ClipboardList,
  },
  {
    title: 'What you offer',
    description: 'Select whether you provide services, products, or both on Kluje.',
    icon: Wrench,
  },
  {
    title: 'Verification review',
    description: 'Our team reviews your submission and validates your partner profile.',
    icon: CheckCircle2,
  },
  {
    title: 'Launch on marketplace',
    description: 'Go live and start reaching high-intent customers through Kluje.',
    icon: Store,
  },
];

export const PartnerSignupWizard = () => {
  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Partner onboarding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Applications are currently reviewed by our partnerships team. Complete the onboarding request by emailing{' '}
          <a className="text-primary underline-offset-4 hover:underline" href="mailto:partners@kluje.com?subject=Partner%20Onboarding%20Request">
            partners@kluje.com
          </a>{' '}
          and include your business name, website, and what you would like to offer.
        </p>

        <ol className="grid gap-3 sm:grid-cols-2">
          {onboardingSteps.map(({ title, description, icon: Icon }, index) => (
            <li key={title} className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary" aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Step {index + 1}</p>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
