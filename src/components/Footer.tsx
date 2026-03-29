import { Link } from "react-router-dom";
import logo from "@/assets/logo.png?format=webp&quality=90";
import footerBg from "@/assets/footer-bg.jpg?format=webp&quality=80";

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
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Kluje" className="h-8 md:h-10 w-auto" loading="lazy" decoding="async" />
          </Link>

          <nav aria-label="Footer navigation" className="grid w-full max-w-5xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-x-3 gap-y-2 text-sm text-white/70">
            <a href="#" className="text-center hover:text-white transition-colors py-1">
              About Us
            </a>
            <Link to="/blog" className="text-center hover:text-white transition-colors py-1">
              Blog
            </Link>
            <Link to="/how-it-works" className="text-center hover:text-white transition-colors py-1">
              How it Works
            </Link>
            <Link to="/browse" className="text-center hover:text-white transition-colors py-1">
              Service Providers
            </Link>
            <Link to="/pricing" className="text-center hover:text-white transition-colors py-1">
              Pricing
            </Link>
            <Link to="/contact" className="text-center hover:text-white transition-colors py-1">
              Contact
            </Link>
            <Link to="/services/home-diy-renovation" className="text-center hover:text-white transition-colors py-1">
              Home Services
            </Link>
            <Link to="/services/commercial-services" className="text-center hover:text-white transition-colors py-1">
              Commercial
            </Link>
            <Link to="/services/it-services" className="text-center hover:text-white transition-colors py-1">
              IT Services
            </Link>
            <Link to="/platform-manifesto" className="text-center hover:text-white transition-colors py-1">
              Platform Manifesto
            </Link>
            <Link to="/advertise" className="text-center hover:text-white transition-colors py-1">
              Advertising Partnerships
            </Link>
            <Link to="/privacy" className="text-center hover:text-white transition-colors py-1">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-center hover:text-white transition-colors py-1">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="text-center hover:text-white transition-colors py-1">
              Sitemap
            </Link>
            <Link
              to="/advertiser-dashboard"
              className="text-center py-1 px-2 rounded-md border-2 border-yellow-400 text-yellow-200 hover:text-yellow-100 shadow-[0_0_12px_rgba(250,204,21,0.7)] hover:shadow-[0_0_18px_rgba(250,204,21,0.95)] transition-all"
            >
              Advert-Login
            </Link>
          </nav>

          <p className="text-xs md:text-sm text-white/70 text-center">
            © {new Date().getFullYear()} Kluje. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
