import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mesh-pattern bg-dot-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-3xl border border-border/80 p-8 text-center space-y-6 shadow-xl shadow-orange-500/5">
        <div className="w-16 h-16 rounded-2xl gradient-saffron-pink mx-auto flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">404 Error</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Page Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page you are searching for does not exist, has been removed, or is temporarily unavailable.
          </p>
        </div>
        <div>
          <Link href="/">
            <Button className="h-11 px-6 text-xs font-bold gradient-saffron-pink text-white shadow-md shadow-orange-500/20 rounded-xl gap-2">
              <Home className="w-4 h-4" />
              Return to Studio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
