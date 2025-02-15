import { User, InsertUser, Manuscript, InsertManuscript, Review, InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Manuscript operations
  getManuscript(id: number): Promise<Manuscript | undefined>;
  getManuscriptsByUser(userId: number): Promise<Manuscript[]>;
  createManuscript(manuscript: InsertManuscript & { userId: number }): Promise<Manuscript>;
  updateManuscript(id: number, manuscript: Partial<InsertManuscript>): Promise<Manuscript>;
  deleteManuscript(id: number): Promise<void>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByManuscript(manuscriptId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private manuscripts: Map<number, Manuscript>;
  private reviews: Map<number, Review>;
  sessionStore: session.Store;
  private currentUserId: number;
  private currentManuscriptId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.manuscripts = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentManuscriptId = 1;
    this.currentReviewId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
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
    const user = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async getManuscript(id: number): Promise<Manuscript | undefined> {
    return this.manuscripts.get(id);
  }

  async getManuscriptsByUser(userId: number): Promise<Manuscript[]> {
    return Array.from(this.manuscripts.values()).filter(
      (manuscript) => manuscript.userId === userId,
    );
  }

  async createManuscript(
    manuscript: InsertManuscript & { userId: number },
  ): Promise<Manuscript> {
    const id = this.currentManuscriptId++;
    const newManuscript: Manuscript = {
      id,
      ...manuscript,
      lastModified: new Date(),
      isPublic: manuscript.isPublic ?? false,
    };
    this.manuscripts.set(id, newManuscript);
    return newManuscript;
  }

  async updateManuscript(
    id: number,
    manuscript: Partial<InsertManuscript>,
  ): Promise<Manuscript> {
    const existing = await this.getManuscript(id);
    if (!existing) throw new Error("Manuscript not found");

    const updated = {
      ...existing,
      ...manuscript,
      lastModified: new Date(),
    };
    this.manuscripts.set(id, updated);
    return updated;
  }

  async deleteManuscript(id: number): Promise<void> {
    this.manuscripts.delete(id);
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByManuscript(manuscriptId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.manuscriptId === manuscriptId,
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview = {
      id,
      ...review,
      createdAt: new Date(),
    };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export const storage = new MemStorage();