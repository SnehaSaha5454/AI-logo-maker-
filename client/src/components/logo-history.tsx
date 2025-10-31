import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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

  const handleDownload = (item: LogoHistoryItem) => {
    const link = document.createElement("a");
    link.href = item.imageUrl;
    link.download = `${item.name.replace(/\s+/g, "_")}_logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your logo is being downloaded",
    });
  };

  const handleRegenerate = async (item: LogoHistoryItem) => {
    setRegeneratingId(item.id);
    try {
      const response = await apiRequest<{ imageUrl: string }>("POST", "/api/generate-logo", { 
        prompt: item.prompt 
      });

      const newLogo: LogoHistoryItem = {
        id: crypto.randomUUID(),
        userId,
        imageUrl: response.imageUrl,
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
        title: "Logo regenerated!",
        description: "A new version has been created",
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

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">No logos yet</h3>
          <p className="text-muted-foreground">
            Your generated logos will appear here. Start creating your first logo using the wizard above!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" data-testid="text-history-title">
          Your Logo History
        </h2>
        <p className="text-muted-foreground">
          {history.length} {history.length === 1 ? "logo" : "logos"} generated
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <Card
            key={item.id}
            className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] animate-fade-in"
            data-testid={`history-card-${item.id}`}
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                data-testid={`img-history-${item.id}`}
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.prompt}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(item)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  data-testid={`button-download-history-${item.id}`}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={() => handleRegenerate(item)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  disabled={regeneratingId === item.id}
                  data-testid={`button-regenerate-history-${item.id}`}
                >
                  <RefreshCw className={`w-4 h-4 ${regeneratingId === item.id ? "animate-spin" : ""}`} />
                  {regeneratingId === item.id ? "..." : "Re-generate"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
