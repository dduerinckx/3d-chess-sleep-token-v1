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
  generatedFromId: integer("generated_from_id"),
});

export const bookGenerations = pgTable("book_generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  numChapters: integer("num_chapters").notNull(),
  pagesPerChapter: integer("pages_per_chapter").notNull(),
  plotSummary: text("plot_summary"),
  characters: jsonb("characters").default('[]').notNull(),
  setting: text("setting"),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const bookChapters = pgTable("book_chapters", {
  id: serial("id").primaryKey(),
  bookGenerationId: integer("book_generation_id").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
    content: z.string(),
  });

export const insertBookGenerationSchema = createInsertSchema(bookGenerations)
  .pick({
    title: true,
    genre: true,
    numChapters: true,
    pagesPerChapter: true,
    plotSummary: true,
    characters: true,
    setting: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    genre: z.string().min(1, "Genre is required"),
    numChapters: z.number().min(1, "At least one chapter is required").max(50, "Maximum 50 chapters allowed"),
    pagesPerChapter: z.number().min(1, "At least one page per chapter is required").max(100, "Maximum 100 pages per chapter allowed"),
    plotSummary: z.string().optional(),
    characters: z.array(z.object({
      name: z.string(),
      description: z.string(),
      role: z.string(),
    })).default([]),
    setting: z.string().optional(),
  });

export const insertBookChapterSchema = createInsertSchema(bookChapters)
  .pick({
    bookGenerationId: true,
    chapterNumber: true,
    title: true,
    content: true,
  });

export const insertReviewSchema = createInsertSchema(reviews).pick({
  manuscriptId: true,
  analysis: true,
});

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

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Manuscript = typeof manuscripts.$inferSelect;
export type InsertManuscript = z.infer<typeof insertManuscriptSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type BookGeneration = typeof bookGenerations.$inferSelect;
export type InsertBookGeneration = z.infer<typeof insertBookGenerationSchema>;
export type BookChapter = typeof bookChapters.$inferSelect;
export type InsertBookChapter = z.infer<typeof insertBookChapterSchema>;