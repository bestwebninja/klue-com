import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Eagerly load only the first slide image for FCP
import heroProviders from "@/assets/hero-providers.jpg?format=webp&quality=80";

// Lazy-load remaining slide images as webp
const lazyImages = [
  () => import("@/assets/hero-home-services.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-commercial.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-events.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-health-fitness.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-agriculture.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-pets.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-business.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-it-services.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-legal.jpg?format=webp&quality=80"),
  () => import("@/assets/hero-lessons.jpg?format=webp&quality=80"),
];

const heroSlides = [
  {
    title: "Find a",
    highlight: "Service Provider",
    subtitle: "",
    description: "Up to 3 Service Providers Will Contact you to Do a Quote",
    shortDescription: "Get up to 3 quotes from local pros",
  },
  {
    title: "Home",
    highlight: "DIY & Renovation",
    subtitle: "",
    description: "Skilled tradespeople for all your home needs",
    shortDescription: "Trusted trades for your home",
  },
  {
    title: "Commercial",
    highlight: "Renovations & Services",
    subtitle: "",
    description: "Expert contractors for your business projects",
    shortDescription: "Pros for your business",
  },
  {
    title: "Events &",
    highlight: "Catering",
    subtitle: "",
    description: "Make your special occasions unforgettable",
    shortDescription: "Bring your event to life",
  },
  {
    title: "Health &",
    highlight: "Fitness",
    subtitle: "",
    description: "Personal trainers and wellness professionals",
    shortDescription: "Find wellness pros",
  },
  {
    title: "Agriculture &",
    highlight: "Transport",
    subtitle: "",
    description: "Farm services and logistics solutions",
    shortDescription: "Farm & transport help",
  },
  {
    title: "Pet",
    highlight: "Services",
    subtitle: "",
    description: "Care and grooming for your beloved pets",
    shortDescription: "Care for your pets",
  },
  {
    title: "Business",
    highlight: "Services",
    subtitle: "",
    description: "Professional support for your business needs",
    shortDescription: "Support for your business",
  },
  {
    title: "IT",
    highlight: "Services",
    subtitle: "",
    description: "Technology experts and digital solutions",
    shortDescription: "Tech help, fast",
  },
  {
    title: "Legal",
    highlight: "Services",
    subtitle: "",
    description: "Professional legal advice and representation",
    shortDescription: "Find legal help",
  },
  {
    title: "Lessons &",
    highlight: "Tutoring",
    subtitle: "",
    description: "Expert teachers for all subjects and skills",
    shortDescription: "Learn with experts",
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
