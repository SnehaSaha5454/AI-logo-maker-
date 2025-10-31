import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { User, LogoHistoryItem } from "@shared/schema";
import { LogoWizard } from "@/components/logo-wizard";
import { LogoHistory } from "@/components/logo-history";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
      setLogoHistory(JSON.parse(historyJson));
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text-saffron-pink">
              Indian AI Logo Maker
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="p-6 rounded-2xl gradient-saffron-pink text-white mb-8">
          <h2 className="text-xl font-semibold" data-testid="text-welcome">
            Welcome, {currentUser.username} 👋 Let's craft your dream logo!
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <LogoWizard onLogoGenerated={handleLogoGenerated} userId={currentUser.id} />
        
        {/* Logo History */}
        <div className="mt-16">
          <LogoHistory history={logoHistory} onRegenerate={handleLogoGenerated} userId={currentUser.id} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Indian AI Logo Maker | Made with ❤️ in India
          </p>
        </div>
      </footer>
    </div>
  );
}
