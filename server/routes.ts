import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNoteSchema, insertCompanySchema, insertReminderSchema, insertUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import mammoth from "mammoth";
import { summarizeConversation, generateConversationTitle } from "./utils/openai";

// Configure multer for Word documents only
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Only Word documents (.doc or .docx) are allowed'));
    }
  }
});

// Function to parse filename for date and name
function parseFilename(filename: string): { date: string | null; name: string | null } {
  const match = filename.match(/^(\d{8})\s*-\s*(.+?)(\.docx?)?$/i);
  if (!match) return { date: null, name: null };

  const [, dateStr, name] = match;
  // Format YYYYMMDD to YYYY-MM-DD
  const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

  return {
    date: formattedDate,
    name: name.trim()
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Contacts
  app.get("/api/contacts", async (_req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.get("/api/contacts/:id", async (req, res) => {
    const contact = await storage.getContact(Number(req.params.id));
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  });

  app.post("/api/contacts", async (req, res) => {
    const result = insertContactSchema.safeParse(req.body);
    if (!result.success) {
      console.error('Contact validation failed:', result.error.errors);
      return res.status(400).json({ errors: result.error.errors });
    }

    try {
      const contact = await storage.createContact(result.data);
      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ message: "Failed to create contact", error: error.message });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    const result = insertContactSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    try {
      const contact = await storage.updateContact(Number(req.params.id), result.data);
      res.json(contact);
    } catch (error) {
      res.status(404).json({ message: "Contact not found" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    await storage.deleteContact(Number(req.params.id));
    res.status(204).send();
  });

  // New route for searching contacts
  app.get("/api/contacts/search", async (req, res) => {
    try {
      const name = req.query.name as string;
      if (!name) {
        return res.status(400).json({ message: "Name parameter is required" });
      }

      const contacts = await storage.getContacts();
      const matchingContact = contacts.find(c =>
        c.name.toLowerCase() === name.toLowerCase()
      );

      res.json(matchingContact || null);
    } catch (error) {
      console.error('Error searching contacts:', error);
      res.status(500).json({ message: "Failed to search contacts" });
    }
  });

  // Add these routes after the existing contacts routes
  app.get("/api/contacts/duplicates/:name", async (req, res) => {
    try {
      const duplicates = await storage.findDuplicateContacts(req.params.name);
      res.json(duplicates);
    } catch (error) {
      console.error('Error finding duplicate contacts:', error);
      res.status(500).json({ message: "Failed to find duplicate contacts" });
    }
  });

  app.post("/api/contacts/merge", async (req, res) => {
    try {
      const { primaryId, duplicateIds } = req.body;

      if (!primaryId || !duplicateIds || !Array.isArray(duplicateIds)) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const mergedContact = await storage.mergeContacts(primaryId, duplicateIds);
      res.json(mergedContact);
    } catch (error) {
      console.error('Error merging contacts:', error);
      res.status(500).json({ message: "Failed to merge contacts" });
    }
  });


  // Notes
  app.get("/api/contacts/:id/notes", async (req, res) => {
    const notes = await storage.getNotes(Number(req.params.id));
    res.json(notes);
  });

  app.post("/api/notes", async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    const note = await storage.createNote(result.data);
    res.status(201).json(note);
  });

  // Add this new route after the existing note routes
  app.post("/api/notes/regenerate-summaries", async (_req, res) => {
    try {
      const allNotes = await storage.getAllNotes();
      console.log(`Processing ${allNotes.length} notes for summary regeneration`);

      for (const note of allNotes) {
        try {
          if (note.content) {
            const [summary, title] = await Promise.all([
              summarizeConversation(note.content),
              generateConversationTitle(note.content)
            ]);

            await storage.updateNote(note.id, {
              summary,
              title
            });

            console.log(`Updated note ${note.id} with new summary: ${summary}`);
          }
        } catch (error) {
          console.error(`Error processing note ${note.id}:`, error);
        }
      }

      res.json({ message: "Successfully updated all note summaries" });
    } catch (error) {
      console.error('Error regenerating summaries:', error);
      res.status(500).json({ message: "Failed to regenerate summaries" });
    }
  });

  // Companies
  app.get("/api/companies", async (_req, res) => {
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.post("/api/companies", async (req, res) => {
    const result = insertCompanySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    const company = await storage.createCompany(result.data);
    res.status(201).json(company);
  });

  // Reminders
  app.get("/api/reminders", async (_req, res) => {
    const reminders = await storage.getReminders();
    res.json(reminders);
  });

  app.post("/api/reminders", async (req, res) => {
    const result = insertReminderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    const reminder = await storage.createReminder(result.data);
    res.status(201).json(reminder);
  });

  app.patch("/api/reminders/:id", async (req, res) => {
    const result = insertReminderSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    try {
      const reminder = await storage.updateReminder(Number(req.params.id), result.data);
      res.json(reminder);
    } catch (error) {
      res.status(404).json({ message: "Reminder not found" });
    }
  });

  // User Preferences
  app.get("/api/preferences", async (_req, res) => {
    const prefs = await storage.getUserPreferences();
    res.json(prefs);
  });

  app.patch("/api/preferences", async (req, res) => {
    const result = insertUserPreferencesSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    const prefs = await storage.updateUserPreferences(result.data);
    res.json(prefs);
  });

  // Updated document processing route
  app.post("/api/documents/process", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('Processing file:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Extract date and name from filename
      const { date, name } = parseFilename(req.file.originalname);

      if (!date || !name) {
        return res.status(400).json({
          message: "Invalid filename format. Expected: YYYYMMDD - Name.docx"
        });
      }

      // Convert Word document to text
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      const text = result.value;

      if (!text) {
        return res.status(400).json({ message: "No text content found in document" });
      }

      // Generate summary and title using OpenAI
      const [summary, title] = await Promise.all([
        summarizeConversation(text),
        generateConversationTitle(text)
      ]);

      console.log('Extracted text length:', text.length);
      console.log('Generated summary:', summary);
      console.log('Generated title:', title);

      // Extract potential contact information using improved parsing
      const lines = text.split('\n');
      const contactInfo: Record<string, string> = {
        name,  // Use name from filename
        meetingDate: date,  // Use date from filename
        summary: summary,  // Add the generated summary
        title: title      // Add the generated title
      };

      // More robust parsing for additional information
      for (const line of lines) {
        const normalizedLine = line.toLowerCase().trim();

        if (normalizedLine.includes('company:') || normalizedLine.includes('organization:')) {
          contactInfo.company = line.split(/:|(?<=company|organization)\s/i)[1]?.trim() || '';
        }
        if (normalizedLine.includes('role:') || normalizedLine.includes('title:') || normalizedLine.includes('position:')) {
          contactInfo.role = line.split(/:|(?<=role|title|position)\s/i)[1]?.trim() || '';
        }
        if (normalizedLine.includes('email:')) {
          contactInfo.email = line.split(/:|(?<=email)\s/i)[1]?.trim() || '';
        }
      }

      // If company isn't found in the text, set a default
      if (!contactInfo.company) {
        contactInfo.company = "Unknown Company";
      }

      // If role isn't found in the text, set a default
      if (!contactInfo.role) {
        contactInfo.role = "Unknown Role";
      }

      console.log('Extracted contact info:', contactInfo);

      res.json({
        text,
        extractedContact: contactInfo
      });
    } catch (error) {
      console.error('Error processing document:', error);
      res.status(500).json({
        message: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}