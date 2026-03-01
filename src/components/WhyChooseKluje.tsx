import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/section-header';

export function WhyChooseKluje() {
  return (
    <section aria-label="Why choose Kluje" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            className="mb-8"
            title="Why US Homeowners and Businesses Choose Kluje"
            subtitle="A smarter way to hire contractors and service providers"
          />

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Finding a reliable contractor in the US can be a challenge. From emergency plumbing repairs
              in Houston to full kitchen renovations in Denver, homeowners deserve a straightforward way
              to compare qualified professionals. Kluje was built to solve that problem.
            </p>
            <p>
              Unlike traditional directories, Kluje puts you in control. You describe your project —
              whether it's{' '}
              <Link to="/services/home-diy-renovation" className="text-primary hover:underline">home renovation</Link>,{' '}
              <Link to="/services/commercial-services" className="text-primary hover:underline">commercial maintenance</Link>,{' '}
              <Link to="/services/legal-services" className="text-primary hover:underline">legal advice</Link>{' '}
              or{' '}
              <Link to="/services/health-fitness" className="text-primary hover:underline">personal training</Link>{' '}
              — and qualified providers come to you with competitive quotes. There is no obligation to
              accept, and posting a job is always free.
            </p>

            <h3 className="text-lg font-semibold text-foreground pt-4">
              Covering Every Trade and Service
            </h3>
            <p>
              Kluje covers ten major service categories including{' '}
              <Link to="/services/home-diy-renovation" className="text-primary hover:underline">
                electricians, plumbers, carpenters and builders
              </Link>
              , as well as specialist sectors such as{' '}
              <Link to="/services/events-catering" className="text-primary hover:underline">
                event catering and wedding planning
              </Link>
              ,{' '}
              <Link to="/services/pets-services" className="text-primary hover:underline">
                pet grooming and dog walking
              </Link>
              ,{' '}
              <Link to="/services/business-services" className="text-primary hover:underline">
                accounting and business consulting
              </Link>
              , and{' '}
              <Link to="/services/lessons" className="text-primary hover:underline">
                private tutoring and language lessons
              </Link>
              . With hundreds of subcategories, you can find the exact expertise you need.
            </p>

            <h3 className="text-lg font-semibold text-foreground pt-4">
              Trusted by Homeowners Across All 50 States
            </h3>
            <p>
              Every service provider on Kluje can complete our verification process, which includes identity
              checks, proof of insurance and professional qualifications. Customer reviews and star ratings
              are displayed on every profile, helping you make an informed choice. Our{' '}
              <Link to="/ask-expert" className="text-primary hover:underline">
                Ask an Expert
              </Link>{' '}
              feature also lets you get free advice from experienced professionals before committing to a
              project.
            </p>
            <p>
              Whether you are a first-time buyer renovating an apartment in Brooklyn or a facilities manager sourcing
              contractors for a commercial property in Dallas, Kluje provides the tools to hire with
              confidence. Post your first job today and discover why more US property owners are choosing
              Kluje to find quality contractors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
