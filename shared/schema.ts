import { z } from "zod";

// User schema for localStorage authentication
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type InsertUser = z.infer<typeof registerSchema>;

// User type for localStorage
export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
}

// Logo generation wizard schema
export const logoWizardSchema = z.object({
  name: z.string().min(1, "Logo name is required"),
  description: z.string().min(10, "Please provide a more detailed description"),
  color: z.string().min(1, "Please select a color"),
  style: z.string().min(1, "Please select a logo style"),
  designIdea: z.string().min(1, "Please select a design idea"),
});

export type LogoWizardData = z.infer<typeof logoWizardSchema>;

// Logo history item
export interface LogoHistoryItem {
  id: string;
  userId: string;
  imageUrl: string;
  prompt: string;
  name: string;
  description: string;
  color: string;
  style: string;
  designIdea: string;
  createdAt: string;
}

// Color palette options
export const colorOptions = [
  { name: "Blue", value: "blue", hex: "#3B82F6" },
  { name: "Gold", value: "gold", hex: "#F59E0B" },
  { name: "Green", value: "green", hex: "#10B981" },
  { name: "Red", value: "red", hex: "#EF4444" },
  { name: "Black", value: "black", hex: "#1F2937" },
] as const;

// Logo style options
export const logoStyles = [
  { 
    id: "cartoon", 
    name: "Cartoon Logo", 
    description: "Fun and playful design with vibrant colors" 
  },
  { 
    id: "app", 
    name: "App Logo", 
    description: "Modern and sleek for mobile applications" 
  },
  { 
    id: "mascot", 
    name: "Modern Mascot Logos", 
    description: "Character-based designs with personality" 
  },
  { 
    id: "line", 
    name: "Black and White Line Logos", 
    description: "Clean minimalist line art style" 
  },
  { 
    id: "minimalist", 
    name: "Minimalist and Elegant Logos", 
    description: "Simple, sophisticated, and timeless" 
  },
  { 
    id: "vintage", 
    name: "Vintage Custom Logos", 
    description: "Classic retro-inspired designs" 
  },
  { 
    id: "modern-sharp", 
    name: "Modern Sharp-Lined Logos", 
    description: "Bold geometric shapes and angles" 
  },
  { 
    id: "luxury", 
    name: "Custom Luxury Logo Designs", 
    description: "Premium and high-end aesthetics" 
  },
  { 
    id: "vintage-text", 
    name: "Vintage Logo Designs With Text & Icon", 
    description: "Retro badges with combined elements" 
  },
] as const;

// Design idea options
export const designIdeas = [
  { 
    id: "abstract-star", 
    name: "Abstract star, clean lines", 
    description: "Modern geometric star with minimalist approach" 
  },
  { 
    id: "galaxy", 
    name: "Elegant swirling galaxy icon", 
    description: "Cosmic spiral with elegant flowing curves" 
  },
  { 
    id: "globe", 
    name: "Minimalist globe, modern font", 
    description: "Simple world icon with contemporary typography" 
  },
  { 
    id: "cosmos", 
    name: "Stylized 'N' cosmos symbol", 
    description: "Letter integrated with celestial elements" 
  },
  { 
    id: "planet", 
    name: "Geometric planet, serif text", 
    description: "Angular planetary shape with classic font" 
  },
  { 
    id: "ai-choice", 
    name: "Let AI select the best idea for me", 
    description: "AI will choose the most suitable design concept" 
  },
] as const;

// Logo generation request
export interface LogoGenerationRequest {
  prompt: string;
}

export interface LogoGenerationResponse {
  imageUrl: string;
}
