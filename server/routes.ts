import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertManuscriptSchema } from "@shared/schema";
import { analyzeManuscript } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Manuscripts
  app.get("/api/manuscripts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const manuscripts = await storage.getManuscriptsByUser(req.user.id);
    res.json(manuscripts);
  });

  app.get("/api/manuscripts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const manuscript = await storage.getManuscript(parseInt(req.params.id));
    if (!manuscript) return res.sendStatus(404);
    if (manuscript.userId !== req.user.id && !manuscript.isPublic) {
      return res.sendStatus(403);
    }
    res.json(manuscript);
  });

  app.post("/api/manuscripts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertManuscriptSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const manuscript = await storage.createManuscript({
      ...parsed.data,
      userId: req.user.id,
    });
    res.status(201).json(manuscript);
  });

  app.patch("/api/manuscripts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const manuscript = await storage.getManuscript(parseInt(req.params.id));
    if (!manuscript) return res.sendStatus(404);
    if (manuscript.userId !== req.user.id) return res.sendStatus(403);

    const parsed = insertManuscriptSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const updated = await storage.updateManuscript(manuscript.id, parsed.data);
    res.json(updated);
  });

  app.delete("/api/manuscripts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const manuscript = await storage.getManuscript(parseInt(req.params.id));
    if (!manuscript) return res.sendStatus(404);
    if (manuscript.userId !== req.user.id) return res.sendStatus(403);

    await storage.deleteManuscript(manuscript.id);
    res.sendStatus(204);
  });

  // Reviews
  app.post("/api/manuscripts/:id/review", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const manuscript = await storage.getManuscript(parseInt(req.params.id));
    if (!manuscript) return res.sendStatus(404);
    if (manuscript.userId !== req.user.id) return res.sendStatus(403);

    try {
      const analysis = await analyzeManuscript(manuscript.content);
      const review = await storage.createReview({
        manuscriptId: manuscript.id,
        analysis,
      });
      res.status(201).json(review);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/manuscripts/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const manuscript = await storage.getManuscript(parseInt(req.params.id));
    if (!manuscript) return res.sendStatus(404);
    if (manuscript.userId !== req.user.id && !manuscript.isPublic) {
      return res.sendStatus(403);
    }

    const reviews = await storage.getReviewsByManuscript(manuscript.id);
    res.json(reviews);
  });

  const httpServer = createServer(app);
  return httpServer;
}