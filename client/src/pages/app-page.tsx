import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { User, LogoHistoryItem } from "@shared/schema";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LogoWizard } from "@/components/logo-wizard";
import { LogoHistory } from "@/components/logo-history";
import { Sparkles, Wand2, ShieldCheck, Zap } from "lucide-react";

export default function AppPage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logoHistory, setLogoHistory] = useState<LogoHistoryItem[]>([]);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) {
      setLocation("/");
      return;
    }
    
    const user: User = JSON.parse(userJson);
    setCurrentUser(user);

    // Load logo history
    const historyJson = localStorage.getItem(`logoHistory_${user.id}`);
    if (historyJson) {
      try {
        setLogoHistory(JSON.parse(historyJson));
      } catch {
        setLogoHistory([]);
      }
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setLocation("/");
  };

  const handleLogoGenerated = (newLogo: LogoHistoryItem) => {
    if (!currentUser) return;

    const updatedHistory = [newLogo, ...logoHistory];
    setLogoHistory(updatedHistory);
    localStorage.setItem(`logoHistory_${currentUser.id}`, JSON.stringify(updatedHistory));
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background bg-mesh-pattern flex flex-col selection:bg-orange-500/20">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        historyCount={logoHistory.length}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Modern Welcome Hero Card */}
        <section className="relative rounded-3xl overflow-hidden glass-card border border-border/80 p-6 sm:p-8 shadow-sm">
          {/* Subtle gradient orb behind welcome */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 border border-orange-500/20">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>AI Logo Maker v2.0 • Studio Ready</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground"
                data-testid="text-welcome"
              >
                Welcome, {currentUser.username} 👋 <span className="gradient-text-saffron-pink">Let's craft your dream logo!</span>
              </h1>

              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Follow our streamlined 5-step guided wizard to synthesize distinct, high-resolution logos for your business, startup, or product.
              </p>
            </div>

            {/* Quick Stat Chips */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xs text-xs font-semibold">
                <div className="w-6 h-6 rounded-lg gradient-saffron-pink text-white flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-foreground">{logoHistory.length}</span>
                  <span className="text-muted-foreground ml-1">Logos Created</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xs text-xs font-semibold">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-emerald-600 font-bold">Neural Engine</span>
                  <span className="text-muted-foreground ml-1">Online</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Wizard Studio */}
        <section>
          <LogoWizard
            onLogoGenerated={handleLogoGenerated}
            userId={currentUser.id}
          />
        </section>

        {/* Gallery / History */}
        <section className="pt-6">
          <LogoHistory
            history={logoHistory}
            onRegenerate={handleLogoGenerated}
            userId={currentUser.id}
          />
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
