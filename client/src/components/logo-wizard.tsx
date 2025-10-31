import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Check, Download, RefreshCw, Loader2 } from "lucide-react";
import { colorOptions, logoStyles, designIdeas, type LogoHistoryItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface LogoWizardProps {
  onLogoGenerated: (logo: LogoHistoryItem) => void;
  userId: string;
}

export function LogoWizard({ onLogoGenerated, userId }: LogoWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [logoName, setLogoName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedDesignIdea, setSelectedDesignIdea] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const { toast } = useToast();

  const steps = [
    { number: 1, title: "Logo Name" },
    { number: 2, title: "Description" },
    { number: 3, title: "Color Palette" },
    { number: 4, title: "Logo Style" },
    { number: 5, title: "Design Idea" },
    { number: 6, title: "Generate" },
  ];

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
        description: "Fill in all required information before continuing",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const buildPrompt = () => {
    const colorName = colorOptions.find(c => c.value === selectedColor)?.name || selectedColor;
    const styleName = logoStyles.find(s => s.id === selectedStyle)?.name || selectedStyle;
    const ideaName = designIdeas.find(d => d.id === selectedDesignIdea)?.name || selectedDesignIdea;

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
    }
  };

  const generateLogo = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/generate-logo", { prompt });
      const data = await response.json() as { imageUrl: string };
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
        title: "Logo generated successfully!",
        description: "Your beautiful logo is ready to download",
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
      title: "Download started",
      description: "Your logo is being downloaded",
    });
  };

  return (
    <div>
      {/* Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 flex-wrap">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex items-center"
            data-testid={`step-indicator-${step.number}`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                step.number < currentStep
                  ? "gradient-saffron-pink text-white"
                  : step.number === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`ml-2 text-sm font-medium hidden sm:inline ${
                step.number === currentStep ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
            {step.number < steps.length && (
              <div className="w-8 h-0.5 bg-border ml-2 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="rounded-2xl shadow-lg p-8 md:p-12 max-w-3xl mx-auto min-h-[500px] flex flex-col">
        <div className="flex-1">
          {/* Step 1: Logo Name */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">What's your logo name?</h2>
                <p className="text-sm text-muted-foreground">
                  Add your business, app, or website name for a custom logo
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-name" className="text-base">Logo Name</Label>
                <Input
                  id="logo-name"
                  value={logoName}
                  onChange={(e) => setLogoName(e.target.value)}
                  placeholder="e.g., TechVenture, Creative Studio, MyApp"
                  className="h-14 text-lg"
                  data-testid="input-logo-name"
                />
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Describe your logo vision</h2>
                <p className="text-sm text-muted-foreground">
                  Share your ideas, themes, or inspirations to create a logo that perfectly represents your brand
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A modern tech company focused on innovation and creativity. We want something that feels futuristic yet approachable..."
                  className="min-h-32 text-base"
                  data-testid="input-description"
                />
                <p className="text-sm text-muted-foreground text-right">
                  {description.length} characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Color Palette */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Choose your color palette</h2>
                <p className="text-sm text-muted-foreground">
                  Select a color that represents your brand identity
                </p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      selectedColor === color.value
                        ? "border-primary ring-4 ring-primary/20 scale-105"
                        : "border-border hover-elevate"
                    }`}
                    data-testid={`color-${color.value}`}
                  >
                    <div
                      className="w-16 h-16 rounded-lg"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Logo Style */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Choose your logo style</h2>
                <p className="text-sm text-muted-foreground">
                  Select a design style that matches your vision
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                {logoStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      selectedStyle === style.id
                        ? "border-primary bg-gradient-to-br from-primary/5 to-accent/5"
                        : "border-border hover-elevate"
                    }`}
                    data-testid={`style-${style.id}`}
                  >
                    <h3 className="font-bold mb-2">{style.name}</h3>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Design Idea */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Select your design idea</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a design concept or let AI decide for you
                </p>
              </div>
              <div className="space-y-3">
                {designIdeas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedDesignIdea(idea.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      idea.id === "ai-choice"
                        ? selectedDesignIdea === idea.id
                          ? "border-primary gradient-saffron-pink text-white"
                          : "border-border gradient-saffron-pink/10 hover-elevate"
                        : selectedDesignIdea === idea.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    data-testid={`idea-${idea.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                          selectedDesignIdea === idea.id
                            ? idea.id === "ai-choice"
                              ? "border-white bg-white"
                              : "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {selectedDesignIdea === idea.id && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              idea.id === "ai-choice" ? "bg-primary" : "bg-white"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{idea.name}</h3>
                        <p
                          className={`text-sm ${
                            idea.id === "ai-choice" && selectedDesignIdea === idea.id
                              ? "text-white/90"
                              : "text-muted-foreground"
                          }`}
                        >
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Generate & Results */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Generate your logo</h2>
                <p className="text-sm text-muted-foreground">
                  Click the button below to create your AI-powered logo
                </p>
              </div>

              {!generatedImage && !isGenerating && (
                <div className="flex justify-center py-12">
                  <Button
                    onClick={handleGenerate}
                    className="h-14 px-12 text-lg font-bold gradient-saffron-pink text-white"
                    data-testid="button-generate"
                  >
                    Generate Logo
                  </Button>
                </div>
              )}

              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-lg font-medium text-muted-foreground animate-pulse">
                    Generating your logo...
                  </p>
                </div>
              )}

              {generatedImage && !isGenerating && (
                <div className="space-y-6">
                  <div className="rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                    <img
                      src={generatedImage}
                      alt="Generated logo"
                      className="w-full h-auto"
                      data-testid="img-generated-logo"
                    />
                  </div>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button
                      onClick={handleDownload}
                      className="h-12 px-6 gap-2 gradient-saffron-pink text-white font-medium"
                      data-testid="button-download"
                    >
                      <Download className="w-5 h-5" />
                      Download Logo
                    </Button>
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      className="h-12 px-6 gap-2 font-medium"
                      disabled={isGenerating}
                      data-testid="button-regenerate"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 1}
              className="h-12 px-8 gap-2"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-12 px-8 gap-2 gradient-saffron-pink text-white font-medium"
              data-testid="button-continue"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
