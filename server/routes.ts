import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/generate-logo", async (req, res) => {

    try {

      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
          error: "Prompt is required"
        });
      }

      // Short clean prompt
      const shortPrompt = encodeURIComponent(
        `${prompt}, minimalist logo, modern branding`
      );

      // Pollinations image URL
      const pollinationsUrl =
        `https://image.pollinations.ai/prompt/${shortPrompt}`;

      // Fetch image from Pollinations
      const imageResponse = await fetch(pollinationsUrl);

      if (!imageResponse.ok) {
        throw new Error("Failed to fetch generated image");
      }

      // Convert image to buffer
      const imageBuffer = await imageResponse.arrayBuffer();

      // Convert buffer to base64
      const base64Image =
        Buffer.from(imageBuffer).toString("base64");

      // Create base64 image URL
      const imageUrl =
        `data:image/png;base64,${base64Image}`;

      // Send to frontend
      res.json({ imageUrl });

    } catch (error) {

      console.error("Logo generation error:", error);

      res.status(500).json({
        error: error instanceof Error
          ? error.message
          : "Failed to generate logo"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}