import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateBlissResponse, detectGrowthPhase, generatePersonalizedContent, analyzeValuesAssessment, generateValueBasedGuidance } from "./ai-service";
import { growthTracker } from "./growth-service";
import { communityIntelligence } from "./community-service";

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

  // Growth Tracking endpoints
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

  const httpServer = createServer(app);

  return httpServer;
}
