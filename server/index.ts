// Load .env.local first (if present), then .env so local overrides take precedence.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import crypto from 'crypto';
import pg from 'pg';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import client from 'prom-client';

const app = express();
// Default JSON/urlencoded parsers for regular API routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

  // Allow cross-origin requests from the frontend dev server and allow credentials
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
  app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

  // Setup session store backed by Postgres (connect-pg-simple)
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
  const PgStore = connectPgSimple(session);

  // Use DATABASE_URL from env (docker-compose sets this for the backend service)
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  const pgPool = new pg.Pool({ connectionString: dbUrl });

  app.use(session({
    store: new PgStore({ pool: pgPool }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

// Helper raw body parser to use for endpoints that need the raw payload (e.g. Stripe webhooks)
import { raw } from 'express';
export const rawBodyMiddleware = raw({ type: '*/*' });

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup Prometheus metrics collection
  try {
    client.collectDefaultMetrics();
    app.get('/metrics', async (_req: Request, res: Response) => {
      try {
        const metrics = await client.register.metrics();
        res.set('Content-Type', client.register.contentType);
        res.send(metrics);
      } catch (e) {
        res.status(500).send('could not collect metrics');
      }
    });
  } catch (e) {
    // if prom-client isn't available in some environments, don't fail startup
    log('prom-client not available or failed to initialize metrics');
  }
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // On some platforms (Windows) reusePort is not supported; only enable when available
  const listenOptions: any = {
    port,
    host: '0.0.0.0',
  };

  if (process.platform !== 'win32') {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
