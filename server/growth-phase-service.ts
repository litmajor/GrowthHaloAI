
import OpenAI from 'openai';
import { db } from './db';
import { emotionalDataPoints as emotionalStates, conversationThemes as conversationTopics, phaseHistory, userProfiles } from '../shared/growth-schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

interface GrowthPhaseAnalysis {
  currentPhase: 'expansion' | 'contraction' | 'renewal';
  phaseProgress: number;
  confidence: number;
  evidence: string[];
  predictedTransition: {
    nextPhase: string;
    estimatedTiming: string;
    earlySignals: string[];
    preparationSuggestions: string[];
  };
  phaseHistory: PhaseHistoryEntry[];
  personalPatterns: string[];
  guidance: string;
}

interface PhaseHistoryEntry {
  phase: string;
  duration: number;
  keyLearnings: string[];
  transitionCatalyst: string;
  startDate: Date;
  endDate?: Date;
}

export class GrowthPhaseService {
  async detectCurrentPhase(userId: string | number): Promise<GrowthPhaseAnalysis> {
    const uid = String(userId);
    // Get recent emotional trajectory
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const emotionalData = await db.select()
      .from(emotionalStates)
      .where(and(
        eq(emotionalStates.userId, uid),
        gte(emotionalStates.timestamp, thirtyDaysAgo)
      ))
      .orderBy(desc(emotionalStates.timestamp))
      .limit(50);

    // Get recent conversation themes
    const themes = await db.select()
      .from(conversationTopics)
        .where(eq(conversationTopics.userId, uid))
      .orderBy(desc(conversationTopics.lastMentioned))
      .limit(10);

    // Get current profile
    const profile = await db.select()
      .from(userProfiles)
        .where(eq(userProfiles.userId, uid))
      .limit(1);

    const currentProfile = profile[0];

    // Analyze phase using AI
    const client = getOpenAIClient();
    
    const emotionalSummary = emotionalData.length > 0 
      ? `Average valence: ${(emotionalData.reduce((sum, e) => sum + e.valence, 0) / emotionalData.length).toFixed(2)}, Recent emotions: ${emotionalData.slice(0, 5).map(e => e.dominantEmotion).join(', ')}`
      : 'No recent emotional data';

  const themesSummary = themes.map(t => `${t.theme} (mentioned ${t.frequency || 0}x)`).join(', ');

    const phaseDetection = await client.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      messages: [{
        role: "system",
        content: `Analyze the Growth Halo phase based on these patterns:

**Expansion Phase Signs:**
- Trying new things, high energy
- External focus, building/adding
- Excitement about possibilities
- Optimistic outlook
- High activity level

**Contraction Phase Signs:**
- Pulling back, questioning/doubting
- Internal focus, releasing/simplifying
- Need for rest/reflection
- Lower energy, seeking clarity
- Introspection

**Renewal Phase Signs:**
- Clarity emerging, integration happening
- Balanced energy returning
- New direction forming
- Readiness for next expansion
- Grounded optimism

Recent emotional data: ${emotionalSummary}
Recent conversation themes: ${themesSummary}
Current phase: ${currentProfile?.currentPhase || 'unknown'}

Return JSON:
{
  "currentPhase": "expansion" | "contraction" | "renewal",
  "phaseProgress": number (0-1),
  "confidence": number (0-1),
  "evidence": string[]
}`
      }]
    });

    const detection = JSON.parse(phaseDetection.choices[0].message.content || '{}');

    // Get phase history
  const history = await this.getPhaseHistory(uid);

    // Predict next transition
    const prediction = await this.predictTransition(
      uid,
      detection.currentPhase,
      detection.phaseProgress,
      history
    );

    // Extract personal patterns
    const patterns = await this.extractPhasePatterns(history);

    // Get phase-specific guidance
    const guidance = await this.getPhaseGuidance(detection.currentPhase, detection.phaseProgress);

    // Update user profile if needed
    if (!currentProfile || currentProfile.currentPhase !== detection.currentPhase) {
      await db.update(userProfiles)
        .set({
          currentPhase: detection.currentPhase,
          phaseConfidence: Math.round(detection.confidence * 100),
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, String(userId)));
    }

    return {
      currentPhase: detection.currentPhase,
      phaseProgress: detection.phaseProgress,
      confidence: detection.confidence,
      evidence: detection.evidence,
      predictedTransition: prediction,
      phaseHistory: history,
      personalPatterns: patterns,
      guidance
    };
  }

  private async getPhaseHistory(userId: string | number): Promise<PhaseHistoryEntry[]> {
    const uid = String(userId);
    const history = await db.select()
      .from(phaseHistory)
      .where(eq(phaseHistory.userId, uid))
      .orderBy(desc(phaseHistory.startDate))
      .limit(10);

    return history.map(h => ({
      phase: h.phase,
      duration: h.endDate ? differenceInDays(h.endDate, h.startDate!) : differenceInDays(new Date(), h.startDate!),
      keyLearnings: (h.insights as any)?.keyLearnings || [],
      transitionCatalyst: (h.triggers as any)?.catalyst || 'Unknown',
      startDate: h.startDate!,
      endDate: h.endDate || undefined
    }));
  }

  private async predictTransition(
    userId: string,
    currentPhase: string,
    progress: number,
    history: PhaseHistoryEntry[]
  ): Promise<GrowthPhaseAnalysis['predictedTransition']> {
    try {
      const client = getOpenAIClient();

      // Calculate average phase duration
      const phaseDurations = history
        .filter(h => h.phase === currentPhase && h.endDate)
        .map(h => h.duration);

      const avgDuration = phaseDurations.length > 0
        ? Math.round(phaseDurations.reduce((a, b) => a + b, 0) / phaseDurations.length)
        : 45;

      const currentPhaseDuration = history[0]?.duration || 0;
      const estimatedRemaining = Math.max(0, avgDuration - currentPhaseDuration);

      // Generate prediction
      const prediction = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.5,
        messages: [{
          role: "system",
          content: `Based on this user's phase history, predict their next phase transition.

Current phase: ${currentPhase}
Phase progress: ${Math.round(progress * 100)}%
Average ${currentPhase} duration: ${avgDuration} days
Current duration: ${currentPhaseDuration} days

Past transitions:
${history.slice(0, 5).map(h => `
  ${h.phase} (${h.duration} days)
  Catalyst: ${h.transitionCatalyst}
`).join('\n')}

Return JSON:
{
  "nextPhase": string,
  "estimatedTiming": string (e.g., "2-3 weeks", "1 month"),
  "earlySignals": string[] (3-5 signs to watch for),
  "preparationSuggestions": string[] (3-4 ways to prepare)
}`
        }]
      });

      return JSON.parse(prediction.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error predicting transition:', error);
      return {
        nextPhase: currentPhase === 'expansion' ? 'contraction' : currentPhase === 'contraction' ? 'renewal' : 'expansion',
        estimatedTiming: '4-6 weeks',
        earlySignals: ['Watch for changes in energy levels', 'Notice shifts in your focus'],
        preparationSuggestions: ['Stay present with your current experience', 'Trust the process']
      };
    }
  }

  private async extractPhasePatterns(history: PhaseHistoryEntry[]): Promise<string[]> {
    if (history.length < 3) {
      return ["Still learning your unique growth rhythm..."];
    }

    try {
      const client = getOpenAIClient();

      const analysis = await client.chat.completions.create({
        model: "gpt-4",
        temperature: 0.5,
        messages: [{
          role: "system",
          content: `Identify personal growth patterns from this phase history:

${history.map(h => `
  Phase: ${h.phase}
  Duration: ${h.duration} days
  Catalyst: ${h.transitionCatalyst}
`).join('\n')}

Extract 3-5 meaningful patterns like:
- "Your Contraction phases typically last 6-8 weeks"
- "You transition to Renewal when you start journaling more"
- "Expansion follows periods of deep rest"

Return JSON array of pattern strings.`
        }]
      });

      return JSON.parse(analysis.choices[0].message.content || '[]');
    } catch (error) {
      console.error('Error extracting patterns:', error);
      return ["You've been through multiple growth cycles", "Each phase serves an important purpose"];
    }
  }

  private async getPhaseGuidance(phase: string, progress: number): Promise<string> {
    const guidance = {
      expansion: {
        early: `You're in early Expansion—this is the time to explore freely. Say yes to opportunities that spark curiosity. Don't worry about sustainability yet; that comes later. Enjoy the energy!`,
        mid: `You're deep in Expansion. You might be starting to feel stretched. This is normal. Check in: are you still saying yes to things that truly excite you, or are you on autopilot? It's okay to start being selective.`,
        late: `Your Expansion energy might be waning. If you're feeling tired or overwhelmed, that's a signal—not a failure. Contraction might be approaching. Start thinking about what you want to keep and what you're ready to release.`
      },
      contraction: {
        early: `Entering Contraction can feel like failure, but it's not—it's wisdom. Your system knows you need to pull back and integrate. This phase is about releasing what doesn't serve you. Let go without guilt.`,
        mid: `Deep Contraction. This might feel uncomfortable—the questioning, the doubt, the urge to do something but not knowing what. Trust this. The cocoon is doing its work. Clarity is forming even if you can't see it yet.`,
        late: `You're in late Contraction. Notice if small sparks of clarity are emerging. Don't force it, but pay attention. Renewal is approaching. What's becoming clear about your next direction?`
      },
      renewal: {
        early: `Renewal is beginning! After the Contraction, you're starting to see the path forward. Things feel lighter. Trust these insights—they came from deep integration. Take small steps toward what's calling you.`,
        mid: `You're in full Renewal. Energy is returning, but it's different from Expansion—it's wiser, more aligned. This is when to set intentions for your next Expansion. What do you want to create from this new understanding?`,
        late: `Renewal is maturing. You might feel the pull toward Expansion again—new ideas, new energy. But this time, you're bringing the wisdom of Contraction with you. Prepare to expand more intentionally.`
      }
    };

    const stage = progress < 0.33 ? 'early' : progress < 0.67 ? 'mid' : 'late';
    return guidance[phase as keyof typeof guidance]?.[stage] || 'Trust your growth process.';
  }
}

export const growthPhaseService = new GrowthPhaseService();
