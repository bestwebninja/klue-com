import { FileText, Headphones, UserCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/section-header";

const steps = [
  {
    icon: FileText,
    title: "Post your job for free",
    description: "Describe your project — from boiler repairs to full house renovations — and set your budget",
  },
  {
    icon: Headphones,
    title: "Service providers will contact you",
    description: "Receive up to 3 competitive quotes from qualified UK tradespeople and professionals",
  },
  {
    icon: UserCheck,
    title: "Check the profiles and hire",
    description: "Compare ratings, reviews, qualifications and past work to choose the right provider",
  },
  {
    icon: Star,
    title: "Rate the service",
    description: "Leave a review to help other UK homeowners find reliable service providers",
  },
];

export function HowItWorks() {
  return (
    <section aria-label="How it works" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          className="mb-10 md:mb-16"
          eyebrow="How it works"
          title="Post a job and get quotes"
          subtitle="Post a job and up to 3 service providers will contact you"
        />

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center animate-fade-in-up p-2 md:p-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center transition-all duration-300 hover:bg-primary hover:scale-105 group mb-4 md:mb-6" aria-hidden="true">
                <step.icon className="w-8 h-8 md:w-12 md:h-12 text-primary group-hover:text-primary-foreground transition-colors" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-foreground mb-1 md:mb-2 leading-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
          Need more detail? Read our{" "}
          <Link to="/how-it-works" className="text-primary font-medium hover:underline">
            step-by-step guide to hiring a service provider
          </Link>{" "}
          or{" "}
          <Link to="/post-job" className="text-primary font-medium hover:underline">
            post your job for free
          </Link>{" "}
          and start receiving quotes today.
        </p>
      </div>
    </section>
  );
}

