import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import type { User, LogoHistoryItem } from "@shared/schema";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LogoWizard } from "@/components/logo-wizard";
import { LogoHistory } from "@/components/logo-history";
import { Sparkles, Wand2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AppPage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logoHistory, setLogoHistory] = useState<LogoHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { toast } = useToast();

  const fetchUserLogos = useCallback(async (userId: number | string) => {
    if (!userId || userId === "undefined") return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/logos?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLogoHistory(data);
      }
    } catch (error) {
      console.error("Failed to load logos from database:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) {
      setLocation("/");
      return;
    }
    
    try {
      const user: User = JSON.parse(userJson);
      setCurrentUser(user);
      fetchUserLogos(user.id);
    } catch {
      localStorage.removeItem("currentUser");
      setLocation("/");
    }
  }, [setLocation, fetchUserLogos]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setLocation("/");
  };

  const handleLogoGenerated = (newLogo: LogoHistoryItem) => {
    if (!currentUser) return;
    setLogoHistory((prev) => [newLogo, ...prev]);
  };

  const handleLogoDeleted = async (logoId: string | number) => {
    if (!currentUser) return;

    // Optimistic UI update
    setLogoHistory((prev) => prev.filter((item) => String(item.id) !== String(logoId)));

    try {
      const response = await fetch(`/api/logos/${logoId}?userId=${currentUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete logo from database");
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete from database",
        variant: "destructive",
      });
      // Re-fetch to synchronize state
      fetchUserLogos(currentUser.id);
    }
  };

  const handleAllLogosDeleted = async () => {
    if (!currentUser) return;

    // Optimistic UI update
    setLogoHistory([]);

    try {
      const response = await fetch(`/api/logos?userId=${currentUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear database gallery");
      }
    } catch (error) {
      toast({
        title: "Clear failed",
        description: error instanceof Error ? error.message : "Failed to clear gallery",
        variant: "destructive",
      });
      fetchUserLogos(currentUser.id);
    }
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
        historyCount={isLoadingHistory ? 0 : logoHistory.length}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Modern Welcome Hero Card */}
        <section className="relative rounded-3xl overflow-hidden glass-card border border-border/80 p-6 sm:p-8 shadow-sm">
          {/* Subtle gradient orb behind welcome */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>AI Logo Studio</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground"
                data-testid="text-welcome"
              >
                Welcome, {currentUser.username} 👋 <span className="gradient-text-saffron-pink">Let's craft your logo!</span>
              </h1>

              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Follow our 6-step guided wizard to create customized, high-resolution logos for your business, startup, or product.
              </p>
            </div>

            {/* Quick Stat Chips */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xs text-xs font-semibold">
                <div className="w-6 h-6 rounded-lg gradient-saffron-pink text-white flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  {isLoadingHistory ? (
                    <span className="inline-block w-4 h-3.5 bg-muted-foreground/30 rounded animate-pulse align-middle mr-0.5" />
                  ) : (
                    <span className="text-foreground">{logoHistory.length}</span>
                  )}
                  <span className="text-muted-foreground ml-1">Logos Saved</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xs text-xs font-semibold">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-emerald-600 font-bold">PostgreSQL DB</span>
                  <span className="text-muted-foreground ml-1">Connected</span>
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
            onDelete={handleLogoDeleted}
            onDeleteAll={handleAllLogosDeleted}
            userId={currentUser.id}
            isLoading={isLoadingHistory}
          />
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
