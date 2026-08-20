import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginData, type RegisterData, type User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export default function AuthPage() {
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

  const handleLogin = (data: LoginData) => {
    const usersJson = localStorage.getItem("users");
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const user = users.find(u => u.email === data.email && u.password === data.password);
    
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.username}`,
      });
      setLocation("/app");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (data: RegisterData) => {
    const usersJson = localStorage.getItem("users");
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    if (users.some(u => u.email === data.email)) {
      toast({
        title: "Registration failed",
        description: "Email already exists",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      username: data.username,
      password: data.password,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    
    toast({
      title: "Account created!",
      description: `Welcome, ${newUser.username}!`,
    });
    setLocation("/app");
  };

  return (
    <div className="min-h-screen gradient-saffron-pink flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl bg-white p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text-saffron-pink mb-2">
           LogoMind AI 🧠

          </h1>
          <p className="text-sm text-muted-foreground">
            Create stunning logos with AI-powered creativity
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 pb-3 text-base font-medium transition-colors relative ${
              activeTab === "login"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-login"
          >
            Login
            {activeTab === "login" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 pb-3 text-base font-medium transition-colors relative ${
              activeTab === "register"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-register"
          >
            Register
            {activeTab === "register" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="your@email.com"
                className="h-12 rounded-lg"
                data-testid="input-login-email"
                {...loginForm.register("email")}
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-lg"
                data-testid="input-login-password"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg font-bold gradient-saffron-pink text-white"
              data-testid="button-login"
            >
              Login
            </Button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                className="h-12 rounded-lg"
                data-testid="input-register-email"
                {...registerForm.register("email")}
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="register-username"
                type="text"
                placeholder="your_username"
                className="h-12 rounded-lg"
                data-testid="input-register-username"
                {...registerForm.register("username")}
              />
              {registerForm.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {registerForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-lg"
                data-testid="input-register-password"
                {...registerForm.register("password")}
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg font-bold gradient-saffron-pink text-white"
              data-testid="button-register"
            >
              Create Account
            </Button>
          </form>
        )}
      </Card>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-6 text-center">
        <p className="text-sm text-white/80">
          © 2025 LogoMind AI 🧠 | Powered by AI & creativity
        </p>
      </div>
    </div>
  );
}
