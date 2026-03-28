import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Eagerly load only the first slide image for FCP
import heroProviders from "@/assets/hero-providers.jpg?format=webp&quality=80";

// Lazy-load remaining slide images as webp
// TODO: replace each placeholder with its dedicated category image once uploaded:
//   hero-design-build.jpg, hero-smart-security.jpg, hero-build-ops.jpg,
//   hero-capital.jpg, hero-ai-core.jpg, hero-legal-shield.jpg,
//   hero-connections.jpg, hero-property-deals.jpg, hero-sales-agents.jpg,
//   hero-living-solutions.jpg, hero-materials.jpg
const lazyImages = [
  () => import("@/assets/hero-commercial.jpg?format=webp&quality=80"),   // → hero-design-build.jpg
  () => import("@/assets/hero-it-services.jpg?format=webp&quality=80"),  // → hero-smart-security.jpg
  () => import("@/assets/hero-contractor.jpg?format=webp&quality=80"),   // → hero-build-ops.jpg
  () => import("@/assets/hero-pricing.jpg?format=webp&quality=80"),      // → hero-capital.jpg
  () => import("@/assets/hero-business.jpg?format=webp&quality=80"),     // → hero-ai-core.jpg
  () => import("@/assets/hero-legal.jpg?format=webp&quality=80"),        // → hero-legal-shield.jpg
  () => import("@/assets/support-bg.jpg?format=webp&quality=80"),        // → hero-connections.jpg
  () => import("@/assets/hero-post-job.jpg?format=webp&quality=80"),     // → hero-property-deals.jpg
  () => import("@/assets/cta-bg.jpg?format=webp&quality=80"),            // → hero-sales-agents.jpg
  () => import("@/assets/hero-home-services.jpg?format=webp&quality=80"), // → hero-living-solutions.jpg
  () => import("@/assets/footer-bg.jpg?format=webp&quality=80"),         // → hero-materials.jpg
];

