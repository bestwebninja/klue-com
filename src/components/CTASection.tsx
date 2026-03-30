import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import ctaBg from "@/assets/cta-bg.jpg?format=webp&quality=80";
import { SectionHeader } from "@/components/ui/section-header";

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section 
      aria-label="Post a job call to action"
      className="relative py-16 md:py-20 bg-cover bg-center"
      style={{ backgroundImage: `url(${ctaBg})` }}
      role="img"
      aria-roledescription="Post a free job on Kluje and get quotes from verified US contractors"
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative container mx-auto px-6 md:px-4 text-center">
        <SectionHeader
          tone="inverse"
          className="mb-4 md:mb-6"
          eyebrow="Ready to get started"
          title="Post your job today"
          subtitle="Get up to 3 quotes from relevant service providers"
        />
        <Button variant="hero" size="lg" type="button" onClick={() => navigate("/post-job")} className="font-signature normal-case tracking-normal font-normal text-2xl md:text-3xl">
          Just Kluje it
        </Button>
        <p className="text-white/70 mt-4">
          Are you a tradesperson?{" "}
          <Link to="/pricing" className="text-white underline hover:text-white/90">
            View subscription plans for service providers
          </Link>
        </p>
      </div>
    </section>
  );
}

