import { Sparkles, Heart, Zap, ShieldCheck, Palette, Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-saffron-pink flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold gradient-text-saffron-pink">
                LogoMind AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Empowering creators, entrepreneurs, and startups to design modern, distinct, and scalable logos powered by state-of-the-art AI.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                Where ideas become identities.
              </span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Neural Synthesis</span>
              </li>
              <li className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-pink-500" />
                <span>Curated Vector Color Harmonies</span>
              </li>
              <li className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span>9+ Modern Design Archetypes</span>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Highlights
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant PNG Downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Curated Design Styles</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Local Session History</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} LogoMind AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Friendly</span>
            <span>•</span>
            <span>No Cookies Tracked</span>
            <span>•</span>
            <span>Powered by Neural Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