const heroSlides = [
  {
    title: "Find a",
    highlight: "Service Provider",
    description: "Up to 3 verified professionals will contact you with a quote — free to post, no obligation",
    shortDescription: "Get up to 3 quotes from local pros",
  },
  {
    title: "Design &",
    highlight: "Build",
    description: "Architects, interior designers, and design-build contractors for residential and commercial projects",
    shortDescription: "Design & build pros near you",
  },
  {
    title: "Smart",
    highlight: "Security",
    description: "CCTV, access control, smart locks, and intelligent surveillance systems installed by certified specialists",
    shortDescription: "Protect your property today",
  },
  {
    title: "Build",
    highlight: "Ops Trades",
    description: "Licensed general contractors, electricians, plumbers, HVAC, roofers, and every specialist trade",
    shortDescription: "Find licensed trades near you",
  },
  {
    title: "Capital &",
    highlight: "Finance",
    description: "CPAs, construction lenders, hard money, financial advisors, and business capital specialists",
    shortDescription: "Fund your next project",
  },
  {
    title: "AI",
    highlight: "Core Solutions",
    description: "Automate workflows, analyze data, and transform your construction or real estate operations with AI",
    shortDescription: "Supercharge your business with AI",
  },
  {
    title: "Legal",
    highlight: "Shield",
    description: "Construction attorneys, real estate lawyers, contract review, mechanic liens, and compliance specialists",
    shortDescription: "Protect your deals legally",
  },
  {
    title: "Business",
    highlight: "Connections",
    description: "Consultants, project managers, HR, marketing, and tech professionals to grow your business",
    shortDescription: "Connect with the right pros",
  },
  {
    title: "Property",
    highlight: "Deals",
    description: "Fix & flip, buy & hold, commercial, and off-market properties — find your next investment deal",
    shortDescription: "Find your next deal",
  },
  {
    title: "Sales",
    highlight: "Agents",
    description: "Buyer agents, listing agents, investment specialists, and commercial brokers across the US",
    shortDescription: "Find the right agent",
  },
  {
    title: "Living",
    highlight: "Solutions",
    description: "Home repairs, remodeling, cleaning, landscaping, and residential services from trusted local pros",
    shortDescription: "Home services made easy",
  },
  {
    title: "Building",
    highlight: "Materials",
    description: "Lumber, MEP supplies, roofing, flooring, hardware, and wholesale building materials with bulk pricing",
    shortDescription: "Source materials at wholesale",
  },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideImages, setSlideImages] = useState<string[]>([heroProviders]);

  // Lazy-load remaining hero images after first paint
  useEffect(() => {
    const timer = requestIdleCallback?.(() => loadRemainingImages()) ??
      setTimeout(() => loadRemainingImages(), 200);

    function loadRemainingImages() {
      Promise.all(lazyImages.map(fn => fn())).then(modules => {
        setSlideImages([heroProviders, ...modules.map(m => m.default)]);
      });
    }

    return () => {
      if (typeof timer === "number") clearTimeout(timer);
    };
  }, []);

  const heroVariant = useMemo<"default" | "compact">(() => {
    const fromQuery = searchParams.get("hero");
    if (fromQuery === "compact" || fromQuery === "default") return fromQuery;

    const fromStorage = window.localStorage.getItem("kluje.heroVariant");
    if (fromStorage === "compact" || fromStorage === "default") return fromStorage;

    return "default";
  }, [searchParams]);

  const showHeroToggle = searchParams.get("heroToggle") === "1";

  const setVariant = (variant: "default" | "compact") => {
    window.localStorage.setItem("kluje.heroVariant", variant);
    const next = new URLSearchParams(searchParams);
    next.set("hero", variant);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const handlePostJobClick = () => {
    navigate("/post-job");
  };

  const getSlideImage = (index: number) => slideImages[index] ?? slideImages[0];

  return (
    <section
      aria-label="Hero slideshow"
      aria-roledescription="carousel"
      className={
        "relative overflow-hidden " +
        (heroVariant === "compact"
          ? "h-[52vh] md:h-[64vh] min-h-[360px] md:min-h-[460px]"
          : "h-[62vh] md:h-[75vh] min-h-[420px] md:min-h-[520px]")
      }
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade – first slide uses <img> for LCP */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={getSlideImage(index)}
            alt=""
            role="presentation"
            className="absolute inset-0 w-full h-full object-cover object-top"
            {...(index === 0
              ? { fetchPriority: "high" as const, decoding: "sync" as const, loading: "eager" as const }
              : { fetchPriority: "low" as const, decoding: "async" as const, loading: "lazy" as const }
            )}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 hero-gradient" />

      {/* Optional A/B toggle (enable via ?heroToggle=1) */}
      {showHeroToggle && (
        <div className="absolute right-3 top-24 z-30">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/20 backdrop-blur px-1 py-1">
            <button
              type="button"
              onClick={() => setVariant("default")}
              className={
                "px-3 py-1 text-xs font-semibold rounded-full transition-colors " +
                (heroVariant === "default" ? "bg-primary text-primary-foreground" : "text-primary-foreground")
              }
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setVariant("compact")}
              className={
                "px-3 py-1 text-xs font-semibold rounded-full transition-colors " +
                (heroVariant === "compact" ? "bg-primary text-primary-foreground" : "text-primary-foreground")
              }
            >
              Compact
            </button>
          </div>
        </div>
      )}

      {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
      <button
        onClick={prevSlide}
        className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        aria-label="Previous slide"
        type="button"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        aria-label="Next slide"
        type="button"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 md:px-4">
        <h1 
          className="max-w-[20ch] md:max-w-none text-balance text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 md:mb-6 animate-fade-in-up leading-tight"
          style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
        >
          {heroSlides[currentSlide].title} {heroSlides[currentSlide].highlight}
        </h1>

        <Button
          size="lg"
          variant="hero"
          className="mb-6 md:mb-8 animate-fade-in-up relative z-20 px-8 md:px-10 py-3 md:py-4"
          style={{ animationDelay: "0.2s" }}
          onClick={handlePostJobClick}
          type="button"
        >
          Post a Job Now
        </Button>

        <p
          className="text-base md:text-lg lg:text-xl text-primary-foreground/90 animate-fade-in-up max-w-md md:max-w-none px-4"
          style={{ animationDelay: "0.4s" }}
        >
          <span className="md:hidden">{heroSlides[currentSlide].shortDescription}</span>
          <span className="hidden md:inline">{heroSlides[currentSlide].description}</span>
        </p>

        {/* Slide Indicators */}
        <div className="flex gap-1.5 md:gap-2 mt-6 md:mt-8" role="tablist" aria-label="Slide indicators">
          {heroSlides.map((slide, index) => (
            <button
              key={index}
              role="tab"
              onClick={() => setCurrentSlide(index)}
              className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-primary w-6 md:w-8"
                  : "bg-primary-foreground/50 hover:bg-primary-foreground/70 w-2 md:w-3"
              }`}
              aria-label={`Slide ${index + 1}: ${slide.title} ${slide.highlight}`}
              aria-selected={index === currentSlide}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
