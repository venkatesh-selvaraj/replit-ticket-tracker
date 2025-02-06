import { users, tickets, type User, type InsertUser, type Ticket, type InsertTicket } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  createTicket(ticket: InsertTicket & { createdBy: number }): Promise<Ticket>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTickets(): Promise<Ticket[]>;
  updateTicket(id: number, ticket: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: number): Promise<boolean>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private currentUserId: number;
  private currentTicketId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTicket(ticket: InsertTicket & { createdBy: number }): Promise<Ticket> {
    const id = this.currentTicketId++;
    const newTicket: Ticket = {
      ...ticket,
      id,
      status: "open",
      createdAt: new Date(),
    };
    this.tickets.set(id, newTicket);
    return newTicket;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const updatedTicket = { ...ticket, ...updates };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<boolean> {
    return this.tickets.delete(id);
  }
}

export const storage = new MemStorage();