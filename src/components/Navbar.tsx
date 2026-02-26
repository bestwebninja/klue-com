import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Settings, Briefcase, Home, Shield, LogOut, MapPin, Users, HelpCircle, Info, ChevronRight, Layers } from "lucide-react";
import categories from "@/data/categoryLandingData";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import logo from "@/assets/logo.png?format=webp&quality=90";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isProvider, isAdmin, loading: roleLoading } = useUserRole();
  const isNavVisible = useScrollDirection();

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isProvider) return "/dashboard";
    return "/user-dashboard";
  };

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin Panel";
    if (isProvider) return "Provider Dashboard";
    return "My Dashboard";
  };

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield className="h-5 w-5" />;
    if (isProvider) return <Briefcase className="h-5 w-5" />;
    return <Home className="h-5 w-5" />;
  };

  const MenuLink = ({ 
    to, 
    children, 
    icon,
    onClick 
  }: { 
    to: string; 
    children: React.ReactNode; 
    icon?: React.ReactNode;
    onClick?: () => void 
  }) => (
    <SheetClose asChild>
      <Link
        to={to}
        className="flex items-center gap-3 py-3.5 px-4 text-primary-foreground/90 hover:text-primary hover:bg-white/5 text-sm font-medium tracking-wide transition-all duration-200 rounded-lg group"
        onClick={onClick}
      >
        {icon && <span className="text-primary-foreground/60 group-hover:text-primary transition-colors">{icon}</span>}
        <span>{children}</span>
      </Link>
    </SheetClose>
  );

  return (
    <nav 
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 bg-foreground/50 backdrop-blur-md transition-transform duration-300 ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Kluje" className="h-8 md:h-10 w-auto" width={120} height={40} decoding="async" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Show different CTA based on role */}
            {!user ? (
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth?type=provider">List Your Business</Link>
              </Button>
            ) : isProvider ? (
              <Button variant="hero" size="sm" asChild>
                <Link to="/dashboard">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Provider Dashboard
                </Link>
              </Button>
            ) : (
              <Button variant="hero" size="sm" asChild>
                <Link to="/user-dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  My Jobs
                </Link>
              </Button>
            )}

            {/* Slide-out Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-80 sm:w-96 bg-black/80 backdrop-blur-xl border-l border-white/10 p-0 overflow-y-auto scrollbar-thin"
              >
                <SheetHeader className="p-6 pb-2 border-b border-white/10">
                  <SheetTitle className="text-primary-foreground text-lg font-semibold tracking-wide">
                    Menu
                  </SheetTitle>
                </SheetHeader>

                <div className="p-4 flex flex-col">
                  {/* Primary CTA */}
                  <SheetClose asChild>
                    <Button variant="hero" size="lg" className="w-full mb-6 h-12 text-base font-semibold" asChild>
                      <Link to="/post-job">Post a Job Now!</Link>
                    </Button>
                  </SheetClose>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <MenuLink to="/jobs" icon={<MapPin className="h-5 w-5" />}>
                      Browse Jobs
                    </MenuLink>
                    <MenuLink to="/browse" icon={<Users className="h-5 w-5" />}>
                      Find Providers
                    </MenuLink>
                    <MenuLink to="/ask-expert" icon={<HelpCircle className="h-5 w-5" />}>
                      Ask An Expert
                    </MenuLink>
                    <MenuLink to="/how-it-works" icon={<Info className="h-5 w-5" />}>
                      How It Works
                    </MenuLink>
                  </div>

                  {/* Services Section */}
                  <div className="border-t border-white/10 my-4" />
                  <p className="px-4 text-[11px] uppercase tracking-widest text-primary-foreground/40 font-semibold mb-2">Services</p>
                  <div className="space-y-0.5">
                    {categories.map((cat) => (
                      <SheetClose asChild key={cat.slug}>
                        <Link
                          to={`/services/${cat.slug}`}
                          className="flex items-center justify-between py-2.5 px-4 text-primary-foreground/80 hover:text-primary hover:bg-white/5 text-sm transition-all duration-200 rounded-lg group"
                        >
                          <span className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary-foreground/40 group-hover:text-primary transition-colors" />
                            {cat.name}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/30 group-hover:text-primary transition-colors" />
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  {user && (
                    <>
                      <div className="border-t border-white/10 my-4" />
                      
                      <div className="space-y-1">
                        <MenuLink to={getDashboardLink()} icon={getDashboardIcon()}>
                          {getDashboardLabel()}
                        </MenuLink>

                        <MenuLink to="/settings/notifications" icon={<Settings className="h-5 w-5" />}>
                          Settings
                        </MenuLink>
                      </div>

                      <div className="border-t border-white/10 my-4" />
                      
                      <SheetClose asChild>
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-3 py-3.5 px-4 text-destructive hover:bg-destructive/10 text-sm font-medium tracking-wide transition-all duration-200 rounded-lg w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Log Out</span>
                        </button>
                      </SheetClose>
                    </>
                  )}

                  {!user && (
                    <>
                      <div className="border-t border-white/10 my-4" />
                      
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <Button variant="ghost" size="lg" className="w-full h-12 border border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
                            <Link to="/auth">Log In</Link>
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button variant="hero" size="lg" className="w-full h-12" asChild>
                            <Link to="/auth?type=provider">Free Contractor Sign Up</Link>
                          </Button>
                        </SheetClose>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-primary-foreground hover:bg-white/10 active:bg-white/20 transition-colors" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
