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

  // 3. AI Logo Generation via Pollinations AI + DB Persistence
  app.post("/api/generate-logo", async (req, res) => {
    try {
      const { prompt, name, description, color, style, designIdea, userId } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
          error: "Prompt is required",
        });
      }

      // Short clean prompt
      const shortPrompt = encodeURIComponent(
        `${prompt}, minimalist logo, modern branding`
      );

      // Pollinations image URL
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${shortPrompt}`;

      // Fetch image from Pollinations
      const imageResponse = await fetch(pollinationsUrl);

      if (!imageResponse.ok) {
        throw new Error("Failed to fetch generated image from AI service");
      }

      // Convert image to buffer
      const imageBuffer = await imageResponse.arrayBuffer();

      // Convert buffer to base64 Data URL
      const base64Image = Buffer.from(imageBuffer).toString("base64");
      const imageUrl = `data:image/png;base64,${base64Image}`;

      let savedLogo = null;

      // If user ID is provided, save directly into PostgreSQL
      if (userId) {
        const parsedUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;
        if (!isNaN(parsedUserId)) {
          savedLogo = await storage.createLogo({
            userId: parsedUserId,
            imageUrl,
            prompt,
            name: name || "Custom Logo",
            description: description || "",
            color: color || "custom",
            style: style || "minimalist",
            designIdea: designIdea || "ai-choice",
          });
        }
      }

      // Send to frontend
      res.json({ imageUrl, logo: savedLogo });
    } catch (error) {
      console.error("Logo generation error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to generate logo",
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