import type { Express } from "express";
import { Request, Response } from "express";
import fileUpload from "express-fileupload";
import path from "path";
import { promisify } from "util";
import mammoth from "mammoth";
import { createRequire } from "module";

// Create a require function for CommonJS modules
const require = createRequire(import.meta.url);
// Initialize pdf-parse without test files
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export function setupFileUpload(app: Express) {
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    abortOnLimit: true,
  }));

  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.files.file;
      if (Array.isArray(file)) {
        return res.status(400).json({ message: "Multiple files not supported" });
      }

      const extension = path.extname(file.name).toLowerCase();
      let content = "";

      switch (extension) {
        case ".pdf":
          const pdfData = await pdfParse(file.data);
          content = pdfData.text;
          break;

        case ".doc":
        case ".docx":
          const result = await mammoth.extractRawText({ buffer: file.data });
          content = result.value;
          break;

        case ".txt":
          content = file.data.toString('utf-8');
          break;

        default:
          return res.status(400).json({ message: "Unsupported file type" });
      }

      // Clean up the extracted content
      content = content
        .trim()
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines

      res.json({ content });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process file" 
      });
    }
  });
}