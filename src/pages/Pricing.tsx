import { Check, Star, Zap, Users, MessageSquare, Award, Clock, Shield } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import heroPricing from '@/assets/hero-pricing.jpg';

const features = [
  {
    icon: MessageSquare,
    title: 'Unlimited Quote Requests',
    description: 'Contact as many potential customers as you want with no daily limits.',
  },
  {
    icon: Users,
    title: 'Direct Customer Contact',
    description: 'Get customer contact details instantly when they accept your quote request.',
  },
  {
    icon: Star,
    title: 'Build Your Reputation',
    description: 'Collect reviews and ratings to stand out from the competition.',
  },
  {
    icon: Zap,
    title: 'Priority Visibility',
    description: 'Subscribed providers appear higher in search results and listings.',
  },
  {
    icon: Award,
    title: 'Verified Badge',
    description: 'Show customers you\'re a trusted professional with verification options.',
  },
  {
    icon: Clock,
    title: 'Real-Time Notifications',
    description: 'Get instant alerts when new jobs matching your services are posted.',
  },
];

const includedFeatures = [
  'Unlimited quote requests per month',
  'Direct access to customer contact details',
  'In-app messaging with customers',
  'Profile customisation and portfolio',
  'Customer reviews and ratings',
  'Email notifications for new jobs',
  'Priority listing in search results',
  'Monthly performance insights',
];

const freeFeatures = [
  'Create and manage your profile',
  'Add your services and expertise',
  'Browse available jobs',
  'Receive job alerts',
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProvider } = useUserRole();

  const handleGetStarted = () => {
    if (user && isProvider) {
      navigate('/dashboard?tab=subscription');
    } else if (user) {
      navigate('/auth?mode=provider');
    } else {
      navigate('/auth?mode=signup&provider=true');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Plans & Pricing for Providers | Kluje" description="Affordable monthly plans for UK service providers. Access job leads, showcase your portfolio, collect reviews, and grow your client base." pageType="pricing" />
      <Navbar />
      
      <PageHero
        backgroundImage={heroPricing}
        title="Grow Your Business with Kluje"
        description="Connect with customers looking for your services. One simple plan with everything you need to succeed."
      >
        <Badge variant="secondary">
          Simple, Transparent Pricing
        </Badge>
      </PageHero>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2 border-border">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Free Account</CardTitle>
                <CardDescription>Get started and explore</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/auth?mode=signup&provider=true')}
                  >
                    Create Free Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Pro Subscription</CardTitle>
                <CardDescription>Everything you need to grow</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">$4.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Cancel anytime, no commitment
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {includedFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Button className="w-full" size="lg" onClick={handleGetStarted}>
                    Get Started Today
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 sm:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Our subscription gives you all the tools to find customers and grow your business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Risk-Free Guarantee</h3>
                  <p className="text-muted-foreground mb-4">
                    Not satisfied? Cancel anytime with no questions asked. We believe in the value we provide, 
                    and we want you to feel confident in your subscription.
                  </p>
                  <ul className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>No long-term contracts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Cancel anytime</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Secure payments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-background rounded-lg p-6">
              <h3 className="font-semibold mb-2">How does billing work?</h3>
              <p className="text-muted-foreground">
                You'll be charged $4.99 monthly from the date you subscribe. You can cancel at any time 
                and continue using the service until your billing period ends.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I try before I subscribe?</h3>
              <p className="text-muted-foreground">
                Yes! Create a free account to set up your profile, add your services, and browse available 
                jobs. When you're ready to start requesting quotes, upgrade to Pro. Learn more about{" "}
                <Link to="/how-it-works" className="text-primary font-medium hover:underline">how the platform works</Link>.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6">
              <h3 className="font-semibold mb-2">How many quote requests can I send?</h3>
              <p className="text-muted-foreground">
                With a Pro subscription, you can send unlimited quote requests. There are no daily or 
                monthly limits on how many customers you can contact.
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit and debit cards including Visa, Mastercard, and American Express. 
                All payments are processed securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of service providers already finding customers on Kluje. 
            Start connecting with homeowners today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted}>
              Get Started for £4.99/month
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/browse-providers')}>
              View Service Providers
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Are you a homeowner? <Link to="/post-job" className="text-primary font-medium hover:underline">Post a job for free</Link> and get quotes from trusted professionals. Read our{" "}
            <Link to="/blog" className="text-primary font-medium hover:underline">latest tips and guides</Link> for hiring advice.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
