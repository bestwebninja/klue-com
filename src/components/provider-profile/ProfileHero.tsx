import { useState } from 'react';
import { User, Mail, Phone, MapPin, Link as LinkIcon, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Import all category hero images
import heroProviders from '@/assets/hero-providers.jpg';
import heroHomeServices from '@/assets/hero-home-services.jpg';
import heroCommercial from '@/assets/hero-commercial.jpg';
import heroEvents from '@/assets/hero-events.jpg';
import heroHealthFitness from '@/assets/hero-health-fitness.jpg';
import heroAgriculture from '@/assets/hero-agriculture.jpg';
import heroPets from '@/assets/hero-pets.jpg';
import heroBusiness from '@/assets/hero-business.jpg';
import heroItServices from '@/assets/hero-it-services.jpg';
import heroLegal from '@/assets/hero-legal.jpg';
import heroLessons from '@/assets/hero-lessons.jpg';

// Map category names to hero images
const getCategoryHeroImage = (categoryName?: string | null): string => {
  if (!categoryName) return heroProviders;
  
  const lowerCategory = categoryName.toLowerCase();
  
  if (lowerCategory.includes('home') || lowerCategory.includes('diy') || lowerCategory.includes('renovation') || 
      lowerCategory.includes('handyman') || lowerCategory.includes('electrician') || lowerCategory.includes('plumber') ||
      lowerCategory.includes('carpenter') || lowerCategory.includes('painter') || lowerCategory.includes('roofing') ||
      lowerCategory.includes('flooring') || lowerCategory.includes('heating') || lowerCategory.includes('builder') ||
      lowerCategory.includes('garden') || lowerCategory.includes('landscaping') || lowerCategory.includes('tiling')) {
    return heroHomeServices;
  }
  
  if (lowerCategory.includes('commercial') || lowerCategory.includes('shopfitting') || lowerCategory.includes('maintenance')) {
    return heroCommercial;
  }
  
  if (lowerCategory.includes('event') || lowerCategory.includes('catering') || lowerCategory.includes('wedding') ||
      lowerCategory.includes('dj') || lowerCategory.includes('photography') || lowerCategory.includes('florist') ||
      lowerCategory.includes('bartend') || lowerCategory.includes('chef')) {
    return heroEvents;
  }
  
  if (lowerCategory.includes('health') || lowerCategory.includes('fitness') || lowerCategory.includes('personal trainer') ||
      lowerCategory.includes('massage') || lowerCategory.includes('physio') || lowerCategory.includes('yoga') ||
      lowerCategory.includes('beauty') || lowerCategory.includes('salon') || lowerCategory.includes('wellness')) {
    return heroHealthFitness;
  }
  
  if (lowerCategory.includes('agriculture') || lowerCategory.includes('moving') || lowerCategory.includes('transport') ||
      lowerCategory.includes('courier') || lowerCategory.includes('car') || lowerCategory.includes('van')) {
    return heroAgriculture;
  }
  
  if (lowerCategory.includes('pet') || lowerCategory.includes('dog') || lowerCategory.includes('cat') ||
      lowerCategory.includes('animal') || lowerCategory.includes('grooming')) {
    return heroPets;
  }
  
  if (lowerCategory.includes('business') || lowerCategory.includes('accounting') || lowerCategory.includes('consulting') ||
      lowerCategory.includes('tax') || lowerCategory.includes('payroll') || lowerCategory.includes('resume')) {
    return heroBusiness;
  }
  
  if (lowerCategory.includes('it') || lowerCategory.includes('web') || lowerCategory.includes('software') ||
      lowerCategory.includes('computer') || lowerCategory.includes('seo') || lowerCategory.includes('marketing') ||
      lowerCategory.includes('graphic') || lowerCategory.includes('design') || lowerCategory.includes('development')) {
    return heroItServices;
  }
  
  if (lowerCategory.includes('legal') || lowerCategory.includes('attorney') || lowerCategory.includes('lawyer') ||
      lowerCategory.includes('law') || lowerCategory.includes('notary') || lowerCategory.includes('mediation')) {
    return heroLegal;
  }
  
  if (lowerCategory.includes('lesson') || lowerCategory.includes('tutor') || lowerCategory.includes('teaching') ||
      lowerCategory.includes('language') || lowerCategory.includes('academic') || lowerCategory.includes('sporting')) {
    return heroLessons;
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
