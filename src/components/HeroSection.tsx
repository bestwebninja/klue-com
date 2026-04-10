import heroProviders from "@/assets/hero-ai-city.jpg?format=webp&quality=80";
import { HomepageLeadCapture } from "@/components/HomepageLeadCapture";

export function HeroSection() {
  return (
    <section
      aria-label="Homepage lead capture"
      className="relative overflow-hidden h-[62vh] md:h-[75vh] min-h-[420px] md:min-h-[520px]"
    >
      {/* Static background image — LCP-optimised */}
      <img
        src={heroProviders}
        alt="Kluje AI platform connecting US homeowners with trusted service providers"
        className="absolute inset-0 w-full h-full object-cover object-top"
        fetchPriority="high"
        decoding="sync"
        loading="eager"
      />

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 hero-gradient" />

      {/* Lead-capture widget — centred in the hero */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <HomepageLeadCapture />
      </div>
    </section>
  );
}
