import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateBlissResponse, detectGrowthPhase, generatePersonalizedContent, analyzeValuesAssessment, generateValueBasedGuidance } from "./ai-service";
import { growthTracker } from "./growth-service";
import { communityIntelligence } from "./community-service";
import { subscriptionService } from "./subscription-service";
import { paymentService } from "./payment-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Chat endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], userId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get user context for better responses
      let userContext = {};
      if (userId) {
        try {
          userContext = await growthTracker.getUserGrowthData(userId);
        } catch (error) {
          console.warn('Could not fetch user context:', error);
        }
      }

      const response = await generateBlissResponse(message, history);
      res.json(response);
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to generate response" });
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

  app.post("/api/payment/webhook", async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

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

  const httpServer = createServer(app);

  return httpServer;
}