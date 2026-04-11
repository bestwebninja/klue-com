import { Link } from "react-router-dom";
import logo from "@/assets/logo.png?format=webp&quality=90";
import footerBg from "@/assets/footer-bg.jpg?format=webp&quality=80";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="relative py-8 md:py-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${footerBg})` }}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <Link to="/" className="flex items-center" aria-label="Kluje homepage">
            <img src={logo} alt="Kluje — AI-powered service provider platform for US contractors and homeowners" className="h-8 md:h-10 w-auto" loading="lazy" decoding="async" width="120" height="40" />
          </Link>

          {/* Primary nav */}
          <nav aria-label="Footer navigation" className="w-full max-w-5xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-1 text-sm text-white/70">
              {/* Platform */}
              <h3 className="col-span-2 sm:col-span-3 lg:col-span-4 text-xs uppercase tracking-widest text-white/40 font-semibold mt-2 mb-1">Platform</h3>
              <Link to="/how-it-works" className="hover:text-white transition-colors py-1">How Kluje Works</Link>
              <Link to="/post-job" className="hover:text-white transition-colors py-1">Post a Job Free</Link>
              <Link to="/browse-providers" className="hover:text-white transition-colors py-1">Find Service Providers</Link>
              <Link to="/pricing" className="hover:text-white transition-colors py-1">AI Voice Pricing</Link>
              <Link to="/ask-expert" className="hover:text-white transition-colors py-1">Ask an Expert</Link>
              <Link to="/demo" className="hover:text-white transition-colors py-1">Live Platform Demo</Link>
              <Link to="/ask-expert" className="hover:text-white transition-colors py-1">Ask an Expert</Link>
              <Link to="/platform-manifesto" className="hover:text-white transition-colors py-1">AI Platform Manifesto</Link>

              {/* Services */}
              <h3 className="col-span-2 sm:col-span-3 lg:col-span-4 text-xs uppercase tracking-widest text-white/40 font-semibold mt-3 mb-1">Services</h3>
              <Link to="/services/living-solutions" className="hover:text-white transition-colors py-1">Home Services</Link>
              <Link to="/services/design-and-build" className="hover:text-white transition-colors py-1">Commercial Contractors</Link>
              <Link to="/services/it-services" className="hover:text-white transition-colors py-1">IT & Digital Services</Link>
              <Link to="/services/legal-services" className="hover:text-white transition-colors py-1">Legal Services</Link>
              <Link to="/services/events-catering" className="hover:text-white transition-colors py-1">Events & Catering</Link>
              <Link to="/services/health-fitness" className="hover:text-white transition-colors py-1">Health & Fitness</Link>
              <Link to="/services/business-services" className="hover:text-white transition-colors py-1">Business Services</Link>
              <Link to="/services/pets-services" className="hover:text-white transition-colors py-1">Pet Services</Link>

              {/* Company */}
              <h3 className="col-span-2 sm:col-span-3 lg:col-span-4 text-xs uppercase tracking-widest text-white/40 font-semibold mt-3 mb-1">Company</h3>
              <Link to="/about" className="hover:text-white transition-colors py-1">About Kluje</Link>
              <Link to="/blog" className="hover:text-white transition-colors py-1">Blog & Guides</Link>
              <Link to="/partners/signup" aria-label="Open Kluje Partners signup page" className="inline-block w-fit">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Partner SIGNUP
                </Button>
              </Link>
              <Link to="/partners" className="hover:text-white transition-colors py-1">Partners</Link>
              <Link to="/advertise" className="inline-block w-fit py-1 px-3 rounded-md border-2 border-yellow-400 text-yellow-200 hover:text-yellow-100 shadow-[0_0_12px_rgba(250,204,21,0.7)] hover:shadow-[0_0_18px_rgba(250,204,21,0.95)] transition-all">Advertise on Kluje</Link>
              <Link to="/contact" className="hover:text-white transition-colors py-1">Contact Us</Link>
              <Link to="/newsletter" className="hover:text-white transition-colors py-1">Newsletter</Link>
              <Link to="/sitemap" className="hover:text-white transition-colors py-1">Sitemap</Link>

              {/* Trademark */}
              <h3 className="col-span-2 sm:col-span-3 lg:col-span-4 text-xs uppercase tracking-widest text-white/40 font-semibold mt-3 mb-1">Trademark</h3>
              <Link to="/trademark" className="hover:text-white transition-colors py-1">Official Trademark Statement</Link>

              {/* Partners */}
              <h3 className="col-span-2 sm:col-span-3 lg:col-span-4 text-xs uppercase tracking-widest text-white/40 font-semibold mt-3 mb-1">Partners</h3>
              <Link to="/advertise" className="hover:text-white transition-colors py-1">Partnership Programs</Link>
              <Link
                to="/partners/signup"
                className="inline-block w-fit py-1 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Partner SIGNUP
              </Link>

              {/* Legal & Privacy */}
              <h3 className="col-span-2 sm:col-span-3 lg:col-span-4 text-xs uppercase tracking-widest text-white/40 font-semibold mt-3 mb-1">Legal & Privacy</h3>
              <Link to="/privacy" className="hover:text-white transition-colors py-1">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors py-1">Terms of Service</Link>
              <Link to="/privacy/request" className="hover:text-white transition-colors py-1">Data Subject Request</Link>
              <Link to="/privacy/preferences" className="hover:text-white transition-colors py-1">Cookie Preferences</Link>
              <Link to="/privacy/do-not-sell" className="hover:text-white transition-colors py-1">Do Not Sell My Info</Link>
              <Link
                to="/advertiser-dashboard"
                className="inline-block w-fit py-1 px-3 rounded-md border-2 border-yellow-400 text-yellow-200 hover:text-yellow-100 shadow-[0_0_12px_rgba(250,204,21,0.7)] hover:shadow-[0_0_18px_rgba(250,204,21,0.95)] transition-all"
              >
                Advertiser Admin
              </Link>
              <Link
                to="/metrics"
                className="inline-block w-fit py-1 px-3 rounded-md border-2 border-yellow-400 text-yellow-200 hover:text-yellow-100 shadow-[0_0_12px_rgba(250,204,21,0.7)] hover:shadow-[0_0_18px_rgba(250,204,21,0.95)] transition-all"
              >
                Platform AD-Metrics
              </Link>
            </div>
          </nav>

          <p className="text-xs md:text-sm text-white/70 text-center">
            © {new Date().getFullYear()} Kluje. All rights reserved. AI-powered service provider platform for the US built economy.
          </p>
        </div>
      </div>
    </footer>
  );
}
