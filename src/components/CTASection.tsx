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
    >
      <div className="absolute inset-0 bg-foreground/80" />
      <div className="relative container mx-auto px-6 md:px-4 text-center">
        <SectionHeader
          tone="inverse"
          className="mb-4 md:mb-6"
          eyebrow="Ready to get started"
          title="Post your job today"
          subtitle="Get up to 3 quotes from relevant service providers"
        />
        <Button variant="hero" size="lg" type="button" onClick={() => navigate("/post-job")}>
          Post a Job Now
        </Button>
        <p className="text-primary-foreground/70 mt-4">
          Are you a tradesperson?{" "}
          <Link to="/pricing" className="text-primary-foreground underline hover:text-primary-foreground/90">
            View subscription plans for service providers
          </Link>
        </p>
      </div>
    </section>
  );
}

