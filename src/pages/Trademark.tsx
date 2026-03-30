import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { PageHeader } from "@/components/ui/page-header";
import logo from "@/assets/divitiae-terrae-logo.jpg";

export default function Trademark() {
  return (
    <>
      <SEOHead
        title="Official Trademark Statement | Kluje"
        description="Official trademark declaration for 'Just Kluje it™' by Divitiae Terrae LLC, a Wyoming limited liability company."
        canonical="/trademark"
      />
      <Navbar />
      <PageHeader
        title="Official Trademark Statement"
        description="Divitiae Terrae LLC — Protecting the Kluje brand"
      />

      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <article className="prose prose-lg dark:prose-invert mx-auto space-y-6 text-muted-foreground">
            <p>
              Divitiae Terrae LLC, a Wyoming limited liability company, hereby declares that the slogan{" "}
              <strong className="text-foreground">"Just Kluje it™"</strong> is our official common law
              trademark and a core part of the Kluje.com brand identity.
            </p>

            <p>
              This slogan has been created and consistently used by Divitiae Terrae LLC in connection
              with Kluje.com in interstate commerce. It represents our values, mission, and unique
              positioning in the market. It is a distinctive and valuable asset that embodies the
              essence of the Kluje.com brand.
            </p>

            <p>
              We have established and maintain common law trademark rights in the slogan "Just Kluje
              it™" through prior and continuous use. These rights are recognized and protected under
              the common law, unfair competition laws, and related statutes of the United States and
              all 50 states.
            </p>

            <p>
              We actively protect our intellectual property rights. Any unauthorized use,
              reproduction, or imitation of the slogan "Just Kluje it™" (or confusingly similar
              variations) in connection with goods, services, advertising, or promotional activities
              is strictly prohibited and may constitute trademark infringement, unfair competition,
              and/or dilution under applicable federal and state laws.
            </p>

            <p>
              We will take all necessary legal steps in any relevant jurisdiction to safeguard our
              rights and prevent any dilution or misuse of this trademark.
            </p>

            <p>
              For licensing inquiries or permissions regarding the use of our trademarked slogan,
              please contact us at the details below.
            </p>

            <hr className="border-border my-8" />

            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="Divitiae Terrae LLC logo"
                className="h-16 w-16 rounded-md object-cover"
                loading="lazy"
                width="64"
                height="64"
              />
              <div>
                <p className="font-bold text-foreground mb-0">M. Marcus Mommsen</p>
                <p className="text-sm text-muted-foreground mb-0">Chairman and President</p>
                <p className="text-sm text-muted-foreground mb-0">
                  Kluje.com / Divitiae Terrae LLC
                </p>
                <p className="text-sm text-muted-foreground mb-0">Wyoming, USA</p>
                <p className="text-sm text-muted-foreground mb-0">30th March 2026</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
