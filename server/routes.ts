import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateBlissResponse, generateAdaptiveBlissResponse, analyzeUserPatterns, detectGrowthPhase, generatePersonalizedContent, analyzeValuesAssessment, generateValueBasedGuidance } from "./ai-service";
import { growthTracker } from "./growth-service";
import { communityIntelligence } from "./community-service";
import { subscriptionService } from "./subscription-service";
import { paymentService } from "./payment-service";
import { rawBodyMiddleware } from './index';
import { advancedAnalytics } from './analytics-service';
import { eventsService } from './events-service';
import { generateJournalInsights } from './ai-service';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import * as aiService from "./ai-service"; // Import aiService for adaptiveChat
import { enhancedMemoryService } from './enhanced-memory-service';
import { associativeRecallService } from './associative-recall-service';
import { contradictionDetectionService } from './contradiction-detection-service';
import { users, type InsertUser } from '../shared/schema';
import bcrypt from 'bcryptjs';
import { memories, emotionalDataPoints as emotionalStates, conversationThemes as conversationTopics } from '../shared/growth-schema';
import { beliefs, contradictions, cognitiveDistortions } from '../shared/phase2-schema';
import { causalReasoningService } from './causal-reasoning-service';
import { hypothesisFormationService } from './hypothesis-formation-service'; // Import Hypothesis Formation Service

