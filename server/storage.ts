import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// Mock database storage for development
interface DatabaseRow {
  [key: string]: any;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  get(query: string, params?: any[]): Promise<DatabaseRow | null>;
  execute(query: string, params?: any[]): Promise<void>;
  getAll(query: string, params?: any[]): Promise<DatabaseRow[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private mockTables: Map<string, Map<string, DatabaseRow>>;

  constructor() {
    this.users = new Map();
    this.mockTables = new Map();

    // Initialize mock tables
    this.mockTables.set('user_subscriptions', new Map());
    this.mockTables.set('growth_data', new Map());
    this.mockTables.set('energy_patterns', new Map());
    this.mockTables.set('journal_entries', new Map());
    this.mockTables.set('values_data', new Map());
    this.mockTables.set('chat_messages', new Map());
    this.mockTables.set('coaching_sessions', new Map());
    this.mockTables.set('community_profiles', new Map());
    this.mockTables.set('community_members', new Map());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async get(query: string, params: any[] = []): Promise<DatabaseRow | null> {
    // Simple mock query parser for development
    const tableName = this.extractTableName(query);
    const table = this.mockTables.get(tableName);

    if (!table) return null;

    // For SELECT queries, try to find by first parameter (usually ID)
    if (query.toLowerCase().includes('select') && params.length > 0) {
      const id = params[0];
      return table.get(id) || null;
    }

    return null;
  }

  async getAll(query: string, params: any[] = []): Promise<DatabaseRow[]> {
    const tableName = this.extractTableName(query);
    const table = this.mockTables.get(tableName);

    if (!table) return [];

    console.log('Storage.all called with query:', query.substring(0, 100));
    // Mock implementation with sample data
    if (query.includes('phase_history')) {
      return [
        { user_id: params[0], phase: 'expansion', confidence: 85, start_date: new Date(), triggers: '["new_project"]' },
        { user_id: params[0], phase: 'contraction', confidence: 78, start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), triggers: '["reflection"]' }
      ];
    }
    if (query.includes('energy_patterns')) {
      return [
        { user_id: params[0], date: new Date(), mental_energy: 7, physical_energy: 6, emotional_energy: 8, spiritual_energy: 5, overall_mood: 7 },
        { user_id: params[0], date: new Date(Date.now() - 24 * 60 * 60 * 1000), mental_energy: 6, physical_energy: 7, emotional_energy: 6, spiritual_energy: 6, overall_mood: 6 }
      ];
    }
    if (query.includes('journal_entries')) {
      return [
        { content: 'Today was a breakthrough day...', ai_insights: '{"sentimentAnalysis":{"sentiment":0.8}}', detected_phase: 'expansion', sentiment: 0.8, created_at: new Date() }
      ];
    }
    return [];
  }

  async execute(query: string, params: any[] = []): Promise<void> {
    const tableName = this.extractTableName(query);
    const table = this.mockTables.get(tableName);

    if (!table) return;

    if (query.toLowerCase().includes('insert')) {
      const id = params[0] || randomUUID();
      const data = this.createMockRecord(tableName, params);
      table.set(id, data);
    } else if (query.toLowerCase().includes('update')) {
      const id = params[params.length - 1]; // Usually last parameter
      const existing = table.get(id);
      if (existing) {
        const updated = { ...existing, ...this.createMockRecord(tableName, params) };
        table.set(id, updated);
      }
    }
  }

  private extractTableName(query: string): string {
    const match = query.match(/FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)/i);
    return match ? (match[1] || match[2] || match[3]) : 'unknown';
  }

  private createMockRecord(tableName: string, params: any[]): DatabaseRow {
    const now = new Date().toISOString();

    switch (tableName) {
      case 'user_subscriptions':
        return {
          user_id: params[0],
          tier: params[1] || 'free',
          status: params[2] || 'active',
          current_period_start: params[3] || now,
          current_period_end: params[4] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: params[5] || false,
          created_at: now,
          updated_at: now
        };
      case 'growth_data':
        return {
          user_id: params[0],
          current_phase: params[1] || 'expansion',
          phase_progress: params[2] || 0.6,
          phase_start_date: params[3] || now,
          created_at: now,
          updated_at: now
        };
      case 'chat_messages':
        return {
          user_id: params[0],
          message: params[1] || '',
          is_user: params[2] || true,
          created_at: now
        };
      default:
        return {
          id: randomUUID(),
          created_at: now,
          updated_at: now
        };
    }
  }
}

export const storage = new MemStorage();