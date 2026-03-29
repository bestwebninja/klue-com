import { useState } from 'react';
import { User, Mail, Phone, MapPin, Link as LinkIcon, Lock, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Import category hero images
import heroProviders from '@/assets/hero-providers.jpg';
import heroHomeServices from '@/assets/hero-home-services.jpg';
import heroCommercial from '@/assets/hero-commercial.jpg';
import heroBusiness from '@/assets/hero-business.jpg';
import heroItServices from '@/assets/hero-it-services.jpg';
import heroLegal from '@/assets/hero-legal.jpg';
import heroContractor from '@/assets/hero-contractor.jpg';

// Map provider category names to the most relevant hero image
const getCategoryHeroImage = (categoryName?: string | null): string => {
  if (!categoryName) return heroProviders;

  const c = categoryName.toLowerCase();

  if (c.includes('design') || c.includes('architect') || c.includes('interior') || c.includes('commercial') || c.includes('build')) {
    return heroCommercial;
  }
  if (c.includes('security') || c.includes('cctv') || c.includes('surveillance') || c.includes('access control') ||
      c.includes('ai') || c.includes('automation') || c.includes('software') || c.includes('it ') || c.includes('tech') ||
      c.includes('web') || c.includes('computer') || c.includes('data') || c.includes('digital')) {
    return heroItServices;
  }
  if (c.includes('contractor') || c.includes('construction') || c.includes('trade') || c.includes('electrician') ||
      c.includes('plumber') || c.includes('hvac') || c.includes('roofing') || c.includes('framing') ||
      c.includes('concrete') || c.includes('flooring') || c.includes('painter') || c.includes('carpenter')) {
    return heroContractor;
  }
  if (c.includes('legal') || c.includes('attorney') || c.includes('lawyer') || c.includes('law') ||
      c.includes('compliance') || c.includes('notary') || c.includes('mediation')) {
    return heroLegal;
  }
  if (c.includes('capital') || c.includes('finance') || c.includes('accounting') || c.includes('cpa') ||
      c.includes('tax') || c.includes('loan') || c.includes('investment') || c.includes('consulting') ||
      c.includes('business') || c.includes('payroll') || c.includes('bookkeep')) {
    return heroBusiness;
  }
  if (c.includes('home') || c.includes('renovation') || c.includes('repair') || c.includes('cleaning') ||
      c.includes('landscaping') || c.includes('handyman') || c.includes('garden') || c.includes('living') ||
      c.includes('property') || c.includes('real estate') || c.includes('agent') || c.includes('sales')) {
    return heroHomeServices;
  }

  return heroProviders;
};

interface ProfileHeroProps {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
    is_featured?: boolean;
    email?: string | null;
    phone?: string | null;
  };
  primaryLocation?: {
    address?: string | null;
    city?: string | null;
    postcode?: string | null;
  } | null;
  showContactDetails?: boolean;
  websiteUrl?: string;
  isAuthenticated?: boolean;
  primaryCategory?: string | null;
}

export const ProfileHero = ({ 
  profile, 
  primaryLocation, 
  showContactDetails = false,
  websiteUrl,
  isAuthenticated = false,
  primaryCategory
}: ProfileHeroProps) => {
  const heroBackground = getCategoryHeroImage(primaryCategory);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.slice(0, 2) + '****' + local.slice(-1);
    const domainParts = domain.split('.');
    const maskedDomain = domainParts[0].slice(0, 2) + '****' + '.' + domainParts.slice(1).join('.');
    return `${maskedLocal}@${maskedDomain}`;
  };

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    return '*** *** ' + digits.slice(-4);
  };

  return (
    <section className="relative min-h-[320px] md:min-h-[400px]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[320px] md:min-h-[400px]">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Avatar with Verified Badge */}
          <div className="relative">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-muted border-4 border-primary overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'Provider'} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <User className="w-20 h-20 text-muted-foreground" />
              )}
            </div>
            {profile.is_verified && (
              <Badge 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold"
              >
                Verified
              </Badge>
            )}
          </div>

          {/* Provider Info */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {profile.full_name || 'Service Provider'}
            </h1>

            {(profile as any)?.is_veteran && (
              <div className="flex items-center gap-1.5 bg-blue-950 text-yellow-400 border border-yellow-400/40 rounded-full px-3 py-1 text-xs font-semibold mb-3 w-fit mx-auto md:mx-0">
                <Medal className="h-3.5 w-3.5" />
                Veteran-Owned Business
              </div>
            )}

            <div className="space-y-2">
              {/* Show contact details for authenticated users */}
              {isAuthenticated && (
                <>
                  {/* Email - masked or shown based on relationship */}
                  {profile.email && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">
                        {showFullEmail ? (
                          <>
                            {profile.email}
                            <button 
                              onClick={() => setShowFullEmail(false)}
                              className="text-primary ml-1 cursor-pointer hover:underline"
                            >
                              hide
                            </button>
                          </>
                        ) : (
                          <>
                            {maskEmail(profile.email)}
                            {showContactDetails && (
                              <button 
                                onClick={() => setShowFullEmail(true)}
                                className="text-primary ml-1 cursor-pointer hover:underline"
                              >
                                view
                              </button>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Phone - masked or shown based on relationship */}
                  {profile.phone && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">
                        {showFullPhone ? (
                          <>
                            {profile.phone}
                            <button 
                              onClick={() => setShowFullPhone(false)}
                              className="text-primary ml-1 cursor-pointer hover:underline"
                            >
                              hide
                            </button>
                          </>
                        ) : (
                          <>
                            {maskPhone(profile.phone)}
                            {showContactDetails && (
                              <button 
                                onClick={() => setShowFullPhone(true)}
                                className="text-primary ml-1 cursor-pointer hover:underline"
                              >
                                view
                              </button>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Location */}
              {primaryLocation && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">
                    {showFullAddress ? (
                      <>
                        {primaryLocation.address || primaryLocation.postcode || primaryLocation.city || 'Location available'}
                        <button 
                          onClick={() => setShowFullAddress(false)}
                          className="text-primary ml-1 cursor-pointer hover:underline"
                        >
                          hide
                        </button>
                      </>
                    ) : (
                      <>
                        {primaryLocation.city || primaryLocation.postcode || 'Location available'}
                        {showContactDetails && (primaryLocation.address || primaryLocation.postcode) && (
                          <button 
                            onClick={() => setShowFullAddress(true)}
                            className="text-primary ml-1 cursor-pointer hover:underline"
                          >
                            view full address
                          </button>
                        )}
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* Website */}
              {websiteUrl && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                  <LinkIcon className="w-4 h-4" />
                  <a 
                    href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Login/Register banner at bottom of hero for unauthenticated users */}
        {!isAuthenticated && (
          <div className="mt-8 w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-medium text-white">
                    Sign in to view contact details
                  </p>
                  <p className="text-sm text-white/70">
                    Get direct access to email & phone
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/auth?redirect=/service-provider/${profile.id}`}>
                  <Button size="sm" variant="secondary" className="bg-white text-foreground hover:bg-white/90">
                    Login
                  </Button>
                </Link>
                <Link to={`/auth?signup=true&redirect=/service-provider/${profile.id}`}>
                  <Button size="sm">
                    Register Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
