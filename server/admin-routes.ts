
import type { Express } from "express";
import { adminService } from "./admin-service";

export function registerAdminRoutes(app: Express) {
  // Middleware to verify admin access
  const requireAdmin = async (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = await adminService.verifyAdminAccess(user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    next();
  };

  // Get all users with analytics
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await adminService.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  // Get user analytics
  app.get('/api/admin/analytics/:userId?', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const analytics = await adminService.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error('Admin analytics error:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  // Get digital twin profile
  app.get('/api/admin/digital-twin/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await adminService.getDigitalTwinProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error('Digital twin error:', error);
      res.status(500).json({ error: 'Failed to get digital twin profile' });
    }
  });

  // Generate digital twin
  app.post('/api/admin/digital-twin/:userId/generate', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const adminId = req.user.id;
      
      const twinId = await adminService.generateDigitalTwin(userId);
      
      await adminService.logAdminAction(
        adminId,
        'generate_digital_twin',
        'user',
        userId,
        { twinId }
      );

      res.json({ twinId });
    } catch (error) {
      console.error('Generate digital twin error:', error);
      res.status(500).json({ error: 'Failed to generate digital twin' });
    }
  });

  // Get system metrics
  app.get('/api/admin/metrics', requireAdmin, async (req, res) => {
    try {
      const timeRange = req.query.range as 'hour' | 'day' | 'week' || 'day';
      const metrics = await adminService.getSystemMetrics(timeRange);
      res.json(metrics);
    } catch (error) {
      console.error('System metrics error:', error);
      res.status(500).json({ error: 'Failed to get system metrics' });
    }
  });

  // Create admin user
  app.post('/api/admin/create', requireAdmin, async (req, res) => {
    try {
      const { userId, role, permissions } = req.body;
      const adminId = req.user.id;

      const newAdminId = await adminService.createAdmin(userId, role, permissions);
      
      await adminService.logAdminAction(
        adminId,
        'create_admin',
        'user',
        userId,
        { role, permissions }
      );

      res.json({ adminId: newAdminId });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({ error: 'Failed to create admin' });
    }
  });

  // Perception profiling endpoints
  app.get('/api/admin/perception/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await adminService.getPerceptionProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error('Get perception profile error:', error);
      res.status(500).json({ error: 'Failed to get perception profile' });
    }
  });

  app.post('/api/admin/perception/:userId/generate', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const adminId = req.user.id;
      
      const profileId = await adminService.generatePerceptionProfile(userId);
      
      await adminService.logAdminAction(
        adminId,
        'generate_perception_profile',
        'user',
        userId,
        { profileId }
      );

      res.json({ profileId });
    } catch (error) {
      console.error('Generate perception profile error:', error);
      res.status(500).json({ error: 'Failed to generate perception profile' });
    }
  });

  app.put('/api/admin/perception/:userId/consent', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { consent } = req.body;
      const adminId = req.user.id;

      await adminService.updatePerceptionConsent(userId, consent);
      
      await adminService.logAdminAction(
        adminId,
        'update_perception_consent',
        'user',
        userId,
        { consent }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Update perception consent error:', error);
      res.status(500).json({ error: 'Failed to update consent' });
    }
  });

  // Experiment management endpoints
  app.get('/api/admin/experiments', requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const experiments = await adminService.getExperiments(status as string);
      res.json(experiments);
    } catch (error) {
      console.error('Get experiments error:', error);
      res.status(500).json({ error: 'Failed to get experiments' });
    }
  });

  app.post('/api/admin/experiments', requireAdmin, async (req, res) => {
    try {
      const { name, hypothesis, description } = req.body;
      const adminId = req.user.id;

      const experimentId = await adminService.createExperiment(adminId, name, hypothesis, description);
      res.json({ experimentId });
    } catch (error) {
      console.error('Create experiment error:', error);
      res.status(500).json({ error: 'Failed to create experiment' });
    }
  });

  app.get('/api/admin/experiments/:experimentId/participants', requireAdmin, async (req, res) => {
    try {
      const { experimentId } = req.params;
      const participants = await adminService.getExperimentParticipants(experimentId);
      res.json(participants);
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({ error: 'Failed to get participants' });
    }
  });

  app.post('/api/admin/experiments/:experimentId/participants', requireAdmin, async (req, res) => {
    try {
      const { experimentId } = req.params;
      const { userId, consent } = req.body;
      const adminId = req.user.id;

      const participantId = await adminService.addExperimentParticipant(experimentId, userId, consent);
      
      await adminService.logAdminAction(
        adminId,
        'add_experiment_participant',
        'experiment',
        experimentId,
        { userId, consent, participantId }
      );

      res.json({ participantId });
    } catch (error) {
      console.error('Add participant error:', error);
      res.status(500).json({ error: 'Failed to add participant' });
    }
  });

  app.get('/api/admin/revenue/overview', requireAdmin, async (req, res) => {
    try {
      const { timeRange } = req.query;
      const revenue = await adminService.getRevenueOverview(timeRange as string || 'month');
      res.json(revenue);
    } catch (error) {
      console.error('Get revenue overview error:', error);
      res.status(500).json({ error: 'Failed to get revenue overview' });
    }
  });

  app.get('/api/admin/revenue/subscriptions', requireAdmin, async (req, res) => {
    try {
      const stats = await adminService.getSubscriptionStats();
      res.json(stats);
    } catch (error) {
      console.error('Get subscription stats error:', error);
      res.status(500).json({ error: 'Failed to get subscription stats' });
    }
  });

  app.get('/api/admin/revenue/payments', requireAdmin, async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const payments = await adminService.getRecentPayments(
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0
      );
      res.json(payments);
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ error: 'Failed to get payments' });
    }
  });

  app.post('/api/admin/register', async (req, res) => {
    try {
      const { username, password, email, inviteCode } = req.body;
      
      if (!inviteCode || inviteCode !== process.env.ADMIN_INVITE_CODE) {
        return res.status(403).json({ error: 'Invalid invite code' });
      }

      const bcrypt = await import('bcryptjs');
      const hashed = await bcrypt.hash(password, 10);
      
      const result = await adminService.registerAdmin(username, email, hashed);
      res.status(201).json({ success: true, adminId: result.adminId });
    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({ error: 'Admin registration failed' });
    }
  });

  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const result = await adminService.authenticateAdmin(email, password);
      
      if (!result.success) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      (req as any).session.userId = result.userId;
      (req as any).session.isAdmin = true;

      res.json({ 
        success: true, 
        user: { 
          id: result.userId, 
          role: result.role,
          permissions: result.permissions 
        } 
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Admin login failed' });
    }
  });
}
