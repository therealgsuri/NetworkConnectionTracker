import { 
  Contact, InsertContact, 
  Note, InsertNote,
  Company, InsertCompany,
  Reminder, InsertReminder,
  UserPreferences, InsertUserPreferences,
  ContactTier,
  contacts,
  notes,
  companies,
  reminders,
  userPreferences
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, or } from "drizzle-orm";

export interface IStorage {
  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Notes
  getNotes(contactId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  getAllNotes(): Promise<Note[]>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note>;

  // Companies
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;

  // Reminders
  getReminders(): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder>;

  // User Preferences
  getUserPreferences(): Promise<UserPreferences>;
  updateUserPreferences(prefs: Partial<InsertUserPreferences>): Promise<UserPreferences>;

  // Contact Tier
  getContactTier(contact: Contact): ContactTier;

  // Add new methods for handling duplicates
  findDuplicateContacts(name: string): Promise<Contact[]>;
  mergeContacts(primaryId: number, duplicateIds: number[]): Promise<Contact>;
}

export class DatabaseStorage implements IStorage {
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const [updated] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    if (!updated) throw new Error("Contact not found");
    return updated;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async getNotes(contactId: number): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.contactId, contactId));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async getAllNotes(): Promise<Note[]> {
    return await db.select().from(notes);
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note> {
    const [updated] = await db
      .update(notes)
      .set(note)
      .where(eq(notes.id, id))
      .returning();
    if (!updated) throw new Error("Note not found");
    return updated;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getReminders(): Promise<Reminder[]> {
    return await db.select().from(reminders);
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [newReminder] = await db.insert(reminders).values(reminder).returning();
    return newReminder;
  }

  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder> {
    const [updated] = await db
      .update(reminders)
      .set(reminder)
      .where(eq(reminders.id, id))
      .returning();
    if (!updated) throw new Error("Reminder not found");
    return updated;
  }

  async getUserPreferences(): Promise<UserPreferences> {
    const [prefs] = await db.select().from(userPreferences);
    if (!prefs) {
      // Create default preferences if none exist
      const defaultPrefs: InsertUserPreferences = {
        targetCompanies: [],
        targetRoles: [],
        emailNotifications: true,
      };
      const [newPrefs] = await db.insert(userPreferences).values(defaultPrefs).returning();
      return newPrefs;
    }
    return prefs;
  }

  async updateUserPreferences(prefs: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [existing] = await db.select().from(userPreferences);
    if (!existing) {
      const [newPrefs] = await db.insert(userPreferences).values({
        ...prefs,
        targetCompanies: prefs.targetCompanies || [],
        targetRoles: prefs.targetRoles || [],
        emailNotifications: prefs.emailNotifications ?? true,
      }).returning();
      return newPrefs;
    }

    const [updated] = await db
      .update(userPreferences)
      .set(prefs)
      .where(eq(userPreferences.id, existing.id))
      .returning();
    return updated;
  }

  getContactTier(contact: Contact): ContactTier {
    const targetCompanies = []; // Will be populated from user preferences
    const targetRoles = []; // Will be populated from user preferences

    const matchesCompany = targetCompanies.includes(contact.company);
    const matchesRole = targetRoles.some(role => 
      contact.role.toLowerCase().includes(role.toLowerCase())
    );

    if (matchesCompany && matchesRole) return "GOLD";
    if (matchesCompany) return "SILVER";
    return "STANDARD";
  }

  async findDuplicateContacts(name: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(ilike(contacts.name, `%${name}%`)); // Added % wildcards for partial matches
  }

  async mergeContacts(primaryId: number, duplicateIds: number[]): Promise<Contact> {
    // Start a transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      // Get the primary contact
      const [primaryContact] = await tx
        .select()
        .from(contacts)
        .where(eq(contacts.id, primaryId));

      if (!primaryContact) {
        throw new Error("Primary contact not found");
      }

      // Move all notes from duplicate contacts to the primary contact
      await tx
        .update(notes)
        .set({ contactId: primaryId })
        .where(or(...duplicateIds.map(id => eq(notes.contactId, id))));

      // Move all reminders from duplicate contacts to the primary contact
      await tx
        .update(reminders)
        .set({ contactId: primaryId })
        .where(or(...duplicateIds.map(id => eq(reminders.contactId, id))));

      // Delete the duplicate contacts
      await tx
        .delete(contacts)
        .where(or(...duplicateIds.map(id => eq(contacts.id, id))));

      return primaryContact;
    });
  }
}

export const storage = new DatabaseStorage();