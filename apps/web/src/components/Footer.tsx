import { navigate } from "../App";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Kluje Ad Platform. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <button
              type="button"
              onClick={() => navigate("/about")}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
