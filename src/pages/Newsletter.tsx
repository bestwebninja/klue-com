import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';

function mathCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

const Newsletter = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [captcha] = useState(mathCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    if (!consent) {
      toast({ title: 'Consent required', description: 'Please tick the box to allow Kluje to send you newsletters.', variant: 'destructive' });
      return;
    }
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      toast({ title: 'Captcha incorrect', description: `${captcha.a} + ${captcha.b} = ?  Try again.`, variant: 'destructive' });
      setCaptchaInput('');
      return;
    }

    setIsLoading(true);
    const { error } = await (supabase.from('newsletter_subscribers' as any).insert({
      email: email.trim().toLowerCase(),
      name: name.trim() || null,
      consent_marketing: true,
      source: 'newsletter_page',
    } as any) as any);
    setIsLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already subscribed', description: 'This email is already on our list!' });
        setDone(true);
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return;
    }

    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Newsletter | Kluje"
        description="Subscribe to the Kluje newsletter for tips on finding trusted local tradespeople, home improvement guides, and platform updates."
      />
      <Navbar />

      <main className="container mx-auto px-4 py-16 max-w-lg">
        {done ? (
          <div className="text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">You're subscribed!</h1>
            <p className="text-muted-foreground">
              Thanks for joining the Kluje newsletter. We'll be in touch with updates, tips, and exclusive offers.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Back to Kluje
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold">Stay in the loop</h1>
              <p className="text-muted-foreground leading-relaxed">
                Get the latest from Kluje — home improvement tips, new features, and curated deals from trusted tradespeople near you.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 bg-card border rounded-xl p-6 shadow-sm">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Captcha */}
              <div className="space-y-1.5">
                <Label htmlFor="captcha">
                  Quick check: what is {captcha.a} + {captcha.b}?{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="Answer"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    className="max-w-[120px]"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setCaptchaInput(''); }}
                    title="New question"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-100">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={v => setConsent(!!v)}
                  className="mt-0.5"
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  I authorise <strong>kluje.com</strong> to send me newsletter emails including platform news, home improvement tips, and promotional offers. I understand I can unsubscribe at any time.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Subscribing…' : 'Subscribe to newsletter'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                We respect your privacy. No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Newsletter;
