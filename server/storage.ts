import { type User, type InsertUser } from "@shared/schema";
import { 
  type Goal, 
  type InsertGoal, 
  type GoalProgress, 
  type InsertGoalProgress,
  type GoalRelationship,
  type InsertGoalRelationship,
  type ConversationGoalLink,
  type InsertConversationGoalLink 
} from "@shared/growth-schema";
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
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<Array<{ id: string; username: string; followedAt: Date }>>;
  getFollowing(userId: string): Promise<Array<{ id: string; username: string; followedAt: Date }>>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // Goal management operations
  getGoalsByUserId(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalProgress(goalId: string, progress: number): Promise<void>;
  createGoalProgress(progress: InsertGoalProgress): Promise<GoalProgress>;
  getRecentGoalProgress(userId: string, days: number): Promise<GoalProgress[]>;
  createGoalRelationship(relationship: InsertGoalRelationship): Promise<GoalRelationship>;
  createConversationGoalLink(link: InsertConversationGoalLink): Promise<ConversationGoalLink>;
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
    this.mockTables.set('user_follows', new Map());
    
    // Goal management tables
    this.mockTables.set('goals', new Map());
    this.mockTables.set('goal_progress', new Map());
    this.mockTables.set('goal_relationships', new Map());
    this.mockTables.set('conversation_goal_links', new Map());
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

  // Follow operations implementation
  async followUser(followerId: string, followingId: string): Promise<void> {
    const followsTable = this.mockTables.get('user_follows');
    if (!followsTable) return;

    const followId = randomUUID();
    const follow = {
      id: followId,
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date(),
    };
    
    followsTable.set(followId, follow);
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const followsTable = this.mockTables.get('user_follows');
    if (!followsTable) return;

    // Find and remove the follow relationship
    for (const id of followsTable.keys()) {
      const follow = followsTable.get(id);
      if (follow && follow.follower_id === followerId && follow.following_id === followingId) {
        followsTable.delete(id);
        break;
      }
    }
  }

  async getFollowers(userId: string): Promise<Array<{ id: string; username: string; followedAt: Date }>> {
    const followsTable = this.mockTables.get('user_follows');
    if (!followsTable) return [];

    const followers = [];
    for (const id of followsTable.keys()) {
      const follow = followsTable.get(id);
      if (follow && follow.following_id === userId) {
        const followerUser = this.users.get(follow.follower_id);
        if (followerUser) {
          followers.push({
            id: followerUser.id,
            username: followerUser.username,
            followedAt: follow.created_at,
          });
        }
      }
    }
    
    return followers;
  }

  async getFollowing(userId: string): Promise<Array<{ id: string; username: string; followedAt: Date }>> {
    const followsTable = this.mockTables.get('user_follows');
    if (!followsTable) return [];

    const following = [];
    for (const id of followsTable.keys()) {
      const follow = followsTable.get(id);
      if (follow && follow.follower_id === userId) {
        const followedUser = this.users.get(follow.following_id);
        if (followedUser) {
          following.push({
            id: followedUser.id,
            username: followedUser.username,
            followedAt: follow.created_at,
          });
        }
      }
    }
    
    return following;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const followsTable = this.mockTables.get('user_follows');
    if (!followsTable) return false;

    for (const id of Array.from(followsTable.keys())) {
      const follow = followsTable.get(id);
      if (follow && follow.follower_id === followerId && follow.following_id === followingId) {
        return true;
      }
    }
    
    return false;
  }

  // Goal management methods
  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    const goalsTable = this.mockTables.get('goals');
    if (!goalsTable) return [];

    const goals: Goal[] = [];
    for (const id of Array.from(goalsTable.keys())) {
      const goal = goalsTable.get(id);
      if (goal && goal.userId === userId) {
        goals.push({
          id: goal.id,
          userId: goal.userId,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          priority: goal.priority,
          status: goal.status,
          progress: goal.progress,
          detectedFromConversation: goal.detectedFromConversation,
          emotionalInvestment: goal.emotionalInvestment,
          urgency: goal.urgency,
          targetDate: goal.targetDate,
          completedAt: goal.completedAt,
          lastMentioned: goal.lastMentioned,
          aiInsights: goal.aiInsights,
          conversationContext: goal.conversationContext,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
        });
      }
    }
    
    return goals;
  }

  async createGoal(goalData: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const now = new Date();
    const goal: Goal = {
      id,
      ...goalData,
      createdAt: now,
      updatedAt: now,
    };
    
    const goalsTable = this.mockTables.get('goals');
    goalsTable?.set(id, goal);
    
    return goal;
  }

  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    const goalsTable = this.mockTables.get('goals');
    if (!goalsTable) return;

    const goal = goalsTable.get(goalId);
    if (goal) {
      goal.progress = progress;
      goal.updatedAt = new Date();
      goalsTable.set(goalId, goal);
    }
  }

  async createGoalProgress(progressData: InsertGoalProgress): Promise<GoalProgress> {
    const id = randomUUID();
    const now = new Date();
    const progress: GoalProgress = {
      id,
      ...progressData,
      createdAt: now,
    };
    
    const progressTable = this.mockTables.get('goal_progress');
    progressTable?.set(id, progress);
    
    return progress;
  }

  async getRecentGoalProgress(userId: string, days: number): Promise<GoalProgress[]> {
    const progressTable = this.mockTables.get('goal_progress');
    if (!progressTable) return [];

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentProgress: GoalProgress[] = [];
    
    for (const id of Array.from(progressTable.keys())) {
      const progress = progressTable.get(id);
      if (progress && 
          progress.userId === userId && 
          new Date(progress.createdAt) >= cutoffDate) {
        recentProgress.push({
          id: progress.id,
          goalId: progress.goalId,
          userId: progress.userId,
          progressPercentage: progress.progressPercentage,
          detectedActivity: progress.detectedActivity,
          conversationExcerpt: progress.conversationExcerpt,
          aiConfidence: progress.aiConfidence,
          momentum: progress.momentum,
          obstacles: progress.obstacles,
          createdAt: progress.createdAt,
        });
      }
    }
    
    return recentProgress.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createGoalRelationship(relationshipData: InsertGoalRelationship): Promise<GoalRelationship> {
    const id = randomUUID();
    const now = new Date();
    const relationship: GoalRelationship = {
      id,
      ...relationshipData,
      createdAt: now,
    };
    
    const relationshipsTable = this.mockTables.get('goal_relationships');
    relationshipsTable?.set(id, relationship);
    
    return relationship;
  }

  async createConversationGoalLink(linkData: InsertConversationGoalLink): Promise<ConversationGoalLink> {
    const id = randomUUID();
    const now = new Date();
    const link: ConversationGoalLink = {
      id,
      ...linkData,
      createdAt: now,
    };
    
    const linksTable = this.mockTables.get('conversation_goal_links');
    linksTable?.set(id, link);
    
    return link;
  }
}

export const storage = new MemStorage();