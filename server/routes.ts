import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Logo generation endpoint
  app.post("/api/generate-logo", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.HUGGINGFACE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Hugging Face API key not configured" });
      }

      // Call Hugging Face Stable Diffusion API
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: 30,
              guidance_scale: 7.5,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Hugging Face API error:", errorText);
        
        // Check if model is loading
        if (response.status === 503) {
          return res.status(503).json({ 
            error: "Model is currently loading. Please try again in a few moments." 
          });
        }
        
        return res.status(response.status).json({ 
          error: "Failed to generate logo. Please try again." 
        });
      }

      // Get the image as a buffer
      const imageBuffer = await response.arrayBuffer();
      
      // Convert to base64 for easy frontend display
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      res.json({ imageUrl });
    } catch (error) {
      console.error("Logo generation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
