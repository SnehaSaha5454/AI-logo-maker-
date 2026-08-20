import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Download, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  Copy, 
  CheckCheck, 
  Lightbulb, 
  Layers, 
  Palette, 
  FileText, 
  Wand2,
  RotateCcw
} from "lucide-react";
import { colorOptions, logoStyles, designIdeas, type LogoHistoryItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface LogoWizardProps {
  onLogoGenerated: (logo: LogoHistoryItem) => void;
  userId: string;
}

const GENERATION_STAGES = [
  "Synthesizing creative prompt & branding context...",
  "Querying Pollinations AI neural image engine...",
  "Rendering minimalist vector shapes & color gradients...",
  "Applying typography aesthetics & finalizing high-res logo...",
];

export function LogoWizard({ onLogoGenerated, userId }: LogoWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [logoName, setLogoName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedDesignIdea, setSelectedDesignIdea] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [lastPrompt, setLastPrompt] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const { toast } = useToast();

  const steps = [
    { number: 1, title: "Name", subtitle: "Brand title" },
    { number: 2, title: "Vision", subtitle: "Description" },
    { number: 3, title: "Colors", subtitle: "Color theme" },
    { number: 4, title: "Style", subtitle: "Archetype" },
    { number: 5, title: "Idea", subtitle: "Core concept" },
    { number: 6, title: "Studio", subtitle: "Generate" },
  ];

  // Rotate loading stage messages during generation
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStageIndex((prev) => (prev + 1) % GENERATION_STAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return logoName.trim().length > 0;
      case 2: return description.trim().length >= 10;
      case 3: return selectedColor !== "";
      case 4: return selectedStyle !== "";
      case 5: return selectedDesignIdea !== "";
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Please complete this step",
        description: currentStep === 2 
          ? "Please provide at least 10 characters for your description." 
          : "Select or fill in the required option to proceed.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const buildPrompt = () => {
    const colorName = colorOptions.find((c) => c.value === selectedColor)?.name || selectedColor;
    const styleName = logoStyles.find((s) => s.id === selectedStyle)?.name || selectedStyle;
    const ideaName = designIdeas.find((d) => d.id === selectedDesignIdea)?.name || selectedDesignIdea;

    return `Professional logo design for "${logoName}". ${description}. Color scheme: ${colorName}. Style: ${styleName}. Design concept: ${ideaName}. High quality, clean, modern, professional logo design.`;
  };

  const handleGenerate = async () => {
    const prompt = buildPrompt();
    setLastPrompt(prompt);
    await generateLogo(prompt);
  };

  const handleRegenerate = async () => {
    if (lastPrompt) {
      await generateLogo(lastPrompt);
    } else {
      handleGenerate();
    }
  };

  const handleReset = () => {
    setGeneratedImage("");
    setCurrentStep(1);
  };

  const generateLogo = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/generate-logo", { prompt });
      const data = (await response.json()) as { imageUrl: string };
      setGeneratedImage(data.imageUrl);

      const newLogo: LogoHistoryItem = {
        id: crypto.randomUUID(),
        userId,
        imageUrl: data.imageUrl,
        prompt,
        name: logoName,
        description,
        color: selectedColor,
        style: selectedStyle,
        designIdea: selectedDesignIdea,
        createdAt: new Date().toISOString(),
      };

      onLogoGenerated(newLogo);

      toast({
        title: "✨ Logo generated successfully!",
        description: "Your custom logo is ready to download in high-resolution.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `${logoName.replace(/\s+/g, "_")}_logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download initiated",
      description: `Saved ${logoName}_logo.png to your downloads.`,
    });
  };

  const handleCopyPrompt = () => {
    const promptToCopy = lastPrompt || buildPrompt();
    navigator.clipboard.writeText(promptToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    toast({
      title: "Prompt copied to clipboard",
      description: "You can reuse or save this prompt anytime.",
    });
  };

  const quickNameSuggestions = ["Solaris Tech", "BharatPay", "Bloom & Co", "Nexus AI", "GreenSprout"];
  const quickDescriptionIdeas = [
    "A modern fintech startup focused on fast, secure digital payments with minimalist geometric geometry.",
    "An eco-friendly organic food and wellness brand inspired by fresh natural botanicals and subtle warmth.",
    "A next-gen AI automation company with sleek sharp lines and futuristic minimalism.",
  ];

  return (
    <div id="wizard-section" className="space-y-6">
      
      {/* Modern Stepper Indicator */}
      <div className="w-full max-w-4xl mx-auto px-2">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-border -z-0 hidden sm:block" />
          {/* Active Progress Line */}
          <div
            className="absolute left-6 top-5 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500 -z-0 hidden sm:block"
            style={{
              width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 92}%`,
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => {
                  if (step.number < currentStep) {
                    setCurrentStep(step.number);
                  }
                }}
                disabled={step.number > currentStep}
                className={`flex flex-col items-center group relative z-10 transition-all ${
                  step.number <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                }`}
                data-testid={`step-indicator-${step.number}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? "gradient-saffron-pink text-white shadow-sm ring-4 ring-orange-500/15"
                      : isCurrent
                      ? "bg-card text-orange-600 border-2 border-orange-500 shadow-md ring-4 ring-orange-500/20 scale-110"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div className="text-center mt-2 hidden md:block">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-foreground" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{step.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Card */}
      <Card className="rounded-2xl shadow-xl shadow-orange-500/5 glass-card p-6 sm:p-10 max-w-4xl mx-auto min-h-[520px] flex flex-col justify-between border border-border/80 relative">
        <div className="flex-1">
          
          {/* STEP 1: Logo Name */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 mb-1">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Step 1 of 5
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  What is your brand or logo name?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter the title of your business, startup, app, or project.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Label htmlFor="logo-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Brand Name / Title
                </Label>
                <div className="relative">
                  <Input
                    id="logo-name"
                    value={logoName}
                    onChange={(e) => setLogoName(e.target.value)}
                    placeholder="e.g., Nexus AI, BharatPay, Bloom Studio"
                    className="h-14 text-lg font-semibold pl-4 pr-12 rounded-xl bg-card border-border shadow-xs focus-visible:ring-primary"
                    data-testid="input-logo-name"
                    autoFocus
                  />
                  {logoName && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      {logoName.length} chars
                    </div>
                  )}
                </div>
              </div>

              {/* Quick suggestion chips */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Need inspiration? Click a sample name:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickNameSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setLogoName(suggestion)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-orange-500/10 hover:text-orange-600 border border-border/80 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 mb-1">
                  <FileText className="w-3 h-3 text-orange-500" />
                  Step 2 of 5
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Describe your logo vision
                </h2>
                <p className="text-sm text-muted-foreground">
                  Share themes, industry keywords, and the mood or aesthetic you want to convey.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Brand Description & Vision
                  </Label>
                  <span
                    className={`text-xs font-medium ${
                      description.trim().length >= 10 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {description.length} / 10 min characters
                  </span>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A modern tech company focused on AI innovation and cloud computing. We want a sleek, futuristic yet clean aesthetic..."
                  className="min-h-32 text-sm leading-relaxed p-4 rounded-xl bg-card border-border shadow-xs focus-visible:ring-primary"
                  data-testid="input-description"
                  autoFocus
                />
              </div>

              {/* Starter inspiration cards */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Quick starter prompts (click to apply):
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {quickDescriptionIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDescription(idea)}
                      className="text-left p-2.5 rounded-xl text-xs bg-muted/60 hover:bg-orange-500/10 hover:border-orange-500/30 border border-border/60 transition-all text-muted-foreground hover:text-foreground"
                    >
                      "{idea}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Color Palette */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 mb-1">
                  <Palette className="w-3 h-3 text-orange-500" />
                  Step 3 of 5
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Choose your color palette
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select the primary color theme that best represents your brand emotional tone.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 pt-2">
                {colorOptions.map((color) => {
                  const isSelected = selectedColor === color.value;
                  const colorTraits: Record<string, string> = {
                    blue: "Trust & Tech",
                    gold: "Luxury & Wealth",
                    green: "Eco & Growth",
                    red: "Bold & Passion",
                    black: "Sleek & Modern",
                  };

                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/5 shadow-md ring-4 ring-orange-500/15 scale-[1.02]"
                          : "border-border/80 bg-card hover:border-orange-500/40 hover:shadow-xs"
                      }`}
                      data-testid={`color-${color.value}`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-saffron-pink text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <div
                        className="w-14 h-14 rounded-xl shadow-inner mb-3 border border-black/10 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm font-bold text-foreground">{color.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono mt-0.5">{color.hex}</span>
                      <span className="text-[10px] text-orange-600/80 font-medium mt-1">
                        {colorTraits[color.value] || "Custom"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Logo Style */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 mb-1">
                  <Layers className="w-3 h-3 text-orange-500" />
                  Step 4 of 5
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Choose your design archetype
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a stylistic direction for how your vector logo should look and feel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
                {logoStyles.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/5 shadow-sm ring-2 ring-orange-500/15"
                          : "border-border/80 bg-card hover:border-orange-500/40 hover:shadow-xs"
                      }`}
                      data-testid={`style-${style.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-sm text-foreground">{style.name}</h3>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full gradient-saffron-pink text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{style.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Design Idea */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 mb-1">
                  <Lightbulb className="w-3 h-3 text-orange-500" />
                  Step 5 of 5
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Select your core motif or idea
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose a central visual symbol or let AI synthesize the optimal concept.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {designIdeas.map((idea) => {
                  const isSelected = selectedDesignIdea === idea.id;
                  const isAIChoice = idea.id === "ai-choice";

                  return (
                    <button
                      key={idea.id}
                      type="button"
                      onClick={() => setSelectedDesignIdea(idea.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3 ${
                        isAIChoice
                          ? isSelected
                            ? "border-orange-500 gradient-saffron-pink text-white shadow-md ring-4 ring-orange-500/20"
                            : "border-orange-300 bg-orange-500/10 text-foreground hover:bg-orange-500/15"
                          : isSelected
                          ? "border-orange-500 bg-orange-500/5 shadow-sm ring-2 ring-orange-500/15"
                          : "border-border/80 bg-card hover:border-orange-500/40 hover:shadow-xs"
                      }`}
                      data-testid={`idea-${idea.id}`}
                    >
                      {/* Radio Dot */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? isAIChoice
                              ? "border-white bg-white text-orange-600"
                              : "border-orange-500 bg-orange-500 text-white"
                            : "border-muted-foreground/40 bg-card"
                        }`}
                      >
                        {isSelected && <div className={`w-2 h-2 rounded-full ${isAIChoice ? "bg-orange-600" : "bg-white"}`} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-bold text-sm ${
                              isAIChoice && isSelected ? "text-white" : "text-foreground"
                            }`}
                          >
                            {idea.name}
                          </h3>
                          {isAIChoice && (
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isSelected ? "bg-white/20 text-white" : "bg-orange-500 text-white"
                              }`}
                            >
                              Recommended
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            isAIChoice && isSelected ? "text-white/90" : "text-muted-foreground"
                          }`}
                        >
                          {idea.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Studio / Generate & Results */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in text-center">
              
              {/* Ready State / Pre-generation Summary */}
              {!generatedImage && !isGenerating && (
                <div className="space-y-6 max-w-xl mx-auto py-4">
                  <div className="space-y-2">
                    <div className="w-14 h-14 rounded-2xl gradient-saffron-pink mx-auto flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-2">
                      <Wand2 className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      Ready to synthesize your logo
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Review your customized parameters before unleashing neural generation.
                    </p>
                  </div>

                  {/* Summary Parameter Pill Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-muted/60 border border-border/80 text-left text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Logo Name</span>
                      <p className="font-bold text-foreground truncate">{logoName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Color Theme</span>
                      <p className="font-bold text-foreground capitalize">{selectedColor || "Auto"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Archetype</span>
                      <p className="font-bold text-foreground capitalize">
                        {logoStyles.find((s) => s.id === selectedStyle)?.name || selectedStyle}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Design Idea</span>
                      <p className="font-bold text-foreground truncate">
                        {designIdeas.find((d) => d.id === selectedDesignIdea)?.name || selectedDesignIdea}
                      </p>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleGenerate}
                      size="lg"
                      className="w-full sm:w-auto h-14 px-10 text-base font-bold gradient-saffron-pink text-white shadow-xl shadow-orange-500/25 hover:opacity-95 transition-all rounded-xl gap-2.5"
                      data-testid="button-generate"
                    >
                      <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                      <span>Generate AI Logo Now</span>
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Zero cost • Powered by Pollinations AI • High-Res PNG
                    </p>
                  </div>
                </div>
              )}

              {/* Generating Loader State */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 max-w-md mx-auto">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full gradient-saffron-pink/20 animate-ping absolute inset-0" />
                    <div className="w-20 h-20 rounded-2xl gradient-saffron-pink flex items-center justify-center text-white shadow-xl shadow-orange-500/30 relative z-10">
                      <Loader2 className="w-9 h-9 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Designing your logo...
                    </h3>
                    <p className="text-xs font-medium text-orange-600 min-h-[20px] transition-all">
                      {GENERATION_STAGES[loadingStageIndex]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      This usually takes between 3 to 10 seconds.
                    </p>
                  </div>
                </div>
              )}

              {/* Result State */}
              {generatedImage && !isGenerating && (
                <div className="space-y-6 max-w-lg mx-auto animate-fade-in">
                  
                  {/* Generated Image Showcase Card */}
                  <div className="relative group rounded-2xl overflow-hidden bg-card border-2 border-orange-500/30 shadow-2xl p-4">
                    <div className="aspect-square w-full max-w-[340px] mx-auto rounded-xl overflow-hidden bg-white/95 shadow-inner flex items-center justify-center">
                      <img
                        src={generatedImage}
                        alt={`Generated logo for ${logoName}`}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                        data-testid="img-generated-logo"
                      />
                    </div>
                    
                    {/* Header badge */}
                    <div className="absolute top-6 left-6 px-3 py-1 rounded-full text-[11px] font-bold gradient-saffron-pink text-white shadow-md">
                      ✨ Logo Ready
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      onClick={handleDownload}
                      className="h-12 px-6 font-bold gradient-saffron-pink text-white shadow-md shadow-orange-500/20 hover:opacity-95 rounded-xl gap-2"
                      data-testid="button-download"
                    >
                      <Download className="w-4 h-4" />
                      Download High-Res PNG
                    </Button>

                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      className="h-12 px-5 font-semibold border-border hover:bg-muted rounded-xl gap-2"
                      disabled={isGenerating}
                      data-testid="button-regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </Button>

                    <Button
                      onClick={handleCopyPrompt}
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground"
                      title="Copy full AI prompt"
                    >
                      {copiedPrompt ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="h-12 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Create Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation (Steps 1 to 5) */}
        {currentStep < 6 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/80">
            <Button
              type="button"
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 1}
              className="h-11 px-5 gap-1.5 rounded-xl text-xs font-bold border-border"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-xs text-muted-foreground font-medium hidden sm:block">
              Step {currentStep} of 5
            </div>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-11 px-6 gap-1.5 gradient-saffron-pink text-white font-bold shadow-md shadow-orange-500/20 hover:opacity-95 rounded-xl text-xs"
              data-testid="button-continue"
            >
              <span>{currentStep === 5 ? "Go to Studio" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
