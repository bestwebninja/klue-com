import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";

export function AppDownload() {
  return (
    <section className="py-16 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="text-center md:text-left">
            <SectionHeader
              tone="inverse"
              align="left"
              eyebrow="Mobile app"
              title="We are on the app stores"
              subtitle="Use our application now. It's free!"
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Smartphone className="w-5 h-5 mr-2" />
              App Store
            </Button>
            <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Smartphone className="w-5 h-5 mr-2" />
              Google Play
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

