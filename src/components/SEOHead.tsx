import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  pageType?: string;
  pageContent?: string;
  category?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * SEOHead – manages <head> meta for every page on kluje.com.
 *
 * Every new page MUST include <SEOHead /> with at minimum a unique `title`
 * and `description` (140-160 chars). Private / authenticated pages should
 * pass `noIndex={true}`.
 */

const defaultSeoMap: Record<string, { title: string; description: string; keywords: string[] }> = {
  '/': {
    title: 'Find Trusted Service Providers in the US | Kluje AI Platform',
    description: 'Post a job for free and get up to 3 quotes from verified US contractors and service providers. Kluje AI risk intelligence, AI Voice, and predictive dashboard power the built economy.',
    keywords: ['trusted service providers US', 'find contractors US', 'AI platform built economy', 'post job get quotes', 'Kluje AI', 'veteran-owned contractors'],
  },
  '/browse-providers': {
    title: 'Browse Verified Service Providers Near You | Kluje',
    description: 'Search rated and verified service providers near you. Filter by trade, location, and reviews to hire the right professional for your project. Start comparing now.',
    keywords: ['browse service providers', 'find contractors US', 'verified professionals', 'local tradespeople'],
  },
  '/jobs': {
    title: 'Open Jobs & Leads for US Contractors | Kluje',
    description: 'Browse open jobs posted by US homeowners and businesses. Find leads in your trade, request to quote, and grow your contractor business on Kluje.',
    keywords: ['contractor jobs US', 'contractor leads', 'service provider jobs', 'trade work leads'],
  },
  '/post-job': {
    title: 'Post a Job Free | Get Up to 3 Quotes | Kluje',
    description: 'Describe your project in minutes and get up to 3 quotes from verified US service providers. Free to post, no obligation to hire. Start now on Kluje.',
    keywords: ['post job free', 'get quotes US', 'hire tradespeople', 'service quotes free'],
  },
  '/ask-expert': {
    title: 'Ask an Expert – Free Advice from US Pros | Kluje',
    description: 'Ask home improvement, renovation, or trade questions and get free answers from verified US professionals. Browse expert advice with no sign-up required.',
    keywords: ['ask expert', 'free trade advice', 'professional help US', 'home improvement questions'],
  },
  '/blog': {
    title: 'Home Improvement Tips & Guides | Kluje Blog',
    description: 'Expert articles on hiring tradespeople, home renovation tips, event planning, and business services from experienced US professionals. Read now on Kluje.',
    keywords: ['home improvement blog', 'contractor tips', 'hiring advice US', 'renovation guides'],
  },
  '/how-it-works': {
    title: 'How Kluje Works | Post a Job & Get Matched | Kluje',
    description: 'Post your job, receive quotes from up to 3 verified providers, compare profiles and reviews, then hire the best fit. Simple, free, and transparent.',
    keywords: ['how Kluje works', 'hire service provider', 'get quotes process', 'find contractors'],
  },
  '/pricing': {
    title: 'AI Voice Plans & Pricing for Providers | Kluje',
    description: 'Choose your Kluje AI Voice plan: Solo $49, Pro $99, Agency $199, Enterprise $399/mo. 24/7 AI receptionist, CRM, and lead management included.',
    keywords: ['Kluje pricing', 'AI Voice plans', 'contractor subscription', 'service provider membership'],
  },
  '/contact': {
    title: 'Contact Kluje | Support & Partnerships | Kluje',
    description: 'Get in touch with Kluje for support, feedback, or partnership inquiries. We help homeowners and service providers across the US. Contact us today.',
    keywords: ['contact Kluje', 'Kluje support', 'partnership inquiries'],
  },
  '/terms': {
    title: 'Terms of Service | Kluje',
    description: 'Read Kluje terms of service covering account use, job posting rules, provider obligations, and dispute resolution for all platform users.',
    keywords: ['terms of service', 'Kluje terms', 'user agreement'],
  },
  '/privacy': {
    title: 'Privacy Policy | Data Protection | Kluje',
    description: 'Learn how Kluje collects, stores, and protects your personal data. Our privacy policy covers cookies, third-party sharing, and your rights under US law.',
    keywords: ['privacy policy', 'data protection', 'Kluje privacy', 'CCPA'],
  },
  '/auth': {
    title: 'Sign In or Create Your Account | Kluje',
    description: 'Log in to your Kluje account or sign up as a homeowner or service provider. Manage jobs, quotes, and messages all in one place. Join Kluje today.',
    keywords: ['sign in Kluje', 'create account', 'Kluje login', 'register contractor'],
  },
  '/about': {
    title: 'About Kluje | AI-Powered Service Marketplace | Kluje',
    description: 'Kluje connects US homeowners and businesses with trusted, verified service providers. Learn about our mission, values, and the AI platform powering the built economy.',
    keywords: ['about Kluje', 'AI service marketplace', 'trusted contractors US'],
  },
  '/platform-manifesto': {
    title: 'Kluje Platform Manifesto | AI Architecture | Kluje',
    description: 'Deep dive into Kluje neural AI architecture, biometric site intelligence, AI Voice, predictive dashboard, and the data moat powering the built economy.',
    keywords: ['Kluje manifesto', 'AI architecture', 'biometric intelligence', 'AI Voice contractors'],
  },
  '/advertise': {
    title: 'Advertise on Kluje | Reach US Homeowners | Kluje',
    description: 'Reach 70,000+ monthly active users searching for service providers. Targeted ads, geo-filtering, and AI-optimised placements on the Kluje marketplace.',
    keywords: ['advertise Kluje', 'reach homeowners', 'contractor marketplace ads'],
  },
  '/newsletter': {
    title: 'Subscribe to the Kluje Newsletter | Kluje',
    description: 'Get the latest tips on hiring contractors, home improvement guides, and Kluje platform updates delivered to your inbox. Subscribe free today.',
    keywords: ['Kluje newsletter', 'home improvement tips', 'contractor news'],
  },
  '/sitemap': {
    title: 'Sitemap | All Pages on Kluje | Kluje',
    description: 'Browse the complete sitemap for Kluje. Find all pages, service categories, blog posts, provider profiles, and job listings indexed on our platform.',
    keywords: ['Kluje sitemap', 'all pages'],
  },
  '/demo': {
    title: 'Live Platform Demo | Kluje AI Dashboard | Kluje',
    description: 'See the Kluje AI platform in action. Explore dashboards, campaigns, analytics, and the AI Voice system powering US contractors. Try the live demo now.',
    keywords: ['Kluje demo', 'AI dashboard demo', 'contractor platform demo'],
  },
  '/metrics': {
    title: 'Platform Performance Metrics | Kluje',
    description: 'Transparent performance data for the Kluje marketplace — advertisers, campaigns, impressions, CTR, and lead conversion rates updated quarterly.',
    keywords: ['Kluje metrics', 'platform performance', 'marketplace analytics'],
  },
  '/privacy/request': {
    title: 'Data Subject Access Request | Kluje',
    description: 'Submit a request to access, correct, or delete your personal data held by Kluje. Exercise your rights under CCPA, CPRA, and US privacy laws.',
    keywords: ['data request Kluje', 'CCPA request', 'delete my data'],
  },
  '/privacy/preferences': {
    title: 'Cookie & Privacy Preferences | Kluje',
    description: 'Control how Kluje collects and uses your data. Manage cookie preferences, analytics tracking, and marketing communications in one place.',
    keywords: ['cookie preferences', 'privacy settings Kluje', 'manage cookies'],
  },
  '/privacy/do-not-sell': {
    title: 'Do Not Sell My Personal Information | Kluje',
    description: 'Exercise your CCPA/CPRA rights — opt out of any data sharing classified as a sale on Kluje. Your privacy, your choice.',
    keywords: ['do not sell', 'CCPA opt out', 'Kluje privacy rights'],
  },
  '/services/home-diy-renovation': {
    title: 'Home Renovation Quotes & Trusted Providers | Kluje',
    description: 'Find trusted US tradespeople for home renovations, repairs, and improvements. Get up to 3 quotes from verified electricians, plumbers, builders, and more.',
    keywords: ['home renovation US', 'find tradespeople', 'DIY services', 'home improvement quotes'],
  },
  '/services/commercial-services': {
    title: 'Commercial Renovation & Services Providers | Kluje',
    description: 'Professional commercial fit-outs, shopfitting, and maintenance services across the US. Get quotes from verified commercial contractors on Kluje.',
    keywords: ['commercial renovation US', 'shopfitting', 'commercial contractors'],
  },
  '/services/events-catering': {
    title: 'Event & Catering Service Providers | Kluje',
    description: 'Plan unforgettable events with top US event professionals. Find caterers, DJs, photographers, wedding planners, and more on Kluje.',
    keywords: ['event services US', 'catering quotes', 'wedding planning providers'],
  },
  '/services/health-fitness': {
    title: 'Health & Fitness Service Providers | Kluje',
    description: 'Find qualified personal trainers, physiotherapists, nutritionists, and wellness professionals near you across the US. Compare and hire on Kluje.',
    keywords: ['personal trainer US', 'health fitness providers', 'wellness professionals'],
  },
  '/services/agriculture': {
    title: 'Agriculture & Transport Service Providers | Kluje',
    description: 'Reliable agricultural services, removals, couriers, and transport providers across the US. Compare quotes and hire with confidence on Kluje.',
    keywords: ['agriculture services US', 'moving transport providers', 'courier services'],
  },
  '/services/pets-services': {
    title: 'Pet Service Providers in the US | Kluje',
    description: 'Trusted US pet care professionals: dog walkers, groomers, pet sitters, and trainers. Find insured, reviewed providers near you on Kluje.',
    keywords: ['pet services US', 'dog walking', 'pet grooming', 'pet sitting'],
  },
  '/services/business-services': {
    title: 'Business Service Providers in the US | Kluje',
    description: 'Professional US business support: accountancy, payroll, consulting, and admin services. Get quotes from verified providers on Kluje.',
    keywords: ['business services US', 'accountancy quotes', 'business consulting'],
  },
  '/services/it-services': {
    title: 'IT & Digital Service Providers | Kluje',
    description: 'Expert US-based IT services: web design, software development, SEO, and cybersecurity. Compare portfolios and get quotes on Kluje.',
    keywords: ['IT services US', 'web design quotes', 'software development', 'SEO services'],
  },
  '/services/legal-services': {
    title: 'Legal Service Providers & Attorneys | Kluje',
    description: 'Find qualified US attorneys and legal professionals for real estate, family law, commercial contracts, immigration, and more on Kluje.',
    keywords: ['attorneys US', 'legal services quotes', 'real estate law', 'family law'],
  },
  '/services/lessons': {
    title: 'Tutoring & Lesson Providers in the US | Kluje',
    description: 'Find qualified US tutors and instructors for academic subjects, languages, music, sports, and more. Compare credentials and book on Kluje.',
    keywords: ['tutoring US', 'private lessons', 'tutors near me', 'language lessons'],
  },
};

