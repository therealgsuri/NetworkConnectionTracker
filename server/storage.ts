import { 
  Contact, InsertContact, 
  Note, InsertNote,
  Company, InsertCompany,
  Reminder, InsertReminder,
  UserPreferences, InsertUserPreferences,
  ContactTier
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private contacts: Map<number, Contact>;
  private notes: Map<number, Note>;
  private companies: Map<number, Company>;
  private reminders: Map<number, Reminder>;
  private userPreferences: UserPreferences;
  private currentIds: {
    contacts: number;
    notes: number;
    companies: number;
    reminders: number;
  };

  constructor() {
    this.contacts = new Map();
    this.notes = new Map();
    this.companies = new Map();
    this.reminders = new Map();
    this.currentIds = {
      contacts: 1,
      notes: 1,
      companies: 1,
      reminders: 1,
    };
    this.userPreferences = {
      id: 1,
      targetCompanies: [],
      targetRoles: [],
      emailNotifications: true,
    };
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentIds.contacts++;
    const newContact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const existing = await this.getContact(id);
    if (!existing) throw new Error("Contact not found");
    
    const updated = { ...existing, ...contact };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }

  async getNotes(contactId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.contactId === contactId);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.currentIds.notes++;
    const newNote = { ...note, id };
    this.notes.set(id, newNote);
    return newNote;
  }

  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = this.currentIds.companies++;
    const newCompany = { ...company, id };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values());
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.currentIds.reminders++;
    const newReminder = { ...reminder, id };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder> {
    const existing = this.reminders.get(id);
    if (!existing) throw new Error("Reminder not found");
    
    const updated = { ...existing, ...reminder };
    this.reminders.set(id, updated);
    return updated;
  }

  async getUserPreferences(): Promise<UserPreferences> {
    return this.userPreferences;
  }

  async updateUserPreferences(prefs: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    this.userPreferences = { ...this.userPreferences, ...prefs };
    return this.userPreferences;
  }

  getContactTier(contact: Contact): ContactTier {
    const matchesCompany = this.userPreferences.targetCompanies.includes(contact.company);
    const matchesRole = this.userPreferences.targetRoles.some(role => 
      contact.role.toLowerCase().includes(role.toLowerCase())
    );

    if (matchesCompany && matchesRole) return "GOLD";
    if (matchesCompany) return "SILVER";
    return "STANDARD";
  }
}

export const storage = new MemStorage();
