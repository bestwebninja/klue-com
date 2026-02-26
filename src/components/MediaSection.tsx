import { SectionHeader } from "@/components/ui/section-header";

export function MediaSection() {
  const mediaLogos = [
    { name: "Yahoo Finance", width: "150px" },
    { name: "SG Business Review", width: "150px" },
    { name: "Computerworld SG", width: "150px" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader className="mb-12" eyebrow="As seen in" title="Featured in the media" subtitle="Kluje as featured in the media" />

        <div className="flex flex-wrap items-center justify-center gap-12">
          {mediaLogos.map((logo, index) => (
            <div
              key={index}
              className="h-12 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="bg-muted px-6 py-3 rounded">
                <span className="text-muted-foreground font-semibold">{logo.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

