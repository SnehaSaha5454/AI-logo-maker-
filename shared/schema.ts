import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Database table: users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
});

// Database table: logos
export const logos = pgTable("logos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  style: text("style").notNull(),
  designIdea: text("design_idea").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for database entities
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const selectUserSchema = createSelectSchema(users);

export const insertLogoSchema = createInsertSchema(logos).omit({ id: true, createdAt: true });
export const selectLogoSchema = createSelectSchema(logos);

// Authentication schemas
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
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLogo = z.infer<typeof insertLogoSchema>;
export type Logo = typeof logos.$inferSelect;

// Backward-compatible LogoHistoryItem interface for frontend components
export interface LogoHistoryItem {
  id: number | string;
  userId: number | string;
  imageUrl: string;
  prompt: string;
  name: string;
  description: string;
  color: string;
  style: string;
  designIdea: string;
  createdAt?: string | Date;
}

// Logo generation wizard form validation schema
export const logoWizardSchema = z.object({
  name: z.string().min(1, "Logo name is required"),
  description: z.string().min(10, "Please provide a more detailed description"),
  color: z.string().min(1, "Please select a color"),
  style: z.string().min(1, "Please select a logo style"),
  designIdea: z.string().min(1, "Please select a design idea"),
});

export type LogoWizardData = z.infer<typeof logoWizardSchema>;

// Color palette definition and options
export interface ColorPalette {
  name: string;
  value: string;
  hex: string;
  swatches: string[];
  description: string;
  mood?: string;
}

export const colorOptions: ColorPalette[] = [
  {
    name: "Ocean Blue",
    value: "ocean-blue",
    hex: "#0284C7",
    swatches: ["#0369A1", "#0284C7", "#38BDF8"],
    description: "Deep azure, ocean blue & sky highlights",
    mood: "Trust, Tech & Depth",
  },
  {
    name: "Emerald",
    value: "emerald",
    hex: "#059669",
    swatches: ["#047857", "#059669", "#34D399"],
    description: "Rich botanical emerald & mint accents",
    mood: "Growth, Nature & Prosperity",
  },
  {
    name: "Purple",
    value: "purple",
    hex: "#7C3AED",
    swatches: ["#5B21B6", "#7C3AED", "#C084FC"],
    description: "Royal violet, amethyst & lavender",
    mood: "Creativity, Luxury & Vision",
  },
  {
    name: "Gold",
    value: "gold",
    hex: "#D97706",
    swatches: ["#B45309", "#D97706", "#FDE047"],
    description: "Warm amber gold & champagne tones",
    mood: "Prestige, Wealth & Excellence",
  },
  {
    name: "Orange",
    value: "orange",
    hex: "#EA580C",
    swatches: ["#C2410C", "#EA580C", "#FDBA74"],
    description: "Vibrant sunset saffron & tangerine",
    mood: "Energy, Warmth & Innovation",
  },
  {
    name: "Crimson",
    value: "crimson",
    hex: "#DC2626",
    swatches: ["#991B1B", "#DC2626", "#FCA5A5"],
    description: "Bold ruby crimson & scarlet accents",
    mood: "Passion, Power & Drive",
  },
  {
    name: "Black & White",
    value: "black-white",
    hex: "#0F172A",
    swatches: ["#0F172A", "#64748B", "#F8FAFC"],
    description: "Timeless monochrome slate & pure white",
    mood: "Sleek, Minimalist & Modern",
  },
  {
    name: "Navy & Cyan",
    value: "navy-cyan",
    hex: "#06B6D4",
    swatches: ["#0F172A", "#0284C7", "#06B6D4"],
    description: "Midnight navy base with electric cyan",
    mood: "Cyber, High-Tech & Futuristic",
  },
  {
    name: "Pink & Purple",
    value: "pink-purple",
    hex: "#DB2777",
    swatches: ["#7E22CE", "#DB2777", "#F472B6"],
    description: "Magenta rose & electric ultraviolet",
    mood: "Playful, Bold & Dynamic",
  },
  {
    name: "Earth Tones",
    value: "earth-tones",
    hex: "#78350F",
    swatches: ["#78350F", "#57534E", "#D97706"],
    description: "Terracotta, warm olive & desert sand",
    mood: "Organic, Grounded & Authentic",
  },
];

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

// Logo generation request & response types
export interface LogoGenerationRequest {
  prompt: string;
  name?: string;
  description?: string;
  color?: string;
  style?: string;
  designIdea?: string;
  userId?: number | string;
}

export interface LogoGenerationResponse {
  imageUrl: string;
  logo?: LogoHistoryItem;
}
