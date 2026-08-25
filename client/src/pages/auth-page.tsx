import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Sparkles, Wand2, Shield, CheckCircle2, Lock, Mail, User as UserIcon, ArrowRight, Heart, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function AuthPage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invalid email or password");
      }

      localStorage.setItem("currentUser", JSON.stringify(result.user));
      toast({
        title: "Welcome back! 👋",
        description: `Successfully logged in as ${result.user.username}`,
      });
      setLocation("/app");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      localStorage.setItem("currentUser", JSON.stringify(result.user));
      toast({
        title: "Account created!",
        description: `Welcome to LogoMind AI, ${result.user.username}!`,
      });
      setLocation("/app");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-pattern bg-dot-pattern flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl glass-card border-border shadow-xs hover:bg-muted transition-all"
          aria-label="Toggle theme"
          data-testid="button-auth-theme-toggle"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-foreground/80" />
          )}
        </Button>
      </div>

      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Product Showcase (Desktop) */}
        <div className="lg:col-span-6 space-y-6 text-left p-2 sm:p-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            AI Logo Studio
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Design Custom Logos in <span className="gradient-text-saffron-pink">Minutes</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Create custom, high-resolution logos tailored to your brand style, color preferences, and design vision.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card/80 border border-border/80 shadow-xs backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">6-Step Wizard</h4>
                <p className="text-[11px] text-muted-foreground">Customize style, colors, and concepts step-by-step.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card/80 border border-border/80 shadow-xs backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Curated Styles</h4>
                <p className="text-[11px] text-muted-foreground">Minimalist, vintage, mascot, line art, and more.</p>
              </div>
            </div>
          </div>

          {/* Social Proof / Trust */}
          <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant PNG Downloads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Color & Style Options</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Card */}
        <div className="lg:col-span-6 flex justify-center">
          <Card className="w-full max-w-md glass-card rounded-2xl shadow-xl shadow-orange-500/5 p-6 sm:p-8 border border-border/80 relative">
            {/* Logo & Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl gradient-saffron-pink mx-auto flex items-center justify-center text-white shadow-md shadow-orange-500/25 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {activeTab === "login" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "login"
                  ? "Enter your credentials to access your logo studio"
                  : "Sign up in 5 seconds to start generating AI logos"}
              </p>
            </div>

            {/* Tab Pill Navigation */}
            <div className="flex p-1 mb-6 rounded-xl bg-muted/80 border border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "login"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-login"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "register"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-register"
              >
                Create Account
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-11 pl-10 rounded-xl bg-card border-border text-sm focus-visible:ring-primary"
                      data-testid="input-login-email"
                      {...loginForm.register("email")}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-11 pl-10 rounded-xl bg-card border-border text-sm focus-visible:ring-primary"
                      data-testid="input-login-password"
                      {...loginForm.register("password")}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-bold gradient-saffron-pink text-white shadow-md shadow-orange-500/20 hover:opacity-95 transition-all gap-2 btn-press"
                  data-testid="button-login"
                >
                  <span>{isLoading ? "Signing in..." : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="register-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-11 pl-10 rounded-xl bg-card border-border text-sm focus-visible:ring-primary"
                      data-testid="input-register-email"
                      {...registerForm.register("email")}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="register-username" className="text-xs font-semibold text-foreground">
                    Username
                  </Label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="username"
                      className="h-11 pl-10 rounded-xl bg-card border-border text-sm focus-visible:ring-primary"
                      data-testid="input-register-username"
                      {...registerForm.register("username")}
                    />
                  </div>
                  {registerForm.formState.errors.username && (
                    <p className="text-xs text-destructive font-medium">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="register-password" className="text-xs font-semibold text-foreground">
                    Password (min 6 characters)
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-11 pl-10 rounded-xl bg-card border-border text-sm focus-visible:ring-primary"
                      data-testid="input-register-password"
                      {...registerForm.register("password")}
                    />
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-bold gradient-saffron-pink text-white shadow-md shadow-orange-500/20 hover:opacity-95 transition-all gap-2 btn-press"
                  data-testid="button-register"
                >
                  <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

      {/* Floating Bottom Footer Note */}
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          <span>LogoMind AI</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
          </span>
        </p>
      </div>
    </div>
  );
}
