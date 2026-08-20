import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Sparkles, Search, Copy, CheckCheck, Wand2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LogoHistoryItem } from "@shared/schema";

interface LogoHistoryProps {
  history: LogoHistoryItem[];
  onRegenerate: (logo: LogoHistoryItem) => void;
  userId: string;
}

export function LogoHistory({ history, onRegenerate, userId }: LogoHistoryProps) {
  const { toast } = useToast();
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.style.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const handleDownload = (item: LogoHistoryItem) => {
    const link = document.createElement("a");
    link.href = item.imageUrl;
    link.download = `${item.name.replace(/\s+/g, "_")}_logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: `Downloading ${item.name}_logo.png`,
    });
  };

  const handleCopyPrompt = (item: LogoHistoryItem) => {
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Prompt copied",
      description: "AI prompt copied to your clipboard.",
    });
  };

  const handleRegenerate = async (item: LogoHistoryItem) => {
    setRegeneratingId(item.id);
    try {
      const response = await apiRequest("POST", "/api/generate-logo", { 
        prompt: item.prompt 
      });
      const data = (await response.json()) as { imageUrl: string };

      const newLogo: LogoHistoryItem = {
        id: crypto.randomUUID(),
        userId,
        imageUrl: data.imageUrl,
        prompt: item.prompt,
        name: item.name,
        description: item.description,
        color: item.color,
        style: item.style,
        designIdea: item.designIdea,
        createdAt: new Date().toISOString(),
      };

      onRegenerate(newLogo);

      toast({
        title: "✨ Logo regenerated!",
        description: "A fresh variation has been added to your studio collection.",
      });
    } catch (error) {
      toast({
        title: "Regeneration failed",
        description: error instanceof Error ? error.message : "Failed to regenerate logo",
        variant: "destructive",
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently created";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently created";
    }
  };

  if (history.length === 0) {
    return (
      <div id="history-section" className="text-center py-16 px-4">
        <Card className="max-w-lg mx-auto p-10 glass-card rounded-3xl border border-dashed border-border text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-saffron-pink flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Your gallery is empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              No logos generated yet. Complete the 5-step wizard above to unleash AI neural synthesis and build your brand identity.
            </p>
          </div>
          <div>
            <a href="#wizard-section">
              <Button className="h-11 px-6 text-xs font-bold gradient-saffron-pink text-white shadow-md shadow-orange-500/20 rounded-xl gap-2">
                <Wand2 className="w-4 h-4" />
                Create Your First Logo
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div id="history-section" className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-history-title">
              Your Logo Gallery
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20">
              {history.length} {history.length === 1 ? "design" : "designs"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse, re-synthesize, and download your previous brand logos.
          </p>
        </div>

        {/* Search Bar */}
        {history.length > 2 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by name, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3 text-xs rounded-xl bg-card border-border shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Grid of Logo Cards */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs">
          No logos match "{searchQuery}". Try a different keyword.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl glass-card border border-border/80 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
              data-testid={`history-card-${item.id}`}
            >
              <div>
                {/* Logo Image Preview Frame */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-b from-muted/30 to-muted/80 p-4 flex items-center justify-center border-b border-border/60">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    data-testid={`img-history-${item.id}`}
                  />

                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                    {item.style && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-sm text-foreground shadow-xs border border-black/5 capitalize">
                        {item.style.replace("-", " ")}
                      </span>
                    )}
                    {item.color && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-sm text-foreground shadow-xs border border-black/5 capitalize">
                        {item.color}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground truncate">{item.name}</h3>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" title={item.prompt}>
                    {item.prompt}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <Button
                  onClick={() => handleDownload(item)}
                  variant="default"
                  size="sm"
                  className="flex-1 h-9 rounded-xl text-xs font-bold gradient-saffron-pink text-white shadow-xs hover:opacity-95 gap-1.5"
                  data-testid={`button-download-history-${item.id}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>

                <Button
                  onClick={() => handleRegenerate(item)}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-xl text-xs font-semibold border-border hover:bg-muted gap-1.5"
                  disabled={regeneratingId === item.id}
                  data-testid={`button-regenerate-history-${item.id}`}
                  title="Generate a new variation"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === item.id ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">{regeneratingId === item.id ? "..." : "Vary"}</span>
                </Button>

                <Button
                  onClick={() => handleCopyPrompt(item)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                  title="Copy Prompt"
                >
                  {copiedId === item.id ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
