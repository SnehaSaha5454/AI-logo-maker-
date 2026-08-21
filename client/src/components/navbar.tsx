import { LogOut, Sparkles, Moon, Sun, Wand2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import type { User } from "@shared/schema";

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  historyCount?: number;
}

export function Navbar({ currentUser, onLogout, historyCount = 0 }: NavbarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-border/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-saffron-pink flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight gradient-text-saffron-pink">
              LogoMind AI
            </span>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              AI-Powered Logo Generator
            </p>
          </div>
        </div>

        {/* Center Quick Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
          <a
            href="#wizard-section"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-card hover:shadow-xs transition-all"
          >
            <Wand2 className="w-3.5 h-3.5 text-orange-500" />
            Studio
          </a>
          <a
            href="#history-section"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          >
            <History className="w-3.5 h-3.5 text-pink-500" />
            Gallery
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-white">
                {historyCount}
              </span>
            )}
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Theme Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all relative btn-press"
                aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
                data-testid="button-theme-toggle"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
                ) : (
                  <Moon className="w-4 h-4 text-foreground/80 animate-fade-in" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-semibold">
                {resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-muted/60 border border-border/60">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              {getInitials(currentUser.username)}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                {currentUser.username}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Active
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="h-9 px-3 gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all rounded-lg text-xs font-medium btn-press"
            data-testid="button-logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
