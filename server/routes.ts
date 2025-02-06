import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTicketSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // User routes
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const users = await storage.getUsers();
    res.json(users);
  });

  // Ticket routes
  app.get("/api/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tickets = await storage.getTickets();
    res.json(tickets);
  });

  app.post("/api/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertTicketSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const ticket = await storage.createTicket({
      ...result.data,
      createdBy: req.user!.id,
    });
    res.status(201).json(ticket);
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    const ticket = await storage.getTicket(id);
    if (!ticket) return res.sendStatus(404);

    const updatedTicket = await storage.updateTicket(id, req.body);
    res.json(updatedTicket);
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    const success = await storage.deleteTicket(id);
    if (!success) return res.sendStatus(404);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}