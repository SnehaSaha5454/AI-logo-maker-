import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePasswords } from "./auth-utils";
import { loginSchema, registerSchema, insertLogoSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // 1. User Registration
  app.post("/api/register", async (req, res) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { email, username, password } = parseResult.data;

      // Check if email is already taken
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      // Hash password securely
      const hashedPassword = await hashPassword(password);

      // Create user in PostgreSQL database
      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
      });

      // Return user without password
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      res.status(201).json({ user: safeUser });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to register user",
      });
    }
  });

  // 2. User Login
  app.post("/api/login", async (req, res) => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { email, password } = parseResult.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify hashed password
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Return safe user object
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      res.json({ user: safeUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to log in",
      });
    }
  });

  // 3. AI Logo Generation via Cloudflare Workers AI (@cf/black-forest-labs/flux-1-schnell) + DB Persistence
  app.post("/api/generate-logo", async (req, res) => {
    try {
      const { prompt, name, description, color, style, designIdea, userId } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
          error: "Prompt is required",
        });
      }

      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
      const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

      if (!accountId || !apiToken) {
        throw new Error(
          "Cloudflare AI credentials missing. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env"
        );
      }

      const brandName = name?.trim() || "Brand";
      const brandDescription = description?.trim() || "";
      const selectedColor = color?.trim() || "ocean-blue";
      const selectedStyle = style?.trim() || "minimalist";
      const selectedIdea = designIdea?.trim() || "ai-choice";

      // Style guidelines for strict vector branding aesthetics
      const styleGuidance: Record<string, string> = {
        minimalist: "Minimalist geometric vector logo, refined simplicity, clean negative space, timeless corporate branding",
        "modern-sharp": "Modern sharp geometric emblem, bold precision angles, dynamic polygonal facets, futuristic tech branding",
        luxury: "High-end luxury vector emblem, premium balanced golden ratio proportions, prestigious brand crest",
        line: "Single-tone continuous monoline vector graphic, ultra-clean negative space, modern minimalist line art logo",
        app: "Modern digital app icon glyph, clean rounded geometry, bold recognizable silhouette, high UI scalability",
        cartoon: "Playful clean 2D vector graphic, bold outlines, friendly characterful geometry, vibrant flat vector art",
        mascot: "Modern stylized 2D vector mascot emblem, bold iconic silhouette, clean vector character with strong personality",
        vintage: "Classic vintage vector insignia, retro geometric badge, balanced heritage typography and timeless crest mark",
        "vintage-text": "Vintage typographic crest logo, harmonious combined vector icon and retro brand text badge"
      };

      // Color theme guidelines with exact palette mappings
      const colorGuidance: Record<string, string> = {
        "ocean-blue": "Ocean Blue harmony (Deep azure #0369A1, royal ocean blue #0284C7, and sky highlights #38BDF8)",
        emerald: "Emerald harmony (Rich botanical emerald #047857, vibrant jade #059669, and mint #34D399)",
        purple: "Purple harmony (Royal violet #5B21B6, amethyst #7C3AED, and lavender #C084FC)",
        gold: "Gold harmony (Warm amber gold #B45309, rich metallic ochre #D97706, and champagne #FDE047)",
        orange: "Orange harmony (Vibrant sunset saffron #C2410C, tangerine #EA580C, and warm peach #FDBA74)",
        crimson: "Crimson harmony (Deep ruby crimson #991B1B, scarlet red #DC2626, and rose #FCA5A5)",
        "black-white": "Monochrome slate & pure white (Deep obsidian slate #0F172A, charcoal #64748B, and pure white #F8FAFC)",
        "navy-cyan": "Navy & Cyan harmony (Midnight navy #0F172A, deep sapphire #0284C7, and electric cyan #06B6D4)",
        "pink-purple": "Pink & Purple harmony (Electric magenta rose #DB2777, ultraviolet #7E22CE, and soft blossom #F472B6)",
        "earth-tones": "Earth Tones harmony (Warm terracotta #78350F, earthy olive slate #57534E, and warm desert sand #D97706)",
        "ai-recommended": "AI-harmonized professional color palette tailored to the brand personality",
        blue: "Professional royal blue (#2563EB) and deep navy (#0F172A)",
        green: "Vibrant emerald green (#059669) and mint (#34D399)",
        red: "Bold crimson red (#DC2626) and coral (#F87171)",
        black: "Sleek monochrome black (#0F172A) and crisp charcoal (#334155)",
      };

      // Design motif guidelines
      const motifGuidance: Record<string, string> = {
        "abstract-star": "geometric abstract star motif with sharp multi-point symmetry",
        galaxy: "stylized cosmic galaxy spiral with elegant flowing vector curves",
        globe: "modern minimalist interconnected globe icon with clean longitude lines",
        cosmos: "stylized celestial lettermark symbol with clean orbital geometry",
        planet: "geometric orbital planet motif with sharp clean vector rings",
        "ai-choice": "tailored bespoke visual symbol derived directly from the brand vision"
      };

      // Fresh variation concepts ensuring each generation/regeneration creates a distinct logo concept
      const variationArchetypes = [
        "Abstract geometric glyph with clean symmetry",
        "Precision monoline vector icon with balanced flow",
        "Bold modular emblem combining clean geometric shapes",
        "Dynamic intersecting vector forms with sharp precision",
        "Harmonic circular badge crest with minimalist central icon",
        "Sleek futuristic iconographic glyph with crisp angular facets",
        "Refined minimalist monogram emblem with clean initials",
        "Dual-element interlocking symbol with modern balance"
      ];

      // Dynamic layout compositions
      const layoutArrangements = [
        `Centered composition: prominent standalone icon mark positioned directly above the readable brand name "${brandName}"`,
        `Stacked composition: bold geometric vector mark centered above clean, balanced typography "${brandName}"`,
        `Balanced emblem composition: unified vector icon and brand name "${brandName}" in perfect visual equilibrium`
      ];

      const selectedVariation = variationArchetypes[Math.floor(Math.random() * variationArchetypes.length)];
      const selectedLayout = layoutArrangements[Math.floor(Math.random() * layoutArrangements.length)];

      const activeStyle = styleGuidance[selectedStyle] || `${selectedStyle} vector logo style`;
      const activeColor =
        colorGuidance[selectedColor] ||
        (selectedColor.toLowerCase().includes("ai-recommended")
          ? "AI-harmonized professional color palette tailored to the brand personality"
          : `Bespoke color palette: ${selectedColor}`);
      const activeMotif = motifGuidance[selectedIdea] || `${selectedIdea} motif`;

      // Concise, information-dense prompt specifically calibrated for FLUX.1-schnell
      const constructedPrompt = [
        `Professional 2D vector logo design for brand "${brandName}".`,
        brandDescription ? `Brand identity: ${brandDescription}.` : "",
        `Style: ${activeStyle}.`,
        `Color scheme: ${activeColor} on solid plain white background.`,
        `Symbol: ${activeMotif}.`,
        `Composition: ${selectedLayout}.`,
        `Design concept: ${selectedVariation}.`,
        `Quality directives: Flat vector graphic design, single standalone centered logo mark, crisp clean outlines, balanced proportions, high contrast, clean modern typography "${brandName}", isolated on pure solid white background.`,
        `Avoid 3D effects, mockups, drop shadows, perspective tilts, photographic elements, textured backgrounds.`
      ].filter(Boolean).join(" ");

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          // body: JSON.stringify({
          //   prompt: constructedPrompt,
          //   steps: 4,
          //   seed: numericSeed,
          // }),

          body: JSON.stringify({
          prompt: constructedPrompt,
          steps: 4,
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Cloudflare Workers AI Error Response:", response.status, errorBody);
        throw new Error(`Cloudflare AI error (${response.status}): ${errorBody}`);
      }

      const responseData = (await response.json()) as {
        result?: { image?: string };
        success?: boolean;
        errors?: Array<{ message?: string }>;
      };

      if (!responseData || !responseData.result || !responseData.result.image) {
        const errorMsg =
          responseData?.errors?.[0]?.message ||
          "No image data returned from Cloudflare Workers AI";
        throw new Error(errorMsg);
      }

      const imageUrl = `data:image/jpeg;base64,${responseData.result.image}`;

      let savedLogo = null;

      // If user ID is provided, save directly into PostgreSQL
      if (userId) {
        const parsedUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;
        if (!isNaN(parsedUserId)) {
          savedLogo = await storage.createLogo({
            userId: parsedUserId,
            imageUrl,
            prompt,
            name: brandName,
            description: brandDescription,
            color: selectedColor,
            style: selectedStyle,
            designIdea: selectedIdea,
          });
        }
      }

      // Send to frontend
      res.json({ imageUrl, logo: savedLogo });
    } catch (error) {
      console.error("Logo generation error:", error);
      let errorMessage = "Failed to generate logo";
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed?.error?.message) {
            errorMessage = parsed.error.message;
          } else if (parsed?.errors?.[0]?.message) {
            errorMessage = parsed.errors[0].message;
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      res.status(500).json({
        error: errorMessage,
      });
    }
  });

  // 4. Get User's Logos from Database
  app.get("/api/logos", async (req, res) => {
    try {
      const userIdParam = req.query.userId;
      if (!userIdParam) {
        return res.status(400).json({ error: "userId query parameter is required" });
      }

      const userId = parseInt(userIdParam as string, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      const userLogos = await storage.getLogosByUserId(userId);
      res.json(userLogos);
    } catch (error) {
      console.error("Get logos error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch user logos",
      });
    }
  });

  // 5. Save Logo to Database
  app.post("/api/logos", async (req, res) => {
    try {
      const parseResult = insertLogoSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const logo = await storage.createLogo(parseResult.data);
      res.status(201).json(logo);
    } catch (error) {
      console.error("Save logo error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to save logo",
      });
    }
  });

  // 6. Delete Single Logo from Database
  app.delete("/api/logos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userIdParam = req.query.userId || req.body?.userId;

      if (isNaN(id) || !userIdParam) {
        return res.status(400).json({ error: "Valid logo id and userId are required" });
      }

      const userId = parseInt(userIdParam as string, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      const success = await storage.deleteLogo(id, userId);
      if (!success) {
        return res.status(404).json({ error: "Logo not found or not owned by user" });
      }

      res.json({ message: "Logo deleted successfully" });
    } catch (error) {
      console.error("Delete logo error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete logo",
      });
    }
  });

  // 7. Delete All Logos for User from Database
  app.delete("/api/logos", async (req, res) => {
    try {
      const userIdParam = req.query.userId || req.body?.userId;
      if (!userIdParam) {
        return res.status(400).json({ error: "userId is required" });
      }

      const userId = parseInt(userIdParam as string, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      await storage.deleteAllLogos(userId);
      res.json({ message: "All logos deleted successfully" });
    } catch (error) {
      console.error("Delete all logos error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete all logos",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}