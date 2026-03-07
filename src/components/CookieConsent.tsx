import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CONSENT_KEY = 'cookie-consent';

export type ConsentStatus = 'accepted' | 'declined' | null;

export const getCookieConsent = (): ConsentStatus => {
  return localStorage.getItem(CONSENT_KEY) as ConsentStatus;
};

export const resetCookieConsent = () => {
  localStorage.removeItem(CONSENT_KEY);
  // Reload to show the banner again
  window.location.reload();
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY) as ConsentStatus;
    
    if (consent === null) {
      // No consent recorded yet, show banner
      setShowBanner(true);
    } else if (consent === 'accepted') {
      // User previously accepted, load analytics
      loadGoogleAnalytics();
    }
    // If declined, don't load analytics and don't show banner
  }, []);

  const loadGoogleAnalytics = () => {
    // Check if already loaded
    if (document.getElementById('ga-script')) return;

    // Load gtag.js
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-6360VXHKWV';
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'G-9LP4B0LT1R');
    
    // Make gtag available globally
    (window as any).gtag = gtag;
  };

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    loadGoogleAnalytics();
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">We use cookies</p>
              <p className="text-sm text-muted-foreground">
                We use cookies and similar technologies to help personalise content, and measure ads. 
                By clicking "Accept", you agree to our use of cookies. Read our{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                for more information.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="flex-1 sm:flex-none"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 sm:flex-none"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add type declaration for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}
