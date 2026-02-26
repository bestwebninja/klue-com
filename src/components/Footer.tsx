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
      <div className="absolute inset-0 bg-foreground/90" />
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Kluje" className="h-8 md:h-10 w-auto" loading="lazy" decoding="async" />
          </Link>
          
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:gap-6 text-sm text-primary-foreground/70">
            <a href="#" className="hover:text-primary-foreground transition-colors py-1">
              About Us
            </a>
            <Link to="/blog" className="hover:text-primary-foreground transition-colors py-1">
              Blog
            </Link>
            <Link to="/how-it-works" className="hover:text-primary-foreground transition-colors py-1">
              How it Works
            </Link>
            <Link to="/browse" className="hover:text-primary-foreground transition-colors py-1">
              Service Providers
            </Link>
            <Link to="/pricing" className="hover:text-primary-foreground transition-colors py-1">
              Pricing
            </Link>
            <Link to="/contact" className="hover:text-primary-foreground transition-colors py-1">
              Contact
            </Link>
            <Link to="/services/home-diy-renovation" className="hover:text-primary-foreground transition-colors py-1">
              Home Services
            </Link>
            <Link to="/services/commercial-services" className="hover:text-primary-foreground transition-colors py-1">
              Commercial
            </Link>
            <Link to="/services/it-services" className="hover:text-primary-foreground transition-colors py-1">
              IT Services
            </Link>
            <Link to="/privacy" className="hover:text-primary-foreground transition-colors py-1">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-foreground transition-colors py-1">
              Terms of Service
            </Link>
            <Link to="/admin" className="hover:text-primary-foreground transition-colors py-1">
              Admin
            </Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors py-1">
              Sitemap
            </a>
          </nav>
          
          <p className="text-xs md:text-sm text-primary-foreground/70 text-center">
            © {new Date().getFullYear()} Kluje. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
