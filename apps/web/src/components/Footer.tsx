import { navigate } from "../App";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-white">Platform</p>
            <nav className="mt-3 flex flex-col gap-2">
              <button type="button" onClick={() => navigate("/demo")} className="text-left text-sm text-slate-400 hover:text-white transition">Demo</button>
              <button type="button" onClick={() => navigate("/pricing")} className="text-left text-sm text-slate-400 hover:text-white transition">Pricing</button>
              <button type="button" onClick={() => navigate("/metrics")} className="text-left text-sm text-slate-400 hover:text-white transition">Metrics</button>
              <button type="button" onClick={() => navigate("/about")} className="text-left text-sm text-slate-400 hover:text-white transition">About Us</button>
            </nav>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Privacy</p>
            <nav className="mt-3 flex flex-col gap-2">
              <button type="button" onClick={() => navigate("/privacy")} className="text-left text-sm text-slate-400 hover:text-white transition">Privacy Policy</button>
              <button type="button" onClick={() => navigate("/privacy/request")} className="text-left text-sm text-slate-400 hover:text-white transition">Data Request</button>
              <button type="button" onClick={() => navigate("/privacy/preferences")} className="text-left text-sm text-slate-400 hover:text-white transition">Cookie Preferences</button>
              <button type="button" onClick={() => navigate("/privacy/do-not-sell")} className="text-left text-sm text-slate-400 hover:text-white transition">Do Not Sell</button>
            </nav>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Account</p>
            <nav className="mt-3 flex flex-col gap-2">
              <button type="button" onClick={() => navigate("/login")} className="text-left text-sm text-slate-400 hover:text-white transition">Sign In</button>
              <button type="button" onClick={() => navigate("/signup")} className="text-left text-sm text-slate-400 hover:text-white transition">Sign Up</button>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Kluje Ad Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
