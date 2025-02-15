import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const manuscripts = pgTable("manuscripts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  lastModified: timestamp("last_modified").notNull().defaultNow(),
  isPublic: boolean("is_public").notNull().default(false),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  manuscriptId: integer("manuscript_id").notNull(),
  analysis: jsonb("analysis").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  embedding: jsonb("embedding").notNull(),
  metadata: jsonb("metadata").default('{}').notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Existing schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertManuscriptSchema = createInsertSchema(manuscripts)
  .pick({
    title: true,
    content: true,
    isPublic: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    content: z.string(), // Remove minimum length requirement for initial creation
  });

export const insertReviewSchema = createInsertSchema(reviews).pick({
  manuscriptId: true,
  analysis: true,
});

// New schema for documents
export const insertDocumentSchema = createInsertSchema(documents)
  .pick({
    title: true,
    content: true,
    metadata: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    metadata: z.record(z.string(), z.any()).optional().default({}),
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Manuscript = typeof manuscripts.$inferSelect;
export type InsertManuscript = z.infer<typeof insertManuscriptSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;