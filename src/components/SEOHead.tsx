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
  jsonLd?: Record<string, unknown>;
}

/**
 * SEOHead – manages <head> meta for every page.
 *
 * IMPORTANT FOR NEW PAGES:
 * Every new page MUST include <SEOHead /> with at minimum a unique `title`
 * and `description` (140-160 chars). If the page route is public, also add
 * an entry to `defaultSeoMap` below so the description is available even
 * before JS hydration / AI generation.
 *
 * Private / authenticated pages should pass `noIndex={true}`.
 */

// Default SEO data per route for instant rendering (fallback before AI generates)
const defaultSeoMap: Record<string, { title: string; description: string; keywords: string[] }> = {
  '/': {
    title: 'Find Trusted Service Providers in the US | Kluje',
    description: 'Post a job for free and receive up to 3 quotes from verified US tradespeople and contractors. Compare profiles, reviews, and hire with confidence.',
    keywords: ['service providers US', 'find tradespeople', 'post job free', 'get quotes', 'US contractors'],
  },
  '/browse-providers': {
    title: 'Browse Local Service Providers | Kluje',
    description: 'Search rated and verified service providers near you. Filter by trade, location and reviews to find the right professional for your project.',
    keywords: ['browse service providers', 'find contractors', 'US tradespeople', 'verified professionals'],
  },
  '/jobs': {
    title: 'Open Jobs & Leads for Tradespeople | Kluje',
    description: 'Browse open jobs posted by US homeowners and businesses. Find leads in your trade, request to quote, and grow your service provider business.',
    keywords: ['service provider jobs', 'contractor leads', 'US job listings', 'trade work'],
  },
  '/post-job': {
    title: 'Post a Job for Free & Get Quotes | Kluje',
    description: 'Describe your project in minutes and get up to 3 quotes from qualified service providers. Completely free to post with no obligation to hire.',
    keywords: ['post job free', 'get quotes', 'hire tradespeople', 'US service quotes'],
  },
  '/ask-expert': {
    title: 'Ask an Expert – Free Trade Advice | Kluje',
    description: 'Ask home improvement, renovation or trade questions and get free answers from verified US professionals. No sign-up needed to browse answers.',
    keywords: ['ask expert', 'free advice', 'professional help', 'US tradespeople advice'],
  },
  '/blog': {
    title: 'Tips & Guides for Home Improvement | Kluje',
    description: 'Read expert articles on hiring tradespeople, home renovation tips, event planning, and business services from experienced US professionals.',
    keywords: ['home improvement blog', 'service tips', 'US tradespeople guides', 'hiring advice'],
  },
  '/how-it-works': {
    title: 'How It Works – Hire with Confidence | Kluje',
    description: 'Post your job, receive quotes from up to 3 providers, compare profiles and reviews, then hire the best fit. Simple, free, and transparent.',
    keywords: ['how it works', 'hire service provider', 'get quotes process', 'Kluje guide'],
  },
  '/pricing': {
    title: 'Plans & Pricing for Providers | Kluje',
    description: 'Affordable monthly plans for US service providers. Access job leads, showcase your portfolio, collect reviews, and grow your client base.',
    keywords: ['service provider pricing', 'subscription plans', 'contractor membership', 'trade leads cost'],
  },
  '/contact': {
    title: 'Contact Us | Kluje',
    description: 'Get in touch with the Kluje team for support, feedback, or partnership inquiries. We are here to help customers and service providers.',
    keywords: ['contact Kluje', 'get in touch', 'support', 'help'],
  },
  '/terms': {
    title: 'Terms of Service | Kluje',
    description: 'Read the Kluje terms of service covering account use, job posting rules, provider obligations, and dispute resolution for all platform users.',
    keywords: ['terms of service', 'Kluje terms', 'user agreement'],
  },
  '/privacy': {
    title: 'Privacy Policy | Kluje',
    description: 'Learn how Kluje collects, stores, and protects your personal data. Our privacy policy covers cookies, third-party sharing, and your rights.',
    keywords: ['privacy policy', 'data protection', 'Kluje privacy'],
  },
  '/auth': {
    title: 'Sign In or Create Account | Kluje',
    description: 'Log in to your Kluje account or sign up as a homeowner or service provider. Manage jobs, quotes, and messages all in one place.',
    keywords: ['sign in', 'create account', 'Kluje login', 'register'],
  },
  '/services/home-diy-renovation': {
    title: 'Home DIY & Renovation Services in the US | Kluje',
    description: 'Find trusted US tradespeople for home renovations, repairs and improvements. Get up to 3 quotes from verified electricians, plumbers, builders and more.',
    keywords: ['home renovation US', 'find tradespeople', 'DIY services', 'US builders', 'home improvement'],
  },
  '/services/commercial-services': {
    title: 'Commercial Renovations & Services in the US | Kluje',
    description: 'Professional commercial fit-outs, shopfitting and maintenance services across the US. Get quotes from verified commercial contractors.',
    keywords: ['commercial renovation US', 'shopfitting', 'office refurbishment', 'commercial contractors'],
  },
  '/services/events-catering': {
    title: 'Events & Catering Services in the US | Kluje',
    description: 'Plan unforgettable events with top US event professionals. Find caterers, DJs, photographers, wedding planners and more.',
    keywords: ['event services US', 'catering', 'wedding planning', 'US event professionals'],
  },
  '/services/health-fitness': {
    title: 'Health & Fitness Services in the US | Kluje',
    description: 'Find qualified personal trainers, physiotherapists, nutritionists and wellness professionals near you across the US.',
    keywords: ['personal trainer US', 'physiotherapy', 'health and fitness', 'wellness professionals'],
  },
  '/services/agriculture': {
    title: 'Agriculture & Transport Services in the US | Kluje',
    description: 'Reliable agricultural services, removals, couriers and transport providers across the US. Compare quotes and hire with confidence.',
    keywords: ['agriculture US', 'removals', 'courier services', 'transport', 'man with a van'],
  },
  '/services/pets-services': {
    title: 'Pet Services in the US | Kluje',
    description: 'Trusted US pet care professionals including dog walkers, groomers, pet sitters and trainers. Find insured and reviewed providers near you.',
    keywords: ['pet services US', 'dog walking', 'pet grooming', 'pet sitting', 'dog training'],
  },
  '/services/business-services': {
    title: 'Business Services in the US | Kluje',
    description: 'Professional US business support including accountancy, payroll, consulting and administrative services. Get quotes from verified providers.',
    keywords: ['business services US', 'accountancy', 'payroll services', 'business consulting'],
  },
  '/services/it-services': {
    title: 'IT Services in the US | Kluje',
    description: 'Expert US-based IT and digital services including web design, software development, SEO and cybersecurity. Compare portfolios and quotes.',
    keywords: ['IT services US', 'web design', 'software development', 'SEO services', 'digital agency'],
  },
  '/services/legal-services': {
    title: 'Legal Services in the US | Kluje',
    description: 'Find qualified US attorneys and legal professionals for real estate, family law, commercial contracts, immigration and more.',
    keywords: ['attorneys US', 'legal services', 'real estate law', 'family law', 'US lawyers'],
  },
  '/services/lessons': {
    title: 'Lessons & Tutoring in the US | Kluje',
    description: 'Find qualified US tutors and instructors for academic subjects, languages, music, sports and more. Compare credentials and book with confidence.',
    keywords: ['tutoring US', 'private lessons', 'tutors near me', 'language lessons', 'academic tutoring'],
  },
};

