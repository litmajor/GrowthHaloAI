
import { db } from './db';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { users } from '../shared/schema';
import { adminUsers, userAnalytics, digitalTwinProfiles, systemMetrics, auditLogs } from '../shared/admin-schema';
import { memories, emotionalDataPoints, conversationThemes } from '../shared/growth-schema';
import { beliefs, contradictions } from '../shared/phase2-schema';

export class AdminService {
  async verifyAdminAccess(userId: string): Promise<boolean> {
    const admin = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, userId))
      .limit(1);
    
    return admin.length > 0;
  }

  async createAdmin(userId: string, role: string, permissions: string[]) {
    const adminId = `admin_${Date.now()}`;
    
    await db.insert(adminUsers).values({
      id: adminId,
      userId,
      role,
      permissions,
    });

    return adminId;
  }

  async getUserAnalytics(userId?: string) {
    if (userId) {
      return await db.select()
        .from(userAnalytics)
        .where(eq(userAnalytics.userId, userId))
        .limit(1);
    }

    return await db.select()
      .from(userAnalytics)
      .orderBy(desc(userAnalytics.growthScore));
  }

  async getDigitalTwinProfile(userId: string) {
    const [profile] = await db.select()
      .from(digitalTwinProfiles)
      .where(eq(digitalTwinProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return null;
    }

    // Enrich with additional data
    const [userMemories] = await db.select({ count: sql<number>`count(*)` })
      .from(memories)
      .where(eq(memories.userId, userId));

    const [userBeliefs] = await db.select({ count: sql<number>`count(*)` })
      .from(beliefs)
      .where(eq(beliefs.userId, userId));

    const [userContradictions] = await db.select({ count: sql<number>`count(*)` })
      .from(contradictions)
      .where(eq(contradictions.userId, userId));

    return {
      ...profile,
      stats: {
        totalMemories: userMemories?.count || 0,
        totalBeliefs: userBeliefs?.count || 0,
        totalContradictions: userContradictions?.count || 0,
      }
    };
  }

  async getSystemMetrics(timeRange: 'hour' | 'day' | 'week' = 'day') {
    const now = new Date();
    const cutoff = new Date();
    
    if (timeRange === 'hour') cutoff.setHours(now.getHours() - 1);
    else if (timeRange === 'day') cutoff.setDate(now.getDate() - 1);
    else cutoff.setDate(now.getDate() - 7);

    const metrics = await db.select()
      .from(systemMetrics)
      .where(gte(systemMetrics.timestamp, cutoff))
      .orderBy(desc(systemMetrics.timestamp));

    return metrics;
  }

  async getAllUsers(limit: number = 50, offset: number = 0) {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
    })
    .from(users)
    .limit(limit)
    .offset(offset);

    // Get analytics for each user
    const userIds = allUsers.map(u => u.id);
    const analytics = await db.select()
      .from(userAnalytics)
      .where(sql`${userAnalytics.userId} IN ${userIds}`);

    return allUsers.map(user => ({
      ...user,
      analytics: analytics.find(a => a.userId === user.id),
    }));
  }

  async generateDigitalTwin(userId: string) {
    // Collect all user data
    const userMemories = await db.select()
      .from(memories)
      .where(eq(memories.userId, userId));

    const emotionalData = await db.select()
      .from(emotionalDataPoints)
      .where(eq(emotionalDataPoints.userId, userId));

    const themes = await db.select()
      .from(conversationThemes)
      .where(eq(conversationThemes.userId, userId));

    const userBeliefs = await db.select()
      .from(beliefs)
      .where(eq(beliefs.userId, userId));

    // Generate digital twin profile
    const personalityVector = this.calculatePersonalityVector(userMemories, emotionalData);
    const valueSystem = this.extractValueSystem(userBeliefs, themes);
    const growthPatterns = this.analyzeGrowthPatterns(userMemories, emotionalData);
    const emotionalSignature = this.createEmotionalSignature(emotionalData);
    const conversationStyle = this.analyzeConversationStyle(userMemories);

    const twinId = `twin_${userId}_${Date.now()}`;

    await db.insert(digitalTwinProfiles).values({
      id: twinId,
      userId,
      personalityVector,
      valueSystem,
      growthPatterns,
      emotionalSignature,
      conversationStyle,
    });

    return twinId;
  }

  private calculatePersonalityVector(memories: any[], emotionalData: any[]): number[] {
    // Calculate personality dimensions
    const openness = this.calculateOpenness(memories);
    const conscientiousness = this.calculateConscientiousness(memories);
    const extraversion = this.calculateExtraversion(emotionalData);
    const agreeableness = this.calculateAgreeableness(memories);
    const neuroticism = this.calculateNeuroticism(emotionalData);

    return [openness, conscientiousness, extraversion, agreeableness, neuroticism];
  }

  private calculateOpenness(memories: any[]): number {
    const exploratoryKeywords = ['new', 'explore', 'try', 'different', 'creative'];
    const count = memories.filter(m => 
      exploratoryKeywords.some(k => m.content?.toLowerCase().includes(k))
    ).length;
    return Math.min(count / Math.max(memories.length, 1) * 100, 100);
  }

  private calculateConscientiousness(memories: any[]): number {
    const organizedKeywords = ['plan', 'organize', 'schedule', 'goal', 'prepare'];
    const count = memories.filter(m => 
      organizedKeywords.some(k => m.content?.toLowerCase().includes(k))
    ).length;
    return Math.min(count / Math.max(memories.length, 1) * 100, 100);
  }

  private calculateExtraversion(emotionalData: any[]): number {
    const avgValence = emotionalData.reduce((sum, d) => sum + (d.valence || 0), 0) / Math.max(emotionalData.length, 1);
    return Math.min(avgValence * 100, 100);
  }

  private calculateAgreeableness(memories: any[]): number {
    const positiveKeywords = ['help', 'support', 'care', 'kind', 'understand'];
    const count = memories.filter(m => 
      positiveKeywords.some(k => m.content?.toLowerCase().includes(k))
    ).length;
    return Math.min(count / Math.max(memories.length, 1) * 100, 100);
  }

  private calculateNeuroticism(emotionalData: any[]): number {
    const avgArousal = emotionalData.reduce((sum, d) => sum + (d.arousal || 0), 0) / Math.max(emotionalData.length, 1);
    return Math.min(avgArousal * 100, 100);
  }

  private extractValueSystem(beliefs: any[], themes: any[]): Record<string, any> {
    const coreBeliefs = beliefs.filter(b => b.confidence && b.confidence > 0.7);
    const dominantThemes = themes.slice(0, 5);

    return {
      coreBeliefs: coreBeliefs.map(b => b.beliefStatement),
      dominantThemes: dominantThemes.map(t => t.theme),
      valueAlignment: this.calculateValueAlignment(beliefs),
    };
  }

  private calculateValueAlignment(beliefs: any[]): number {
    const consistentBeliefs = beliefs.filter(b => !b.contradicted);
    return (consistentBeliefs.length / Math.max(beliefs.length, 1)) * 100;
  }

  private analyzeGrowthPatterns(memories: any[], emotionalData: any[]): Record<string, any> {
    return {
      memoryGrowth: memories.length,
      emotionalTrend: this.calculateEmotionalTrend(emotionalData),
      engagementPattern: this.calculateEngagementPattern(memories),
    };
  }

  private calculateEmotionalTrend(emotionalData: any[]): string {
    if (emotionalData.length < 2) return 'insufficient_data';
    
    const recent = emotionalData.slice(-10);
    const avgRecent = recent.reduce((sum, d) => sum + (d.valence || 0), 0) / recent.length;
    const older = emotionalData.slice(0, 10);
    const avgOlder = older.reduce((sum, d) => sum + (d.valence || 0), 0) / Math.max(older.length, 1);

    return avgRecent > avgOlder ? 'improving' : 'declining';
  }

  private calculateEngagementPattern(memories: any[]): string {
    const timeGaps = [];
    for (let i = 1; i < memories.length; i++) {
      const gap = new Date(memories[i].timestamp).getTime() - new Date(memories[i-1].timestamp).getTime();
      timeGaps.push(gap);
    }

    const avgGap = timeGaps.reduce((sum, g) => sum + g, 0) / Math.max(timeGaps.length, 1);
    const day = 24 * 60 * 60 * 1000;

    if (avgGap < day) return 'daily';
    if (avgGap < day * 3) return 'frequent';
    if (avgGap < day * 7) return 'weekly';
    return 'sporadic';
  }

  private createEmotionalSignature(emotionalData: any[]): Record<string, any> {
    const avgValence = emotionalData.reduce((sum, d) => sum + (d.valence || 0), 0) / Math.max(emotionalData.length, 1);
    const avgArousal = emotionalData.reduce((sum, d) => sum + (d.arousal || 0), 0) / Math.max(emotionalData.length, 1);

    return {
      baselineValence: avgValence,
      baselineArousal: avgArousal,
      emotionalRange: this.calculateEmotionalRange(emotionalData),
      dominantEmotion: this.getDominantEmotion(avgValence, avgArousal),
    };
  }

  private calculateEmotionalRange(emotionalData: any[]): number {
    const valences = emotionalData.map(d => d.valence || 0);
    return Math.max(...valences) - Math.min(...valences);
  }

  private getDominantEmotion(valence: number, arousal: number): string {
    if (valence > 0.5 && arousal > 0.5) return 'excited';
    if (valence > 0.5 && arousal < 0.5) return 'content';
    if (valence < 0.5 && arousal > 0.5) return 'anxious';
    return 'calm';
  }

  private analyzeConversationStyle(memories: any[]): Record<string, any> {
    const avgLength = memories.reduce((sum, m) => sum + (m.content?.length || 0), 0) / Math.max(memories.length, 1);
    
    return {
      avgMessageLength: avgLength,
      verbosity: avgLength > 200 ? 'verbose' : avgLength > 50 ? 'moderate' : 'concise',
      preferredTopics: this.extractTopics(memories),
    };
  }

  private extractTopics(memories: any[]): string[] {
    const topics = new Map<string, number>();
    const keywords = ['growth', 'career', 'relationships', 'health', 'goals', 'values', 'emotions'];

    memories.forEach(m => {
      const content = m.content?.toLowerCase() || '';
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          topics.set(keyword, (topics.get(keyword) || 0) + 1);
        }
      });
    });

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  async logAdminAction(adminId: string, action: string, targetType: string, targetId: string, details: any) {
    await db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      adminId,
      action,
      targetType,
      targetId,
      details,
    });
  }
}

export const adminService = new AdminService();
