
import type { Express } from "express";
import { setupAuth } from "./auth";
import { storage } from "./storage";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function setupRoutes(app: Express) {
  // Setup authentication routes
  setupAuth(app);

  // Products API
  app.get("/api/products", async (req, res, next) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", requireAuth, async (req, res, next) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Announcements API
  app.get("/api/announcements", async (req, res, next) => {
    try {
      const announcement = await storage.getActiveAnnouncement();
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/announcements", requireAuth, async (req, res, next) => {
    try {
      const announcement = await storage.updateAnnouncement(req.body);
      res.status(201).json(announcement);
    } catch (error) {
      next(error);
    }
  });

  // Users API
  app.get("/api/users", requireAuth, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // Chat sessions API (returning empty for now)
  app.get("/api/chat-sessions", (req, res) => {
    res.json([]);
  });
}
