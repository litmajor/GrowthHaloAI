
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
}
