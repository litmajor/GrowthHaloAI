
import { db } from './db';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { users } from '../shared/schema';
import { adminUsers, userAnalytics, digitalTwinProfiles, systemMetrics, auditLogs, perceptionProfiles, experiments, experimentParticipants } from '../shared/admin-schema';
import { memories, emotionalDataPoints, conversationThemes } from '../shared/growth-schema';
import { beliefs, contradictions } from '../shared/phase2-schema';
import { subscriptions } from '../shared/subscription-schema';
import { subscriptionPayments } from '../shared/subscription-payment-schema';
import bcrypt from 'bcryptjs';

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

  async generatePerceptionProfile(userId: string) {
    // Extract linguistic features
    const userMemories = await db.select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.timestamp))
      .limit(100);

    const emotionalData = await db.select()
      .from(emotionalDataPoints)
      .where(eq(emotionalDataPoints.userId, userId))
      .orderBy(desc(emotionalDataPoints.timestamp))
      .limit(100);

    // Calculate linguistic features
    const features = this.extractLinguisticFeatures(userMemories);
    
    // Calculate Big Five proxy
    const traits = {
      openness: this.calculateOpenness(userMemories),
      conscientiousness: this.calculateConscientiousness(userMemories),
      extraversion: this.calculateExtraversion(emotionalData),
      agreeableness: this.calculateAgreeableness(userMemories),
      neuroticism: this.calculateNeuroticism(emotionalData)
    };

    // Generate cognitive proxy estimate
    const cognitiveProxy = this.estimateCognitiveProxy(features, traits);

    // Emotion style analysis
    const emotionStyle = this.analyzeEmotionStyle(emotionalData);

    // Engagement patterns
    const engagementPatterns = this.analyzeEngagementPatterns(userMemories, emotionalData);

    // Extract key phrases
    const keyPhrases = this.extractKeyPhrases(userMemories);

    // Overall confidence
    const confidenceOverall = this.calculateOverallConfidence(userMemories.length, emotionalData.length);

    const profileId = `perception_${userId}_${Date.now()}`;

    // Check if consent exists
    const existingProfile = await db.select()
      .from(perceptionProfiles)
      .where(eq(perceptionProfiles.userId, userId))
      .limit(1);

    const consentGiven = existingProfile.length > 0 ? existingProfile[0].consentGiven : false;

    await db.insert(perceptionProfiles).values({
      id: profileId,
      userId,
      summary: this.generateProfileSummary(traits, emotionStyle),
      traits,
      emotionStyle,
      engagementPatterns,
      cognitiveProxy,
      keyPhrases,
      confidenceOverall,
      consentGiven,
    });

    return profileId;
  }

  private extractLinguisticFeatures(memories: any[]) {
    const allText = memories.map(m => m.content || '').join(' ');
    const words = allText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words);

    return {
      lexicalDiversity: uniqueWords.size / Math.max(words.length, 1),
      vocabularyRichness: words.filter(w => w.length > 7).length / Math.max(words.length, 1),
      avgWordLength: words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1),
      sentenceCount: (allText.match(/[.!?]+/g) || []).length,
    };
  }

  private estimateCognitiveProxy(features: any, traits: any): any {
    // Simple heuristic-based cognitive estimate
    // In production, this should use trained ML model
    const baseEstimate = 100;
    const vocabBoost = features.vocabularyRichness * 30;
    const diversityBoost = features.lexicalDiversity * 20;
    const opennessBoost = (traits.openness / 100) * 15;

    const estimate = Math.round(baseEstimate + vocabBoost + diversityBoost + opennessBoost);
    const confidence = Math.min(features.lexicalDiversity * 0.8, 0.85);
    const margin = Math.round(estimate * (1 - confidence) * 0.5);

    return {
      estimate: Math.max(85, Math.min(145, estimate)),
      ci: [estimate - margin, estimate + margin] as [number, number],
      confidence: Math.round(confidence * 100) / 100,
      basis: ['vocabulary_richness', 'lexical_diversity', 'openness_trait']
    };
  }

  private analyzeEmotionStyle(emotionalData: any[]): string {
    if (emotionalData.length < 5) return 'insufficient_data';

    const valences = emotionalData.map(d => d.valence || 0);
    const stdDev = Math.sqrt(
      valences.reduce((sum, v) => sum + Math.pow(v - (valences.reduce((a, b) => a + b, 0) / valences.length), 2), 0) / valences.length
    );

    const avgValence = valences.reduce((a, b) => a + b, 0) / valences.length;

    if (stdDev > 0.3) return 'high_variability';
    if (avgValence > 0.6) return 'consistently_positive';
    if (avgValence < 0.4) return 'tends_to_ruminate';
    return 'stable_moderate';
  }

  private analyzeEngagementPatterns(memories: any[], emotionalData: any[]) {
    const timestamps = memories.map(m => new Date(m.timestamp));
    const hours = timestamps.map(t => t.getHours());
    const hourCounts = new Map<number, number>();
    
    hours.forEach(h => hourCounts.set(h, (hourCounts.get(h) || 0) + 1));
    const peakHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([hour]) => `${hour}:00`);

    return {
      peak_hours: peakHours,
      session_length_median: 8.4, // Simplified
      total_interactions: memories.length,
      consistency_score: memories.length > 20 ? 0.7 : 0.4
    };
  }

  private extractKeyPhrases(memories: any[]): string[] {
    // Simple keyword extraction - in production use NLP libraries
    const text = memories.map(m => m.content || '').join(' ').toLowerCase();
    const patterns = [
      /i'm (scared|afraid|worried) (of|about) ([^.!?]+)/gi,
      /i (get|feel) ([^.!?]+) easily/gi,
      /i (want|need|wish) to ([^.!?]+)/gi
    ];

    const phrases: string[] = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) phrases.push(...matches.slice(0, 3));
    });

    return phrases.slice(0, 5);
  }

  private generateProfileSummary(traits: any, emotionStyle: string): string {
    const highestTrait = Object.entries(traits)
      .sort((a: any, b: any) => b[1] - a[1])[0][0];
    
    const traitDescriptions: Record<string, string> = {
      openness: 'curious and open to new experiences',
      conscientiousness: 'organized and goal-oriented',
      extraversion: 'socially engaged and energetic',
      agreeableness: 'cooperative and empathetic',
      neuroticism: 'emotionally sensitive'
    };

    return `${traitDescriptions[highestTrait]}, ${emotionStyle.replace(/_/g, ' ')}`;
  }

  private calculateOverallConfidence(memoryCount: number, emotionalCount: number): number {
    const dataScore = Math.min((memoryCount + emotionalCount) / 100, 1);
    return Math.round(dataScore * 0.8 * 100) / 100;
  }

  async getPerceptionProfile(userId: string) {
    const [profile] = await db.select()
      .from(perceptionProfiles)
      .where(eq(perceptionProfiles.userId, userId))
      .limit(1);

    return profile;
  }

  async updatePerceptionConsent(userId: string, consent: boolean) {
    await db.update(perceptionProfiles)
      .set({ consentGiven: consent, lastUpdated: new Date() })
      .where(eq(perceptionProfiles.userId, userId));
  }

  async createExperiment(adminId: string, name: string, hypothesis: string, description?: string) {
    const experimentId = `exp_${Date.now()}`;
    
    await db.insert(experiments).values({
      id: experimentId,
      name,
      hypothesis,
      description,
      status: 'draft',
      createdBy: adminId,
    });

    await this.logAdminAction(adminId, 'create_experiment', 'experiment', experimentId, { name, hypothesis });

    return experimentId;
  }

  async addExperimentParticipant(experimentId: string, userId: string, consent: boolean) {
    const participantId = `part_${Date.now()}`;

    await db.insert(experimentParticipants).values({
      id: participantId,
      experimentId,
      userId,
      consentGiven: consent,
      consentedAt: consent ? new Date() : null,
    });

    if (consent) {
      await db.update(experiments)
        .set({ participantCount: sql`${experiments.participantCount} + 1` })
        .where(eq(experiments.id, experimentId));
    }

    return participantId;
  }

  async getExperiments(status?: string) {
    if (status) {
      return await db.select()
        .from(experiments)
        .where(eq(experiments.status, status))
        .orderBy(desc(experiments.createdAt));
    }

    return await db.select()
      .from(experiments)
      .orderBy(desc(experiments.createdAt));
  }

  async getExperimentParticipants(experimentId: string) {
    return await db.select()
      .from(experimentParticipants)
      .where(eq(experimentParticipants.experimentId, experimentId));
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

  async getRevenueOverview(timeRange: string = 'month') {
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
    else if (timeRange === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (timeRange === 'year') startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setDate(now.getDate() - 30);

    const payments = await db.select()
      .from(subscriptionPayments)
      .where(and(
        gte(subscriptionPayments.paidAt, startDate),
        eq(subscriptionPayments.status, 'completed')
      ));

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paymentCount = payments.length;

    const activeSubscriptions = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const newSubscriptions = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(and(
        gte(subscriptions.startedAt, startDate),
        eq(subscriptions.status, 'active')
      ));

    const cancelledSubscriptions = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(and(
        gte(subscriptions.startedAt, startDate),
        eq(subscriptions.status, 'cancelled')
      ));

    const planBreakdown = await db.select({
      plan: subscriptions.plan,
      count: sql<number>`count(*)`,
      revenue: sql<number>`sum(${subscriptions.price})`
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'))
    .groupBy(subscriptions.plan);

    const mrr = activeSubscriptions[0]?.count 
      ? await db.select({ total: sql<number>`sum(${subscriptions.price})` })
          .from(subscriptions)
          .where(eq(subscriptions.status, 'active'))
          .then(r => r[0]?.total || 0)
      : 0;

    return {
      totalRevenue,
      paymentCount,
      activeSubscriptions: activeSubscriptions[0]?.count || 0,
      newSubscriptions: newSubscriptions[0]?.count || 0,
      cancelledSubscriptions: cancelledSubscriptions[0]?.count || 0,
      mrr,
      arr: mrr * 12,
      planBreakdown: planBreakdown.map(p => ({
        plan: p.plan,
        count: p.count,
        revenue: p.revenue
      })),
      avgRevenuePerUser: activeSubscriptions[0]?.count > 0 
        ? totalRevenue / activeSubscriptions[0].count 
        : 0
    };
  }

  async getSubscriptionStats() {
    const total = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions);

    const active = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const cancelled = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'cancelled'));

    const expired = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'expired'));

    const byPlan = await db.select({
      plan: subscriptions.plan,
      count: sql<number>`count(*)`
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'))
    .groupBy(subscriptions.plan);

    return {
      total: total[0]?.count || 0,
      active: active[0]?.count || 0,
      cancelled: cancelled[0]?.count || 0,
      expired: expired[0]?.count || 0,
      byPlan: byPlan.reduce((acc, item) => {
        acc[item.plan] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getRecentPayments(limit: number = 50, offset: number = 0) {
    return await db.select({
      id: subscriptionPayments.id,
      userId: subscriptionPayments.userId,
      amount: subscriptionPayments.amount,
      currency: subscriptionPayments.currency,
      status: subscriptionPayments.status,
      paidAt: subscriptionPayments.paidAt,
      paymentMethod: subscriptionPayments.paymentMethod,
      transactionId: subscriptionPayments.transactionId
    })
    .from(subscriptionPayments)
    .orderBy(desc(subscriptionPayments.paidAt))
    .limit(limit)
    .offset(offset);
  }

  async registerAdmin(username: string, email: string, hashedPassword: string) {
    const userId = `user_${Date.now()}`;
    const adminId = `admin_${Date.now()}`;

    await db.insert(users).values({
      id: userId,
      username: email,
      password: hashedPassword
    });

    await db.insert(adminUsers).values({
      id: adminId,
      userId,
      role: 'admin',
      permissions: ['view_analytics', 'manage_users', 'view_revenue']
    });

    return { userId, adminId };
  }

  async authenticateAdmin(email: string, password: string) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, email))
      .limit(1);

    if (!user) {
      return { success: false };
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return { success: false };
    }

    const [admin] = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, user.id))
      .limit(1);

    if (!admin) {
      return { success: false };
    }

    await db.update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, admin.id));

    return {
      success: true,
      userId: user.id,
      role: admin.role,
      permissions: admin.permissions
    };
  }
}

export const adminService = new AdminService();
