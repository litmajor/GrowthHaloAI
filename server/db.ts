import { Pool, neonConfig } from '@neondatabase/serverless';
// If DATABASE_URL is missing due to module load ordering, try to read .env.local/.env manually
if (!process.env.DATABASE_URL) {
  try {
    // Use sync require so this file works without top-level await
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    const root = path.resolve(__dirname, '..');

    const tryLoad = (filename: string) => {
      try {
        const p = path.join(root, filename);
        if (!fs.existsSync(p)) return;
        const content = fs.readFileSync(p, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/);
          if (m) {
            process.env.DATABASE_URL = m[1].trim();
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    };

    tryLoad('.env.local');
    if (!process.env.DATABASE_URL) tryLoad('.env');
  } catch (e) {
    // ignore any errors reading files
  }
}
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
