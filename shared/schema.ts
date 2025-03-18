import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database tables
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  linkedinUrl: text("linkedin_url"),
  email: text("email"),
  phone: text("phone"),
  lastContactDate: timestamp("last_contact_date").notNull(),
  nextContactDate: timestamp("next_contact_date"),
  notes: text("notes"),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  content: text("content").notNull(),
  meetingDate: timestamp("meeting_date").notNull(),
  documentUrl: text("document_url"),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isTarget: boolean("is_target").notNull().default(false),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  targetCompanies: text("target_companies").array(),
  targetRoles: text("target_roles").array(),
  emailNotifications: boolean("email_notifications").notNull().default(true),
});

// Base schemas from drizzle-zod
const baseContactSchema = createInsertSchema(contacts);
const baseNoteSchema = createInsertSchema(notes);
const baseCompanySchema = createInsertSchema(companies);
const baseReminderSchema = createInsertSchema(reminders);
const baseUserPreferencesSchema = createInsertSchema(userPreferences);

// Extended schemas with custom validation
export const insertContactSchema = baseContactSchema.extend({
  linkedinUrl: z.string().url().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  lastContactDate: z.string().transform((date) => new Date(date)),
  nextContactDate: z.string().nullable().transform((date) => date ? new Date(date) : null),
  notes: z.string().nullable(),
}).omit({ id: true });

export const insertNoteSchema = baseNoteSchema.extend({
  meetingDate: z.string().transform((date) => new Date(date)),
  documentUrl: z.string().url().nullable(),
}).omit({ id: true });

export const insertCompanySchema = baseCompanySchema.omit({ id: true });

export const insertReminderSchema = baseReminderSchema.extend({
  dueDate: z.string().transform((date) => new Date(date)),
}).omit({ id: true });

export const insertUserPreferencesSchema = baseUserPreferencesSchema.omit({ id: true });

// Types
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type ContactTier = "GOLD" | "SILVER" | "STANDARD";