import { User, InsertUser, Manuscript, InsertManuscript, Review, InsertReview, Document, InsertDocument, BookGeneration, InsertBookGeneration, BookChapter, InsertBookChapter } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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

  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument & { userId: number; embedding: number[] }): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument> & { embedding?: number[] }): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  searchDocuments(userId: number, embedding: number[], limit?: number): Promise<Document[]>;

  // New book generation operations
  getBookGeneration(id: number): Promise<BookGeneration | undefined>;
  getBookGenerationsByUser(userId: number): Promise<BookGeneration[]>;
  createBookGeneration(bookGeneration: InsertBookGeneration & { userId: number }): Promise<BookGeneration>;
  updateBookGenerationStatus(id: number, status: string, completedAt?: Date): Promise<BookGeneration>;

  // Book chapter operations
  getBookChapter(id: number): Promise<BookChapter | undefined>;
  getBookChaptersByGeneration(bookGenerationId: number): Promise<BookChapter[]>;
  createBookChapter(chapter: InsertBookChapter): Promise<BookChapter>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async getManuscript(id: number): Promise<Manuscript | undefined> {
    const [manuscript] = await db.select().from(schema.manuscripts).where(eq(schema.manuscripts.id, id));
    return manuscript;
  }

  async getManuscriptsByUser(userId: number): Promise<Manuscript[]> {
    return await db.select().from(schema.manuscripts).where(eq(schema.manuscripts.userId, userId));
  }

  async createManuscript(manuscript: InsertManuscript & { userId: number }): Promise<Manuscript> {
    const [newManuscript] = await db.insert(schema.manuscripts).values({
      ...manuscript,
      lastModified: new Date(),
      isPublic: manuscript.isPublic ?? false,
    }).returning();
    return newManuscript;
  }

  async updateManuscript(id: number, manuscript: Partial<InsertManuscript>): Promise<Manuscript> {
    const [updated] = await db
      .update(schema.manuscripts)
      .set({
        ...manuscript,
        lastModified: new Date(),
      })
      .where(eq(schema.manuscripts.id, id))
      .returning();

    if (!updated) throw new Error("Manuscript not found");
    return updated;
  }

  async deleteManuscript(id: number): Promise<void> {
    await db.delete(schema.manuscripts).where(eq(schema.manuscripts.id, id));
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
    return review;
  }

  async getReviewsByManuscript(manuscriptId: number): Promise<Review[]> {
    return await db.select().from(schema.reviews).where(eq(schema.reviews.manuscriptId, manuscriptId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(schema.reviews).values({
      ...review,
      createdAt: new Date(),
    }).returning();
    return newReview;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
    return document;
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.userId, userId))
      .orderBy(desc(schema.documents.updatedAt));
  }

  async createDocument(
    document: InsertDocument & { userId: number; embedding: number[] }
  ): Promise<Document> {
    const [newDocument] = await db
      .insert(schema.documents)
      .values({
        ...document,
        embedding: document.embedding,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newDocument;
  }

  async updateDocument(
    id: number,
    document: Partial<InsertDocument> & { embedding?: number[] }
  ): Promise<Document> {
    const [updated] = await db
      .update(schema.documents)
      .set({
        ...document,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, id))
      .returning();

    if (!updated) throw new Error("Document not found");
    return updated;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(schema.documents).where(eq(schema.documents.id, id));
  }

  async searchDocuments(
    userId: number,
    embedding: number[],
    limit: number = 10
  ): Promise<Document[]> {
    // For now, return all documents. In a future update, we'll implement vector similarity search
    return await this.getDocumentsByUser(userId);
  }

  async getBookGeneration(id: number): Promise<BookGeneration | undefined> {
    const [generation] = await db
      .select()
      .from(schema.bookGenerations)
      .where(eq(schema.bookGenerations.id, id));
    return generation;
  }

  async getBookGenerationsByUser(userId: number): Promise<BookGeneration[]> {
    return await db
      .select()
      .from(schema.bookGenerations)
      .where(eq(schema.bookGenerations.userId, userId))
      .orderBy(desc(schema.bookGenerations.createdAt));
  }

  async createBookGeneration(
    bookGeneration: InsertBookGeneration & { userId: number }
  ): Promise<BookGeneration> {
    const [generation] = await db
      .insert(schema.bookGenerations)
      .values({
        ...bookGeneration,
        status: 'pending',
        createdAt: new Date(),
      })
      .returning();
    return generation;
  }

  async updateBookGenerationStatus(
    id: number,
    status: string,
    completedAt?: Date
  ): Promise<BookGeneration> {
    const [updated] = await db
      .update(schema.bookGenerations)
      .set({
        status,
        completedAt: completedAt || null,
      })
      .where(eq(schema.bookGenerations.id, id))
      .returning();

    if (!updated) throw new Error("Book generation not found");
    return updated;
  }

  async getBookChapter(id: number): Promise<BookChapter | undefined> {
    const [chapter] = await db
      .select()
      .from(schema.bookChapters)
      .where(eq(schema.bookChapters.id, id));
    return chapter;
  }

  async getBookChaptersByGeneration(bookGenerationId: number): Promise<BookChapter[]> {
    return await db
      .select()
      .from(schema.bookChapters)
      .where(eq(schema.bookChapters.bookGenerationId, bookGenerationId))
      .orderBy(schema.bookChapters.chapterNumber);
  }

  async createBookChapter(chapter: InsertBookChapter): Promise<BookChapter> {
    const [newChapter] = await db
      .insert(schema.bookChapters)
      .values({
        ...chapter,
        createdAt: new Date(),
      })
      .returning();
    return newChapter;
  }
}

export const storage = new DatabaseStorage();