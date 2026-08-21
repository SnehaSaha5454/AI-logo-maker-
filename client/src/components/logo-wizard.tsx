import { useState, useEffect, useRef } from "react";
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
  RotateCcw,
  AlertCircle,
  Edit3,
  Sun,
  Moon,
  Grid,
  Clock,
  Pipette,
  SlidersHorizontal,
} from "lucide-react";
import { colorOptions, logoStyles, designIdeas, type LogoHistoryItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface LogoWizardProps {
  onLogoGenerated: (logo: LogoHistoryItem) => void;
  userId: string | number;
}

const GENERATION_STAGES = [
  "Analyzing brand identity & vision...",
  "Synthesizing vector logo prompt...",
  "Generating neural vectors with FLUX.1 [schnell]...",
  "Harmonizing color palette & geometry...",
  "Finalizing high-resolution logo render...",
];

const getStorageKey = (uid?: string | number) => `logo_wizard_draft_${uid || "guest"}`;

const getSavedDraft = (uid?: string | number) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey(uid));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read wizard draft:", err);
  }
  return null;
};

const clearSavedDraft = (uid?: string | number) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getStorageKey(uid));
  } catch (err) {
    console.warn("Failed to clear wizard draft:", err);
  }
};

export function LogoWizard({ onLogoGenerated, userId }: LogoWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const draft = getSavedDraft(userId);
    if (draft && typeof draft.currentStep === "number" && draft.currentStep >= 1 && draft.currentStep <= 6) {
      return draft.currentStep;
    }
    return 1;
  });
  const [logoName, setLogoName] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.logoName === "string" ? draft.logoName : "";
  });
  const [description, setDescription] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.description === "string" ? draft.description : "";
  });
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.selectedColor === "string" ? draft.selectedColor : "";
  });
  const [customColorDescription, setCustomColorDescription] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.customColorDescription === "string" ? draft.customColorDescription : "";
  });
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.customPrimaryColor === "string" ? draft.customPrimaryColor : "#2563EB";
  });
  const [customSecondaryColor, setCustomSecondaryColor] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.customSecondaryColor === "string" ? draft.customSecondaryColor : "#0F172A";
  });
  const [customAccentColor, setCustomAccentColor] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.customAccentColor === "string" ? draft.customAccentColor : "#38BDF8";
  });
  const [selectedStyle, setSelectedStyle] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.selectedStyle === "string" ? draft.selectedStyle : "";
  });
  const [selectedDesignIdea, setSelectedDesignIdea] = useState<string>(() => {
    const draft = getSavedDraft(userId);
    return draft && typeof draft.selectedDesignIdea === "string" ? draft.selectedDesignIdea : "";
  });
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastPrompt, setLastPrompt] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [previewBg, setPreviewBg] = useState<"light" | "dark" | "checkered">("light");
  const { toast } = useToast();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore saved draft when userId changes
  useEffect(() => {
    if (!userId) return;
    const draft = getSavedDraft(userId);
    if (draft) {
      if (typeof draft.currentStep === "number" && draft.currentStep >= 1 && draft.currentStep <= 6) {
        setCurrentStep(draft.currentStep);
      }
      if (typeof draft.logoName === "string") setLogoName(draft.logoName);
      if (typeof draft.description === "string") setDescription(draft.description);
      if (typeof draft.selectedColor === "string") setSelectedColor(draft.selectedColor);
      if (typeof draft.customColorDescription === "string") setCustomColorDescription(draft.customColorDescription);
      if (typeof draft.customPrimaryColor === "string") setCustomPrimaryColor(draft.customPrimaryColor);
      if (typeof draft.customSecondaryColor === "string") setCustomSecondaryColor(draft.customSecondaryColor);
      if (typeof draft.customAccentColor === "string") setCustomAccentColor(draft.customAccentColor);
      if (typeof draft.selectedStyle === "string") setSelectedStyle(draft.selectedStyle);
      if (typeof draft.selectedDesignIdea === "string") setSelectedDesignIdea(draft.selectedDesignIdea);
    }
  }, [userId]);

  // Persist wizard progress draft to localStorage on any step / input change
  useEffect(() => {
    if (isGenerating || generatedImage) return;

    if (
      currentStep === 1 &&
      !logoName &&
      !description &&
      !selectedColor &&
      !selectedStyle &&
      !selectedDesignIdea
    ) {
      clearSavedDraft(userId);
      return;
    }

    try {
      const draft = {
        currentStep,
        logoName,
        description,
        selectedColor,
        customColorDescription,
        customPrimaryColor,
        customSecondaryColor,
        customAccentColor,
        selectedStyle,
        selectedDesignIdea,
      };
      localStorage.setItem(getStorageKey(userId), JSON.stringify(draft));
    } catch (err) {
      console.warn("Failed to save wizard draft:", err);
    }
  }, [
    userId,
    currentStep,
    logoName,
    description,
    selectedColor,
    customColorDescription,
    customPrimaryColor,
    customSecondaryColor,
    customAccentColor,
    selectedStyle,
    selectedDesignIdea,
    isGenerating,
    generatedImage,
  ]);

  const steps = [
    { number: 1, title: "Name", subtitle: "Brand title" },
    { number: 2, title: "Vision", subtitle: "Description" },
    { number: 3, title: "Colors", subtitle: "Color theme" },
    { number: 4, title: "Style", subtitle: "Archetype" },
    { number: 5, title: "Idea", subtitle: "Core concept" },
    { number: 6, title: "Studio", subtitle: "Review & Build" },
  ];

  // Rotate loading stage messages & track elapsed time during generation
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStageIndex(0);
      setElapsedSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const stageInterval = setInterval(() => {
      setLoadingStageIndex((prev) => (prev + 1) % GENERATION_STAGES.length);
    }, 2400);

    const timeInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    timerRef.current = timeInterval;

    return () => {
      clearInterval(stageInterval);
      clearInterval(timeInterval);
    };
  }, [isGenerating]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return logoName.trim().length > 0;
      case 2:
        return description.trim().length >= 10;
      case 3:
        if (selectedColor === "custom") {
          return customColorDescription.trim().length > 0 || customPrimaryColor.length > 0;
        }
        return selectedColor !== "";
      case 4:
        return selectedStyle !== "";
      case 5:
        return selectedDesignIdea !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Please complete this step",
        description:
          currentStep === 2
            ? "Please provide at least 10 characters for your description."
            : currentStep === 3 && selectedColor === "custom"
            ? "Please describe your custom palette or select colors."
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

  const getColorLabelForReview = () => {
    if (selectedColor === "ai-recommended") {
      return "AI Recommended Palette";
    }
    if (selectedColor === "custom") {
      return customColorDescription.trim() || `Custom (${customPrimaryColor}, ${customSecondaryColor}, ${customAccentColor})`;
    }
    const found = colorOptions.find((c) => c.value === selectedColor);
    return found ? found.name : selectedColor;
  };

  const buildPrompt = () => {
    let colorDescriptionText = "";
    if (selectedColor === "ai-recommended") {
      colorDescriptionText = "AI-recommended optimal color harmony tailored to the brand personality";
    } else if (selectedColor === "custom") {
      const parts = [];
      if (customColorDescription.trim()) parts.push(customColorDescription.trim());
      parts.push(`Primary: ${customPrimaryColor}, Secondary: ${customSecondaryColor}, Accent: ${customAccentColor}`);
      colorDescriptionText = `Custom Palette (${parts.join(" • ")})`;
    } else {
      const found = colorOptions.find((c) => c.value === selectedColor);
      colorDescriptionText = found
        ? `${found.name} (${found.swatches.join(", ")}) - ${found.description}`
        : selectedColor;
    }

    const styleName = logoStyles.find((s) => s.id === selectedStyle)?.name || selectedStyle;
    const ideaName = designIdeas.find((d) => d.id === selectedDesignIdea)?.name || selectedDesignIdea;

    return `Professional logo design for "${logoName}". ${description}. Color scheme: ${colorDescriptionText}. Style: ${styleName}. Design concept: ${ideaName}. High quality, clean, modern, professional logo design.`;
  };

  const handleGenerate = async () => {
    const prompt = buildPrompt();
    setLastPrompt(prompt);
    await generateLogo(prompt);
  };

  const handleRegenerate = async () => {
    const promptToUse = lastPrompt || buildPrompt();
    await generateLogo(promptToUse);
  };

  const handleReset = () => {
    clearSavedDraft(userId);
    setLogoName("");
    setDescription("");
    setSelectedColor("");
    setCustomColorDescription("");
    setCustomPrimaryColor("#2563EB");
    setCustomSecondaryColor("#0F172A");
    setCustomAccentColor("#38BDF8");
    setSelectedStyle("");
    setSelectedDesignIdea("");
    setGeneratedImage("");
    setGenerationError(null);
    setLastPrompt("");
    setCurrentStep(1);
  };

  const generateLogo = async (prompt: string) => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const colorPayload =
        selectedColor === "custom"
          ? (customColorDescription.trim()
              ? `${customColorDescription.trim()} (HEX: ${customPrimaryColor}, ${customSecondaryColor}, ${customAccentColor})`
              : `Custom (${customPrimaryColor}, ${customSecondaryColor}, ${customAccentColor})`)
          : selectedColor === "ai-recommended"
          ? "ai-recommended"
          : selectedColor;

      const response = await apiRequest("POST", "/api/generate-logo", {
        prompt,
        name: logoName,
        description,
        color: colorPayload,
        style: selectedStyle,
        designIdea: selectedDesignIdea,
        userId,
      });
      const data = (await response.json()) as { imageUrl: string; logo?: LogoHistoryItem };

      if (!data || !data.imageUrl) {
        throw new Error("No image data received from the generator.");
      }

      // Successful generation: clear saved wizard draft state
      clearSavedDraft(userId);

      setGeneratedImage(data.imageUrl);

      const newLogo: LogoHistoryItem = data.logo || {
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
        description: "Your custom logo is ready to preview and download.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate logo. Please try again.";
      setGenerationError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
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
      title: "Download started",
      description: `Saved ${logoName}_logo.png to your device.`,
    });
  };

  const handleCopyPrompt = () => {
    const promptToCopy = lastPrompt || buildPrompt();
    navigator.clipboard.writeText(promptToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    toast({
      title: "Prompt copied",
      description: "Full AI generation prompt copied to clipboard.",
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
                      isCurrent
                        ? "text-foreground"
                        : isCompleted
                        ? "text-foreground/80"
                        : "text-muted-foreground"
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 mb-1">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Step 1 of 6
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  What is your brand or logo name?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter the title of your business, startup, app, or project.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Label
                  htmlFor="logo-name"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 mb-1">
                  <FileText className="w-3 h-3 text-orange-500" />
                  Step 2 of 6
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
                  <Label
                    htmlFor="description"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 mb-1">
                  <Palette className="w-3 h-3 text-orange-500" />
                  Step 3 of 6
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Choose your color palette
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a curated brand harmony, let AI automatically harmonize your palette, or configure bespoke custom colors.
                </p>
              </div>

              {/* Special Options Row: AI Recommended & Custom Bespoke */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* 1. AI Recommended Option */}
                <button
                  type="button"
                  onClick={() => setSelectedColor("ai-recommended")}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-3.5 ${
                    selectedColor === "ai-recommended"
                      ? "border-orange-500 bg-orange-500/5 shadow-md ring-4 ring-orange-500/15"
                      : "border-border/80 bg-card hover:border-orange-500/40 hover:shadow-xs"
                  }`}
                  data-testid="color-ai-recommended"
                >
                  <div className="w-12 h-12 rounded-xl gradient-saffron-pink flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-foreground">AI Recommended</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        Smart Choice
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      AI analyzes your brand vision and automatically selects the optimal color harmony.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-black/10 shadow-2xs" />
                      <div className="w-3.5 h-3.5 rounded-full bg-violet-500 border border-black/10 shadow-2xs" />
                      <div className="w-3.5 h-3.5 rounded-full bg-pink-500 border border-black/10 shadow-2xs" />
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-black/10 shadow-2xs" />
                      <span className="text-[10px] text-muted-foreground ml-1 font-medium">Dynamic Harmony</span>
                    </div>
                  </div>
                  {selectedColor === "ai-recommended" && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full gradient-saffron-pink text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>

                {/* 2. Custom Palette Option */}
                <button
                  type="button"
                  onClick={() => setSelectedColor("custom")}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-3.5 ${
                    selectedColor === "custom"
                      ? "border-orange-500 bg-orange-500/5 shadow-md ring-4 ring-orange-500/15"
                      : "border-border/80 bg-card hover:border-orange-500/40 hover:shadow-xs"
                  }`}
                  data-testid="color-custom"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground shrink-0 border border-border">
                    <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-foreground">Custom Palette</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                        Bespoke
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Enter a custom color description and choose exact HEX colors with color pickers.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                        style={{ backgroundColor: customPrimaryColor || "#2563EB" }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                        style={{ backgroundColor: customSecondaryColor || "#0F172A" }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                        style={{ backgroundColor: customAccentColor || "#38BDF8" }}
                      />
                      <span className="text-[10px] text-muted-foreground ml-1 font-mono truncate max-w-[140px]">
                        {customColorDescription ? customColorDescription.slice(0, 18) + "..." : "Custom Trio"}
                      </span>
                    </div>
                  </div>
                  {selectedColor === "custom" && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full gradient-saffron-pink text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              </div>

              {/* Custom Palette Configuration Drawer (shown when Custom is active) */}
              {selectedColor === "custom" && (
                <div className="p-5 rounded-2xl bg-card border border-orange-500/30 shadow-xs space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Pipette className="w-4 h-4 text-orange-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Configure Your Custom Palette
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="custom-color-desc" className="text-xs font-medium text-muted-foreground">
                      Color Mood & Description (optional but recommended)
                    </Label>
                    <Input
                      id="custom-color-desc"
                      value={customColorDescription}
                      onChange={(e) => setCustomColorDescription(e.target.value)}
                      placeholder="e.g., deep navy blue with electric cyan accents and pure white highlights"
                      className="h-10 text-xs rounded-xl bg-background border-border shadow-xs"
                      data-testid="input-custom-color-desc"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Primary Color Picker */}
                    <div className="p-3 rounded-xl bg-muted/50 border border-border/80 space-y-2">
                      <span className="text-[11px] font-bold text-foreground block">Primary Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customPrimaryColor}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                          title="Choose primary color"
                        />
                        <Input
                          type="text"
                          value={customPrimaryColor}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="h-8 font-mono text-xs uppercase rounded-lg bg-background"
                          placeholder="#2563EB"
                        />
                      </div>
                    </div>

                    {/* Secondary Color Picker */}
                    <div className="p-3 rounded-xl bg-muted/50 border border-border/80 space-y-2">
                      <span className="text-[11px] font-bold text-foreground block">Secondary Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customSecondaryColor}
                          onChange={(e) => setCustomSecondaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                          title="Choose secondary color"
                        />
                        <Input
                          type="text"
                          value={customSecondaryColor}
                          onChange={(e) => setCustomSecondaryColor(e.target.value)}
                          className="h-8 font-mono text-xs uppercase rounded-lg bg-background"
                          placeholder="#0F172A"
                        />
                      </div>
                    </div>

                    {/* Accent Color Picker */}
                    <div className="p-3 rounded-xl bg-muted/50 border border-border/80 space-y-2">
                      <span className="text-[11px] font-bold text-foreground block">Accent / Highlight</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customAccentColor}
                          onChange={(e) => setCustomAccentColor(e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                          title="Choose accent color"
                        />
                        <Input
                          type="text"
                          value={customAccentColor}
                          onChange={(e) => setCustomAccentColor(e.target.value)}
                          className="h-8 font-mono text-xs uppercase rounded-lg bg-background"
                          placeholder="#38BDF8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Swatch Preview */}
                  <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground font-medium">Live Palette Harmony:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1.5">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-card shadow-xs"
                          style={{ backgroundColor: customPrimaryColor }}
                          title={`Primary: ${customPrimaryColor}`}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-card shadow-xs"
                          style={{ backgroundColor: customSecondaryColor }}
                          title={`Secondary: ${customSecondaryColor}`}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-card shadow-xs"
                          style={{ backgroundColor: customAccentColor }}
                          title={`Accent: ${customAccentColor}`}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-foreground font-semibold">
                        {customPrimaryColor} • {customSecondaryColor} • {customAccentColor}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Curated Professional Palettes Grid (10 Palettes) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Curated Professional Palettes
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    10 Studio-Tested Harmonies
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {colorOptions.map((palette) => {
                    const isSelected = selectedColor === palette.value;

                    return (
                      <button
                        key={palette.value}
                        type="button"
                        onClick={() => setSelectedColor(palette.value)}
                        className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-orange-500 bg-orange-500/5 shadow-md ring-4 ring-orange-500/15 scale-[1.02]"
                            : "border-border/80 bg-card hover:border-orange-500/40 hover:shadow-xs"
                        }`}
                        data-testid={`color-${palette.value}`}
                      >
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full gradient-saffron-pink text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}

                        {/* Swatches strip */}
                        <div className="flex items-center gap-1.5 mb-3">
                          {palette.swatches.map((hexCode, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-lg border border-black/10 shadow-2xs transition-transform group-hover:scale-105"
                              style={{ backgroundColor: hexCode }}
                              title={hexCode}
                            />
                          ))}
                        </div>

                        <span className="text-sm font-bold text-foreground block">
                          {palette.name}
                        </span>

                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                          {palette.swatches.join(" • ")}
                        </span>

                        {palette.mood && (
                          <span className="text-[10px] font-medium text-orange-600/90 dark:text-orange-400 mt-1.5 line-clamp-1">
                            {palette.mood}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Logo Style */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 mb-1">
                  <Layers className="w-3 h-3 text-orange-500" />
                  Step 4 of 6
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
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {style.description}
                      </p>
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 mb-1">
                  <Lightbulb className="w-3 h-3 text-orange-500" />
                  Step 5 of 6
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
                            : "border-orange-300 dark:border-orange-700 bg-orange-500/10 text-foreground hover:bg-orange-500/15"
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
                        {isSelected && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isAIChoice ? "bg-orange-600" : "bg-white"
                            }`}
                          />
                        )}
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

          {/* STEP 6: Studio / Final Review, Generator & Results */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. Pre-Generation Final Review State */}
              {!generatedImage && !isGenerating && !generationError && (
                <div className="space-y-6 max-w-xl mx-auto py-2">
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 rounded-2xl gradient-saffron-pink mx-auto flex items-center justify-center text-white shadow-md shadow-orange-500/20 mb-2">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      Final Review & Generate
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Review your customized branding configuration. Click any item to modify before generating.
                    </p>
                  </div>

                  {/* Interactive Review Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    {/* Item 1: Name */}
                    <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3 group">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Brand Name
                        </span>
                        <p className="font-bold text-sm text-foreground truncate">{logoName}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentStep(1)}
                        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0 opacity-80 group-hover:opacity-100"
                        title="Edit brand name"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Item 2: Color Palette */}
                    <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3 group">
                      <div className="min-w-0 flex items-center gap-2.5">
                        {selectedColor === "ai-recommended" ? (
                          <div className="w-6 h-6 rounded-md gradient-saffron-pink flex items-center justify-center text-white shadow-xs shrink-0">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        ) : selectedColor === "custom" ? (
                          <div className="flex items-center -space-x-1 shrink-0">
                            <div className="w-4 h-4 rounded-full border border-card shadow-xs" style={{ backgroundColor: customPrimaryColor }} />
                            <div className="w-4 h-4 rounded-full border border-card shadow-xs" style={{ backgroundColor: customSecondaryColor }} />
                            <div className="w-4 h-4 rounded-full border border-card shadow-xs" style={{ backgroundColor: customAccentColor }} />
                          </div>
                        ) : (
                          <div className="flex items-center -space-x-1 shrink-0">
                            {(colorOptions.find((c) => c.value === selectedColor)?.swatches || ["#3B82F6"]).map((hex, idx) => (
                              <div key={idx} className="w-4 h-4 rounded-full border border-card shadow-xs" style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Color Palette
                          </span>
                          <p className="font-bold text-sm text-foreground capitalize truncate">
                            {getColorLabelForReview()}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentStep(3)}
                        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0 opacity-80 group-hover:opacity-100"
                        title="Edit color theme"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Item 3: Style Archetype */}
                    <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3 group">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Style Archetype
                        </span>
                        <p className="font-bold text-sm text-foreground truncate">
                          {logoStyles.find((s) => s.id === selectedStyle)?.name || selectedStyle}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentStep(4)}
                        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0 opacity-80 group-hover:opacity-100"
                        title="Edit style archetype"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Item 4: Motif Idea */}
                    <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3 group">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Motif / Idea
                        </span>
                        <p className="font-bold text-sm text-foreground truncate">
                          {designIdeas.find((d) => d.id === selectedDesignIdea)?.name || selectedDesignIdea}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentStep(5)}
                        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0 opacity-80 group-hover:opacity-100"
                        title="Edit motif idea"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Primary Generate Button */}
                  <div className="pt-2 text-center">
                    <Button
                      onClick={handleGenerate}
                      size="lg"
                      className="w-full sm:w-auto h-14 px-10 text-base font-bold gradient-saffron-pink text-white shadow-xl shadow-orange-500/25 hover:opacity-95 transition-all rounded-xl gap-2.5 btn-press"
                      data-testid="button-generate"
                    >
                      <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                      <span>Synthesize AI Logo Now</span>
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Powered by FLUX.1 [schnell] (Cloudflare Workers AI) • High-Resolution Output
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Loading State with Progress Messaging & Elapsed Time */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-10 space-y-6 max-w-md mx-auto text-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full gradient-saffron-pink/20 animate-ping absolute inset-0" />
                    <div className="w-20 h-20 rounded-2xl gradient-saffron-pink flex items-center justify-center text-white shadow-xl shadow-orange-500/30 relative z-10">
                      <Loader2 className="w-9 h-9 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Synthesizing "{logoName}" Logo
                    </h3>

                    {/* Progress Bar Glow */}
                    <div className="w-64 h-1.5 bg-muted rounded-full mx-auto overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-pulse w-3/4" />
                    </div>

                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 min-h-[22px] transition-all">
                      {GENERATION_STAGES[loadingStageIndex]}
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-muted/80 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{elapsedSeconds}s elapsed</span>
                    </div>

                    {elapsedSeconds > 10 && (
                      <p className="text-[11px] text-muted-foreground/80 animate-fade-in">
                        Still rendering... complex vectors can take a few extra seconds during high traffic.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Error Handling State with Retry Option */}
              {generationError && !isGenerating && (
                <div className="space-y-6 max-w-md mx-auto py-6 animate-fade-in text-center">
                  <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-destructive/20 text-destructive mx-auto flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-destructive">
                        Generation Failed
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {generationError}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      onClick={handleRegenerate}
                      className="h-11 px-6 font-bold gradient-saffron-pink text-white shadow-md rounded-xl gap-2 text-xs btn-press"
                      data-testid="button-retry-generate"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Generation
                    </Button>
                    <Button
                      onClick={() => setGenerationError(null)}
                      variant="outline"
                      className="h-11 px-5 text-xs font-semibold rounded-xl border-border btn-press"
                    >
                      Back to Review
                    </Button>
                  </div>
                </div>
              )}

              {/* 4. Completed Logo Result State */}
              {generatedImage && !isGenerating && (
                <div className="space-y-6 max-w-xl mx-auto animate-fade-in text-center">
                  {/* Canvas Showcase Card */}
                  <div className="relative group rounded-3xl overflow-hidden bg-card border-2 border-orange-500/30 shadow-2xl p-4 sm:p-6 space-y-4">
                    {/* Top Canvas Toolbar */}
                    <div className="flex items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold gradient-saffron-pink text-white shadow-xs">
                          ✨ Ready
                        </span>
                        <span className="text-xs font-bold text-foreground truncate max-w-[140px]">
                          {logoName}
                        </span>
                      </div>

                      {/* Canvas Background Preview Switcher */}
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/80 border border-border/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setPreviewBg("light")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 btn-press ${
                            previewBg === "light"
                              ? "bg-card text-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="Preview on light background"
                        >
                          <Sun className="w-3 h-3" />
                          <span className="hidden sm:inline">Light</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewBg("dark")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 btn-press ${
                            previewBg === "dark"
                              ? "bg-card text-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="Preview on dark background"
                        >
                          <Moon className="w-3 h-3" />
                          <span className="hidden sm:inline">Dark</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewBg("checkered")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 btn-press ${
                            previewBg === "checkered"
                              ? "bg-card text-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title="Preview on transparent grid"
                        >
                          <Grid className="w-3 h-3" />
                          <span className="hidden sm:inline">Grid</span>
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Box with Selected Background */}
                    <div
                      className={`aspect-square w-full max-w-[360px] mx-auto rounded-2xl overflow-hidden border border-border/80 shadow-inner flex items-center justify-center p-3 transition-colors duration-300 ${
                        previewBg === "light"
                          ? "bg-white"
                          : previewBg === "dark"
                          ? "bg-slate-950"
                          : "bg-dot-pattern bg-muted/40"
                      }`}
                    >
                      <img
                        src={generatedImage}
                        alt={`Generated logo for ${logoName}`}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 rounded-xl"
                        data-testid="img-generated-logo"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      onClick={handleDownload}
                      className="h-12 px-6 font-bold gradient-saffron-pink text-white shadow-md shadow-orange-500/20 hover:opacity-95 rounded-xl gap-2 text-xs btn-press"
                      data-testid="button-download"
                    >
                      <Download className="w-4 h-4" />
                      Download High-Res PNG
                    </Button>

                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      className="h-12 px-5 font-semibold border-border hover:bg-muted rounded-xl gap-2 text-xs btn-press"
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
                      className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground btn-press"
                      title="Copy full AI prompt"
                    >
                      {copiedPrompt ? (
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="h-12 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 btn-press"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Start New
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
              className="h-11 px-5 gap-1.5 rounded-xl text-xs font-bold border-border btn-press"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-xs text-muted-foreground font-medium hidden sm:block">
              Step {currentStep} of 6
            </div>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-11 px-6 gap-1.5 gradient-saffron-pink text-white font-bold shadow-md shadow-orange-500/20 hover:opacity-95 rounded-xl text-xs btn-press"
              data-testid="button-continue"
            >
              <span>{currentStep === 5 ? "Go to Final Review" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
