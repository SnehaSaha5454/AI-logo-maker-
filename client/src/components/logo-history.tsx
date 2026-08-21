import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  RefreshCw,
  Download,
  Sparkles,
  Search,
  Copy,
  CheckCheck,
  Wand2,
  Calendar,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LogoHistoryItem } from "@shared/schema";

interface LogoHistoryProps {
  history: LogoHistoryItem[];
  onRegenerate: (logo: LogoHistoryItem) => void;
  onDelete?: (logoId: string | number) => void;
  onDeleteAll?: () => void;
  userId: string | number;
  isLoading?: boolean;
}

export function LogoHistory({
  history,
  onRegenerate,
  onDelete,
  onDeleteAll,
  userId,
  isLoading = false,
}: LogoHistoryProps) {
  const { toast } = useToast();
  const [regeneratingId, setRegeneratingId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Deletion dialog states
  const [logoToDelete, setLogoToDelete] = useState<LogoHistoryItem | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(q) ||
        (item.style || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.color || "").toLowerCase().includes(q) ||
        (item.designIdea || "").toLowerCase().includes(q) ||
        (item.prompt || "").toLowerCase().includes(q)
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
      description: "AI prompt copied to clipboard.",
    });
  };

  const handleRegenerate = async (item: LogoHistoryItem) => {
    setRegeneratingId(item.id);
    try {
      const response = await apiRequest("POST", "/api/generate-logo", {
        prompt: item.prompt,
        name: item.name,
        description: item.description,
        color: item.color,
        style: item.style,
        designIdea: item.designIdea,
        userId,
      });
      const data = (await response.json()) as { imageUrl: string; logo?: LogoHistoryItem };

      const newLogo: LogoHistoryItem = data.logo || {
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
        description: "A fresh variation has been saved to your database gallery.",
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

  const confirmDeleteSingle = () => {
    if (!logoToDelete) return;
    if (onDelete) {
      onDelete(logoToDelete.id);
    }
    toast({
      title: "Logo deleted",
      description: `"${logoToDelete.name}" has been removed from your gallery.`,
    });
    setLogoToDelete(null);
  };

  const confirmDeleteAll = () => {
    if (onDeleteAll) {
      onDeleteAll();
    }
    toast({
      title: "Gallery cleared",
      description: "All logos have been deleted from your history.",
    });
    setIsDeleteAllOpen(false);
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "Recently created";
    try {
      const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently created";
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div id="history-section" className="space-y-6 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-44 bg-muted/80 rounded-lg" />
              <div className="h-5 w-20 bg-muted/60 rounded-full" />
            </div>
            <div className="h-4 w-64 bg-muted/40 rounded" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-52 bg-muted/60 rounded-xl" />
            <div className="h-9 w-24 bg-muted/60 rounded-xl" />
          </div>
        </div>

        {/* Skeleton Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <Card
              key={idx}
              className="rounded-2xl glass-card border border-border/80 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Image Placeholder */}
                <div className="aspect-square bg-muted/30 p-4 flex items-center justify-center border-b border-border/60">
                  <div className="w-16 h-16 rounded-2xl bg-muted/60" />
                </div>
                {/* Text Placeholder */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-32 bg-muted/70 rounded" />
                    <div className="h-3 w-16 bg-muted/40 rounded" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-muted/50 rounded" />
                    <div className="h-3 w-3/4 bg-muted/40 rounded" />
                  </div>
                </div>
              </div>

              {/* Action Buttons Placeholder */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <div className="h-9 flex-1 bg-muted/70 rounded-xl" />
                <div className="h-9 w-16 bg-muted/50 rounded-xl" />
                <div className="h-9 w-9 bg-muted/40 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty Gallery State (only shown when not loading and history is empty)
  if (history.length === 0) {
    return (
      <div id="history-section" className="text-center py-12 px-4 animate-fade-in">
        <Card className="max-w-xl mx-auto p-8 sm:p-10 glass-card rounded-3xl border border-dashed border-border/80 text-center space-y-6 shadow-sm">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-2xl gradient-saffron-pink/20 blur-xl" />
            <div className="relative w-16 h-16 rounded-2xl gradient-saffron-pink flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Your Logo Gallery is Empty
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Logos you synthesize will be automatically saved here. Complete the 6-step guided wizard above to start creating your collection.
            </p>
          </div>

          {/* Quick tips list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
            <div className="p-3 rounded-xl bg-muted/60 border border-border/60 text-xs">
              <span className="font-bold text-foreground block mb-0.5">1. Pick Archetype</span>
              <span className="text-[11px] text-muted-foreground">Minimalist, vintage, mascot, line art & more.</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/60 border border-border/60 text-xs">
              <span className="font-bold text-foreground block mb-0.5">2. Color Harmonies</span>
              <span className="text-[11px] text-muted-foreground">Custom tailored brand palettes & emotion tags.</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/60 border border-border/60 text-xs">
              <span className="font-bold text-foreground block mb-0.5">3. Export Assets</span>
              <span className="text-[11px] text-muted-foreground">High-res PNG downloads with prompt history.</span>
            </div>
          </div>

          <div className="pt-2">
            <a href="#wizard-section">
              <Button className="h-11 px-8 text-xs font-bold gradient-saffron-pink text-white shadow-md shadow-orange-500/20 hover:opacity-95 rounded-xl gap-2">
                <Wand2 className="w-4 h-4" />
                Launch 6-Step Wizard
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
            <h2
              className="text-2xl font-bold tracking-tight text-foreground"
              data-testid="text-history-title"
            >
              Your Logo Gallery
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              {history.length} {history.length === 1 ? "design" : "designs"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse, manage, re-generate, and download your brand logos.
          </p>
        </div>

        {/* Right Action Bar: Search & Delete All */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Gallery Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name, style, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs rounded-xl bg-card border-border shadow-xs focus-visible:ring-primary"
              data-testid="input-search-logos"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Delete All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteAllOpen(true)}
            className="h-9 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all gap-1.5 shrink-0"
            data-testid="button-delete-all-history"
            title="Delete all logos from gallery"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        </div>
      </div>

      {/* Grid of Logo Cards */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            No logos match "{searchQuery}"
          </p>
          <p className="text-xs text-muted-foreground">
            Try searching by another brand name, style keyword, or description phrase.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-8 px-4 text-xs font-semibold rounded-lg"
          >
            Clear Search
          </Button>
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

                  {/* Floating Style / Color Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                    {item.style && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-card/90 backdrop-blur-sm text-foreground shadow-xs border border-border/60 capitalize">
                        {item.style.replace("-", " ")}
                      </span>
                    )}
                    {item.color && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-card/90 backdrop-blur-sm text-foreground shadow-xs border border-border/60 capitalize">
                        {item.color}
                      </span>
                    )}
                  </div>

                  {/* 3-Dot Overflow Menu (Top Right) */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border/60 text-muted-foreground hover:text-foreground shadow-xs"
                          data-testid={`menu-trigger-${item.id}`}
                          aria-label="Logo options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs">
                        <DropdownMenuItem
                          onClick={() => handleDownload(item)}
                          className="cursor-pointer gap-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRegenerate(item)}
                          className="cursor-pointer gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Regenerate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopyPrompt(item)}
                          className="cursor-pointer gap-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Prompt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setLogoToDelete(item)}
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                          data-testid={`menu-delete-${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Logo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground truncate">
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p
                    className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                    title={item.prompt}
                  >
                    {item.prompt}
                  </p>
                </div>
              </div>

              {/* Card Bottom Quick Actions */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <Button
                  onClick={() => handleDownload(item)}
                  variant="default"
                  size="sm"
                  className="flex-1 h-9 rounded-xl text-xs font-bold gradient-saffron-pink text-white shadow-xs hover:opacity-95 gap-1.5 btn-press"
                  data-testid={`button-download-history-${item.id}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>

                <Button
                  onClick={() => handleRegenerate(item)}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-xl text-xs font-semibold border-border hover:bg-muted gap-1.5 btn-press"
                  disabled={regeneratingId === item.id}
                  data-testid={`button-regenerate-history-${item.id}`}
                  title="Generate a new variation"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      regeneratingId === item.id ? "animate-spin" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {regeneratingId === item.id ? "..." : "Vary"}
                  </span>
                </Button>

                <Button
                  onClick={() => handleCopyPrompt(item)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground btn-press"
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

      {/* Confirmation Dialog: Delete Single Logo */}
      <AlertDialog
        open={Boolean(logoToDelete)}
        onOpenChange={(open) => !open && setLogoToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              Delete Logo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{logoToDelete?.name}"
              </span>{" "}
              from your gallery? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSingle}
              className="rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-single"
            >
              Delete Logo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog: Delete All Logos */}
      <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-destructive">
              Clear Entire Gallery
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete all{" "}
              <span className="font-bold text-foreground">
                {history.length}
              </span>{" "}
              saved logos from your gallery? All generated images and prompts in
              this session will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAll}
              className="rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-all"
            >
              Delete All Logos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