const BASE_URL = 'https://klue-us.lovable.app';

export const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/og-image.png',
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

  // Get default SEO or use provided props
  const routeDefaults = defaultSeoMap[location.pathname];

  // Auto-generate a fallback description from the pathname so no page is ever without one
  const autoDescription = (() => {
    const slug = location.pathname.replace(/^\//, '').replace(/[-/]/g, ' ').trim();
    if (!slug) return 'Find trusted, verified service providers across the UK on Kluje. Post a job for free and get quotes.';
    const capitalised = slug.replace(/\b\w/g, c => c.toUpperCase());
    return `${capitalised} – find trusted professionals, read reviews and get quotes on Kluje, the UK service provider platform.`;
  })();

  const effectiveTitle = title || aiSeo?.meta_title || routeDefaults?.title || 'Kluje – Find Service Providers';
  const effectiveDescription = description || aiSeo?.meta_description || routeDefaults?.description || autoDescription;
  const effectiveKeywords = keywords || aiSeo?.keywords || routeDefaults?.keywords || [];
  const effectiveCanonical = canonical || `${BASE_URL}${location.pathname}`;

  // Dev-mode warning: every page should supply an explicit title & description
  if (import.meta.env.DEV && !title && !routeDefaults?.title) {
    console.warn(`[SEOHead] Missing explicit title for route "${location.pathname}". Add it to defaultSeoMap or pass a title prop.`);
  }
  if (import.meta.env.DEV && !description && !routeDefaults?.description) {
    console.warn(`[SEOHead] Missing explicit description for route "${location.pathname}". Add it to defaultSeoMap or pass a description prop.`);
  }

  // Generate AI SEO for dynamic pages (blog posts, provider profiles, job details)
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
    // Title
    document.title = effectiveTitle;

    // Meta description
    updateMeta('description', effectiveDescription);

    // Keywords
    if (effectiveKeywords.length > 0) {
      updateMeta('keywords', effectiveKeywords.join(', '));
    }

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', effectiveCanonical);

    // Robots & prerender status code
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
      updateMeta('prerender-status-code', '404');
    } else {
      removeMeta('robots');
      removeMeta('prerender-status-code');
    }

    // Open Graph
    updateMeta('og:title', effectiveTitle, 'property');
    updateMeta('og:description', effectiveDescription, 'property');
    updateMeta('og:url', effectiveCanonical, 'property');
    updateMeta('og:image', ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`, 'property');
    updateMeta('og:type', 'website', 'property');

    // Twitter
    updateMeta('twitter:title', effectiveTitle);
    updateMeta('twitter:description', effectiveDescription);
    updateMeta('twitter:image', ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`);

    // JSON-LD
    if (jsonLd) {
      let scriptEl = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.setAttribute('type', 'application/ld+json');
        scriptEl.setAttribute('data-seo-jsonld', 'true');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // Clean up JSON-LD on unmount
      const scriptEl = document.querySelector('script[data-seo-jsonld]');
      if (scriptEl) scriptEl.remove();
    };
  }, [effectiveTitle, effectiveDescription, effectiveKeywords, effectiveCanonical, ogImage, noIndex, jsonLd]);

  return null; // This component only modifies <head>
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