const BASE_URL = 'https://kluje.com';
const DEFAULT_OG_IMAGE = 'https://kluje.com/og-image.png';

export const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  pageType = 'page',
  pageContent,
  category,
  noIndex = false,
  jsonLd,
}: SEOHeadProps) => {
  const location = useLocation();
  const [aiSeo, setAiSeo] = useState<{
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
  } | null>(null);

  const routeDefaults = defaultSeoMap[location.pathname];

  const autoDescription = (() => {
    const slug = location.pathname.replace(/^\//, '').replace(/[-/]/g, ' ').trim();
    if (!slug) return 'Find trusted, verified service providers across the US on Kluje. Post a job for free and get quotes from vetted professionals.';
    const capitalised = slug.replace(/\b\w/g, c => c.toUpperCase());
    return `${capitalised} – find trusted professionals, read reviews, and get quotes on Kluje, the AI-powered US service provider platform.`;
  })();

  const effectiveTitle = title || aiSeo?.meta_title || routeDefaults?.title || 'Find Trusted Service Providers | Kluje';
  const effectiveDescription = description || aiSeo?.meta_description || routeDefaults?.description || autoDescription;
  const effectiveKeywords = keywords || aiSeo?.keywords || routeDefaults?.keywords || [];
  const effectiveCanonical = canonical || `${BASE_URL}${location.pathname === '/' ? '' : location.pathname}`;
  const effectiveOgImage = ogImage
    ? (ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`)
    : DEFAULT_OG_IMAGE;

  if (import.meta.env.DEV && !title && !routeDefaults?.title) {
    console.warn(`[SEOHead] Missing explicit title for route "${location.pathname}". Add it to defaultSeoMap or pass a title prop.`);
  }

  // Generate AI SEO for dynamic pages
  useEffect(() => {
    const dynamicPages = ['/blog/', '/service-provider/', '/jobs/', '/ask-expert/'];
    const isDynamic = dynamicPages.some(p => location.pathname.startsWith(p) && location.pathname !== p.slice(0, -1));

    if (isDynamic && !title && pageContent) {
      const generateSeo = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('generate-seo-meta', {
            body: {
              pageType,
              pageTitle: title || document.title,
              pageContent: pageContent?.substring(0, 500),
              category,
            },
          });
          if (!error && data?.success && data.data) {
            setAiSeo(data.data);
          }
        } catch (err) {
          console.warn('SEO generation skipped:', err);
        }
      };
      generateSeo();
    }
  }, [location.pathname, pageContent, pageType, title, category]);

  // Update document head
  useEffect(() => {
    document.title = effectiveTitle;

    // Meta description
    updateMeta('description', effectiveDescription);

    // Keywords
    if (effectiveKeywords.length > 0) {
      updateMeta('keywords', effectiveKeywords.join(', '));
    }

    // Robots
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
      updateMeta('prerender-status-code', '404');
    } else {
      updateMeta('robots', 'index, follow');
      removeMeta('prerender-status-code');
    }

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', effectiveCanonical);

    // hreflang (en-US primary)
    let hreflangEl = document.querySelector('link[hreflang="en-US"]') as HTMLLinkElement;
    if (!hreflangEl) {
      hreflangEl = document.createElement('link');
      hreflangEl.setAttribute('rel', 'alternate');
      hreflangEl.setAttribute('hreflang', 'en-US');
      document.head.appendChild(hreflangEl);
    }
    hreflangEl.setAttribute('href', effectiveCanonical);

    let xDefaultEl = document.querySelector('link[hreflang="x-default"]') as HTMLLinkElement;
    if (!xDefaultEl) {
      xDefaultEl = document.createElement('link');
      xDefaultEl.setAttribute('rel', 'alternate');
      xDefaultEl.setAttribute('hreflang', 'x-default');
      document.head.appendChild(xDefaultEl);
    }
    xDefaultEl.setAttribute('href', effectiveCanonical);

    // Open Graph
    updateMeta('og:title', effectiveTitle, 'property');
    updateMeta('og:description', effectiveDescription, 'property');
    updateMeta('og:url', effectiveCanonical, 'property');
    updateMeta('og:image', effectiveOgImage, 'property');
    updateMeta('og:image:width', '1200', 'property');
    updateMeta('og:image:height', '630', 'property');
    updateMeta('og:type', pageType === 'homepage' ? 'website' : 'article', 'property');
    updateMeta('og:site_name', 'Kluje', 'property');
    updateMeta('og:locale', 'en_US', 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', '@Kluje');
    updateMeta('twitter:title', effectiveTitle);
    updateMeta('twitter:description', effectiveDescription);
    updateMeta('twitter:image', effectiveOgImage);

    // JSON-LD
    const jsonLdData = jsonLd
      ? jsonLd
      : {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": effectiveTitle,
          "description": effectiveDescription,
          "url": effectiveCanonical,
          "publisher": {
            "@type": "Organization",
            "name": "Kluje",
            "url": "https://kluje.com",
            "logo": { "@type": "ImageObject", "url": DEFAULT_OG_IMAGE },
          },
        };

    let scriptEl = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.setAttribute('data-seo-jsonld', 'true');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdData);

    return () => {
      const el = document.querySelector('script[data-seo-jsonld]');
      if (el) el.remove();
    };
  }, [effectiveTitle, effectiveDescription, effectiveKeywords, effectiveCanonical, effectiveOgImage, noIndex, jsonLd, pageType]);

  return null;
};

function updateMeta(nameOrProp: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(name: string) {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.remove();
}