export async function registerRoutes(app: Express): Promise<Server> {
  // Attach user to request from session if present so route handlers can use (req as any).user
  app.use(async (req, _res, next) => {
    try {
      const sessionAny = (req as any).session;
      if (sessionAny && sessionAny.userId) {
        const u = await storage.getUser(sessionAny.userId);
        if (u) (req as any).user = u;
      }
    } catch (err) {
      // ignore
    }
    next();
  });
  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, conversationHistory, userId } = req.body;

      // Use adaptive response with memory features
      const response = await generateAdaptiveBlissResponse(
        message,
        userId || 'anonymous',
        conversationHistory || []
      );

      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback to basic response
      try {
        const fallbackResponse = await generateBlissResponse(typeof req.body?.message === 'string' ? req.body.message : '', Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : []);
        res.json({
          ...fallbackResponse,
          adaptationNotes: 'Used fallback due to memory service error',
          memoryAnchors: [],
          associativeRecall: null
        });
      } catch (fallbackError) {
        res.status(500).json({ error: 'Failed to generate response' });
      }
    }
  });

  // API endpoint for the original chat functionality (kept for backward compatibility if needed)
  app.post("/api/bliss/chat", async (req, res) => {
    try {
      const { message, conversationHistory = [], userId } = req.body;

      const { generateBlissResponse } = await import("./ai-service");
      const response = await generateBlissResponse(message, conversationHistory);

      res.json(response);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // New adaptive chat endpoint
  app.post("/api/bliss/adaptive-chat", async (req, res) => {
  // Support both authenticated users and demo/guest users
  const user = (req as any).user as any | undefined;
  const { message: userMessage, conversationId, conversationHistory, userId: bodyUserId } = req.body;
    
  // Use authenticated user ID or fall back to userId from request body (for demo/guest users)
  const effectiveUserId = String(user?.id ?? bodyUserId ?? 'demo-user');

    try {
  // Extract and store memories from user message (enhancedMemoryService exposes extractFromMessage)
  // conversationId may be undefined in some requests; pass empty string when absent
  await enhancedMemoryService.extractFromMessage(effectiveUserId, conversationId || `conv_${Date.now()}`, userMessage);

      // PHASE 2: Extract beliefs from message
  await contradictionDetectionService.extractBeliefs(userMessage, effectiveUserId);

      // PHASE 2: Get associative recalls
      const recalls = await associativeRecallService.recall(
        effectiveUserId,
        userMessage,
        conversationHistory
      );

      // PHASE 2: Detect contradictions
      const contradictionsFound = await contradictionDetectionService.detectContradictions(
        effectiveUserId,
        userMessage
      );

      // PHASE 2: Detect cognitive distortions
      const distortions = await contradictionDetectionService.detectCognitiveDistortions(
        userMessage,
        effectiveUserId
      );

      // Build enhanced context
      let enhancedContext = '';

      if (recalls.length > 0) {
        enhancedContext += associativeRecallService.formatRecallsForContext(recalls);
      }

      if (contradictionsFound.length > 0) {
        enhancedContext += '\n\nContradiction to gently address:\n';
        enhancedContext += contradictionDetectionService.formatContradictionResponse(contradictionsFound[0]);
      }

      if (distortions.length > 0 && contradictionsFound.length === 0) {
        enhancedContext += '\n\nCognitive pattern to gently reframe:\n';
        enhancedContext += contradictionDetectionService.formatDistortionResponse(distortions[0]);
      }

      // Store user message
      await storage.saveMessage(effectiveUserId, conversationId || `conv_${Date.now()}`, 'user', userMessage);

      // Use AI service for adaptive chat with enhanced context
      const systemPrompt = (typeof (global as any).getSystemPrompt === 'function' ? (global as any).getSystemPrompt() : 'You are Bliss, a helpful AI assistant.') + (enhancedContext ? '\n\n' + enhancedContext : '');

      const stream = await aiService.adaptiveChatStream(
        effectiveUserId,
        userMessage,
        conversationId,
        conversationHistory,
        systemPrompt
      );

      // Handle streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let assistantMessage = '';
      for await (const chunk of stream) {
        const content = (chunk as any)?.choices?.[0]?.delta?.content || (chunk as any)?.content || '';
        if (content) {
          res.write(`data: ${content}\n\n`);
          assistantMessage += content;
        }
      }

      // Store assistant message after stream ends
      await storage.saveMessage(effectiveUserId, conversationId || `conv_${Date.now()}`, 'assistant', assistantMessage);

      res.end();

    } catch (error: any) {
      console.error("Adaptive chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // User registration endpoint
  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, interests, goals } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check for existing user
      const existing = await storage.getUserByUsername(email);
      if (existing) {
        return res.status(409).json({ error: 'User already exists' });
      }

  // Hash password before storing
  const hashed = await bcrypt.hash(password, 10);

  // Create user (InsertUser expects username/password)
  const newUser = await storage.createUser({ username: email, password: hashed } as InsertUser);

      // Create a free subscription for the new user
      try {
        await subscriptionService.createFreeSubscription(newUser.id);
      } catch (err) {
        console.warn('Could not create free subscription for new user:', err);
      }

      res.status(201).json({ id: newUser.id });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Simple login endpoint - verifies credentials and sets session
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      const user = await storage.getUserByUsername(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, (user as any).password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      // Attach user id to session
      (req as any).session.userId = (user as any).id;

      res.json({ success: true, id: (user as any).id });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get current authenticated user
  app.get('/api/me', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.json({ user: null });
      // return minimal public user info
      const safe = { id: user.id, username: user.username } as any;
      res.json({ user: safe });
    } catch (err) {
      console.error('Me error:', err);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    try {
      const sess = (req as any).session;
      if (sess) {
        sess.destroy?.(() => {});
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // Advanced pattern analysis endpoint
  app.post('/api/user/:userId/analyze-patterns', async (req, res) => {
    try {
      const { userId } = req.params;
      const { message, context } = req.body;

      const analysis = await analyzeUserPatterns(userId, message, context);
      res.json(analysis);
    } catch (error) {
      console.error('Pattern analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze patterns' });
    }
  });

  app.post("/api/detect-phase", async (req, res) => {
    try {
      const { message, userId, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const phaseDetection = await detectGrowthPhase(message, context);

      // If userId provided, update their phase if confidence is high
      if (userId && phaseDetection.confidence > 75) {
        try {
          await growthTracker.trackPhaseTransition(
            userId,
            phaseDetection.phase,
            phaseDetection.confidence,
            'user_message'
          );
        } catch (error) {
          console.warn('Could not update user phase:', error);
        }
      }

      res.json(phaseDetection);
    } catch (error) {
      console.error("Phase detection API error:", error);
      res.status(500).json({ error: "Failed to detect phase" });
    }
  });

  // Contradiction Detection & Belief Revision endpoint
  app.post('/api/user/:userId/contradiction-analysis', async (req, res) => {
    try {
      const { userId } = req.params;
      const { currentMessage, historicalMessages, userBeliefs } = req.body;

      const { detectContradictionsAndBelief } = await import('./ai-service');
      const analysis = await detectContradictionsAndBelief(
        userId,
        currentMessage,
        historicalMessages || [],
        userBeliefs || []
      );

      res.json(analysis);
    } catch (error) {
      console.error('Contradiction analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze contradictions' });
    }
  });

  app.post('/api/user/:userId/belief-revision-guidance', async (req, res) => {
    try {
      const { userId } = req.params;
      const { contradictions, cognitiveDistortions, selfPerceptionPatterns, currentPhase } = req.body;

      const { generateBeliefRevisionGuidance } = await import('./ai-service');
      const guidance = await generateBeliefRevisionGuidance(
        contradictions || [],
        cognitiveDistortions || [],
        selfPerceptionPatterns || {},
        currentPhase || 'expansion'
      );

      res.json(guidance);
    } catch (error) {
      console.error('Belief revision guidance error:', error);
      res.status(500).json({ error: 'Failed to generate belief revision guidance' });
    }
  });

  // Belief Revision Tracking endpoints
  app.post('/api/user/:userId/detect-belief-revision', async (req, res) => {
    try {
      const { userId } = req.params;
      const { currentBelief, conversationId } = req.body;

      const { beliefRevisionService } = await import('./belief-revision-service');
      const revision = await beliefRevisionService.detectBeliefRevision(
        userId,
        currentBelief,
        conversationId
      );

      if (revision && !revision.celebrated) {
        const celebration = beliefRevisionService.generateCelebrationMessage(revision);
        await beliefRevisionService.markCelebrated(revision.id);

        res.json({
          revision,
          celebration,
          shouldCelebrate: true
        });
      } else {
        res.json({
          revision: null,
          shouldCelebrate: false
        });
      }
    } catch (error) {
      console.error('Belief revision detection error:', error);
      res.status(500).json({ error: 'Failed to detect belief revision' });
    }
  });

  // Phase 4.4: Growth Phase Prediction routes
  app.get('/api/growth-phase/analysis/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const { growthPhaseService } = await import('./growth-phase-service');
      const analysis = await growthPhaseService.detectCurrentPhase(userId);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Phase 4.2: Dormant Concept Reactivation routes
  app.get('/api/dormant-concepts/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const { dormantConceptService } = await import('./dormant-concept-service');
      const concepts = await dormantConceptService.identifyDormantConcepts(userId);
      res.json(concepts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/dormant-concepts/check-relevance', async (req, res) => {
    try {
      const { dormantConcepts, currentMessage, currentContext } = req.body;
      const { dormantConceptService } = await import('./dormant-concept-service');
      const relevant = await dormantConceptService.checkRelevance(
        dormantConcepts,
        currentMessage,
        currentContext
      );
      res.json(relevant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/creative-insights/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const { challenge } = req.body;
      const { dormantConceptService } = await import('./dormant-concept-service');
      const bridges = await dormantConceptService.bridgeDistantConcepts(userId, challenge);
      res.json(bridges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Phase 4.5: Wisdom Library routes
  app.get('/api/wisdom/library/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const { wisdomLibraryService } = await import('./wisdom-library-service');
  const wisdomBook = await wisdomLibraryService.generateWisdomBook(userId);
      res.json(wisdomBook);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/wisdom/extract', async (req, res) => {
    try {
      const { userId, conversationId, message } = req.body;
      const { wisdomLibraryService } = await import('./wisdom-library-service');
  const wisdom = await wisdomLibraryService.extractWisdom(userId, conversationId, message);
      res.json(wisdom);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/wisdom/applicable', async (req, res) => {
    try {
      const { userId, currentSituation } = req.body;
      const { wisdomLibraryService } = await import('./wisdom-library-service');
  const applicable = await wisdomLibraryService.findApplicableWisdom(userId, currentSituation);
      res.json(applicable);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Phase 4: Meta-Memory routes
  app.get('/api/ideas/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const includeAll = req.query.all === 'true';
      const { metaMemoryService } = await import('./meta-memory-service');
  const ideas = await metaMemoryService.getUserIdeas(userId, includeAll);
      res.json(ideas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/idea-journey/:ideaId', async (req, res) => {
    try {
      const ideaId = String(req.params.ideaId);
      const { metaMemoryService } = await import('./meta-memory-service');
  const journey = await metaMemoryService.visualizeIdeaJourney(Number(ideaId));
      res.json(journey);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ideas/detect-seed', async (req, res) => {
    try {
      const { userId, message, conversationId } = req.body;
      const { metaMemoryService } = await import('./meta-memory-service');
  const idea = await metaMemoryService.detectIdeaSeed(userId, message, conversationId);
      res.json(idea);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ideas/track-development', async (req, res) => {
    try {
      const { userId, message } = req.body;
      const { metaMemoryService } = await import('./meta-memory-service');
  await metaMemoryService.trackIdeaDevelopment(userId, message);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Phase 3: Hypothesis Formation routes
  app.post('/api/hypotheses/generate/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
  const hypotheses = await hypothesisFormationService.generateHypotheses(userId);
      res.json(hypotheses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/hypotheses/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const confirmed = req.query.confirmed === 'true' ? true : req.query.confirmed === 'false' ? false : undefined;
  const hypotheses = await hypothesisFormationService.getUserHypotheses(userId, confirmed);
      res.json(hypotheses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/hypotheses/:hypothesisId/test', async (req, res) => {
    try {
      const hypothesisId = String(req.params.hypothesisId);
      const { evidence } = req.body;
  const result = await hypothesisFormationService.testHypothesis(Number(hypothesisId), evidence);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/personality-insights/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
  const insights = await hypothesisFormationService.getPersonalityInsights(userId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/predict-outcome/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const { plannedAction, context } = req.body;
  const prediction = await hypothesisFormationService.predictOutcome(userId, plannedAction, context);
      res.json(prediction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Phase 3: Causal reasoning endpoints
  app.get('/api/causal-patterns/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const domain = req.query.domain as string | undefined;
  const patterns = await causalReasoningService.getPatterns(userId, domain);
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching causal patterns:', error);
      res.status(500).json({ error: 'Failed to fetch patterns' });
    }
  });

  app.post('/api/causal-patterns/suggest-actions', async (req, res) => {
    try {
      const { userId, currentSituation, desiredOutcome } = req.body;
      const suggestions = await causalReasoningService.suggestActions(
        userId,
        currentSituation,
        desiredOutcome
      );
      res.json(suggestions);
    } catch (error) {
      console.error('Error suggesting actions:', error);
      res.status(500).json({ error: 'Failed to suggest actions' });
    }
  });

  app.get('/api/causal-patterns/analogies/:userId', async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const { situation, domain } = req.query;
      const analogies = await causalReasoningService.findAnalogies(
        userId,
        situation as string,
        domain as string
      );
      res.json(analogies);
    } catch (error) {
      console.error('Error finding analogies:', error);
      res.status(500).json({ error: 'Failed to find analogies' });
    }
  });

  // Belief revision endpoints
  app.get('/api/belief-revisions', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const { beliefRevisionService } = await import('./belief-revision-service');
      const journey = await beliefRevisionService.getBeliefJourney(userId);

      res.json(journey);
    } catch (error) {
      console.error('Get belief journey error:', error);
      res.status(500).json({ error: 'Failed to fetch belief journey' });
    }
  });

  // Advanced AI Analysis endpoints
  app.post("/api/user/:userId/crisis-detection", async (req, res) => {
    try {
      const { userId } = req.params;
      const { text, context } = req.body;

      const { detectCrisisSignals } = await import("./ai-service");
      const crisisAssessment = await detectCrisisSignals(text, context);

      // Log crisis detection for follow-up if needed
      if (crisisAssessment.riskLevel !== 'low') {
        console.log(`Crisis detected for user ${userId}: ${crisisAssessment.riskLevel} risk`);
      }

      res.json(crisisAssessment);
    } catch (error) {
      console.error("Crisis detection error:", error);
      res.status(500).json({ error: "Failed to assess crisis signals" });
    }
  });

  app.post("/api/user/:userId/advanced-journal-insights", async (req, res) => {
    try {
      const { userId } = req.params;
      const { entries, timeframe, userContext } = req.body;

      const { generateAdvancedJournalInsights } = await import("./ai-service");
      const insights = await generateAdvancedJournalInsights(entries, timeframe, userContext);

      res.json(insights);
    } catch (error) {
      console.error("Advanced journal insights error:", error);
      res.status(500).json({ error: "Failed to generate advanced insights" });
    }
  });

  app.post("/api/user/:userId/growth-patterns", async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe } = req.body;

      const patterns = await growthTracker.analyzeGrowthPatterns(userId, timeframe);
      res.json(patterns);
    } catch (error) {
      console.error("Growth pattern analysis error:", error);
      res.status(500).json({ error: "Failed to analyze growth patterns" });
    }
  });

  app.post("/api/user/:userId/personalized-content-advanced", async (req, res) => {
    try {
      const { userId } = req.params;
      const { userContext } = req.body;

      const contentService = new (await import("./content-service")).ContentCurationService();
      const content = await contentService.generateAdvancedPersonalizedContent(userId, userContext);

      res.json(content);
    } catch (error) {
      console.error("Advanced content curation error:", error);
      res.status(500).json({ error: "Failed to curate personalized content" });
    }
  });

  // Growth tracking endpoints
  app.get("/api/user/:userId/growth", async (req, res) => {
    try {
      const { userId } = req.params;
      const growthData = await growthTracker.getUserGrowthData(userId);
      res.json(growthData);
    } catch (error) {
      console.error("Get growth data error:", error);
      res.status(500).json({ error: "Failed to get growth data" });
    }
  });

  app.post("/api/user/:userId/energy", async (req, res) => {
    try {
      const { userId } = req.params;
      const energyData = req.body;

      const result = await growthTracker.updateEnergyPatterns(userId, energyData);
      res.json(result);
    } catch (error) {
      console.error("Update energy error:", error);
      res.status(500).json({ error: "Failed to update energy patterns" });
    }
  });

  app.post("/api/user/:userId/journal", async (req, res) => {
    try {
      const { userId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Journal content is required" });
      }

      const result = await growthTracker.saveJournalEntry(userId, content);
      res.json(result);
    } catch (error) {
      console.error("Save journal entry error:", error);
      res.status(500).json({ error: "Failed to save journal entry" });
    }
  });

  app.get("/api/user/:userId/insights/weekly", async (req, res) => {
    try {
      const { userId } = req.params;
      const insights = await growthTracker.generateWeeklyInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Generate insights error:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/user/:userId/recommendations", async (req, res) => {
    try {
      const { userId } = req.params;
      const userProfile = req.body;

      const recommendations = await generatePersonalizedContent(userProfile);
      res.json(recommendations);
    } catch (error) {
      console.error("Generate recommendations error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Values assessment endpoints
  app.post("/api/user/:userId/values/assess", async (req, res) => {
    try {
      const { userId } = req.params;
      const { responses, assessmentType } = req.body;

      const analysis = await analyzeValuesAssessment(responses, assessmentType);

      // Save assessment results
      await storage.execute(`
        INSERT INTO values_data (user_id, core_values, value_evolution, alignment_score)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET
          core_values = $2,
          value_evolution = $3,
          alignment_score = $4,
          last_assessment = NOW()
      `, [userId, JSON.stringify(analysis.updatedValues), JSON.stringify(analysis.evolution), analysis.alignmentScore]);

      res.json(analysis);
    } catch (error) {
      console.error("Values assessment error:", error);
      res.status(500).json({ error: "Failed to analyze values assessment" });
    }
  });

  app.get("/api/user/:userId/values", async (req, res) => {
    try {
      const { userId } = req.params;

      const valuesData = await storage.get(`
        SELECT * FROM values_data WHERE user_id = $1
      `, [userId]);

      res.json(valuesData || { coreValues: [], alignmentScore: 0.7 });
    } catch (error) {
      console.error("Get values data error:", error);
      res.status(500).json({ error: "Failed to get values data" });
    }
  });

  app.post("/api/user/:userId/values/decision-support", async (req, res) => {
    try {
      const { userId } = req.params;
      const { decision, valueContext } = req.body;

      const guidance = await generateValueBasedGuidance(decision, valueContext);
      res.json(guidance);
    } catch (error) {
      console.error("Decision support error:", error);
      res.status(500).json({ error: "Failed to generate decision support" });
    }
  });

  // Community Intelligence endpoints
  app.get("/api/user/:userId/community/compatible-members", async (req, res) => {
    try {
      const { userId } = req.params;
      const { circleType, limit = 5 } = req.query;

      const compatibleMembers = await communityIntelligence.findCompatibleMembers(
        userId,
        circleType as string,
        parseInt(limit as string)
      );

      res.json(compatibleMembers);
    } catch (error) {
      console.error("Compatible members error:", error);
      res.status(500).json({ error: "Failed to find compatible members" });
    }
  });

  app.post("/api/community/discussion-guidance", async (req, res) => {
    try {
      const { circleId, discussionContent, recentMessages, participantPhases } = req.body;

      const guidance = await communityIntelligence.generateDiscussionGuidance(
        circleId,
        discussionContent,
        recentMessages,
        participantPhases
      );

      res.json(guidance);
    } catch (error) {
      console.error("Discussion guidance error:", error);
      res.status(500).json({ error: "Failed to generate discussion guidance" });
    }
  });

  app.post("/api/user/:userId/community/engagement", async (req, res) => {
    try {
      const { userId } = req.params;
      const { action, metadata } = req.body;

      await communityIntelligence.updateEngagementMetrics(userId, action, metadata);
      res.json({ success: true });
    } catch (error) {
      console.error("Update engagement error:", error);
      res.status(500).json({ error: "Failed to update engagement metrics" });
    }
  });

  // User Follow endpoints
  app.post("/api/user/:userId/follow", async (req, res) => {
    try {
      const { userId } = req.params;
      const { followingId } = req.body;

      if (userId === followingId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }

      const isAlreadyFollowing = await storage.isFollowing(userId, followingId);
      if (isAlreadyFollowing) {
        return res.status(400).json({ error: "Already following this user" });
      }

      await storage.followUser(userId, followingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Follow user error:", error);
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  app.delete("/api/user/:userId/follow/:followingId", async (req, res) => {
    try {
      const { userId, followingId } = req.params;

      await storage.unfollowUser(userId, followingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Unfollow user error:", error);
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  });

  app.get("/api/user/:userId/followers", async (req, res) => {
    try {
      const { userId } = req.params;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Get followers error:", error);
      res.status(500).json({ error: "Failed to get followers" });
    }
  });

  app.get("/api/user/:userId/following", async (req, res) => {
    try {
      const { userId } = req.params;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Get following error:", error);
      res.status(500).json({ error: "Failed to get following" });
    }
  });

  app.get("/api/user/:userId/following/:targetUserId", async (req, res) => {
    try {
      const { userId, targetUserId } = req.params;
      const isFollowing = await storage.isFollowing(userId, targetUserId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Check following status error:", error);
      res.status(500).json({ error: "Failed to check following status" });
    }
  });

  // Subscription Management endpoints
  app.get("/api/user/:userId/subscription", async (req, res) => {
    try {
      const { userId } = req.params;
      const subscription = await subscriptionService.getUserSubscription(userId);
      const usageStats = await subscriptionService.getUsageStats(userId);

      res.json({
        ...subscription,
        usageStats
      });
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({ error: "Failed to get subscription data" });
    }
  });

  app.post("/api/user/:userId/subscription/upgrade", async (req, res) => {
    try {
      const { userId } = req.params;
      const { tier } = req.body;

      const success = await subscriptionService.upgradeSubscription(userId, tier);

      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Failed to upgrade subscription" });
      }
    } catch (error) {
      console.error("Upgrade subscription error:", error);
      res.status(500).json({ error: "Failed to upgrade subscription" });
    }
  });

  app.post("/api/user/:userId/subscription/cancel", async (req, res) => {
    try {
      const { userId } = req.params;

      const success = await subscriptionService.cancelSubscription(userId);

      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Failed to cancel subscription" });
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  app.get("/api/user/:userId/feature-access/:feature", async (req, res) => {
    try {
      const { userId, feature } = req.params;

      const canUse = await subscriptionService.canUseFeature(userId, feature);
      res.json({ canUse });
    } catch (error) {
      console.error("Feature access check error:", error);
      res.status(500).json({ error: "Failed to check feature access" });
    }
  });

  // Payment Processing endpoints
  app.post("/api/payment/create-subscription", async (req, res) => {
    try {
      const { userId, tier, successUrl, cancelUrl } = req.body;

      const checkout = await paymentService.createSubscriptionCheckout(
        userId,
        tier,
        successUrl,
        cancelUrl
      );

      res.json(checkout);
    } catch (error) {
      console.error("Create subscription error:", error);
      res.status(500).json({ error: "Failed to create subscription checkout" });
    }
  });

  // Stripe webhook: use raw body parser for signature verification
  app.post("/api/payment/webhook", rawBodyMiddleware, async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      // req.body will be a Buffer because of rawBodyMiddleware
      const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body || {});

      await paymentService.handleWebhook(signature, payload);
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook handling failed" });
    }
  });

  app.post("/api/payment/customer-portal", async (req, res) => {
    try {
      const { customerId, returnUrl } = req.body;

      const portalUrl = await paymentService.createPortalSession(customerId, returnUrl);
      res.json({ url: portalUrl });
    } catch (error) {
      console.error("Customer portal error:", error);
      res.status(500).json({ error: "Failed to create customer portal session" });
    }
  });

  // Events endpoints
  app.get('/api/events', async (req, res) => {
    try {
      const { type, location, priceRange } = req.query;
      const events = await eventsService.getUpcomingEvents({
        eventType: type as string,
        location: location as string,
        // priceRange parsing left to service if needed
      });
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.post('/api/events/:eventId/register', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { userId } = req.body;

      const result = await eventsService.registerForEvent(eventId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error registering for event:', error);
      res.status(500).json({ error: 'Failed to register for event' });
    }
  });

  // Advanced Analytics endpoints
  app.get('/api/user/:userId/analytics/timeline', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe = '6months' } = req.query;

      const timeline = await advancedAnalytics.generateGrowthTimeline(
        userId,
        timeframe as '3months' | '6months' | '1year' | '2years'
      );
      res.json(timeline);
    } catch (error) {
      console.error('Error generating growth timeline:', error);
      res.status(500).json({ error: 'Failed to generate timeline' });
    }
  });

  app.get('/api/user/:userId/analytics/patterns', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe = '6months' } = req.query;

      const patterns = await advancedAnalytics.generatePatternVisualization(
        userId,
        timeframe as '3months' | '6months' | '1year'
      );
      res.json(patterns);
    } catch (error) {
      console.error('Error generating pattern visualization:', error);
      res.status(500).json({ error: 'Failed to generate patterns' });
    }
  });

  app.get("/api/user/:userId/analytics/predictions", async (req, res) => {
    try {
      const { userId } = req.params;
      const predictions = await advancedAnalytics.generatePredictiveModel(userId);
      res.json(predictions);
    } catch (error) {
      console.error("Predictions error:", error);
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  });

  // Chat History endpoint
  app.get("/api/user/:userId/chat-history", async (req, res) => {
    try {
      const { userId } = req.params;

      // For now, return mock data - in production this would query the database
      const mockHistory = [
        {
          id: '1',
          title: 'Exploring Career Transition',
          date: new Date('2024-01-15'),
          messageCount: 12,
          phase: 'contraction',
          preview: 'Discussed feeling stuck in current role and exploring new possibilities...',
          tags: ['career', 'transition', 'purpose']
        },
        {
          id: '2',
          title: 'Values Alignment Session',
          date: new Date('2024-01-12'),
          messageCount: 8,
          phase: 'expansion',
          preview: 'Deep dive into core values and how they relate to daily decisions...',
          tags: ['values', 'alignment', 'authenticity']
        },
        {
          id: '3',
          title: 'Morning Reflection',
          date: new Date('2024-01-10'),
          messageCount: 5,
          phase: 'renewal',
          preview: 'Gentle check-in about energy levels and intention setting...',
          tags: ['morning', 'reflection', 'intentions']
        }
      ];

      res.json(mockHistory);
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  app.get('/api/user/:userId/analytics/compatibility', async (req, res) => {
    try {
      const { userId } = req.params;
      const { matches } = req.query;

      const potentialMatches = matches ? (matches as string).split(',') : [];
      const matrix = await advancedAnalytics.generateCompatibilityMatrix(userId, potentialMatches);
      res.json(matrix);
    } catch (error) {
      console.error('Error generating compatibility matrix:', error);
      res.status(500).json({ error: 'Failed to generate compatibility analysis' });
    }
  });

  // Weekly insights endpoint
  app.post('/api/insights/weekly', async (req, res) => {
    try {
      const { entries } = req.body;
      const insights = await generateJournalInsights(entries, 'week');
      res.json(insights);
    } catch (error) {
      console.error('Weekly insights error:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });

  // Memory exploration endpoints
  app.post('/api/memory/patterns', async (req, res) => {
    try {
      const { userId, pattern, timeframe } = req.body;
      const { advancedMemory } = await import('./memory-service');

      const patterns = await advancedMemory.retrievePatternBasedMemories(
        userId,
        pattern,
        timeframe || 'month'
      );

      res.json(patterns);
    } catch (error) {
      console.error('Memory patterns error:', error);
      res.status(500).json({ error: 'Failed to retrieve memory patterns' });
    }
  });

  app.post('/api/memory/cluster', async (req, res) => {
    try {
      const { userId } = req.body;
      const { advancedMemory } = await import('./memory-service');

      const clustering = await advancedMemory.clusterSemanticMemories(userId);

      res.json(clustering);
    } catch (error) {
      console.error('Memory clustering error:', error);
      res.status(500).json({ error: 'Failed to cluster memories' });
    }
  });

  // Store personality test results
  app.post("/api/personality-test", async (req, res) => {
    try {
      const { results, userId } = req.body;

      // Store personality data for Bliss AI context
      await storage.storePersonalityProfile(userId || 'anonymous', {
        traits: results,
        completedAt: new Date(),
        insights: (function generatePersonalityInsights(res: any){
          // Minimal insight generator used for storage; real implementation lives elsewhere
          return {
            summary: `Detected traits: ${Object.keys(res || {}).join(', ')}`,
            recommendations: []
          };
        })(results)
      });

      res.json({ success: true, message: "Personality test results saved" });
    } catch (error) {
      console.error("Error saving personality test results:", error);
      res.status(500).json({ error: "Failed to save personality test results" });
    }
  });

  // Get personality profile for AI context
  app.get("/api/personality-profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getPersonalityProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching personality profile:", error);
      res.status(500).json({ error: "Failed to fetch personality profile" });
    }
  });

  // Subscription routes
  app.post("/api/subscription/create-checkout", async (req, res) => {
    try {
      const user = (req as any).user as any;
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      const { tier } = req.body;
      // Use paymentService to create checkout for subscription
      const session = await paymentService.createSubscriptionCheckout(user.id, tier, req.body.successUrl, req.body.cancelUrl);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Notification endpoints
  app.get('/api/notifications', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationService } = await import('./notification-service');
      const notifications = await notificationService.getUserNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.get('/api/notifications/unread-count', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationService } = await import('./notification-service');
      const count = await notificationService.getUnreadCount(user.id);
      res.json({ count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  });

  app.put('/api/notifications/:notificationId/read', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationId } = req.params;
      const { notificationService } = await import('./notification-service');
      await notificationService.markAsRead(notificationId, user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  app.put('/api/notifications/read-all', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationService } = await import('./notification-service');
      await notificationService.markAllAsRead(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  app.delete('/api/notifications/:notificationId', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationId } = req.params;
      const { notificationService } = await import('./notification-service');
      await notificationService.deleteNotification(notificationId, user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // Memory & Emotional Intelligence routes
  app.get("/api/emotional-trajectory", async (req, res) => {
    try {
      const user = (req as any).user as any;
      if (!user) {
        return res.status(401).send("Unauthorized");
      }

      const days = parseInt(req.query.days as string) || 30;
      const { enhancedMemoryService } = await import("./enhanced-memory-service");

      const dataPoints = await enhancedMemoryService.getEmotionalTrajectory(user.id, days);

      // Calculate trend
      const valences = dataPoints.map(d => d.valence);
      const trend = valences.length > 1 ?
        (valences[valences.length - 1] - valences[0]) / valences.length : 0;

      res.json({
        dataPoints,
        trend,
        patterns: [], // Will be populated by pattern detection in future
      });
    } catch (error: any) {
      console.error("Emotional trajectory error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/conversation-themes", async (req, res) => {
    try {
      const user = (req as any).user as any;
      if (!user) {
        return res.status(401).send("Unauthorized");
      }

      const { enhancedMemoryService } = await import("./enhanced-memory-service");
      const themes = await enhancedMemoryService.getUserThemes(user.id);

      res.json(themes);
    } catch (error: any) {
      console.error("Themes error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get themes for user
  app.get('/api/themes', async (req, res) => {
    if (!(req as any).isAuthenticated || !(req as any).isAuthenticated()) {
      return res.status(401).send('Not authenticated');
    }

    try {
      const themes = await enhancedMemoryService.getUserThemes((req as any).user!.id);
      res.json(themes);
    } catch (error) {
      console.error('Error fetching themes:', error);
      res.status(500).json({ error: 'Failed to fetch themes' });
    }
  });

  // PHASE 2: Get user beliefs
  app.get('/api/beliefs', async (req, res) => {
    if (!(req as any).isAuthenticated || !(req as any).isAuthenticated()) {
      return res.status(401).send('Not authenticated');
    }

    try {
      const userBeliefs = await db.select()
        .from(beliefs)
        .where(eq(beliefs.userId, (req as any).user!.id))
        .orderBy(desc(beliefs.confidence));
      res.json(userBeliefs);
    } catch (error) {
      console.error('Error fetching beliefs:', error);
      res.status(500).json({ error: 'Failed to fetch beliefs' });
    }
  });

  // PHASE 2: Get contradiction history
  app.get('/api/contradictions', async (req, res) => {
    if (!(req as any).isAuthenticated || !(req as any).isAuthenticated()) {
      return res.status(401).send('Not authenticated');
    }

    try {
      const userContradictions = await db.select()
        .from(contradictions)
        .where(eq(contradictions.userId, (req as any).user!.id))
        .orderBy(desc(contradictions.detectedAt))
        .limit(20);
      res.json(userContradictions);
    } catch (error) {
      console.error('Error fetching contradictions:', error);
      res.status(500).json({ error: 'Failed to fetch contradictions' });
    }
  });

  // PHASE 2: Get cognitive distortions
  app.get('/api/cognitive-distortions', async (req, res) => {
    if (!(req as any).isAuthenticated || !(req as any).isAuthenticated()) {
      return res.status(401).send('Not authenticated');
    }

    try {
      const distortionsData = await db.select()
        .from(cognitiveDistortions)
        .where(eq(cognitiveDistortions.userId, (req as any).user!.id))
        .orderBy(desc(cognitiveDistortions.detectedAt))
        .limit(20);
      res.json(distortionsData);
    } catch (error) {
      console.error('Error fetching cognitive distortions:', error);
      res.status(500).json({ error: 'Failed to fetch cognitive distortions' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}