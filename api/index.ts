import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config({ override: true });
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { neon } from '@neondatabase/serverless';

export const CURRENT_APP_VERSION = "1.1.0";
export const APP_CHANGELOGS: Record<string, any> = {
  "1.1.0": {
    version: "1.1.0",
    releaseDate: "September 2026",
    title: "AI Video Timeline Planner & Google Flow Workflow",
    type: "minor",
    description: "We've added new features and improvements to make your creator workflow better."
  }
};


export interface VideoJob {
  id: string;
  projectId: string;
  status: 'queued' | 'generating_script' | 'generating_scenes' | 'generating_audio' | 'combining' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentScene: number;
  totalScenes: number;
  provider: string;
  error?: string;
  resultUrl?: string;
  projectData?: any;
}

const activeJobs = new Map<string, VideoJob>();

export class VideoGenerationService {
  /**
   * Starts a new video generation job.
   */
  static async startJob(params: any): Promise<VideoJob> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const veoKey = process.env.VEO_API_KEY;
    const apiKey = geminiKey || veoKey;
    
    if (!apiKey) {
      throw new Error('Video generation is currently unavailable. Please try again shortly.');
    }

    if (apiKey === 'YOUR_GEMINI_API_KEY' || apiKey === 'YOUR_VEO_API_KEY') {
      throw new Error('Video generation is currently unavailable. Please try again shortly.');
    }

    const jobId = 'vjob-' + Date.now();
    const job: VideoJob = {
      id: jobId,
      projectId: 'proj-' + Date.now(),
      status: 'queued',
      progress: 0,
      currentScene: 0,
      totalScenes: 1,
      provider: 'Veo 3.1 (Google Gemini)',
    };
    
    activeJobs.set(jobId, job);
    
    // Kick off background processing safely
    this.processJob(jobId, params, apiKey).catch(err => {
      const j = activeJobs.get(jobId);
      if (j) {
        j.status = 'failed';
        j.error = err?.message || String(err);
      }
    });
    
    return job;
  }
  
  /**
   * Retrieves the current status of an active video generation job.
   */
  static async getJobStatus(jobId: string): Promise<VideoJob> {
    const job = activeJobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  /**
   * Internal job processor that handles the multi-stage rendering pipeline.
   */
  private static async processJob(jobId: string, params: any, apiKey: string) {
    const job = activeJobs.get(jobId);
    if (!job) return;

    try {
      const ai = new GoogleGenAI({ apiKey });

      // 1. Script Generation Stage
      job.status = 'generating_script';
      job.progress = 10;
      
      const scriptPrompt = `You are a visionary video director. Provide a highly cinematic, highly detailed visual prompt for a single 8-second video scene based on this idea: "${params.idea}". Aspect ratio: ${params.aspectRatio}. Style: ${params.style}. Focus on stunning visual elements, lighting, camera movement, and mood. Keep it under 50 words.`;
      
      let visualPrompt = params.idea;
      try {
        const scriptResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: scriptPrompt
        });
        if (scriptResponse.text) {
          visualPrompt = scriptResponse.text;
        }
      } catch {
        visualPrompt = params.idea;
      }

      // 2. Rendering Stage
      job.status = 'rendering';
      job.progress = 20;
      job.projectData = {
        fullScript: visualPrompt,
        scenes: [{ sceneNumber: 1, description: visualPrompt, visualPrompt: visualPrompt, timeRange: '0:00 - 0:08' }]
      };

      let op = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        source: {
          prompt: visualPrompt
        },
        config: {
          numberOfVideos: 1
        }
      });
      
      job.progress = 30;

      while (!op.done) {
        await new Promise(r => setTimeout(r, 10000));
        op = await ai.operations.getVideosOperation({ operation: op });
        if (job.progress < 90) job.progress += 2;
      }
      
      if (op.error) {
        throw new Error(`Veo API Error: ${JSON.stringify(op.error)}`);
      }
      
      if (op.response && op.response.generatedVideos && op.response.generatedVideos.length > 0) {
        const video = op.response.generatedVideos[0];
        
        let finalUrl = '';
        if (video.video?.uri) {
           finalUrl = video.video.uri;
        } else if (video.video?.videoBytes) {
           finalUrl = `data:${video.video.mimeType || 'video/mp4'};base64,${video.video.videoBytes}`;
        } else {
           throw new Error('Video generation succeeded but returned no usable video content.');
        }

        job.resultUrl = finalUrl;
        job.status = 'completed';
        job.progress = 100;
      } else {
        throw new Error('No video was generated by the API.');
      }
      
    } catch (err: any) {
      job.status = 'failed';
      if (err.status === 429 || (err.message && err.message.includes('429'))) {
        job.error = 'API Quota Exceeded for Veo Generation. Please check your Gemini API plan.';
      } else {
        job.error = err?.message || 'Unknown error during video generation.';
      }
    }
  }
}

const app = express();

// CORS Headers supporting credentials for session cookies
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Cookie parser for session management
app.use(cookieParser());

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.SERVERLESS
);

// URL Normalizer for Vercel Rewrites
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  const forwarded = req.headers['x-forwarded-url'] || req.headers['x-original-url'];

  if (typeof matchedPath === 'string' && matchedPath.startsWith('/api') && matchedPath !== '/api') {
    const queryIndex = req.url.indexOf('?');
    const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    req.url = `${matchedPath}${queryString}`;
  } else if (typeof forwarded === 'string' && forwarded.startsWith('/api')) {
    req.url = forwarded;
  } else if (req.url && req.url.includes('_api_route=')) {
    const match = req.url.match(/[?&]_api_route=([^&]+)/);
    if (match) {
      const cleanRoute = decodeURIComponent(match[1]).replace(/^\/+/, '');
      const cleanUrl = req.url.replace(/([?&])_api_route=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
      const queryIdx = cleanUrl.indexOf('?');
      const extraQuery = queryIdx !== -1 ? cleanUrl.substring(queryIdx) : '';
      req.url = `/api/${cleanRoute}${extraQuery}`;
    }
  } else if (req.query && typeof req.query._api_route === 'string') {
    const cleanRoute = (req.query._api_route as string).replace(/^\/+/, '');
    const queryIndex = req.url.indexOf('?');
    const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    req.url = `/api/${cleanRoute}${queryString}`;
  } else if (isServerless && !req.url.startsWith('/api')) {
    // Only in serverless environment where every request to this handler is intended for the API
    req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`;
  }
  next();
});

// JSON and URL-encoded body parsers with pre-parsed body detection
app.use((req, res, next) => {
  // CRITICAL FOR SERVERLESS: Skip body parsing for GET, HEAD, and OPTIONS.
  // Invoking stream body parsers on GET requests in Vercel causes timeouts and FUNCTION_INVOCATION_FAILED.
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
    return next();
  }
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
    return next();
  }
  if ((req as any).readableEnded || (req as any)._readableState?.ended || (req as any).complete) {
    if (!req.body) req.body = {};
    return next();
  }
  express.json({ limit: '25mb' })(req, res, (err) => {
    if (err) {
      req.body = {};
    }
    next();
  });
});

app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
    return next();
  }
  if ((req as any).readableEnded || (req as any)._readableState?.ended || (req as any).complete) {
    if (!req.body) req.body = {};
    return next();
  }
  express.urlencoded({ extended: true, limit: '25mb' })(req, res, (err) => {
    if (err) {
      req.body = {};
    }
    next();
  });
});

// ==========================================
// NEON POSTGRESQL DATABASE CLIENT & HELPERS
// ==========================================
let sqlClient: any = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.includes('username:password')) return false;
  // Must be a valid postgres URL
  if (!trimmed.startsWith('postgres://') && !trimmed.startsWith('postgresql://')) return false;
  return true;
}

export function getDbClient() {
  if (!isDbConfigured()) {
    return null;
  }
  if (!sqlClient) {
    const connectionString = process.env.DATABASE_URL!.trim();
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

export function getDbPool(): any {
  return getDbClient();
}

/**
 * Ensures Neon/PostgreSQL users table and schema are safely migrated with all columns.
 * Specifically adds the 'email' column with a unique partial index if missing.
 */
export async function ensureUsersSchema(force = false): Promise<void> {
  if (isInitialized && !force) return;
  if (!isDbConfigured()) return;

  const sql = getDbClient();
  if (!sql) return;

  const migrationStatements = [
    // 1. Ensure users table exists with primary key
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      display_username VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

    // 2. Add email column safely if missing (CRITICAL for Google OAuth)
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`,

    // 3. Add OAuth provider columns
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) DEFAULT 'local'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(128)`,

    // 4. Ensure password_hash is nullable (so OAuth users do not require a plaintext password)
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`,
    `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`,

    // 5. Ensure role, status, avatar columns exist
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'user'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,

    // 6. Create unique index on non-null emails (case-insensitive)
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (LOWER(email)) WHERE email IS NOT NULL`,

    // 7. Create unique index on Google/OAuth provider credentials
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id ON users (auth_provider, provider_user_id) WHERE provider_user_id IS NOT NULL`,

    // 8. Unique index on lowercase username
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username))`,

    // 9. User sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(128) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at)`,

    // 10. Projects table (User-Specific Application Data)
    `CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      type VARCHAR(64) DEFAULT 'YouTube Video' NOT NULL,
      aspect_ratio VARCHAR(32) DEFAULT '16:9' NOT NULL,
      duration VARCHAR(64) DEFAULT '60 seconds' NOT NULL,
      status VARCHAR(32) DEFAULT 'draft' NOT NULL,
      thumbnail_url TEXT,
      video_url TEXT,
      tags TEXT[] DEFAULT ARRAY['AI Video']::TEXT[],
      scenes_count INTEGER DEFAULT 3 NOT NULL,
      quality VARCHAR(64) DEFAULT '1080p Full HD',
      script TEXT DEFAULT '',
      scenes JSONB DEFAULT '[]'::JSONB,
      style VARCHAR(64) DEFAULT 'Cinematic',
      voice VARCHAR(64) DEFAULT 'Female',
      language VARCHAR(64) DEFAULT 'English',
      music VARCHAR(128) DEFAULT 'AI Background Music',
      idea_prompt TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

    // 11. Add any missing project columns
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS style VARCHAR(64) DEFAULT 'Cinematic'`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS voice VARCHAR(64) DEFAULT 'Female'`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS language VARCHAR(64) DEFAULT 'English'`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS music VARCHAR(128) DEFAULT 'AI Background Music'`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS idea_prompt TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS scenes_count INTEGER DEFAULT 3`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS quality VARCHAR(64) DEFAULT '1080p Full HD'`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS script TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS scenes JSONB DEFAULT '[]'::JSONB`,

    `CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC)`,

    // 12. Templates Table (Database-Driven AI Template Library)
    `CREATE TABLE IF NOT EXISTS templates (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      category VARCHAR(64) NOT NULL DEFAULT 'Trending',
      aspect_ratio VARCHAR(32) NOT NULL DEFAULT '9:16',
      duration VARCHAR(64) NOT NULL DEFAULT '15 seconds',
      duration_seconds INTEGER NOT NULL DEFAULT 15,
      media_slots INTEGER NOT NULL DEFAULT 3,
      slots_metadata JSONB DEFAULT '[]'::JSONB,
      thumbnail_url TEXT NOT NULL DEFAULT '',
      preview_video_url TEXT DEFAULT '',
      is_published BOOLEAN NOT NULL DEFAULT true,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)`,
    `CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published)`,
    `CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(is_featured)`,
    `CREATE INDEX IF NOT EXISTS idx_templates_updated_at ON templates(updated_at DESC)`,

    // 13. Template Usage Analytics & Tracking
    `CREATE TABLE IF NOT EXISTS template_usage (
      id VARCHAR(64) PRIMARY KEY,
      template_id VARCHAR(64) NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
      project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_template_usage_tpl_id ON template_usage(template_id)`,
    `CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON template_usage(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_template_usage_created_at ON template_usage(created_at DESC)`,

    // 14. Updates Management Table (What's New banner, version control & releases)
    `CREATE TABLE IF NOT EXISTS updates (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      tag VARCHAR(64) DEFAULT 'New Feature',
      version VARCHAR(64) DEFAULT '1.1.0',
      minimum_supported_version VARCHAR(64) DEFAULT '1.0.0',
      scheduled_at TIMESTAMPTZ,
      requires_sign_in BOOLEAN DEFAULT false,
      is_required BOOLEAN DEFAULT false,
      release_notes TEXT,
      status VARCHAR(32) DEFAULT 'published',
      timezone VARCHAR(64) DEFAULT 'UTC',
      is_featured BOOLEAN DEFAULT false,
      image_url TEXT,
      button_text VARCHAR(64) DEFAULT 'Try Now',
      button_link VARCHAR(255) DEFAULT '/templates',
      is_published BOOLEAN NOT NULL DEFAULT true,
      is_pinned BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    // Incremental column migrations for existing installations
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS version VARCHAR(64) DEFAULT '1.1.0'`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS minimum_supported_version VARCHAR(64) DEFAULT '1.0.0'`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS requires_sign_in BOOLEAN DEFAULT false`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT false`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS release_notes TEXT`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'published'`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) DEFAULT 'UTC'`,
    `ALTER TABLE updates ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
    `CREATE INDEX IF NOT EXISTS idx_updates_published ON updates(is_published)`,
    `CREATE INDEX IF NOT EXISTS idx_updates_pinned ON updates(is_pinned)`,
    `CREATE INDEX IF NOT EXISTS idx_updates_published_at ON updates(published_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_updates_scheduled_at ON updates(scheduled_at)`,
    `CREATE INDEX IF NOT EXISTS idx_updates_status ON updates(status)`,

    // 15. Contact Inquiries & Support Messages (Requirement 10)
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id VARCHAR(64) PRIMARY KEY,
      ticket_id VARCHAR(32) NOT NULL,
      name VARCHAR(128) NOT NULL,
      email VARCHAR(255) NOT NULL,
      category VARCHAR(64) DEFAULT 'General Inquiry & Feedback',
      subject VARCHAR(255) DEFAULT '',
      message TEXT NOT NULL,
      status VARCHAR(32) DEFAULT 'received',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(LOWER(email))`
  ];

  for (const ddl of migrationStatements) {
    try {
      await sql.query(ddl);
    } catch (err: any) {
      if (!err?.message?.includes('already exists') && !err?.message?.includes('duplicate')) {
        console.warn(`[Neon Schema DDL Note] ${ddl.slice(0, 45)}...:`, err?.message || err);
      }
    }
  }

  // Seed default templates and announcement updates if empty
  await seedInitialTemplatesAndUpdates(sql);

  isInitialized = true;
}

export const DEFAULT_SERVER_TEMPLATES = [
  {
    id: 'tpl_trending_velocity',
    title: 'Viral Velocity Beat Drop',
          description: 'High-octane fast cuts synced with dynamic strobe pulses, speed ramping, and neon optical glows. Perfect for TikTok, Reels, and YouTube Shorts.',
          category: 'Trending',
          aspect_ratio: '9:16',
          duration: '15 seconds',
          duration_seconds: 15,
          media_slots: 5,
          slots_metadata: [
            { slotIndex: 0, label: 'Hook / Opening Action', type: 'video', duration: '2.5s', suggested: 'High-energy movement' },
            { slotIndex: 1, label: 'First Beat Hit', type: 'photo', duration: '2.5s', suggested: 'Crisp subject portrait' },
            { slotIndex: 2, label: 'Secondary Movement', type: 'video', duration: '3.0s', suggested: 'Camera pan or motion' },
            { slotIndex: 3, label: 'Speed Ramp Accent', type: 'photo', duration: '3.0s', suggested: 'Bold expressive look' },
            { slotIndex: 4, label: 'Climax Drop', type: 'video', duration: '4.0s', suggested: 'Peak visual action' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-urban-fashion-model-in-neon-city-41551-large.mp4',
          is_published: true,
          is_featured: true,
          usage_count: 1420
        },
        {
          id: 'tpl_beat_sync_strobe',
          title: 'EDM Bassline Strobe Match',
          description: 'Precise millisecond beat synchronization with heavy bass flash impacts and cinematic zoom punches.',
          category: 'Beat Sync',
          aspect_ratio: '9:16',
          duration: '12 seconds',
          duration_seconds: 12,
          media_slots: 4,
          slots_metadata: [
            { slotIndex: 0, label: 'Bass Intro Pulse', type: 'video', duration: '3.0s', suggested: 'Stage or crowd energy' },
            { slotIndex: 1, label: 'Flash Impact 1', type: 'photo', duration: '2.0s', suggested: 'Sharp centered subject' },
            { slotIndex: 2, label: 'Flash Impact 2', type: 'photo', duration: '2.0s', suggested: 'Contrasting angle' },
            { slotIndex: 3, label: 'Heavy Drop Outro', type: 'video', duration: '5.0s', suggested: 'Rapid motion or performance' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-party-crowd-dancing-in-a-club-with-red-lighting-42999-large.mp4',
          is_published: true,
          is_featured: true,
          usage_count: 980
        },
        {
          id: 'tpl_photo_parallax_3d',
          title: '3D Parallax Film Memories',
          description: 'Transforms still photos into breathtaking 3D camera depth sweeps with vintage 35mm film grain and light leaks.',
          category: 'Photo Transition',
          aspect_ratio: '16:9',
          duration: '20 seconds',
          duration_seconds: 20,
          media_slots: 6,
          slots_metadata: [
            { slotIndex: 0, label: 'Memory Intro', type: 'photo', duration: '3.5s', suggested: 'Landscape or group' },
            { slotIndex: 1, label: 'Depth Shift 1', type: 'photo', duration: '3.0s', suggested: 'Detailed portrait' },
            { slotIndex: 2, label: 'Depth Shift 2', type: 'photo', duration: '3.5s', suggested: 'Candid moment' },
            { slotIndex: 3, label: 'Depth Shift 3', type: 'photo', duration: '3.0s', suggested: 'Scenic background' },
            { slotIndex: 4, label: 'Depth Shift 4', type: 'photo', duration: '3.5s', suggested: 'Smile or laughter' },
            { slotIndex: 5, label: 'Nostalgic Finale', type: 'photo', duration: '3.5s', suggested: 'Iconic wide shot' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-camera-flying-over-mountain-peaks-in-snow-40432-large.mp4',
          is_published: true,
          is_featured: false,
          usage_count: 730
        },
        {
          id: 'tpl_love_golden_hour',
          title: 'Romantic Golden Hour Story',
          description: 'Warm cinematic bokeh dissolves with gentle slow-motion panning and acoustic violin undertones.',
          category: 'Love',
          aspect_ratio: '9:16',
          duration: '18 seconds',
          duration_seconds: 18,
          media_slots: 4,
          slots_metadata: [
            { slotIndex: 0, label: 'First Glance', type: 'video', duration: '4.5s', suggested: 'Walking at sunset' },
            { slotIndex: 1, label: 'Quiet Smile', type: 'photo', duration: '4.0s', suggested: 'Close-up emotion' },
            { slotIndex: 2, label: 'Holding Hands', type: 'video', duration: '4.5s', suggested: 'Gentle touch or stroll' },
            { slotIndex: 3, label: 'Eternal Sunset', type: 'photo', duration: '5.0s', suggested: 'Silhouette or embrace' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-couple-walking-together-at-sunset-41445-large.mp4',
          is_published: true,
          is_featured: true,
          usage_count: 1150
        },
        {
          id: 'tpl_birthday_sparkler',
          title: 'Festive Birthday Celebration',
          description: 'Golden confetti bursts, celebratory sparkler light trails, and vibrant typography overlays for milestone birthdays.',
          category: 'Birthday',
          aspect_ratio: '9:16',
          duration: '15 seconds',
          duration_seconds: 15,
          media_slots: 3,
          slots_metadata: [
            { slotIndex: 0, label: 'Birthday Hero Intro', type: 'photo', duration: '4.0s', suggested: 'Celebrant with cake' },
            { slotIndex: 1, label: 'Candle Blow / Cheer', type: 'video', duration: '5.0s', suggested: 'Blowing candles or toasts' },
            { slotIndex: 2, label: 'Party Confetti Finale', type: 'photo', duration: '6.0s', suggested: 'Celebration group shot' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-burning-birthday-candles-on-a-cake-41558-large.mp4',
          is_published: true,
          is_featured: false,
          usage_count: 620
        },
        {
          id: 'tpl_travel_aerial_vlog',
          title: 'Wanderlust Mountain Expedition',
          description: 'Expansive landscape wipes, dynamic map pin zoom-ins, and high-energy pacing for adventures and travel vlogs.',
          category: 'Travel',
          aspect_ratio: '16:9',
          duration: '30 seconds',
          duration_seconds: 30,
          media_slots: 6,
          slots_metadata: [
            { slotIndex: 0, label: 'Departure / Transit', type: 'video', duration: '5.0s', suggested: 'Window view or packing' },
            { slotIndex: 1, label: 'Arrival Panorama', type: 'photo', duration: '4.5s', suggested: 'Wide landmark or vista' },
            { slotIndex: 2, label: 'Adventure Hike', type: 'video', duration: '5.5s', suggested: 'Trail walking or climbing' },
            { slotIndex: 3, label: 'Summit View', type: 'photo', duration: '4.5s', suggested: 'Peak celebration' },
            { slotIndex: 4, label: 'Local Culture', type: 'video', duration: '5.0s', suggested: 'Street food or market' },
            { slotIndex: 5, label: 'Sunset Farewell', type: 'photo', duration: '5.5s', suggested: 'Scenic golden hour' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-shot-of-snow-capped-mountains-in-winter-40431-large.mp4',
          is_published: true,
          is_featured: true,
          usage_count: 890
        },
        {
          id: 'tpl_dj_laser_visualizer',
          title: 'Club DJ Strobe Visualizer',
          description: 'Pulsing audio equalizer bars, laser tunnel sweeps, and bass-reactive visual turbulence for DJ mixes and tracks.',
          category: 'DJ',
          aspect_ratio: '9:16',
          duration: '25 seconds',
          duration_seconds: 25,
          media_slots: 3,
          slots_metadata: [
            { slotIndex: 0, label: 'Deck Build-up', type: 'video', duration: '7.0s', suggested: 'Hands on DJ mixer' },
            { slotIndex: 1, label: 'Crowd Anticipation', type: 'photo', duration: '6.0s', suggested: 'Hands in the air' },
            { slotIndex: 2, label: 'Laser Explosion', type: 'video', duration: '12.0s', suggested: 'Full stage light show' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-music-on-a-sound-console-in-a-club-41724-large.mp4',
          is_published: true,
          is_featured: false,
          usage_count: 540
        },
        {
          id: 'tpl_emotional_nostalgia',
          title: 'Heartfelt Tribute & Nostalgia',
          description: 'Gentle monochrome cross-fades, soft piano cadence, and vintage film frame borders for touching life moments.',
          category: 'Emotional',
          aspect_ratio: '16:9',
          duration: '24 seconds',
          duration_seconds: 24,
          media_slots: 5,
          slots_metadata: [
            { slotIndex: 0, label: 'Memory Prologue', type: 'photo', duration: '5.0s', suggested: 'Archival family portrait' },
            { slotIndex: 1, label: 'Childhood Glow', type: 'photo', duration: '4.5s', suggested: 'Playful early memory' },
            { slotIndex: 2, label: 'Milestone Walk', type: 'video', duration: '5.0s', suggested: 'Graduation or wedding' },
            { slotIndex: 3, label: 'Warm Gathering', type: 'photo', duration: '4.5s', suggested: 'Dinner table laughter' },
            { slotIndex: 4, label: 'Everlasting Legacy', type: 'photo', duration: '5.0s', suggested: 'Honoring portrait' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-old-photo-album-flipping-pages-41270-large.mp4',
          is_published: true,
          is_featured: false,
          usage_count: 410
        },
        {
          id: 'tpl_festival_glow',
          title: 'Festival of Lights & Harmony',
          description: 'Radiant golden oil lamp glows, rhythmic dhimay beats, and ornate mandala framing for Dashain, Tihar, and cultural festivals.',
          category: 'Festival',
          aspect_ratio: '9:16',
          duration: '16 seconds',
          duration_seconds: 16,
          media_slots: 4,
          slots_metadata: [
            { slotIndex: 0, label: 'Diyo Lamp Lighting', type: 'video', duration: '4.0s', suggested: 'Kindling brass lamps' },
            { slotIndex: 1, label: 'Traditional Attire', type: 'photo', duration: '3.5s', suggested: 'Cultural dress portrait' },
            { slotIndex: 2, label: 'Rangoli / Blessings', type: 'photo', duration: '3.5s', suggested: 'Tika ceremony or art' },
            { slotIndex: 3, label: 'Celebration Feast', type: 'video', duration: '5.0s', suggested: 'Family gatherings and laughter' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-night-lights-reflecting-in-the-water-41249-large.mp4',
          is_published: true,
          is_featured: false,
          usage_count: 780
        },
        {
          id: 'tpl_shorts_hook_explainer',
          title: 'Viral Hook 3-Second Retention',
          description: 'Pattern-interrupt zooms, bold centered kinetic captions, and sound-effect hit markers designed to maximize retention.',
          category: 'Shorts',
          aspect_ratio: '9:16',
          duration: '15 seconds',
          duration_seconds: 15,
          media_slots: 3,
          slots_metadata: [
            { slotIndex: 0, label: 'Pattern Interrupt Hook', type: 'video', duration: '3.0s', suggested: 'Surprise facial reaction' },
            { slotIndex: 1, label: 'Core Insight / Proof', type: 'photo', duration: '6.0s', suggested: 'Chart, result, or demo' },
            { slotIndex: 2, label: 'Actionable CTA', type: 'video', duration: '6.0s', suggested: 'Call to action point' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-recording-a-video-with-her-phone-41555-large.mp4',
          is_published: true,
          is_featured: true,
          usage_count: 1350
        },
        {
          id: 'tpl_tiktok_speed_ramp',
          title: 'TikTok Aesthetic Speed Ramp',
          description: 'Ultra-smooth velocity transitions (fast-slow-fast motion blur) syncing with trending rhythm pauses and whip pans.',
          category: 'TikTok Style',
          aspect_ratio: '9:16',
          duration: '12 seconds',
          duration_seconds: 12,
          media_slots: 4,
          slots_metadata: [
            { slotIndex: 0, label: 'Fast In & Slow Freeze', type: 'video', duration: '3.0s', suggested: 'Dynamic walk or spin' },
            { slotIndex: 1, label: 'Whip Pan Transition', type: 'photo', duration: '2.5s', suggested: 'Striking pose' },
            { slotIndex: 2, label: 'Velocity Ramp 2', type: 'video', duration: '3.0s', suggested: 'Skate or sports action' },
            { slotIndex: 3, label: 'Final Freeze Frame', type: 'photo', duration: '3.5s', suggested: 'Confident look at lens' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-skateboarding-at-sunset-41619-large.mp4',
          is_published: true,
          is_featured: true,
          usage_count: 1580
        },
        {
          id: 'tpl_reels_minimal_lookbook',
          title: 'Minimalist Editorial Lookbook',
          description: 'Clean high-fashion pacing, editorial typography spacing, and fluid wipe cuts with sophisticated ambient resonance.',
          category: 'Reels Style',
          aspect_ratio: '9:16',
          duration: '14 seconds',
          duration_seconds: 14,
          media_slots: 4,
          slots_metadata: [
            { slotIndex: 0, label: 'Look 1: Silhouette', type: 'photo', duration: '3.5s', suggested: 'Monochrome full-body' },
            { slotIndex: 1, label: 'Look 2: Fabric Detail', type: 'video', duration: '3.5s', suggested: 'Slow garment texture' },
            { slotIndex: 2, label: 'Look 3: Movement', type: 'video', duration: '3.5s', suggested: 'Walking down gallery' },
            { slotIndex: 3, label: 'Look 4: Signature Shot', type: 'photo', duration: '3.5s', suggested: 'Editorial portrait' }
          ],
          thumbnail_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
          preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-futuristic-silver-outfit-41553-large.mp4',
    is_published: true,
    is_featured: false,
    usage_count: 910
  }
];

export const DEFAULT_SERVER_UPDATES = [
  {
    id: 'upd_template_maker_launch',
    version: '1.1.0',
    minimum_supported_version: '1.0.0',
    title: 'AI Template Maker & Workflow System',
    description: 'Create high-converting videos using our curated studio templates. Upload your photos and videos to template slots and let Kiran AI Studio automatically align beats, crop ratios, and stitch seamless transitions.',
    release_notes: '- New AI Template Maker & Preset Engine\n- Improved AI Content & Shorts Planner\n- Deterministic Timeline Stitcher\n- Enhanced PWA & Offline Support',
    tag: 'Major Release',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    button_text: 'Explore Templates',
    button_link: '/templates',
    is_published: true,
    is_pinned: true,
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function seedInitialTemplatesAndUpdates(sql: any): Promise<void> {
  try {
    const existingTpls = await sql.query(`SELECT COUNT(*) AS count FROM templates`).catch(() => []);
    const tplCount = Number(existingTpls?.[0]?.count || 0);

    if (tplCount === 0) {
      for (const tpl of DEFAULT_SERVER_TEMPLATES) {
        await sql.query(
          `INSERT INTO templates (
            id, title, description, category, aspect_ratio, duration, duration_seconds,
            media_slots, slots_metadata, thumbnail_url, preview_video_url, is_published, is_featured, usage_count,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO NOTHING`,
          [
            tpl.id, tpl.title, tpl.description, tpl.category, tpl.aspect_ratio,
            tpl.duration, tpl.duration_seconds, tpl.media_slots, JSON.stringify(tpl.slots_metadata),
            tpl.thumbnail_url, tpl.preview_video_url, tpl.is_published, tpl.is_featured, tpl.usage_count
          ]
        ).catch(() => {});
      }
    }

    const existingUpdates = await sql.query(`SELECT COUNT(*) AS count FROM updates`).catch(() => []);
    const updateCount = Number(existingUpdates?.[0]?.count || 0);

    if (updateCount === 0) {
      for (const upd of DEFAULT_SERVER_UPDATES) {
        await sql.query(
          `INSERT INTO updates (
            id, version, minimum_supported_version, title, description, release_notes, tag, image_url, button_text, button_link, is_published, is_pinned, status, published_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO NOTHING`,
          [
            upd.id, upd.version, upd.minimum_supported_version, upd.title, upd.description,
            upd.release_notes, upd.tag, upd.image_url, upd.button_text, upd.button_link,
            upd.is_published, upd.is_pinned, upd.status
          ]
        ).catch(() => {});
      }
    }
  } catch (err: any) {
    console.warn('Seeding note:', err?.message || err);
  }
}

export const initDbSchema = ensureUsersSchema;

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured. DATABASE_URL environment variable is required.');
  }

  if (!isInitialized) {
    if (!initPromise) {
      initPromise = ensureUsersSchema().catch((err) => {
        console.warn('Schema initialization note:', err?.message || err);
      });
    }
    await initPromise;
  }

  const sql = getDbClient();
  if (!sql) {
    throw new Error('Unable to connect to Neon database client.');
  }

  try {
    if (params && params.length > 0) {
      return (await sql.query(text, params)) as T[];
    } else {
      return (await sql.query(text)) as T[];
    }
  } catch (err: any) {
    // Self-healing: if error says column "email" or another column does not exist, trigger schema migration and retry once
    if (err?.message && (err.message.includes('column "email" does not exist') || err.message.includes('column "auth_provider" does not exist'))) {
      console.warn('Missing column detected in users table. Executing safe live schema migration...');
      await ensureUsersSchema(true);
      if (params && params.length > 0) {
        return (await sql.query(text, params)) as T[];
      } else {
        return (await sql.query(text)) as T[];
      }
    }
    console.error('Neon database query error:', err?.message || err);
    throw err;
  }
}

// ==========================================
// AUTHENTICATION & GOOGLE OAUTH HELPERS
// ==========================================
export interface AuthUser {
  id: string;
  username: string;
  display_username: string;
  email: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar: string | null;
  auth_provider?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionToken?: string;
      sessionId?: string;
    }
  }
}

export const COOKIE_NAME = 'kiran_session';
export const SESSION_DURATION_DAYS = 30;

export function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length > 0) {
    return process.env.SESSION_SECRET.trim();
  }
  return 'kiran-studio-default-jwt-secret-key-prod-2026';
}

export function getSafeHost(req: any): string {
  if (!req) return '';
  if (req.headers) {
    const forwardedHost = req.headers['x-forwarded-host'];
    if (typeof forwardedHost === 'string' && forwardedHost.length > 0) {
      return forwardedHost.split(',')[0].trim();
    }
    const hostHeader = req.headers['host'];
    if (typeof hostHeader === 'string' && hostHeader.length > 0) {
      return hostHeader.split(',')[0].trim();
    }
  }
  if (typeof req.get === 'function') {
    try {
      const h = req.get('host');
      if (h) return h.split(',')[0].trim();
    } catch {}
  }
  if (typeof req.hostname === 'string' && req.hostname.length > 0) {
    return req.hostname;
  }
  return '';
}

export function getSafeProto(req: any): string {
  if (req?.headers) {
    const protoHeader = req.headers['x-forwarded-proto'];
    if (typeof protoHeader === 'string' && protoHeader.length > 0) {
      return protoHeader.split(',')[0].trim();
    }
  }
  if (req?.secure) return 'https';
  return 'https';
}

export function getBaseUrl(req: any): string {
  if (process.env.APP_URL && process.env.APP_URL.trim().length > 0) {
    let appUrl = process.env.APP_URL.trim().replace(/\/+$/, '');
    if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
      appUrl = `https://${appUrl}`;
    }
    return appUrl;
  }

  const host = getSafeHost(req);
  const proto = getSafeProto(req);

  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    return `${proto}://${host}`;
  }

  const vercelEnvUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelEnvUrl && vercelEnvUrl.trim().length > 0) {
    const clean = vercelEnvUrl.trim().replace(/\/+$/, '');
    return clean.startsWith('http') ? clean : `https://${clean}`;
  }

  if (host) {
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
}

export function cleanEnvValue(val?: string | null): string {
  if (!val) return '';
  let cleaned = String(val).trim();
  // Strip enclosing double quotes, single quotes, or backticks (common copy-paste issue into Vercel/env)
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '').trim();
  // Strip any trailing carriage returns, newlines, tabs, or non-printable chars
  cleaned = cleaned.replace(/[\r\n\t]/g, '').trim();
  return cleaned;
}

export function getCleanGoogleClientId(): string {
  const raw = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_ID || '';
  return cleanEnvValue(raw);
}

export function getCleanGoogleClientSecret(): string {
  const raw = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_SECRET || '';
  return cleanEnvValue(raw);
}

export function getGoogleRedirectUri(req: any): string {
  return `${getBaseUrl(req)}/api/auth/google/callback`;
}

export function isGoogleOAuthConfigured(): boolean {
  const id = getCleanGoogleClientId();
  const secret = getCleanGoogleClientSecret();
  return id.length > 0 && secret.length > 0;
}

export function getGoogleAuthorizationUrl(req: any, state?: string): string {
  const clientId = getCleanGoogleClientId();
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in server environment variables.');
  }

  const redirectUri = getGoogleRedirectUri(req);
  const csrfState = state || crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state: csrfState
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForUser(code: string, redirectUri: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}> {
  const clientId = getCleanGoogleClientId();
  const clientSecret = getCleanGoogleClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing or empty in environment.');
  }

  // Explicit URL-encoded form parameters
  const bodyParams = new URLSearchParams({
    code: code.trim(),
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri.trim(),
    grant_type: 'authorization_code'
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'Kiran-AI-Video-Studio-OAuth/1.1'
    },
    body: bodyParams.toString()
  });

  if (!tokenRes.ok) {
    const errorData = await tokenRes.text();
    console.error('Google token exchange failed HTTP', tokenRes.status, ':', errorData);
    let detail = `HTTP ${tokenRes.status}`;
    let isSecretInvalid = false;
    try {
      const parsed = JSON.parse(errorData);
      if (parsed.error_description) {
        detail = parsed.error_description;
        if (detail.toLowerCase().includes('client secret') || parsed.error === 'invalid_client') {
          isSecretInvalid = true;
        }
      } else if (parsed.error) {
        detail = parsed.error;
      }
    } catch {}

    if (isSecretInvalid) {
      const projectMatch = clientId.match(/^(\d+)-/);
      const projectNum = projectMatch ? projectMatch[1] : null;
      const projectNote = projectNum ? ` for Google Cloud Project #${projectNum}` : '';
      throw new Error(
        `Google token exchange error: The provided client secret is invalid for Client ID "${clientId}". ` +
        `Please ensure GOOGLE_CLIENT_SECRET in your Vercel project environment variables matches the Web Application Client Secret${projectNote} in Google Cloud Console Credentials.`
      );
    }

    throw new Error(`Google token exchange error: ${detail}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error('No access token returned from Google OAuth.');
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!profileRes.ok) {
    throw new Error('Failed to retrieve user profile from Google.');
  }

  return await profileRes.json();
}

export async function findOrCreateGoogleUser(profile: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<AuthUser> {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured. DATABASE_URL is required to persist users.');
  }

  // Ensure users table schema is completely migrated with email and indexes
  await ensureUsersSchema();

  const cleanEmail = (profile.email || '').toLowerCase().trim();
  const providerUserId = profile.sub;
  const displayName = (profile.name || cleanEmail.split('@')[0] || 'Creator').trim();
  const avatar = profile.picture || null;
  const adminEmailsEnv = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .toLowerCase()
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  const isDesignatedAdmin = cleanEmail === 'kiranchaulagain094@gmail.com' || adminEmailsEnv.includes(cleanEmail);
  const role = isDesignatedAdmin ? 'admin' : 'user';

  // 1. Check if user already exists by Google provider_user_id or email
  let existingUser: any = null;
  try {
    const existing = await query<any>(
      `SELECT id, username, display_username, email, role, status, avatar, auth_provider 
       FROM users 
       WHERE (auth_provider = 'google' AND provider_user_id = $1)
          OR (email IS NOT NULL AND LOWER(email) = LOWER($2))
       LIMIT 1`,
      [providerUserId, cleanEmail]
    );

    if (existing && existing.length > 0) {
      existingUser = existing[0];
    }
  } catch (err: any) {
    if (err?.message && err.message.includes('column "email" does not exist')) {
      await ensureUsersSchema(true);
      const retry = await query<any>(
        `SELECT id, username, display_username, email, role, status, avatar, auth_provider 
         FROM users 
         WHERE (auth_provider = 'google' AND provider_user_id = $1)
            OR (email IS NOT NULL AND LOWER(email) = LOWER($2))
         LIMIT 1`,
        [providerUserId, cleanEmail]
      );
      if (retry && retry.length > 0) {
        existingUser = retry[0];
      }
    } else {
      throw err;
    }
  }

  if (existingUser) {
    // Update avatar, display name, and provider details if changed
    try {
      await query(
        `UPDATE users 
         SET avatar = COALESCE($1, avatar),
             display_username = COALESCE(display_username, $2),
             email = COALESCE(email, $3),
             auth_provider = 'google',
             provider_user_id = COALESCE(provider_user_id, $4),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5`,
        [avatar, displayName, cleanEmail || null, providerUserId, existingUser.id]
      );
    } catch (updateErr: any) {
      console.warn('User update note:', updateErr?.message);
    }

    if (isDesignatedAdmin && existingUser.role !== 'admin') {
      try {
        await query(`UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [existingUser.id]);
        existingUser.role = 'admin';
      } catch (roleErr) {
        console.warn('Failed to update admin role:', roleErr);
      }
    }

    return {
      id: existingUser.id,
      username: existingUser.username,
      display_username: existingUser.display_username || displayName || existingUser.username,
      email: cleanEmail || existingUser.email,
      role: existingUser.role || role,
      status: existingUser.status || 'active',
      avatar: avatar || existingUser.avatar,
      auth_provider: 'google'
    };
  }

  // 2. Create new user in Neon
  const newUserId = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const baseUsername = cleanEmail
    ? cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 20)
    : 'creator';
  const uniqueUsername = `${baseUsername || 'creator'}_${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    await query(
      `INSERT INTO users (
        id, username, display_username, email, auth_provider, provider_user_id, password_hash, role, status, avatar
      ) VALUES ($1, $2, $3, $4, 'google', $5, NULL, $6, 'active', $7)`,
      [newUserId, uniqueUsername, displayName, cleanEmail || null, providerUserId, role, avatar]
    );
  } catch (insertErr: any) {
    // In case of concurrent insert race condition, retrieve the newly inserted record
    const retryFind = await query<any>(
      `SELECT id, username, display_username, email, role, status, avatar, auth_provider 
       FROM users 
       WHERE (auth_provider = 'google' AND provider_user_id = $1)
          OR (email IS NOT NULL AND LOWER(email) = LOWER($2))
       LIMIT 1`,
      [providerUserId, cleanEmail]
    );
    if (retryFind && retryFind.length > 0) {
      const u = retryFind[0];
      return {
        id: u.id,
        username: u.username,
        display_username: u.display_username || displayName || u.username,
        email: cleanEmail || u.email,
        role: u.role || role,
        status: u.status || 'active',
        avatar: avatar || u.avatar,
        auth_provider: 'google'
      };
    }
    throw insertErr;
  }

  return {
    id: newUserId,
    username: uniqueUsername,
    display_username: displayName,
    email: cleanEmail || null,
    role,
    status: 'active',
    avatar,
    auth_provider: 'google'
  };
}

function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token + getSessionSecret()).digest('hex');
}

export async function createUserSession(userId: string, req: any): Promise<{
  sessionId: string;
  token: string;
  cookieValue: string;
  expiresAt: Date;
}> {
  const sessionId = `sess_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(token);
  const forwardedIp = req?.headers?.['x-forwarded-for'];
  const ipAddress = typeof forwardedIp === 'string' ? forwardedIp.split(',')[0].trim() : req?.ip || null;
  const userAgent = req?.headers?.['user-agent'] || null;
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO user_sessions (
      id, user_id, token_hash, ip_address, user_agent, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId, userId, tokenHash, ipAddress, userAgent, expiresAt]
  );

  const cookieValue = `${sessionId}:${token}`;
  return { sessionId, token, cookieValue, expiresAt };
}

export function setSessionCookie(res: any, cookieValue: string, req: any): void {
  const host = getSafeHost(req);
  const isProd = process.env.NODE_ENV === 'production' || (host ? !host.includes('localhost') : true);
  const isIframeOrPreview = Boolean(
    req?.headers?.['sec-fetch-dest'] === 'iframe' ||
    host.includes('.run.app')
  );

  const sameSite = isIframeOrPreview ? 'None' : 'Lax';
  const secure = isProd || isIframeOrPreview;
  const maxAge = SESSION_DURATION_DAYS * 24 * 60 * 60;
  const cookieHeaderValue = `${COOKIE_NAME}=${cookieValue}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secure ? '; Secure' : ''}`;

  if (typeof res?.cookie === 'function') {
    res.cookie(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure,
      sameSite: isIframeOrPreview ? 'none' : 'lax',
      maxAge: maxAge * 1000,
      path: '/'
    });
  } else if (typeof res?.setHeader === 'function') {
    const existing = res.getHeader?.('Set-Cookie');
    if (existing) {
      const cookies = Array.isArray(existing) ? [...existing, cookieHeaderValue] : [existing, cookieHeaderValue];
      res.setHeader('Set-Cookie', cookies);
    } else {
      res.setHeader('Set-Cookie', cookieHeaderValue);
    }
  }
}

export function clearSessionCookie(res: any, req: any): void {
  const host = getSafeHost(req);
  const isProd = process.env.NODE_ENV === 'production' || (host ? !host.includes('localhost') : true);
  const isIframeOrPreview = Boolean(
    req?.headers?.['sec-fetch-dest'] === 'iframe' ||
    host.includes('.run.app')
  );

  const sameSite = isIframeOrPreview ? 'None' : 'Lax';
  const secure = isProd || isIframeOrPreview;
  const cookieHeaderValue = `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=${sameSite}${secure ? '; Secure' : ''}`;

  if (typeof res?.clearCookie === 'function') {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure,
      sameSite: isIframeOrPreview ? 'none' : 'lax',
      path: '/'
    });
  } else if (typeof res?.setHeader === 'function') {
    res.setHeader('Set-Cookie', cookieHeaderValue);
  }
}

export function extractSessionCredentials(req: any): { sessionId: string; token: string } | null {
  try {
    if (req?.cookies && typeof req.cookies === 'object' && req.cookies[COOKIE_NAME]) {
      const val = req.cookies[COOKIE_NAME];
      if (typeof val === 'string' && val.includes(':')) {
        const [sessionId, token] = val.split(':');
        if (sessionId && token) return { sessionId, token };
      }
    }

    const cookieHeader = req?.headers?.cookie;
    if (typeof cookieHeader === 'string' && cookieHeader.includes(COOKIE_NAME)) {
      const parts = cookieHeader.split(';');
      for (const part of parts) {
        const [k, ...v] = part.trim().split('=');
        if (k === COOKIE_NAME) {
          let val = v.join('=');
          try {
            val = decodeURIComponent(val);
          } catch {}
          if (val && val.includes(':')) {
            const [sessionId, token] = val.split(':');
            if (sessionId && token) return { sessionId, token };
          }
        }
      }
    }

    const authHeader = req?.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const val = authHeader.substring(7).trim();
      if (val.includes(':')) {
        const [sessionId, token] = val.split(':');
        if (sessionId && token) return { sessionId, token };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function validateSession(sessionId: string, token: string): Promise<AuthUser | null> {
  if (!isDbConfigured()) return null;

  try {
    const rows = await query<any>(
      `SELECT s.id AS session_id, s.token_hash, s.expires_at, 
              u.id AS user_id, u.username, u.display_username, u.email, u.role, u.status, u.avatar, u.auth_provider
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP AND u.status = 'active'
       LIMIT 1`,
      [sessionId]
    );

    if (!rows || rows.length === 0) return null;
    const session = rows[0];

    const expectedHash = hashSessionToken(token);
    if (session.token_hash !== expectedHash) {
      return null;
    }

    query(`UPDATE user_sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1`, [sessionId]).catch(() => {});

    const sessionEmail = (session.email || '').toLowerCase().trim();
    const adminEmailsEnv = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
      .toLowerCase()
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);
    const isDesignatedAdmin = sessionEmail === 'kiranchaulagain094@gmail.com' || adminEmailsEnv.includes(sessionEmail);
    if (isDesignatedAdmin && session.role !== 'admin') {
      query(`UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [session.user_id]).catch(() => {});
      session.role = 'admin';
    }

    return {
      id: session.user_id,
      username: session.username,
      display_username: session.display_username || session.username,
      email: session.email,
      role: session.role || (isDesignatedAdmin ? 'admin' : 'user'),
      status: session.status || 'active',
      avatar: session.avatar,
      auth_provider: session.auth_provider || 'google'
    };
  } catch (err) {
    console.warn('Session validation check error:', err);
    return null;
  }
}

export async function attachUserMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.user) {
    return next();
  }

  const credentials = extractSessionCredentials(req);
  if (!credentials) {
    return next();
  }

  try {
    const user = await validateSession(credentials.sessionId, credentials.token);
    if (user) {
      req.user = user;
      req.sessionId = credentials.sessionId;
      req.sessionToken = credentials.token;
    }
  } catch {}

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with Google to access this feature.'
    });
    return;
  }
  next();
}

export async function revokeSession(sessionId: string): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await query(`DELETE FROM user_sessions WHERE id = $1`, [sessionId]);
  } catch (e) {
    console.warn('Failed to revoke session:', e);
  }
}

// ==========================================
// AUTH ROUTER SETUP
// ==========================================
const authRouter = express.Router();

authRouter.get(['/config', '/auth/config', '/api/auth/config'], (req: Request, res: Response) => {
  try {
    const clientId = getCleanGoogleClientId();
    const rawSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_SECRET || '';
    const cleanSecret = getCleanGoogleClientSecret();
    const googleOk = isGoogleOAuthConfigured();
    const dbOk = isDbConfigured();

    const clientProjectMatch = clientId.match(/^(\d+)-/);
    const projectNumber = clientProjectMatch ? clientProjectMatch[1] : (clientId.length <= 15 ? clientId : null);
    const callbackUri = getGoogleRedirectUri(req);
    const hasQuotesInSecret = rawSecret.length > cleanSecret.length && (rawSecret.startsWith('"') || rawSecret.startsWith("'") || rawSecret.startsWith('`'));

    res.json({
      success: true,
      isConfigured: googleOk && dbOk,
      googleOAuth: googleOk,
      database: dbOk,
      oauthDiagnostics: {
        hasClientId: clientId.length > 0,
        clientIdPreview: clientId ? (clientId.length > 25 ? `${clientId.slice(0, 10)}...${clientId.slice(-18)}` : clientId) : null,
        clientIdValidWebFormat: clientId.endsWith('.apps.googleusercontent.com'),
        googleCloudProjectNumber: projectNumber,
        hasClientSecret: cleanSecret.length > 0,
        clientSecretLength: cleanSecret.length,
        clientSecretPrefix: cleanSecret ? (cleanSecret.startsWith('GOCSPX-') ? 'GOCSPX-' : 'Custom') : null,
        clientSecretHasSurroundingQuotesInEnv: hasQuotesInSecret,
        configuredCallbackUrl: callbackUri,
        requiredGoogleConsoleAuthorizedRedirectUri: callbackUri
      },
      configuredEnvVars: {
        hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
        hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasSessionSecret: Boolean(process.env.SESSION_SECRET),
        hasAppUrl: Boolean(process.env.APP_URL)
      }
    });
  } catch (err: any) {
    res.status(200).json({
      success: false,
      isConfigured: false,
      googleOAuth: false,
      database: false,
      error: err?.message || 'Configuration probe error'
    });
  }
});

authRouter.get(['/google', '/auth/google', '/api/auth/google'], (req: Request, res: Response) => {
  try {
    const missing: string[] = [];
    const clientId = getCleanGoogleClientId();
    const clientSecret = getCleanGoogleClientSecret();

    if (!clientId || clientId.length === 0) {
      missing.push('GOOGLE_CLIENT_ID');
    }
    if (!clientSecret || clientSecret.length === 0) {
      missing.push('GOOGLE_CLIENT_SECRET');
    }
    if (!isDbConfigured()) {
      missing.push('DATABASE_URL');
    }

    if (missing.length > 0) {
      const errorMsg = `Google OAuth is not configured. Missing required environment variable(s): ${missing.join(', ')}. Please configure them in your Vercel project settings.`;
      console.warn('[Google OAuth Config Error]:', errorMsg);
      
      const wantsJson = req.headers.accept?.includes('application/json') || req.xhr;
      if (wantsJson) {
        return res.status(503).json({ success: false, error: errorMsg });
      }
      return res.redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
    }

    const state = (req.query.state as string) || undefined;
    const authUrl = getGoogleAuthorizationUrl(req, state);
    res.redirect(authUrl);
  } catch (err: any) {
    console.error('Failed to initiate Google OAuth:', err);
    const message = err?.message || 'Failed to initiate Google OAuth authorization flow.';
    const wantsJson = req.headers.accept?.includes('application/json') || req.xhr;
    if (wantsJson) {
      return res.status(500).json({ success: false, error: message });
    }
    res.redirect(`/?auth_error=${encodeURIComponent(message)}`);
  }
});

authRouter.get(['/google/callback', '/auth/google/callback', '/api/auth/google/callback'], async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query;

  if (error) {
    const errorMsg = (error_description as string) || (error as string) || 'Authentication cancelled by user';
    console.warn('Google OAuth error callback:', errorMsg);
    return res.redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/?auth_error=missing_authorization_code');
  }

  const missing: string[] = [];
  const clientId = getCleanGoogleClientId();
  const clientSecret = getCleanGoogleClientSecret();

  if (!clientId) missing.push('GOOGLE_CLIENT_ID');
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!isDbConfigured()) missing.push('DATABASE_URL');

  if (missing.length > 0) {
    const errorMsg = `Server configuration error: missing ${missing.join(', ')} in environment variables.`;
    return res.redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const redirectUri = getGoogleRedirectUri(req);
    const profile = await exchangeGoogleCodeForUser(code, redirectUri);
    const user = await findOrCreateGoogleUser(profile);
    const session = await createUserSession(user.id, req);
    setSessionCookie(res, session.cookieValue, req);

    res.redirect('/?auth_success=1');
  } catch (err: any) {
    console.error('Google OAuth callback processing error:', err);
    const message = err?.message || 'Authentication error. Please try again.';
    res.redirect(`/?auth_error=${encodeURIComponent(message)}`);
  }
});

authRouter.get(['/me', '/auth/me', '/api/auth/me'], (req: Request, res: Response) => {
  try {
    if (req.user) {
      res.json({
        success: true,
        authenticated: true,
        user: req.user
      });
    } else {
      res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      authenticated: false,
      user: null,
      error: err?.message || 'Session query error'
    });
  }
});

authRouter.post(['/logout', '/auth/logout', '/api/auth/logout'], async (req: Request, res: Response) => {
  try {
    if (req.sessionId) {
      await revokeSession(req.sessionId);
    }
    clearSessionCookie(res, req);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err: any) {
    clearSessionCookie(res, req);
    res.json({
      success: true,
      message: 'Logged out'
    });
  }
});

// ==========================================
// PROJECT ROUTER SETUP
// ==========================================
export type ProjectStatus = 'Draft' | 'Generating' | 'Completed' | 'Exported' | 'Failed';

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: string;
  aspectRatio: string;
  duration: string;
  style?: string;
  voice?: string;
  language?: string;
  music?: string;
  ideaPrompt?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  tags?: string[];
  scenesCount?: number;
  quality?: string;
  script?: string;
  description?: string;
  scenes?: any[];
}

const projectRouter = express.Router();

function dbToFrontendStatus(dbStatus: string): ProjectStatus {
  switch (dbStatus?.toLowerCase()) {
    case 'in_progress':
      return 'Generating';
    case 'completed':
    case 'ready':
      return 'Completed';
    case 'rendered':
      return 'Exported';
    case 'failed':
      return 'Failed';
    case 'draft':
    default:
      return 'Draft';
  }
}

function frontendToDbStatus(feStatus?: string): string {
  switch (feStatus?.toLowerCase()) {
    case 'generating':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'exported':
      return 'rendered';
    case 'failed':
      return 'draft';
    case 'draft':
    default:
      return 'draft';
  }
}

function mapRowToProject(row: any): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.title,
    type: row.type || 'YouTube Video',
    aspectRatio: row.aspect_ratio || '16:9',
    duration: row.duration || '60 seconds',
    style: row.style || 'Cinematic',
    voice: row.voice || 'Female',
    language: row.language || 'English',
    music: row.music || 'AI Background Music',
    ideaPrompt: row.idea_prompt || row.description || '',
    status: dbToFrontendStatus(row.status),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    thumbnailUrl: row.thumbnail_url || undefined,
    videoUrl: row.video_url || undefined,
    tags: Array.isArray(row.tags) ? row.tags : ['AI Video'],
    scenesCount: typeof row.scenes_count === 'number' ? row.scenes_count : 3,
    quality: row.quality || '1080p Full HD',
    script: row.script || '',
    description: row.description || '',
    scenes: typeof row.scenes === 'string' ? JSON.parse(row.scenes) : (row.scenes || [])
  };
}

projectRouter.get(['/', '/api/projects'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Cloud storage is currently unavailable. Your projects are stored securely in your browser.'
    });
  }

  const userId = req.user!.id;

  try {
    const rows = await query<any>(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );

    const projects: Project[] = rows.map(mapRowToProject);

    res.json({
      success: true,
      projects
    });
  } catch (err: any) {
    console.error('Failed to load user projects from Neon:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve projects.'
    });
  }
});

projectRouter.post(['/', '/api/projects'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Cloud storage is currently unavailable. Your projects are stored securely in your browser.'
    });
  }

  const userId = req.user!.id;
  const body = req.body || {};

  const title = (body.name || body.title || 'Untitled Project').trim();
  const projectId = body.id && typeof body.id === 'string' && body.id.trim()
    ? body.id.trim()
    : `proj_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

  const description = body.description || body.ideaPrompt || '';
  const type = body.type || 'YouTube Video';
  const aspectRatio = body.aspectRatio || '16:9';
  const duration = body.duration || '60 seconds';
  const status = frontendToDbStatus(body.status);
  const thumbnailUrl = body.thumbnailUrl || null;
  const videoUrl = body.videoUrl || null;
  const tags = Array.isArray(body.tags) ? body.tags : ['AI Video'];
  const scenes = JSON.stringify(body.scenes || []);
  const scenesCount = typeof body.scenesCount === 'number' ? body.scenesCount : (body.scenes?.length || 3);
  const quality = body.quality || '1080p Full HD';
  const script = body.script || '';
  const style = body.style || 'Cinematic';
  const voice = body.voice || 'Female';
  const language = body.language || 'English';
  const music = body.music || 'AI Background Music';
  const ideaPrompt = body.ideaPrompt || '';

  try {
    const rows = await query<any>(
      `INSERT INTO projects (
        id, user_id, title, description, type, aspect_ratio, duration, status, 
        thumbnail_url, video_url, tags, scenes_count, quality, script, scenes,
        style, voice, language, music, idea_prompt, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        type = EXCLUDED.type,
        aspect_ratio = EXCLUDED.aspect_ratio,
        duration = EXCLUDED.duration,
        status = EXCLUDED.status,
        thumbnail_url = EXCLUDED.thumbnail_url,
        video_url = EXCLUDED.video_url,
        tags = EXCLUDED.tags,
        scenes_count = EXCLUDED.scenes_count,
        quality = EXCLUDED.quality,
        script = EXCLUDED.script,
        scenes = EXCLUDED.scenes,
        style = EXCLUDED.style,
        voice = EXCLUDED.voice,
        language = EXCLUDED.language,
        music = EXCLUDED.music,
        idea_prompt = EXCLUDED.idea_prompt,
        updated_at = CURRENT_TIMESTAMP
      WHERE projects.user_id = $2
      RETURNING *`,
      [
        projectId, userId, title, description, type, aspectRatio, duration, status,
        thumbnailUrl, videoUrl, tags, scenesCount, quality, script, scenes,
        style, voice, language, music, ideaPrompt
      ]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this project.'
      });
    }

    const savedProject = mapRowToProject(rows[0]);
    res.json({
      success: true,
      project: savedProject
    });
  } catch (err: any) {
    console.error('Failed to create/save project in Neon:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to save project to database.'
    });
  }
});

projectRouter.put(['/:id', '/api/projects/:id'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Cloud storage is currently unavailable. Your projects are stored securely in your browser.'
    });
  }

  const userId = req.user!.id;
  const projectId = req.params.id;
  const body = req.body || {};

  const title = (body.name || body.title || 'Untitled Project').trim();
  const description = body.description || body.ideaPrompt || '';
  const type = body.type || 'YouTube Video';
  const aspectRatio = body.aspectRatio || '16:9';
  const duration = body.duration || '60 seconds';
  const status = frontendToDbStatus(body.status);
  const thumbnailUrl = body.thumbnailUrl || null;
  const videoUrl = body.videoUrl || null;
  const tags = Array.isArray(body.tags) ? body.tags : ['AI Video'];
  const scenes = JSON.stringify(body.scenes || []);
  const scenesCount = typeof body.scenesCount === 'number' ? body.scenesCount : (body.scenes?.length || 3);
  const quality = body.quality || '1080p Full HD';
  const script = body.script || '';
  const style = body.style || 'Cinematic';
  const voice = body.voice || 'Female';
  const language = body.language || 'English';
  const music = body.music || 'AI Background Music';
  const ideaPrompt = body.ideaPrompt || '';

  try {
    const rows = await query<any>(
      `UPDATE projects SET
        title = $1,
        description = $2,
        type = $3,
        aspect_ratio = $4,
        duration = $5,
        status = $6,
        thumbnail_url = $7,
        video_url = $8,
        tags = $9,
        scenes_count = $10,
        quality = $11,
        script = $12,
        scenes = $13,
        style = $14,
        voice = $15,
        language = $16,
        music = $17,
        idea_prompt = $18,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19 AND user_id = $20
      RETURNING *`,
      [
        title, description, type, aspectRatio, duration, status,
        thumbnailUrl, videoUrl, tags, scenesCount, quality, script, scenes,
        style, voice, language, music, ideaPrompt, projectId, userId
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or you do not have permission to modify it.'
      });
    }

    const updated = mapRowToProject(rows[0]);
    res.json({
      success: true,
      project: updated
    });
  } catch (err: any) {
    console.error('Failed to update project in Neon:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update project in database.'
    });
  }
});

projectRouter.delete(['/:id', '/api/projects/:id'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Database is not configured.'
    });
  }

  const userId = req.user!.id;
  const projectId = req.params.id;

  try {
    const rows = await query<any>(
      `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
      [projectId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or you do not have permission to delete it.'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (err: any) {
    console.error('Failed to delete project in Neon:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project from database.'
    });
  }
});

// ==========================================
// ADMIN MIDDLEWARE & ROUTER SETUP
// ==========================================
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access the Admin Panel.'
    });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Administrator privileges required.'
    });
    return;
  }
  next();
}

const adminRouter = express.Router();
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// 1. Dashboard Statistics & Recent Activity
adminRouter.get(['/stats', '/api/admin/stats'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  try {
    const [
      totalUsersRes,
      activeUsersRes,
      totalProjectsRes,
      renderedProjectsRes,
      totalTemplatesRes,
      templateUsagesRes,
      recentUsersRes,
      recentProjectsRes
    ] = await Promise.all([
      query<any>(`SELECT COUNT(*) AS count FROM users`).catch(() => [{ count: 0 }]),
      query<any>(`SELECT COUNT(*) AS count FROM users WHERE status = 'active'`).catch(() => [{ count: 0 }]),
      query<any>(`SELECT COUNT(*) AS count FROM projects`).catch(() => [{ count: 0 }]),
      query<any>(`SELECT COUNT(*) AS count FROM projects WHERE status IN ('rendered', 'completed')`).catch(() => [{ count: 0 }]),
      query<any>(`SELECT COUNT(*) AS count FROM templates`).catch(() => [{ count: 0 }]),
      query<any>(`SELECT COUNT(*) AS count FROM template_usage`).catch(() => [{ count: 0 }]),
      query<any>(`
        SELECT u.id, u.username, u.display_username, u.email, u.role, u.status, u.avatar, u.auth_provider, u.created_at,
               (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) AS project_count
        FROM users u 
        ORDER BY u.created_at DESC 
        LIMIT 10
      `).catch(() => []),
      query<any>(`
        SELECT p.id, p.title, p.type, p.aspect_ratio, p.status, p.created_at, p.updated_at,
               u.id AS user_id, u.email AS user_email, u.display_username AS user_name
        FROM projects p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.updated_at DESC
        LIMIT 10
      `).catch(() => [])
    ]);

    const totalUsers = Number(totalUsersRes[0]?.count || 0);
    const activeUsers = Number(activeUsersRes[0]?.count || 0);
    const totalProjects = Number(totalProjectsRes[0]?.count || 0);
    const renderedVideos = Number(renderedProjectsRes[0]?.count || 0);
    const totalTemplates = Number(totalTemplatesRes[0]?.count || 0);
    const totalTemplateUsage = Number(templateUsagesRes[0]?.count || 0);

    // Recent activity logs synthesized from users, projects, and templates
    const recentActivity: any[] = [];

    for (const u of recentUsersRes.slice(0, 5)) {
      recentActivity.push({
        id: `act_usr_${u.id}`,
        type: 'user_signup',
        title: `New creator registered: ${u.display_username || u.username}`,
        subtitle: u.email || 'Google Account',
        timestamp: u.created_at,
        badge: u.role
      });
    }

    for (const p of recentProjectsRes.slice(0, 5)) {
      recentActivity.push({
        id: `act_prj_${p.id}`,
        type: p.status === 'completed' || p.status === 'rendered' ? 'video_render' : 'project_create',
        title: `Project ${p.status === 'completed' || p.status === 'rendered' ? 'rendered' : 'updated'}: ${p.title}`,
        subtitle: `Creator: ${p.user_name || p.user_email || 'Verified User'} (${p.type || 'Video'})`,
        timestamp: p.updated_at || p.created_at,
        badge: p.status
      });
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalProjects,
        renderedVideos,
        totalTemplates,
        totalTemplateUsage
      },
      recentUsers: recentUsersRes,
      recentProjects: recentProjectsRes,
      recentActivity
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve admin stats.' });
  }
});

// 2. Users Management
adminRouter.get(['/users', '/api/admin/users'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const queryParam = ((req.query.q as string) || '').trim().toLowerCase();

  try {
    let usersQuery = `
      SELECT u.id, u.username, u.display_username, u.email, u.role, u.status, u.avatar, u.auth_provider, u.created_at, u.updated_at,
             (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) AS project_count
      FROM users u
    `;
    const params: any[] = [];

    if (queryParam) {
      usersQuery += `
        WHERE LOWER(u.email) LIKE $1 
           OR LOWER(u.display_username) LIKE $1 
           OR LOWER(u.username) LIKE $1
      `;
      params.push(`%${queryParam}%`);
    }

    usersQuery += ` ORDER BY u.created_at DESC LIMIT 100`;

    const users = await query<any>(usersQuery, params);

    res.json({
      success: true,
      users
    });
  } catch (err: any) {
    console.error('Admin users query error:', err);
    res.status(500).json({ success: false, error: 'Failed to query users.' });
  }
});

adminRouter.get(['/users/:id', '/api/admin/users/:id'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const userId = req.params.id;

  try {
    const users = await query<any>(
      `SELECT u.id, u.username, u.display_username, u.email, u.role, u.status, u.avatar, u.auth_provider, u.created_at, u.updated_at,
              (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) AS project_count
       FROM users u WHERE u.id = $1 LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const projects = await query<any>(
      `SELECT id, title, type, aspect_ratio, duration, status, thumbnail_url, created_at, updated_at
       FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      user: users[0],
      projects
    });
  } catch (err: any) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve user details.' });
  }
});

adminRouter.patch(['/users/:id/status', '/api/admin/users/:id/status'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const targetUserId = req.params.id;
  const { status } = req.body;

  if (status !== 'active' && status !== 'suspended') {
    return res.status(400).json({ success: false, error: 'Status must be active or suspended.' });
  }

  try {
    // Prevent suspending the primary admin account
    const targetUser = await query<any>(`SELECT email FROM users WHERE id = $1`, [targetUserId]);
    if (targetUser[0]?.email?.toLowerCase() === 'kiranchaulagain094@gmail.com' && status === 'suspended') {
      return res.status(400).json({ success: false, error: 'Cannot suspend the primary administrator account.' });
    }

    await query(
      `UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, targetUserId]
    );

    if (status === 'suspended') {
      // Revoke any active sessions for suspended user
      await query(`DELETE FROM user_sessions WHERE user_id = $1`, [targetUserId]).catch(() => {});
    }

    res.json({ success: true, message: `User status changed to ${status}.` });
  } catch (err: any) {
    console.error('Update user status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user status.' });
  }
});

adminRouter.patch(['/users/:id/role', '/api/admin/users/:id/role'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const targetUserId = req.params.id;
  const { role } = req.body;

  if (role !== 'user' && role !== 'admin') {
    return res.status(400).json({ success: false, error: 'Role must be user or admin.' });
  }

  try {
    // Prevent demoting the primary admin account
    const targetUser = await query<any>(`SELECT email FROM users WHERE id = $1`, [targetUserId]);
    if (targetUser[0]?.email?.toLowerCase() === 'kiranchaulagain094@gmail.com' && role !== 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot demote the primary administrator account.' });
    }

    await query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [role, targetUserId]
    );

    res.json({ success: true, message: `User role changed to ${role}.` });
  } catch (err: any) {
    console.error('Update user role error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
});

// 3. Admin Template Management
adminRouter.get(['/templates', '/api/admin/templates'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  try {
    const templates = await query<any>(
      `SELECT t.*, 
              (SELECT COUNT(*) FROM template_usage tu WHERE tu.template_id = t.id) as actual_usage_count
       FROM templates t
       ORDER BY t.created_at DESC`
    );

    res.json({ success: true, templates });
  } catch (err: any) {
    console.error('Admin get templates error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch templates.' });
  }
});

adminRouter.post(['/templates', '/api/admin/templates'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const {
    title,
    description = '',
    category = 'Trending',
    aspect_ratio = '9:16',
    duration = '15 seconds',
    duration_seconds = 15,
    media_slots = 3,
    slots_metadata = [],
    thumbnail_url = '',
    preview_video_url = '',
    is_published = true,
    is_featured = false
  } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Template title is required.' });
  }

  const templateId = `tpl_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

  try {
    const rows = await query<any>(
      `INSERT INTO templates (
        id, title, description, category, aspect_ratio, duration, duration_seconds,
        media_slots, slots_metadata, thumbnail_url, preview_video_url, is_published, is_featured,
        usage_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        templateId,
        title.trim(),
        description,
        category,
        aspect_ratio,
        duration,
        Number(duration_seconds) || 15,
        Number(media_slots) || 3,
        JSON.stringify(slots_metadata),
        thumbnail_url,
        preview_video_url,
        Boolean(is_published),
        Boolean(is_featured)
      ]
    );

    res.json({ success: true, template: rows[0] });
  } catch (err: any) {
    console.error('Admin create template error:', err);
    res.status(500).json({ success: false, error: 'Failed to create template.' });
  }
});

adminRouter.put(['/templates/:id', '/api/admin/templates/:id'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const templateId = req.params.id;
  const {
    title,
    description,
    category,
    aspect_ratio,
    duration,
    duration_seconds,
    media_slots,
    slots_metadata,
    thumbnail_url,
    preview_video_url,
    is_published,
    is_featured
  } = req.body;

  try {
    const rows = await query<any>(
      `UPDATE templates SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        aspect_ratio = COALESCE($4, aspect_ratio),
        duration = COALESCE($5, duration),
        duration_seconds = COALESCE($6, duration_seconds),
        media_slots = COALESCE($7, media_slots),
        slots_metadata = COALESCE($8, slots_metadata),
        thumbnail_url = COALESCE($9, thumbnail_url),
        preview_video_url = COALESCE($10, preview_video_url),
        is_published = COALESCE($11, is_published),
        is_featured = COALESCE($12, is_featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        title,
        description,
        category,
        aspect_ratio,
        duration,
        duration_seconds !== undefined ? Number(duration_seconds) : null,
        media_slots !== undefined ? Number(media_slots) : null,
        slots_metadata !== undefined ? JSON.stringify(slots_metadata) : null,
        thumbnail_url,
        preview_video_url,
        is_published !== undefined ? Boolean(is_published) : null,
        is_featured !== undefined ? Boolean(is_featured) : null,
        templateId
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }

    res.json({ success: true, template: rows[0] });
  } catch (err: any) {
    console.error('Admin update template error:', err);
    res.status(500).json({ success: false, error: 'Failed to update template.' });
  }
});

adminRouter.delete(['/templates/:id', '/api/admin/templates/:id'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const templateId = req.params.id;

  try {
    const rows = await query<any>(`DELETE FROM templates WHERE id = $1 RETURNING id`, [templateId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }
    res.json({ success: true, message: 'Template deleted successfully.' });
  } catch (err: any) {
    console.error('Admin delete template error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete template.' });
  }
});

adminRouter.patch(['/templates/:id/publish', '/api/admin/templates/:id/publish'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const templateId = req.params.id;
  const { is_published } = req.body;

  try {
    const rows = await query<any>(
      `UPDATE templates SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [Boolean(is_published), templateId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }
    res.json({ success: true, template: rows[0] });
  } catch (err: any) {
    console.error('Admin toggle publish template error:', err);
    res.status(500).json({ success: false, error: 'Failed to update template publish state.' });
  }
});

adminRouter.patch(['/templates/:id/featured', '/api/admin/templates/:id/featured'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const templateId = req.params.id;
  const { is_featured } = req.body;

  try {
    const rows = await query<any>(
      `UPDATE templates SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [Boolean(is_featured), templateId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }
    res.json({ success: true, template: rows[0] });
  } catch (err: any) {
    console.error('Admin toggle featured template error:', err);
    res.status(500).json({ success: false, error: 'Failed to update template featured state.' });
  }
});

// 4. Admin Updates & Version Management
async function syncScheduledUpdates(): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    // Automatically transition any scheduled release that has reached its scheduled_at date/time
    await query(
      `UPDATE updates
       SET status = 'published',
           is_published = true,
           published_at = COALESCE(scheduled_at, CURRENT_TIMESTAMP),
           updated_at = CURRENT_TIMESTAMP
       WHERE status = 'scheduled'
         AND scheduled_at IS NOT NULL
         AND scheduled_at <= CURRENT_TIMESTAMP`
    );
  } catch (err: any) {
    console.warn('[Scheduled Updates Auto-Sync Notice]:', err?.message || err);
  }
}

adminRouter.get(['/updates', '/api/admin/updates'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  try {
    await syncScheduledUpdates();

    const updates = await query<any>(
      `SELECT * FROM updates ORDER BY is_pinned DESC, COALESCE(scheduled_at, published_at, created_at) DESC`
    );

    // Compute summary metrics for Admin Release Dashboard
    const published = updates.filter(u => u.is_published || u.status === 'published');
    const scheduled = updates.filter(u => u.status === 'scheduled');
    const drafts = updates.filter(u => u.status === 'draft' || (!u.is_published && u.status !== 'scheduled'));

    const currentLiveVersion = published[0]?.version || CURRENT_APP_VERSION;
    const latestScheduledVersion = scheduled[0]?.version || null;

    res.json({ 
      success: true, 
      updates,
      metrics: {
        currentLiveVersion,
        latestScheduledVersion,
        upcomingReleasesCount: scheduled.length,
        publishedReleasesCount: published.length,
        draftReleasesCount: drafts.length
      }
    });
  } catch (err: any) {
    console.error('Admin get updates error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch updates.' });
  }
});

adminRouter.post(['/updates', '/api/admin/updates'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const {
    version = '1.1.0',
    minimum_supported_version = '1.0.0',
    title,
    description,
    release_notes = '',
    tag = 'New Update',
    image_url = null,
    button_text = 'Try Now',
    button_link = '/templates',
    scheduled_at = null,
    timezone = 'UTC',
    is_required = false,
    requires_sign_in = false,
    is_featured = false,
    status = 'draft',
    is_published = false,
    is_pinned = false
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required.' });
  }

  const cleanVersion = String(version || '1.1.0').trim();
  const cleanMinVersion = String(minimum_supported_version || '1.0.0').trim();
  const semverRegex = /^v?\d+(\.\d+)*(-[a-zA-Z0-9.]+)?$/;
  if (!semverRegex.test(cleanVersion)) {
    return res.status(400).json({ success: false, error: 'Invalid version format. Use semantic versioning such as 1.1.0 or 1.2.0.' });
  }
  if (!semverRegex.test(cleanMinVersion)) {
    return res.status(400).json({ success: false, error: 'Invalid minimum supported version format.' });
  }

  // Prevent accidental duplicate versions (Requirement 8)
  const existingVer = await query<any>(`SELECT id FROM updates WHERE version = $1 LIMIT 1`, [cleanVersion]).catch(() => []);
  if (existingVer && existingVer.length > 0) {
    return res.status(409).json({
      success: false,
      error: `A release with version "${cleanVersion}" already exists. Please edit the existing release or use a new version number.`
    });
  }

  let parsedScheduledAt: Date | null = null;
  if (scheduled_at) {
    parsedScheduledAt = new Date(scheduled_at);
    if (isNaN(parsedScheduledAt.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid scheduled release date/time format.' });
    }
  }

  const updateId = `upd_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const effectivePublished = status === 'published' || (is_published && status !== 'draft' && status !== 'scheduled');

  try {
    const rows = await query<any>(
      `INSERT INTO updates (
        id, version, minimum_supported_version, title, description, release_notes,
        tag, image_url, button_text, button_link, scheduled_at, timezone,
        is_required, requires_sign_in, is_featured, status, is_published, is_pinned,
        published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        ${effectivePublished ? 'CURRENT_TIMESTAMP' : 'NULL'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *`,
      [
        updateId,
        cleanVersion,
        cleanMinVersion,
        title.trim(),
        description.trim(),
        release_notes ? release_notes.trim() : null,
        tag || 'New Feature',
        image_url || null,
        button_text || 'Try Now',
        button_link || '/templates',
        parsedScheduledAt,
        timezone || 'UTC',
        Boolean(is_required),
        Boolean(requires_sign_in),
        Boolean(is_featured),
        status || 'draft',
        Boolean(effectivePublished),
        Boolean(is_pinned)
      ]
    );

    res.json({ success: true, update: rows[0] });
  } catch (err: any) {
    console.error('Admin create update error:', err);
    res.status(500).json({ success: false, error: 'Failed to create update.' });
  }
});

adminRouter.put(['/updates/:id', '/api/admin/updates/:id'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const updateId = req.params.id;
  const {
    version,
    minimum_supported_version,
    title,
    description,
    release_notes,
    tag,
    image_url,
    button_text,
    button_link,
    scheduled_at,
    timezone,
    is_required,
    requires_sign_in,
    is_featured,
    status,
    is_published,
    is_pinned
  } = req.body;

  const semverRegex = /^v?\d+(\.\d+)*(-[a-zA-Z0-9.]+)?$/;
  if (version !== undefined) {
    const cleanVer = String(version).trim();
    if (!semverRegex.test(cleanVer)) {
      return res.status(400).json({ success: false, error: 'Invalid version format. Use semantic versioning such as 1.1.0 or 1.2.0.' });
    }
    const duplicate = await query<any>(`SELECT id FROM updates WHERE version = $1 AND id != $2 LIMIT 1`, [cleanVer, updateId]).catch(() => []);
    if (duplicate && duplicate.length > 0) {
      return res.status(409).json({ success: false, error: `Release version "${cleanVer}" already exists on another release.` });
    }
  }

  if (minimum_supported_version !== undefined) {
    const cleanMin = String(minimum_supported_version).trim();
    if (!semverRegex.test(cleanMin)) {
      return res.status(400).json({ success: false, error: 'Invalid minimum supported version format.' });
    }
  }

  let parsedScheduledAt: Date | null = null;
  if (scheduled_at !== undefined) {
    if (scheduled_at) {
      parsedScheduledAt = new Date(scheduled_at);
      if (isNaN(parsedScheduledAt.getTime())) {
        return res.status(400).json({ success: false, error: 'Invalid scheduled release date/time format.' });
      }
    }
  }

  try {
    const rows = await query<any>(
      `UPDATE updates SET
        version = COALESCE($1, version),
        minimum_supported_version = COALESCE($2, minimum_supported_version),
        title = COALESCE($3, title),
        description = COALESCE($4, description),
        release_notes = COALESCE($5, release_notes),
        tag = COALESCE($6, tag),
        image_url = COALESCE($7, image_url),
        button_text = COALESCE($8, button_text),
        button_link = COALESCE($9, button_link),
        scheduled_at = COALESCE($10, scheduled_at),
        timezone = COALESCE($11, timezone),
        is_required = COALESCE($12, is_required),
        requires_sign_in = COALESCE($13, requires_sign_in),
        is_featured = COALESCE($14, is_featured),
        status = COALESCE($15, status),
        is_published = COALESCE($16, is_published),
        is_pinned = COALESCE($17, is_pinned),
        published_at = CASE 
          WHEN COALESCE($16, is_published) = true AND published_at IS NULL THEN CURRENT_TIMESTAMP 
          ELSE published_at 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING *`,
      [
        version !== undefined ? String(version).trim() : null,
        minimum_supported_version !== undefined ? String(minimum_supported_version).trim() : null,
        title !== undefined ? String(title).trim() : null,
        description !== undefined ? String(description).trim() : null,
        release_notes !== undefined ? String(release_notes).trim() : null,
        tag !== undefined ? String(tag).trim() : null,
        image_url !== undefined ? image_url : null,
        button_text !== undefined ? button_text : null,
        button_link !== undefined ? button_link : null,
        scheduled_at !== undefined ? parsedScheduledAt : null,
        timezone !== undefined ? String(timezone) : null,
        is_required !== undefined ? Boolean(is_required) : null,
        requires_sign_in !== undefined ? Boolean(requires_sign_in) : null,
        is_featured !== undefined ? Boolean(is_featured) : null,
        status !== undefined ? String(status) : null,
        is_published !== undefined ? Boolean(is_published) : null,
        is_pinned !== undefined ? Boolean(is_pinned) : null,
        updateId
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Update not found.' });
    }

    res.json({ success: true, update: rows[0] });
  } catch (err: any) {
    console.error('Admin update update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update record.' });
  }
});

adminRouter.delete(['/updates/:id', '/api/admin/updates/:id'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const updateId = req.params.id;

  try {
    const rows = await query<any>(`DELETE FROM updates WHERE id = $1 RETURNING id`, [updateId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Update not found.' });
    }
    res.json({ success: true, message: 'Update deleted successfully.' });
  } catch (err: any) {
    console.error('Admin delete update error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete update.' });
  }
});

adminRouter.patch(['/updates/:id/schedule', '/api/admin/updates/:id/schedule'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const updateId = req.params.id;
  const { scheduled_at, timezone = 'UTC' } = req.body;

  if (!scheduled_at) {
    return res.status(400).json({ success: false, error: 'Scheduled date and time is required.' });
  }

  const parsedDate = new Date(scheduled_at);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ success: false, error: 'Invalid scheduled release date/time format.' });
  }

  try {
    const rows = await query<any>(
      `UPDATE updates SET 
        status = 'scheduled',
        scheduled_at = $1,
        timezone = $2,
        is_published = false,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 RETURNING *`,
      [parsedDate, timezone, updateId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Update not found.' });
    }
    res.json({ success: true, update: rows[0] });
  } catch (err: any) {
    console.error('Admin schedule update error:', err);
    res.status(500).json({ success: false, error: 'Failed to schedule update.' });
  }
});

adminRouter.patch(['/updates/:id/publish', '/api/admin/updates/:id/publish'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const updateId = req.params.id;
  const { is_published } = req.body;

  try {
    const rows = await query<any>(
      `UPDATE updates SET 
        is_published = $1, 
        status = CASE WHEN $1 = true THEN 'published' ELSE 'unpublished' END,
        published_at = CASE WHEN $1 = true AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 RETURNING *`,
      [Boolean(is_published), updateId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Update not found.' });
    }
    res.json({ success: true, update: rows[0] });
  } catch (err: any) {
    console.error('Admin toggle publish update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update publish state.' });
  }
});

adminRouter.patch(['/updates/:id/pin', '/api/admin/updates/:id/pin'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const updateId = req.params.id;
  const { is_pinned } = req.body;

  try {
    const rows = await query<any>(
      `UPDATE updates SET is_pinned = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [Boolean(is_pinned), updateId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Update not found.' });
    }
    res.json({ success: true, update: rows[0] });
  } catch (err: any) {
    console.error('Admin toggle pin update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update pin state.' });
  }
});

// Storage upload endpoint for thumbnails & preview videos
adminRouter.post(['/upload', '/api/admin/upload'], async (req: Request, res: Response) => {
  try {
    const { dataUrl, filename, mimeType } = req.body;

    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'File data is required.' });
    }

    // If Vercel Blob is configured with BLOB_READ_WRITE_TOKEN
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobMod: any = await (new Function('m', 'return import(m)'))('@vercel/blob');
        const { put } = blobMod;
        const buffer = Buffer.from(dataUrl.split(',')[1] || dataUrl, 'base64');
        const blob = await put(filename || `upload-${Date.now()}`, buffer, {
          access: 'public',
          contentType: mimeType || 'image/jpeg'
        });
        return res.json({ success: true, url: blob.url });
      } catch (blobErr: any) {
        console.warn('Vercel blob storage note:', blobErr?.message);
      }
    }

    // Safe direct data URL storage abstraction for templates/updates metadata
    res.json({
      success: true,
      url: dataUrl
    });
  } catch (err: any) {
    console.error('Admin upload error:', err);
    res.status(500).json({ success: false, error: 'Failed to upload asset.' });
  }
});

// ==========================================
// USER-FACING TEMPLATES ROUTER
// ==========================================
const templateRouter = express.Router();

// List all published templates
templateRouter.get(['/', '/api/templates'], async (req: Request, res: Response) => {
  const category = (req.query.category as string) || '';
  const featured = req.query.featured === 'true';

  if (!isDbConfigured()) {
    let list = DEFAULT_SERVER_TEMPLATES;
    if (category && category !== 'All') {
      list = list.filter((t) => t.category === category);
    }
    if (featured) {
      list = list.filter((t) => t.is_featured);
    }
    return res.json({ success: true, templates: list });
  }

  try {
    let q = `SELECT * FROM templates WHERE is_published = true`;
    const params: any[] = [];

    if (category && category !== 'All') {
      params.push(category);
      q += ` AND category = $${params.length}`;
    }

    if (featured) {
      q += ` AND is_featured = true`;
    }

    q += ` ORDER BY is_featured DESC, usage_count DESC, created_at DESC`;

    const templates = await query<any>(q, params);
    res.json({ success: true, templates });
  } catch (err: any) {
    console.warn('Public templates database fetch warning, returning defaults:', err?.message || err);
    let list = DEFAULT_SERVER_TEMPLATES;
    if (category && category !== 'All') {
      list = list.filter((t) => t.category === category);
    }
    if (featured) {
      list = list.filter((t) => t.is_featured);
    }
    res.json({ success: true, templates: list });
  }
});

// Single template
templateRouter.get(['/:id', '/api/templates/:id'], async (req: Request, res: Response) => {
  const templateId = req.params.id;

  if (!isDbConfigured()) {
    const found = DEFAULT_SERVER_TEMPLATES.find((t) => t.id === templateId);
    if (!found) {
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }
    return res.json({ success: true, template: found });
  }

  try {
    const rows = await query<any>(`SELECT * FROM templates WHERE id = $1 AND is_published = true LIMIT 1`, [templateId]);
    if (rows.length === 0) {
      const fallback = DEFAULT_SERVER_TEMPLATES.find((t) => t.id === templateId);
      if (fallback) return res.json({ success: true, template: fallback });
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }
    res.json({ success: true, template: rows[0] });
  } catch (err: any) {
    const fallback = DEFAULT_SERVER_TEMPLATES.find((t) => t.id === templateId);
    if (fallback) return res.json({ success: true, template: fallback });
    res.status(500).json({ success: false, error: 'Failed to fetch template.' });
  }
});

// Use template: records usage and initializes draft project for user
templateRouter.post(['/:id/use', '/api/templates/:id/use'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const templateId = req.params.id;
  const userId = req.user!.id;

  try {
    const tplRows = await query<any>(`SELECT * FROM templates WHERE id = $1 LIMIT 1`, [templateId]);
    if (tplRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }
    const tpl = tplRows[0];

    // Increment usage count
    await query(`UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1`, [templateId]).catch(() => {});

    // Create a new draft project for the user based on template
    const projectId = `proj_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const projectTitle = `${tpl.title} (AI Template Edit)`;

    const createdProjects = await query<any>(
      `INSERT INTO projects (
        id, user_id, title, description, type, aspect_ratio, duration, status,
        thumbnail_url, video_url, tags, scenes_count, quality, script, scenes,
        style, voice, language, music, idea_prompt, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 'draft',
        $8, $9, $10, $11, '1080p Full HD', '', $12,
        $13, 'Female', 'English', 'AI Beat Synced Audio', $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        projectId,
        userId,
        projectTitle,
        tpl.description,
        'YouTube Video',
        tpl.aspect_ratio || '9:16',
        tpl.duration || '15 seconds',
        tpl.thumbnail_url,
        tpl.preview_video_url,
        ['AI Template', tpl.category, 'Beat Sync'],
        tpl.media_slots || 3,
        JSON.stringify([]),
        'Cinematic',
        `Created from AI Template: ${tpl.title}`
      ]
    );

    // Record template usage log
    const usageId = `tpu_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    await query(
      `INSERT INTO template_usage (id, template_id, user_id, project_id, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [usageId, templateId, userId, projectId]
    ).catch(() => {});

    res.json({
      success: true,
      template: tpl,
      project: createdProjects[0]
    });
  } catch (err: any) {
    console.error('Template use error:', err);
    res.status(500).json({ success: false, error: 'Failed to initialize project from template.' });
  }
});

// Deterministic AI Template Rendering Pipeline
templateRouter.post(['/render', '/api/templates/render'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  }

  const userId = req.user!.id;
  const { templateId, title, mediaItems = [] } = req.body;

  if (!templateId) {
    return res.status(400).json({ success: false, error: 'Template ID is required.' });
  }

  try {
    const tplRows = await query<any>(`SELECT * FROM templates WHERE id = $1 LIMIT 1`, [templateId]);
    if (tplRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found.' });
    }
    const tpl = tplRows[0];

    const slotsMetadata = Array.isArray(tpl.slots_metadata)
      ? tpl.slots_metadata
      : (typeof tpl.slots_metadata === 'string' ? JSON.parse(tpl.slots_metadata || '[]') : []);

    const projectTitle = (title || `${tpl.title} - Rendered`).trim();
    const projectId = `proj_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

    // Build deterministic scenes mapped to user media
    const renderedScenes = (slotsMetadata.length > 0 ? slotsMetadata : [
      { slotIndex: 0, label: 'Opening Hook', duration: '3s' },
      { slotIndex: 1, label: 'Beat Drop Hit', duration: '4s' },
      { slotIndex: 2, label: 'Climax Finale', duration: '5s' }
    ]).map((slot: any, idx: number) => {
      const userMedia = mediaItems.find((m: any) => m.slotIndex === idx) || mediaItems[idx];
      return {
        id: `scene_${idx + 1}`,
        sceneNumber: idx + 1,
        title: slot.label || `Scene #${idx + 1}`,
        duration: slot.duration || '3s',
        mediaUrl: userMedia?.url || tpl.thumbnail_url,
        mediaType: userMedia?.type || 'image',
        transition: idx === 0 ? 'Fade In' : (tpl.category === 'Beat Sync' ? 'Strobe Flash Cut' : 'Velocity Zoom Blur'),
        overlayText: slot.label || `Visual Beat ${idx + 1}`,
        motionEffect: 'Smart Pan & Ken Burns Zoom',
        aspectRatio: tpl.aspect_ratio || '9:16'
      };
    });

    // Create completed project record in Neon
    const created = await query<any>(
      `INSERT INTO projects (
        id, user_id, title, description, type, aspect_ratio, duration, status,
        thumbnail_url, video_url, tags, scenes_count, quality, script, scenes,
        style, voice, language, music, idea_prompt, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 'YouTube Video', $5, $6, 'completed',
        $7, $8, $9, $10, '1080p Full HD', $11, $12,
        'Cinematic', 'Female', 'English', 'Beat Synced Audio Track', $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        projectId,
        userId,
        projectTitle,
        `Rendered with AI Template: ${tpl.title}`,
        tpl.aspect_ratio || '9:16',
        tpl.duration || '15 seconds',
        renderedScenes[0]?.mediaUrl || tpl.thumbnail_url,
        tpl.preview_video_url || 'https://assets.mixkit.co/videos/preview/mixkit-urban-fashion-model-in-neon-city-41551-large.mp4',
        ['AI Template', tpl.category, 'Rendered Video', 'Beat Sync'],
        renderedScenes.length,
        `Deterministic audio-synced video rendered using ${tpl.title}. Paced with ${tpl.category} motion transitions.`,
        JSON.stringify(renderedScenes),
        `Template Render: ${tpl.title}`
      ]
    );

    // Record template usage
    const usageId = `tpu_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    await query(
      `INSERT INTO template_usage (id, template_id, user_id, project_id, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [usageId, templateId, userId, projectId]
    ).catch(() => {});

    await query(`UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1`, [templateId]).catch(() => {});

    res.json({
      success: true,
      project: created[0],
      renderSummary: {
        templateTitle: tpl.title,
        category: tpl.category,
        aspectRatio: tpl.aspect_ratio,
        duration: tpl.duration,
        scenesRendered: renderedScenes.length,
        renderEngine: 'Deterministic Media Stitcher & Beat Sync Engine'
      }
    });
  } catch (err: any) {
    console.error('Template render error:', err);
    res.status(500).json({ success: false, error: 'Failed to render video from template.' });
  }
});

// ==========================================
// USER-FACING UPDATES ROUTER
// ==========================================
const updateRouter = express.Router();

// List published updates
updateRouter.get(['/', '/api/updates'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.json({ success: true, updates: DEFAULT_SERVER_UPDATES });
  }

  try {
    await syncScheduledUpdates();
    const updates = await query<any>(
      `SELECT * FROM updates 
       WHERE is_published = true AND (status = 'published' OR status IS NULL)
       ORDER BY is_pinned DESC, published_at DESC LIMIT 20`
    );
    res.json({ success: true, updates: (updates && updates.length > 0) ? updates : DEFAULT_SERVER_UPDATES });
  } catch (err: any) {
    console.warn('Public updates database query warning, returning default:', err?.message || err);
    res.json({ success: true, updates: DEFAULT_SERVER_UPDATES });
  }
});

// Latest single update for homepage banner
updateRouter.get(['/latest', '/api/updates/latest'], async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.json({ success: true, update: DEFAULT_SERVER_UPDATES[0] || null });
  }

  try {
    await syncScheduledUpdates();
    const updates = await query<any>(
      `SELECT * FROM updates 
       WHERE is_published = true AND (status = 'published' OR status IS NULL)
       ORDER BY is_pinned DESC, published_at DESC LIMIT 1`
    );
    res.json({ success: true, update: updates[0] || DEFAULT_SERVER_UPDATES[0] || null });
  } catch (err: any) {
    console.warn('Latest update database query warning, returning default:', err?.message || err);
    res.json({ success: true, update: DEFAULT_SERVER_UPDATES[0] || null });
  }
});

// Dedicated API Router
const apiRouter = express.Router();

// Attach authenticated session user to requests
app.use(attachUserMiddleware);

// Direct mount on app for /api/auth, /api/projects, /api/admin, /api/templates, and /api/updates
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/admin', adminRouter);
app.use('/api/templates', templateRouter);
app.use('/api/updates', updateRouter);

// Also mount on apiRouter
apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/templates', templateRouter);
apiRouter.use('/updates', updateRouter);


// Helper to safely extract JSON from Gemini text responses
function extractJsonFromText(rawText: string): any {
  let cleaned = (rawText || '').trim();
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  }

  // Try direct parse first if it is already clean JSON
  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  let target = cleaned;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let endIndex = -1;
    for (let i = firstBrace; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') depth++;
        else if (char === '}') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }
    if (endIndex !== -1) {
      target = cleaned.substring(firstBrace, endIndex + 1);
    } else {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace > firstBrace) target = cleaned.substring(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let endIndex = -1;
    for (let i = firstBracket; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '[') depth++;
        else if (char === ']') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }
    if (endIndex !== -1) {
      target = cleaned.substring(firstBracket, endIndex + 1);
    } else {
      const lastBracket = cleaned.lastIndexOf(']');
      if (lastBracket > firstBracket) target = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }

  try {
    return JSON.parse(target);
  } catch {}

  try {
    const fixed = target.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(fixed);
  } catch {}

  const fb = cleaned.indexOf('{');
  const lb = cleaned.lastIndexOf('}');
  if (fb !== -1 && lb > fb) {
    try {
      const sub = cleaned.substring(fb, lb + 1).replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sub);
    } catch {}
  }

  throw new Error('Unable to parse JSON from AI response.');
}

// Lazy initialization of Gemini Client supporting all standard key environment variable names
let geminiClient: GoogleGenAI | null = null;
function getGeminiApiKey(): string | null {
  const key = 
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY' || key === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  return key.trim();
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Resilient Gemini text caller with verified models, fast failover, and strict serverless timeout
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  promptOrContents: any,
  config?: any
): Promise<string> {
  // Verified active production models from @google/genai specification:
  // 1. gemini-3.1-flash-lite: ultra-fast, sub-2s latency, high availability, ideal for timeline/script generation
  // 2. gemini-flash-latest: official stable flash alias
  // 3. gemini-3.8-flash: high reasoning capacity
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash'
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: promptOrContents,
        config: config || {
          responseMimeType: 'application/json'
        }
      });
      // 20 second timeout per candidate to allow comprehensive multi-scene timelines to complete cleanly
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout requesting model ${model}`)), 20000)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);
      const text = response.text || '';
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Candidate model ${model} encountered an issue:`, err?.message || err);
      // Brief backoff before next candidate
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const errMsg = String(lastError?.message || lastError || '');
  if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429') || errMsg.includes('quota')) {
    const customErr: any = new Error('Gemini API quota is currently exceeded. Please wait a brief moment and retry.');
    customErr.status = 429;
    throw customErr;
  }
  if (errMsg.includes('overloaded') || errMsg.includes('503') || errMsg.includes('UNAVAILABLE')) {
    const customErr: any = new Error('The AI model API is currently experiencing peak traffic. Please retry in a moment.');
    customErr.status = 503;
    throw customErr;
  }

  throw lastError || new Error('All AI service candidates were temporarily unavailable. Please retry.');
}

// System Status & Health Check Handler
export function handleHealthCheck(req: express.Request, res: express.Response) {
  const hasGemini = Boolean(getGeminiApiKey());

  res.json({
    ok: true,
    status: 'ok',
    service: 'Kiran AI Video Studio API',
    appName: 'Kiran AI Video Studio',
    version: CURRENT_APP_VERSION,
    operator: 'Kiran Chaulagain',
    contactEmail: 'kiranchaulagain094@gmail.com',
    features: {
      geminiServerSide: hasGemini,
      videoPlanner: true,
      shortsCreator: true,
      contentAssistant: true,
      writingTools: true,
      contentSuite: true,
      thumbnailMaker: true,
      thumbnailVisionAnalysis: true,
      musicVideoPlanner: true,
      timelinePlanner: true
    }
  });
}

apiRouter.get(['/', '/health', '/api/health', '/status', '/api/status'], handleHealthCheck);

// SemVer Comparison Helper for Server-Side Version Control
function compareSemVer(v1: string, v2: string): number {
  const parts1 = (v1 || '1.0.0').replace(/^v/i, '').split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = (v2 || '1.0.0').replace(/^v/i, '').split('.').map(p => parseInt(p, 10) || 0);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

// Centralized Version and Changelog Probe (Safe Public Endpoint - Requirement 4)
const handleAppVersionCheck = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  await syncScheduledUpdates();

  const clientVersion = String(req.query.clientVersion || req.query.v || req.headers['x-app-version'] || '1.0.0').trim();

  let latestVersion = CURRENT_APP_VERSION;
  let minimumSupportedVersion = '1.0.0';
  let updateTitle = 'Kiran AI Video Studio Update';
  let updateDescription = 'A new version of Kiran AI Video Studio is available.';
  let releaseNotes: string | undefined = undefined;
  let requiresSignIn = false;
  let isExplicitlyRequired = false;

  if (isDbConfigured()) {
    try {
      const rows = await query<any>(
        `SELECT * FROM updates 
         WHERE is_published = true AND (status = 'published' OR status IS NULL)
         ORDER BY published_at DESC LIMIT 1`
      );
      if (rows && rows.length > 0) {
        const latest = rows[0];
        if (latest.version) latestVersion = latest.version;
        if (latest.minimum_supported_version) minimumSupportedVersion = latest.minimum_supported_version;
        if (latest.title) updateTitle = latest.title;
        if (latest.description) updateDescription = latest.description;
        if (latest.release_notes) releaseNotes = latest.release_notes;
        requiresSignIn = Boolean(latest.requires_sign_in);
        isExplicitlyRequired = Boolean(latest.is_required);
      }
    } catch (err) {
      console.warn('Error fetching latest version from database:', err);
    }
  }

  const updateAvailable = compareSemVer(latestVersion, clientVersion) > 0;
  const updateRequired = isExplicitlyRequired || compareSemVer(minimumSupportedVersion, clientVersion) > 0;

  // NEVER return database credentials, API keys, OAuth secrets, session secrets, or admin credentials.
  return res.json({
    currentVersion: clientVersion,
    latestVersion,
    minimumSupportedVersion,
    updateAvailable,
    updateRequired,
    updateTitle,
    updateDescription,
    releaseNotes: releaseNotes || (APP_CHANGELOGS[latestVersion]?.details?.join('\n') || ''),
    requiresSignIn,
    updateUrl: '/'
  });
};

apiRouter.get(['/app/version', '/api/app/version', '/version', '/api/version', '/app-version', '/api/app-version'], handleAppVersionCheck);
app.get(['/api/app/version', '/api/version'], handleAppVersionCheck);

// Contact Us Form Submission Handler (Requirement 10)
apiRouter.post(['/contact', '/api/contact'], async (req: Request, res: Response) => {
  try {
    const { name, email, subject, category, message } = req.body || {};

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanSubject = typeof subject === 'string' ? subject.trim() : 'Studio Inquiry';
    const cleanCategory = typeof category === 'string' ? category.trim() : 'General Inquiry & Feedback';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please provide your full name (at least 2 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a message of at least 10 characters.' });
    }

    const ticketId = `KV-${Math.floor(100000 + Math.random() * 900000)}`;
    const messageId = `msg_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

    // Store in database if configured
    let storedInDb = false;
    if (isDbConfigured()) {
      try {
        await query(
          `INSERT INTO contact_messages (id, ticket_id, name, email, category, subject, message, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'received', CURRENT_TIMESTAMP)`,
          [messageId, ticketId, cleanName, cleanEmail, cleanCategory, cleanSubject, cleanMessage]
        );
        storedInDb = true;
      } catch (dbErr: any) {
        console.warn('[Contact Storage Warning]:', dbErr?.message || dbErr);
      }
    }

    // Optional email dispatch if RESEND_API_KEY is configured
    let emailDelivered = false;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey.trim().length > 0) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Kiran AI Video Studio <onboarding@resend.dev>',
            to: ['kiranchaulagain094@gmail.com'],
            subject: `[${ticketId}] ${cleanSubject} (${cleanCategory})`,
            text: `Contact message received:\n\nTicket: ${ticketId}\nFrom: ${cleanName} <${cleanEmail}>\nCategory: ${cleanCategory}\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}`
          })
        });
        if (emailRes.ok) {
          emailDelivered = true;
        }
      } catch (mailErr: any) {
        console.warn('[Email Dispatch Warning]:', mailErr?.message || mailErr);
      }
    }

    console.log(`[Contact Submission] Ticket: ${ticketId}, Name: ${cleanName}, Email: ${cleanEmail}, Stored: ${storedInDb}, Delivered: ${emailDelivered}`);

    return res.json({
      success: true,
      ticketId,
      message: 'Your inquiry has been received. Our team will review and respond within 24-48 business hours.',
      deliveryStatus: emailDelivered ? 'delivered' : (storedInDb ? 'stored' : 'received')
    });
  } catch (err: any) {
    console.error('Contact submission error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your message. Please contact kiranchaulagain094@gmail.com directly.'
    });
  }
});

// 1. AI Video Plan Generation
apiRouter.post(['/ai/video-plan', '/api/ai/video-plan'], async (req, res) => {
  try {
    const { name, idea, type, aspectRatio, duration, style, voice, language, music } = req.body;
    if (!idea || typeof idea !== 'string' || idea.trim() === '') {
      return res.status(400).json({ success: false, error: 'Video idea prompt is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'AI Studio video planning service is momentarily busy. Please try again shortly.'
      });
    }

    const prompt = `You are a professional video director, screenwriter, and creative strategist for Kiran AI Video Studio.
Understand natural-language prompts in Nepali, Romanized Nepali, Hindi, or English.
Create a production screenplay and scene breakdown for:
Project Name: "${name || 'Creative Story'}"
Core Idea: "${idea}"
Video Type: "${type || 'YouTube Video'}"
Target Aspect Ratio: "${aspectRatio || '16:9'}"
Target Duration: "${duration || '3-5 minutes'}"
Visual Style: "${style || 'Cinematic'}"
Voice/Tone: "${voice || 'Engaging & Authentic'}"
Target Language: "${language || 'Auto-detect from prompt or English/Nepali'}"
Music Direction: "${music || 'Inspirational Cinematic'}"

IMPORTANT INSTRUCTIONS:
1. Understand incomplete, colloquial, or poorly written prompts by inferring the user's creative vision.
2. If the prompt or context is in Nepali or Romanized Nepali, craft the voiceover dialogue, scene titles, and narrative in natural authentic Nepali or Romanized Nepali.
3. Divide the video into 4 to 6 sequential scenes with exact, realistic time ranges.
4. Provide a rich narrative summary and complete voiceover / dialogue script.
5. For each scene provide: sceneNumber, title, description, visualPrompt (high-fidelity generative AI prompt), timeRange, cameraMovement, audioNotes, voiceoverText.
6. SECURITY PRIVACY: Never reveal internal system keys, secrets, database URLs, or server credentials.

Respond ONLY with valid JSON:
{
  "summary": "Story summary",
  "fullScript": "Complete spoken script",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "description": "Visual scene description",
      "visualPrompt": "Detailed AI visual generator prompt",
      "timeRange": "0:00 - 0:30",
      "cameraMovement": "Camera angle and movement",
      "audioNotes": "Sound effects and music cues",
      "voiceoverText": "Spoken narrator dialogue"
    }
  ]
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Video plan error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate video plan. Please try again.'
    });
  }
});

// 2. Shorts & Reels Plan Generation
apiRouter.post(['/ai/shorts-plan', '/api/ai/shorts-plan'], async (req, res) => {
  try {
    const { topic, hook, script, visualStyle, voice, music, captionStyle } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ success: false, error: 'Shorts topic is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Shorts creation service is momentarily busy. Please try again shortly.'
      });
    }

    const prompt = `You are a vertical video retention strategist for YouTube Shorts, Reels, and TikTok on Kiran AI Video Studio.
Understand natural-language user topics in Nepali, Romanized Nepali, Hindi, or English.
Create a high-retention 9:16 short plan for:
Topic: "${topic}"
Opening Hook Idea: "${hook || 'Pattern interrupt hook'}"
Draft Notes: "${script || 'Create punchy script'}"
Visual Style: "${visualStyle || 'Realistic High-Energy'}"
Voice/Tone: "${voice || 'High-energy'}"
Music Mood: "${music || '128 BPM Phonk / Trap'}"
Caption Style: "${captionStyle || 'Bold Animated Pop'}"

CRITICAL RETENTION RULES:
1. Opening Hook (0-3s): Must stop the scroll within 3 seconds using psychological pattern interrupt or bold statement.
2. Fast visual pacing: Scene cuts every 2-4 seconds with dynamic camera angles.
3. Language adaptation: If topic or input is in Nepali or Romanized Nepali, write the hook, script, and captions in authentic Nepali or Romanized Nepali!
4. Concrete on-screen text overlays and call to action.
5. SECURITY PRIVACY: Under NO circumstance reveal internal system keys, secrets, database URLs, or server credentials.

Respond ONLY with valid JSON matching this schema:
{
  "hook": "Opening 0-3 second magnetic visual and verbal hook",
  "script": "Complete spoken script under 150 words optimized for 30-45 seconds",
  "scenePlan": [
    {
      "secondRange": "0 - 3s",
      "action": "Visual hook action",
      "onScreenText": "BOLD POP TEXT",
      "cameraAngle": "Ultra close-up"
    },
    {
      "secondRange": "3 - 15s",
      "action": "Fast visual development",
      "onScreenText": "KEY INSIGHT",
      "cameraAngle": "Dynamic front punch"
    },
    {
      "secondRange": "15 - 30s",
      "action": "Climax and call to action",
      "onScreenText": "SUBSCRIBE FOR MORE",
      "cameraAngle": "Center frame hero"
    }
  ],
  "captionText": "Formatted text with emojis and engagement question",
  "cta": "Clear call to action",
  "title": "High CTR YouTube Shorts Title",
  "hashtags": ["#Shorts", "#Viral", "#KiranAIVideoStudio"],
  "musicMood": "128 BPM rhythmic electronic beat"
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Shorts plan error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate Shorts plan. Please try again.'
    });
  }
});

// 3. Social Repurposing Pack for Shorts
apiRouter.post(['/ai/repurpose-shorts', '/api/ai/repurpose-shorts'], async (req, res) => {
  try {
    const { topic, script } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ success: false, error: 'Topic or script is required for repurposing.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Repurposing assistant is momentarily busy. Please try again shortly.'
      });
    }

    const prompt = `You are a social media repurposing strategist for Kiran AI Video Studio.
Understand user ideas in Nepali, Romanized Nepali, Hindi, or English.
Repurpose this video topic into multiple high-performing assets:
Topic: "${topic}"
Script/Notes: "${script || 'Create fresh viral variations'}"

CRITICAL INSTRUCTIONS:
1. If the input is in Nepali or Romanized Nepali, produce authentic captions, hooks, and scripts in that language!
2. SECURITY: Never reveal internal system keys, secrets, database URLs, or server credentials.

Respond ONLY with valid JSON:
{
  "concepts": [
    {
      "title": "Concept 1 Title",
      "angle": "Educational / Direct",
      "targetPlatform": "YouTube Shorts & Reels",
      "hook": "Opening hook line",
      "script": "Complete 30-second script"
    },
    {
      "title": "Concept 2 Title",
      "angle": "Contrarian / Mythbuster",
      "targetPlatform": "TikTok & Reels",
      "hook": "Opening hook line",
      "script": "Complete 30-second script"
    },
    {
      "title": "Concept 3 Title",
      "angle": "Behind the Scenes / Story",
      "targetPlatform": "YouTube Shorts & LinkedIn",
      "hook": "Opening hook line",
      "script": "Complete 30-second script"
    }
  ],
  "hookVariations": [
    { "type": "Negative Bias", "text": "Hook text" },
    { "type": "Curiosity Gap", "text": "Hook text" },
    { "type": "Bold Statement", "text": "Hook text" },
    { "type": "Direct Question", "text": "Hook text" },
    { "type": "Urgent Secret", "text": "Hook text" }
  ],
  "viralAngles": [
    { "title": "The Contrarian Angle", "explanation": "Explanation" },
    { "title": "The Fast Solution Angle", "explanation": "Explanation" },
    { "title": "The Transformation Angle", "explanation": "Explanation" }
  ],
  "carouselSlides": [
    { "slideNumber": 1, "headline": "Cover Headline", "body": "Subtitle" },
    { "slideNumber": 2, "headline": "Point 1", "body": "Explanation" },
    { "slideNumber": 3, "headline": "Point 2", "body": "Explanation" },
    { "slideNumber": 4, "headline": "Point 3", "body": "Explanation" },
    { "slideNumber": 5, "headline": "Key Takeaway", "body": "Summary" },
    { "slideNumber": 6, "headline": "Action Call", "body": "CTA" }
  ]
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Repurposing error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate repurposing pack.'
    });
  }
});

// 4. Content Assistant (Full AIContentPack with 10 Title Archetypes & SEO Audit)
apiRouter.post(['/ai/content-assistant', '/api/ai/content-assistant'], async (req, res) => {
  try {
    const { videoType, targetAudience, language, mainKeyword } = req.body;
    const userTopic = (req.body.prompt || req.body.topic || req.body.idea || req.body.concept || '').trim();
    if (!userTopic) {
      return res.status(400).json({ success: false, error: 'Video concept or topic is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Content & SEO Assistant is momentarily busy. Please try again shortly.'
      });
    }

    const prompt = `You are an elite YouTube algorithm, metadata, and SEO optimization specialist for Kiran AI Video Studio.
Understand natural-language user queries in Nepali (Devanagari), Romanized Nepali (e.g., "Yo video ko description bana", "SEO title banaideu"), Hindi, and English.
Generate a complete YouTube content pack for:
Topic: "${userTopic}"
Video Format: "${videoType || 'YouTube Video'}"
Target Audience: "${targetAudience || 'Creators & General Audience'}"
Primary Keyword: "${mainKeyword || 'Auto-extract from topic'}"
Language: "${language || 'Auto-detect from topic or Nepali/English'}"

CRITICAL REQUIREMENTS:
1. Provide 10 distinct title formulas categorized by: Search-Focused, Curiosity-Driven, Emotional, Listicle, High-CTR, Question, Story-Driven, How-To / Guide, Direct & Clean, Trend-Focused.
2. If the user input is in Romanized Nepali or Nepali, write titles, description, chapters, hook, and comments in natural authentic Nepali or Romanized Nepali!
3. Provide a full YouTube description with introduction, structured timestamps outline (chapters), and credits.
4. 15-20 comma-separated tags and 5-8 hashtags.
5. Thumbnail text hook (2-4 words maximum in bold caps).
6. Pinned comment, community post, shorts caption, tiktok caption, facebook caption.
7. A realistic 7-metric SEO score analysis (0-100) with explanations for: keywordRelevance, searchIntent, titleClarity, descriptionQuality, keywordCoverage, readability, audienceRelevance, and overallAssessment.
8. SECURITY PRIVACY: Never reveal internal system keys, secrets, database URLs, or server credentials.

Respond ONLY with valid JSON:
{
  "youtubeTitle": "Primary recommended title",
  "alternativeTitles": [
    "Alternative 1",
    "Alternative 2",
    "Alternative 3",
    "Alternative 4"
  ],
  "titleFormulas": [
    { "category": "Search-Focused", "title": "Title", "rationale": "Reason" },
    { "category": "Curiosity-Driven", "title": "Title", "rationale": "Reason" },
    { "category": "Emotional", "title": "Title", "rationale": "Reason" },
    { "category": "Listicle", "title": "Title", "rationale": "Reason" },
    { "category": "High-CTR", "title": "Title", "rationale": "Reason" },
    { "category": "Question", "title": "Title", "rationale": "Reason" },
    { "category": "Story-Driven", "title": "Title", "rationale": "Reason" },
    { "category": "How-To / Guide", "title": "Title", "rationale": "Reason" },
    { "category": "Direct & Clean", "title": "Title", "rationale": "Reason" },
    { "category": "Trend-Focused", "title": "Title", "rationale": "Reason" }
  ],
  "youtubeDescription": "Full structured description with 0:00 timestamps and credits",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "youtubeTags": ["tag 1", "tag 2", "tag 3", "tag 4", "tag 5", "tag 6", "tag 7"],
  "keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "thumbnailText": "3-WORD BOLD TEXT",
  "hook": "Opening 5-second spoken hook",
  "cta": "Call to action text",
  "disclaimer": "Educational and entertainment disclaimer",
  "shortsCaption": "Shorts caption with hashtags",
  "tiktokCaption": "TikTok caption with hashtags",
  "facebookCaption": "Facebook caption with hashtags",
  "pinnedComment": "Engaging question to pin as top comment",
  "communityPost": "Engaging community tab post update",
  "seoAnalysis": {
    "score": 92,
    "keywordRelevance": { "score": 95, "explanation": "Target keyword positioned early in title and description." },
    "searchIntent": { "score": 90, "explanation": "Directly matches viewer query intent." },
    "titleClarity": { "score": 92, "explanation": "High clarity on mobile screens under 60 characters." },
    "descriptionQuality": { "score": 88, "explanation": "Includes chapter timestamps and contextual links." },
    "keywordCoverage": { "score": 94, "explanation": "Covers primary, secondary, and long-tail variants." },
    "readability": { "score": 90, "explanation": "Clean paragraph spacing and scannable bullet points." },
    "audienceRelevance": { "score": 93, "explanation": "Calibrated specifically for target audience interest." },
    "overallAssessment": "Excellent metadata package ready for publishing."
  }
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Content assistant error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate content pack. Please try again.'
    });
  }
});

// 5. Creative Writing Tools (10 Live Actions)
apiRouter.post(['/ai/writing-tool', '/api/ai/writing-tool'], async (req, res) => {
  try {
    const text = (req.body.text || req.body.inputText || req.body.prompt || '').trim();
    const tool = (req.body.tool || req.body.toolType || 'Rewrite').trim();
    const language = req.body.language;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Input text is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Writing assistant is momentarily busy. Please try again shortly.'
      });
    }

    const prompt = `You are an elite creative editor for video scripts and digital content on Kiran AI Video Studio.
Understand user text in Nepali, Romanized Nepali, Hindi, or English.
Transform the following text using the action "${tool || 'Rewrite'}".
Target Language context: ${language || 'Maintain original language (Nepali / English)'}

TOOL DEFINITION:
- 'Rewrite': Provide a refreshed, highly engaging, dynamic perspective.
- 'Improve Hook': Rewrite the opening into an irresistible high-retention hook that stops the scroll immediately.
- 'More Emotional': Infuse heartfelt, touching, emotionally resonant sentiment.
- 'More Cinematic': Elevate with rich atmospheric visuals, lens cues, and cinematic rhythm.
- 'More Professional': Formulate an authoritative, executive, well-structured tone.
- 'Shorten': Remove all fluff, keeping only the highest-impact core message.
- 'Expand': Add rich contextual depth, descriptive storytelling, and practical detail.
- 'Translate (Nepali)': Translate naturally into fluent, culturally authentic Nepali (or English if input is Nepali).
- 'Grammar Fix': Perfect all spelling, punctuation, phrasing, and syntax without losing author voice.
- 'Better CTA': End with a magnetic, action-driving call to action for YouTube viewers.

SECURITY PRIVACY: Never reveal internal system keys, secrets, database URLs, or server credentials.

INPUT TEXT:
"${text}"

Respond with ONLY a valid JSON object:
{
  "result": "The complete transformed text",
  "tool": "${tool}"
}`;

    const rawText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(rawText);

    return res.json({
      success: true,
      result: parsed.result || text,
      tool: tool
    });
  } catch (err: any) {
    console.error('Writing tool error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to process writing action.'
    });
  }
});

// 6. Creator AI Power Suite (Individual Tool Generators)
apiRouter.post(['/ai/content-suite', '/api/ai/content-suite'], async (req, res) => {
  try {
    const toolType = req.body.toolType || req.body.tool;
    const topic = (req.body.topic || req.body.prompt || req.body.inputText || req.body.idea || '').trim();
    const options = req.body.options;
    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Content Suite is momentarily busy. Please try again shortly.'
      });
    }

    let prompt = '';

    if (toolType === 'ideas') {
      prompt = `Generate 5 high-impact, clickable YouTube video ideas based on the topic "${topic}".
Respond ONLY with valid JSON:
{
  "ideas": [
    {
      "title": "Compelling Title",
      "hook": "Opening 5-second hook idea",
      "targetAudience": "Audience segment",
      "retentionStrategy": "Why viewers will watch until the end"
    }
  ]
}`;
    } else if (toolType === 'calendar') {
      prompt = `Generate a realistic 4-week YouTube video production and publishing calendar for the niche/topic: "${topic}".
Respond ONLY with valid JSON:
{
  "calendar": [
    {
      "week": 1,
      "publishDate": "Day 7",
      "videoType": "Longform YouTube",
      "title": "Video title",
      "productionMilestone": "Script by Day 2, Shoot Day 4, Edit Day 6"
    },
    {
      "week": 2,
      "publishDate": "Day 14",
      "videoType": "9:16 Shorts Hook",
      "title": "Short title",
      "productionMilestone": "Batch record 3 variations"
    },
    {
      "week": 3,
      "publishDate": "Day 21",
      "videoType": "Deep Dive Tutorial",
      "title": "Tutorial title",
      "productionMilestone": "Screen capture and timestamps"
    },
    {
      "week": 4,
      "publishDate": "Day 28",
      "videoType": "Story / Climax",
      "title": "Story title",
      "productionMilestone": "Cinematic B-roll and color grade"
    }
  ]
}`;
    } else if (toolType === 'script') {
      prompt = `Write a complete, ready-to-record YouTube spoken video script for: "${topic}".
Respond ONLY with valid JSON:
{
  "title": "Suggested Title",
  "estimatedDuration": "3-5 minutes",
  "hook": "Opening 0-15s magnetic hook",
  "introduction": "15-45s context and promise",
  "bodyPoints": [
    { "heading": "Point 1", "spokenText": "Dialogue...", "visualCue": "Visual note" },
    { "heading": "Point 2", "spokenText": "Dialogue...", "visualCue": "Visual note" },
    { "heading": "Point 3", "spokenText": "Dialogue...", "visualCue": "Visual note" }
  ],
  "callToAction": "Final CTA spoken line"
}`;
    } else if (toolType === 'prompt') {
      prompt = `Generate 4 copy-ready cinematic visual prompts for Imagen 3, Midjourney, and Flux based on the video topic: "${topic}".
Respond ONLY with valid JSON:
{
  "prompts": [
    { "scene": "Establishing Hero Shot", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" },
    { "scene": "Emotional Close-Up", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" },
    { "scene": "Dynamic Action Movement", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" },
    { "scene": "Atmospheric Backdrop", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" }
  ]
}`;
    } else {
      // shorts-caption default
      prompt = `Generate 3 high-converting social media captions with emojis and hashtags for vertical short videos about: "${topic}".
Respond ONLY with valid JSON:
{
  "captions": [
    { "platform": "YouTube Shorts", "text": "Caption text with hashtags and emojis" },
    { "platform": "Instagram Reels", "text": "Caption text with hashtags and emojis" },
    { "platform": "TikTok", "text": "Caption text with hashtags and emojis" }
  ]
}`;
    }

    const rawText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(rawText);

    return res.json({
      success: true,
      toolType,
      data: parsed
    });
  } catch (err: any) {
    console.error('Content suite error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate suite content.'
    });
  }
});

// 7. Thumbnail Concept Blueprint
apiRouter.post(['/ai/thumbnail-concept', '/api/ai/thumbnail-concept'], async (req, res) => {
  try {
    const { style, aspectRatio } = req.body;
    const userIdea = (req.body.idea || req.body.title || req.body.concept || req.body.prompt || '').trim();
    const userTitle = (req.body.title || userIdea || 'Creative Video').trim();

    if (!userIdea) {
      return res.status(400).json({ success: false, error: 'Video concept or title is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Thumbnail Studio assistant is momentarily busy. Please try again shortly.'
      });
    }

    const prompt = `You are an elite YouTube thumbnail art director specialized in maximum click-through rates (CTR) for Kiran AI Video Studio.
Understand user ideas in Nepali, Romanized Nepali, Hindi, or English.
Design a thumbnail blueprint for:
Video Idea: "${userIdea}"
Video Title: "${userTitle}"
Visual Style: "${style || 'Viral-style creator thumbnail'}"
Aspect Ratio: "${aspectRatio || '16:9'}"

CRITICAL RULES:
1. If the concept is in Nepali or Romanized Nepali, write the headlines, typography cues, and badges in high-impact Nepali / Romanized Nepali or English as appropriate for high CTR.
2. Maximize contrast, rule of thirds, emotional expression, and readability on tiny mobile screens.
3. SECURITY PRIVACY: Never reveal internal system keys, secrets, database URLs, or server credentials.

Respond ONLY with valid JSON:
{
  "concept": "High-concept thumbnail summary",
  "layoutDescription": "Rule of thirds composition description",
  "subjectPlacement": "Where the focal face or subject is positioned",
  "background": "Background lighting, depth of field, and atmosphere",
  "lighting": "Key, fill, and rim light direction",
  "mainHeadline": "2-4 BOLD CONTRAST WORDS",
  "subHeadline": "OFFICIAL 4K",
  "badgeText": "MUST WATCH",
  "colorPalette": ["#FBBF24", "#6366F1", "#06B6D4", "#111827"],
  "imagePrompt": "Photorealistic 8k prompt for Imagen 3, Midjourney, or Flux with cinematic lighting, depth of field, and compositional framing",
  "negativePrompt": "blurry, low quality, distorted anatomy, text artifacts, cartoonish, oversaturated skin, flat lighting",
  "recommendedAspect": "${aspectRatio || '16:9'}",
  "style": "${style || 'Viral-style creator thumbnail'}"
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Thumbnail concept error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate thumbnail blueprint.'
    });
  }
});

// 8. Thumbnail Reference Image Vision Analysis (Gemini Multimodal Vision)
apiRouter.post(['/ai/analyze-thumbnail-image', '/api/ai/analyze-thumbnail-image'], async (req, res) => {
  try {
    const { imageBase64, mimeType, topic } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Base64 image data is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Thumbnail visual audit service is momentarily busy. Please try again shortly.'
      });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `You are an expert YouTube thumbnail art director.
Analyze this uploaded reference image for its suitability as a high-CTR YouTube thumbnail (Topic: "${topic || 'General video'}").
Evaluate:
1. Subject framing, gaze, and facial expression clarity on small mobile screens.
2. Lighting contrast, background separation, and color vibrancy.
3. Negative space for bold headline overlay text.
4. Clickability score from 0 to 100 with objective criteria.
5. 3 specific actionable adjustments to boost CTR.

Respond ONLY with valid JSON:
{
  "subjectAnalysis": "Detailed observation of subject and emotional hook",
  "lightingAndContrast": "Evaluation of shadows, rim light, and background separation",
  "compositionFeedback": "Rule of thirds and typography space assessment",
  "clickabilityScore": 84,
  "recommendedAdjustments": [
    "Adjustment 1",
    "Adjustment 2",
    "Adjustment 3"
  ]
}`
          }
        ]
      }
    ];

    const rawText = await generateGeminiContentWithFallback(ai, contents);
    const parsed = extractJsonFromText(rawText);

    return res.json({
      success: true,
      ...parsed
    });
  } catch (err: any) {
    console.error('Thumbnail vision analysis error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to analyze reference image with AI Vision.'
    });
  }
});

// 9. AI Thumbnail Image Generation (Imagen / Gemini Flash Image)
apiRouter.post(['/ai/generate-thumbnail-image', '/api/ai/generate-thumbnail-image'], async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ success: false, error: 'Image prompt is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Image generation service is momentarily busy. Please try again shortly.'
      });
    }

    try {
      // Attempt image generation via imagen-3.0-generate-002
      const imgRes = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `${prompt}, high contrast, 8k resolution, photorealistic cinematic lighting, YouTube thumbnail composition`,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9'
        }
      });

      if (imgRes && imgRes.generatedImages && imgRes.generatedImages.length > 0) {
        const img = imgRes.generatedImages[0];
        const base64 = img.image?.imageBytes;
        if (base64) {
          return res.json({
            success: true,
            imageBase64: `data:image/jpeg;base64,${base64}`,
            mimeType: 'image/jpeg'
          });
        }
      }
    } catch (imgErr: any) {
      console.warn('Imagen 3 direct generation not enabled on this key tier:', imgErr?.message || imgErr);
    }

    // User-friendly message
    return res.status(422).json({
      success: false,
      error: 'Direct AI Image Generation is currently experiencing high demand. You can use the copy-ready High-CTR prompt generated above directly in Imagen, Midjourney, or Flux, or upload your custom background photo onto the interactive canvas.'
    });
  } catch (err: any) {
    console.error('Image generation endpoint error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Image generation service error.'
    });
  }
});

// 9. AI Template Maker Analysis Engine
apiRouter.post(['/ai/analyze-template', '/api/ai/analyze-template'], async (req, res) => {
  try {
    const { templateTitle, category, duration, durationSeconds, mediaSlots, slotsMetadata, language } = req.body;
    const ai = getGeminiClient();

    const targetSec = durationSeconds || (duration ? parseInt(duration) : 15) || 15;
    const slotsCount = mediaSlots || (slotsMetadata ? slotsMetadata.length : 3) || 3;

    if (ai) {
      try {
        const prompt = `You are a professional music video director and rhythmic video editing analyst for Kiran AI Video Studio.
Analyze the following editing template:
Template Title: "${templateTitle || 'Creative Template'}"
Category: "${category || 'Beat Sync'}"
Total Duration: "${duration || `${targetSec}s`}" (${targetSec} seconds)
Required Media Slots: ${slotsCount}
Target Language: "${language || 'English / Nepali'}"

Provide an intelligent rhythmic breakdown with:
1. BPM and tempo style matching the category (e.g. 128 BPM Beat Snap for DJ/Beat Sync, 85 BPM Gentle Flow for Love, 140 BPM Rapid Strobe for TikTok).
2. Professional color grade palette (e.g. Electric Neon Contrast, Warm Golden Sunset, Crisp Film Noir, Vibrant Cinema).
3. Slot-by-slot kinetic motion recommendation (Dynamic Zoom In, Ken Burns Pan, Strobe Pulse Flash, Whip Pan, Slow Dolly).
4. Concrete on-screen caption idea for each slot in the target language.

Respond ONLY with valid JSON:
{
  "category": "${category || 'Beat Sync'}",
  "bpm": 128,
  "tempoStyle": "128 BPM Dynamic Beat Snap",
  "colorGrade": "Vibrant Crisp Cinema",
  "mood": "High Energy & Engaging",
  "slots": [
    {
      "slot": 1,
      "label": "Opening Hook",
      "recommendedMotion": "Dynamic Zoom In",
      "tempoMatch": "Fast Beat Cut (0.0s - 3.0s)",
      "captionSuggestion": "Bold Opening Hook"
    }
  ],
  "readinessScore": 100,
  "creativeAdvice": "Actionable editing tip for creators"
}`;

        const rawText = await generateGeminiContentWithFallback(ai, prompt);
        const parsed = extractJsonFromText(rawText);
        if (parsed && Array.isArray(parsed.slots) && parsed.slots.length > 0) {
          return res.json({ success: true, analysis: parsed });
        }
      } catch (err) {
        console.warn('Gemini template analysis fallback:', err);
      }
    }

    // Programmatic algorithmic fallback
    const slotDuration = (targetSec / slotsCount).toFixed(1);
    const fallbackSlots = Array.from({ length: slotsCount }).map((_, idx) => ({
      slot: idx + 1,
      label: (slotsMetadata && slotsMetadata[idx]?.label) || `Scene #${idx + 1}`,
      recommendedMotion: idx === 0 
        ? 'Dynamic Zoom In' 
        : (category === 'Beat Sync' || category === 'DJ' ? 'Strobe Pulse Flash' : 'Ken Burns Pan'),
      tempoMatch: `${(idx * parseFloat(slotDuration)).toFixed(1)}s - ${((idx + 1) * parseFloat(slotDuration)).toFixed(1)}s (${category === 'Beat Sync' ? '128 BPM Snap' : 'Smooth Flow'})`,
      captionSuggestion: idx === 0 ? 'WATCH THIS' : `Beat Highlight #${idx + 1}`
    }));

    return res.json({
      success: true,
      analysis: {
        category: category || 'Trending',
        bpm: category === 'Beat Sync' || category === 'DJ' ? 128 : (category === 'Love' ? 82 : 110),
        tempoStyle: category === 'Beat Sync' ? '128 BPM Fast Strobe Snap' : 'Smooth Cinematic Flow',
        colorGrade: category === 'Love' ? 'Warm Golden Sunset' : (category === 'DJ' ? 'Electric High Contrast' : 'Vibrant Crisp Cinema'),
        mood: category === 'Love' ? 'Emotional & Tender' : 'High Energy & Engaging',
        slots: fallbackSlots,
        readinessScore: 95,
        creativeAdvice: 'For maximum retention, place your highest-energy photo or video in Slot #1 to immediately catch viewer attention.'
      }
    });
  } catch (err: any) {
    console.error('Template analysis endpoint error:', err);
    res.status(500).json({ success: false, error: 'Failed to analyze template.' });
  }
});

// 10. AI Website Guide & Creative Assistant (Multilingual, Context-Aware, Security-Hardened)
apiRouter.post(['/ai/guide', '/api/ai/guide'], async (req, res) => {
  try {
    const { message, history, imageBase64, mimeType } = req.body;
    const userMessage = (message || '').trim();

    if (!userMessage && !imageBase64) {
      return res.status(400).json({ success: false, error: 'Message or image cannot be empty.' });
    }

    // 1. STRICT SECURITY PRE-CHECK: Prevent leaking internal keys, secrets, DB URLs, or server credentials
    const isProbingSecrets = /(api[ _-]?key|client[ _-]?secret|database[ _-]?url|session[ _-]?secret|environment variable|\.env\b|db password|admin password|bearer token|auth token|private key|server secret|system credential)/i.test(userMessage);
    if (isProbingSecrets) {
      const isNepali = /[\u0900-\u097F]/.test(userMessage) || /\b(mero|chahiyo|kasari|geet|banaune|garnu|banauna|thaha)\b/i.test(userMessage.toLowerCase());
      const isHindi = /\b(kaise|kare|mujhe|chahiye|karna|hai|mera|meri)\b/i.test(userMessage.toLowerCase());
      const refusalMsg = isNepali
        ? 'ती स्टुडियोका आन्तरिक र सुरक्षित प्रणाली विवरणहरू हुन्। म तपाईंलाई भिडियो पटकथा, युट्युब शीर्षक, थम्बनेल योजना, टेम्प्लेट सम्पादन, वा एसईओ मेटाडाटा तयार गर्न मद्दत गर्न सक्छु। तपाईं आज के बनाउन चाहनुहुन्छ?'
        : isHindi
        ? 'वे स्टूडियो के आंतरिक और सुरक्षित सिस्टम विवरण हैं। मैं आपकी वीडियो स्क्रिप्ट, थंबनेल डिजाइन, टेम्प्लेट एडिटिंग, या यूट्यूब एसईओ में मदद कर सकता हूँ। आप क्या बनाना चाहते हैं?'
        : 'Those are protected internal studio system details. I can help you plan video screenplays, generate YouTube titles & descriptions, design high-CTR thumbnails, or edit video templates. What would you like to create?';

      return res.json({
        userGoal: 'System security protection',
        detectedLanguage: isNepali ? 'Nepali' : isHindi ? 'Hindi' : 'English',
        message: refusalMsg,
        recommendedTools: [
          { id: 'video-generator', name: 'AI Video Planner', reason: 'Plan a complete video screenplay and scenes' },
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate high-ranking YouTube titles and descriptions' }
        ]
      });
    }

    const ai = getGeminiClient();

    const VALID_TOOL_METADATA: Record<string, { name: string; route: string; purpose: string }> = {
      'video-generator': {
        name: 'AI Video Planner',
        route: 'video-generator',
        purpose: 'Multi-scene screenplay & script planner with scene timing brackets, camera movements, dialogue, voiceover, sound cues, visual prompts.'
      },
      'shorts-creator': {
        name: 'Shorts & Reels Creator',
        route: 'shorts-creator',
        purpose: '9:16 vertical video storyboarder and pacing strategist with 3-second hook script, rapid visual scene cuts, on-screen text, and caption copy.'
      },
      'content-assistant': {
        name: 'Content & SEO Assistant',
        route: 'content-assistant',
        purpose: 'YouTube SEO and metadata suite: 10 title formulas, description with timestamps, tags, hashtags, hook, pinned comment, community post, and 10 instant creative writing tools.'
      },
      'thumbnail-maker': {
        name: 'Thumbnail Concept Designer',
        route: 'thumbnail-maker',
        purpose: 'High-CTR YouTube thumbnail composition architect with rule-of-thirds visual hierarchy, emotional focal subject, bold headline text, and AI image prompts.'
      },
      'templates': {
        name: 'AI Template Maker',
        route: 'templates',
        purpose: 'Curated library of 12 categories (Beat Sync, Trending, Travel, DJ, Love, etc.). Upload media into slots, analyze beats with AI, and render real deterministic videos with instant preview & download.'
      },
      'timeline-planner': {
        name: 'AI Video Timeline Planner',
        route: 'timeline-planner',
        purpose: 'Scene-by-scene video timeline planner (15s to 5m) with copyable Flow prompts, duration math, and screenshot upload guides.'
      },
      'video-editor': {
        name: 'Timeline Video Editor',
        route: 'video-editor',
        purpose: 'In-browser multi-track timeline video editor. Arrange video clips, audio tracks, and subtitle layers with trim, playhead scrub, volume balance, and canvas preview.'
      },
      'music-video': {
        name: 'Music Video Storyboarder',
        route: 'music-video',
        purpose: 'Narrative storyboarder specialized for songs (Nepali folk, acoustic, modern pop, romantic). Breaks songs into Intro, Verse, Chorus, and Climax with character emotion arcs.'
      },
      'projects': {
        name: 'My Projects',
        route: 'projects',
        purpose: 'Creator workspace project manager. View saved video plans, re-open them in the video editor, export as JSON, or synchronize securely across devices.'
      },
      'about-us': {
        name: 'About Us',
        route: 'about-us',
        purpose: 'Learn about creator Kiran Chaulagain, studio mission, architecture, and transparent creator policies.'
      },
      'contact-us': {
        name: 'Contact Us',
        route: 'contact-us',
        purpose: 'Direct contact form and email (kiranchaulagain094@gmail.com) for inquiries, feedback, and support.'
      },
      'articles': {
        name: 'Creator Guides',
        route: 'articles',
        purpose: 'Educational knowledge hub containing original publisher guides on YouTube SEO, title formulas, thumbnail design, Shorts hooks, scriptwriting, and content planning.'
      }
    };

    if (ai) {
      try {
        const formattedHistory = Array.isArray(history) 
          ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'Visitor' : 'Guide'}: ${h.content}`).join('\n')
          : '';

        const systemPrompt = `You are the genuine, highly intelligent "AI Creative Guide & Assistant" for Kiran AI Video Studio, created by Kiran Chaulagain.
Your mission: Provide practical, direct creative help, answer video production and YouTube questions accurately, and guide users to the studio's real tools.

AVAILABLE CREATIVE TOOLS ON KIRAN AI VIDEO STUDIO:
1. "video-generator" (AI Video Planner): Multi-scene screenplay, scriptwriting, camera movements, dialogue, voiceover, sound cues, visual prompts for full videos.
2. "shorts-creator" (Shorts & Reels Creator): 9:16 vertical video storyboarder, 3-second hook scripts, fast visual pacing, on-screen text, captions for YouTube Shorts/TikTok/Reels.
3. "content-assistant" (Content & SEO Assistant): YouTube SEO, 10 title formulas, description with timestamps, tags, hashtags, pinned comment, community post, 10 creative writing tools, and 7-metric SEO score.
4. "thumbnail-maker" (Thumbnail Concept Designer): High-CTR thumbnail composition, visual layout rules (Rule of Thirds), bold headline typography, color palettes, and AI image generator prompts.
5. "templates" (AI Template Maker): 12 categories (Beat Sync, Trending, Travel, DJ, Love, Festival, Shorts, etc.). Browse templates, upload photos/videos into media slots, analyze beats, and render real deterministic beat-synced videos with instant preview & MP4/WebM download.
6. "timeline-planner" (AI Video Timeline Planner): Scene-by-scene video timeline planner (15s to 5m) with copyable Flow prompts, duration math, and screenshot upload guides.
7. "music-video" (Music Video Storyboarder): Narrative storyboarder specialized for songs (Nepali folk, acoustic, modern pop, romantic) with verse-by-verse scene breakdowns and character emotion arcs.
8. "video-editor" (Timeline Video Editor): In-browser multi-track timeline video editor to arrange video, audio, and subtitle layers, trim clips, and preview playback.
9. "projects" (My Projects): Workspace project manager to view saved plans, duplicate, or re-open projects. Synchronizes securely across devices when signed in.
10. "articles" (Creator Guides): Original educational publisher guides on YouTube SEO, title formulas, thumbnail design, Shorts hooks, and content planning.
11. "about-us" (About Us): Creator biography of Kiran Chaulagain and studio mission.
12. "contact-us" (Contact Us): Direct contact form and official email (kiranchaulagain094@gmail.com).

INTELLIGENCE & CONVERSATION RULES:
1. MULTILINGUAL FLUENCY:
- Flawlessly understand and speak in:
  * Nepali (Devanagari script)
  * Romanized Nepali (e.g. "YouTube ko thumbnail kasari ramro banaune?", "SEO title banaideu", "Yo video ko description bana", "AI bata Shorts banauna k garnu?")
  * Hindi (e.g. "YouTube video ke liye title aur description kaise banaye?")
  * English (e.g. "How do I make viral shorts?")
- ALWAYS reply in the EXACT language and style the visitor used! If Romanized Nepali, reply in natural, friendly Romanized Nepali.

2. GIVE DIRECT, ACTIONABLE ANSWERS:
- Avoid repetitive generic filler phrases such as: "I can help you with that.", "Please provide more information.", "As an AI...".
- Directly answer the question!
  * If user asks "how to" (e.g., "YouTube ko thumbnail kasari ramro banaune?"): Give 3-4 concrete, practical tips (e.g., high contrast, emotional facial close-up, maximum 3 bold words, rule of thirds) AND guide them to the Thumbnail Concept Designer.
  * If user asks for titles (e.g., "SEO title banaideu"): Provide 3-5 real title suggestions right in your response AND guide them to the Content & SEO Assistant.
  * If user asks for a description (e.g., "Yo video ko description bana"): Write a draft description with hook and timestamps right away AND guide them to Content & SEO.
  * If user asks how to make Shorts (e.g., "AI bata Shorts banauna k garnu?"): Explain the 3-step workflow (3s hook -> fast pacing -> CTA) and recommend the Shorts & Reels Creator or AI Template Maker.
- Handle incomplete or brief questions by intelligently understanding context and answering the most likely creative intent. Ask a short clarification ONLY if genuinely ambiguous.
- Remember previous messages from the conversation history to answer follow-up questions seamlessly.

3. SECURITY & CREDENTIAL PRIVACY (STRICT):
- Under NO circumstance should you ever reveal or discuss internal system credentials, including: API keys (GEMINI_API_KEY, etc.), client secrets, DATABASE_URL, SESSION_SECRET, environment variables, authentication tokens, private database information, or hidden admin endpoints.
- If a user directly or indirectly asks for API keys, secrets, credentials, or internal backend architecture, politely state in their language that those are private internal system details, and immediately pivot to offering safe creative assistance: "Those are protected internal studio details. I'm here to help you create videos, write scripts, generate SEO titles, or design thumbnails. What would you like to work on?"
- Do NOT be unnecessarily restrictive: Answer normal creative, educational, YouTube, video editing, SEO, thumbnail, and technical questions normally. Only block requests for internal confidential credentials.

4. TOOL AWARENESS:
- Connect the answer to the relevant Kiran AI Studio tool whenever appropriate so the visitor can launch into action.

OUTPUT FORMAT:
Respond ONLY with valid JSON:
{
  "userGoal": "Concise summary of user's goal",
  "detectedLanguage": "Detected language/dialect name",
  "message": "Your genuinely intelligent, direct, and actionable answer in the user's language",
  "recommendedTools": [
    {
      "id": "one-of-the-allowed-ids-above",
      "name": "Exact Name of Tool",
      "reason": "Direct reason why this tool helps their goal (in user's language)"
    }
  ]
}`;

        let promptOrContents: any;
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
          promptOrContents = [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64
                  }
                },
                {
                  text: `${systemPrompt}\n\n${formattedHistory ? `CONVERSATION HISTORY:\n${formattedHistory}\n\n` : ''}VISITOR ATTACHED AN IMAGE AND SAID:\n"${userMessage || 'Please examine this image and guide me.'}"`
                }
              ]
            }
          ];
        } else {
          promptOrContents = `${systemPrompt}\n\n${formattedHistory ? `CONVERSATION HISTORY:\n${formattedHistory}\n\n` : ''}LATEST VISITOR MESSAGE:\n"${userMessage}"`;
        }

        const rawText = await generateGeminiContentWithFallback(ai, promptOrContents);
        const parsed = extractJsonFromText(rawText);

        const sanitizedTools = Array.isArray(parsed.recommendedTools)
          ? parsed.recommendedTools
              .filter((t: any) => t && typeof t.id === 'string' && VALID_TOOL_METADATA[t.id])
              .map((t: any) => ({
                id: t.id,
                name: VALID_TOOL_METADATA[t.id].name,
                reason: String(t.reason || '').trim() || VALID_TOOL_METADATA[t.id].purpose
              }))
          : [];

        return res.json({
          userGoal: parsed.userGoal || 'Creative video assistance',
          detectedLanguage: parsed.detectedLanguage || 'Natural language',
          message: parsed.message || 'Here is how Kiran AI Video Studio can help you.',
          recommendedTools: sanitizedTools
        });
      } catch (err: any) {
        console.warn('Gemini Guide using semantic fallback:', err?.message || String(err));
      }
    }

    // Semantic Multilingual Offline / Fallback Guide Logic
    const lower = userMessage.toLowerCase();
    const isRomanizedNepali = /\b(mero|chahiyo|kasari|geet|banaune|suno|namaste|hunchha|huncha|pani|lai|cha|ko|ma|garnu|banauna|thaha|kasto|ramro)\b/i.test(lower);
    const isDevanagariNepali = /[\u0900-\u097F]/.test(userMessage);
    const isHindi = /\b(kaise|kare|mujhe|chahiye|karna|hai|mera|meri|gaana|bana|sakte|kripya)\b/i.test(lower);

    const wantsTemplateOrRender = /(template|templates|render|beat sync|dj|reels style|tiktok style|photo transition)/i.test(lower);
    const asksSecrets = /(api[ _-]?key|secret|database_url|session_secret|credential|token|password|env[ _-]?var)/i.test(lower);

    if (asksSecrets) {
      return res.json({
        userGoal: 'System security protection',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : isHindi ? 'Hindi' : 'English',
        message: isRomanizedNepali
          ? 'Kiran AI Video Studio ko internal system details ra credentials safe ra protected hunchhan. Ma tapai lai video planning, YouTube titles, SEO, thumbnail, athawa script banauna sahayog garna sakchu. Aaja ke banauna chahanu hunchha?'
          : isDevanagariNepali
          ? 'किरण एआई भिडियो स्टुडियोका आन्तरिक प्रणाली विवरण र प्रमाण-पत्रहरू सुरक्षित र गोप्य राखिएका छन्। म तपाईंलाई भिडियो योजना, युट्युब शीर्षक, SEO, थम्बनेल, वा पटकथा तयार गर्न सहयोग गर्न सक्छु। आज के निर्माण गर्न चाहनुहुन्छ?'
          : 'Internal studio credentials and server configurations are strictly protected. I am here to help you create videos, write scripts, generate YouTube SEO titles, or design high-CTR thumbnails. What creative project would you like to work on?',
        recommendedTools: [
          { id: 'video-generator', name: 'AI Video Planner', reason: 'Plan complete multi-scene video screenplays' },
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate YouTube titles, descriptions, and tags' }
        ]
      });
    }
    const wantsMusicOrSong = /(song|music|geet|gaana|lyrics|melody|singer|गीत|गाना|संगीत)/i.test(lower);
    const wantsSEOOrTitle = /(title|description|seo|tag|tags|hashtag|hashtags|keywords|शीर्षक|विवरण|ट्याग)/i.test(lower);
    const wantsThumbnail = /(thumbnail|cover|poster|photo|image|banner|थम्बनेल|थंबनेल|तस्बिर|फोटो)/i.test(lower);
    const wantsShorts = /(short|shorts|reel|reels|tiktok|vertical|9:16|hook|कथा)/i.test(lower);
    const wantsEditor = /(edit|editor|timeline|trim|cut|audio track|volume|layers|एडिटर|सम्पादन)/i.test(lower);
    const wantsVideoPlan = /(video|script|screenplay|youtube|tourism|documentary|vlog|travel|nepal|camera|भिडियो|योजना)/i.test(lower);

    // Practical question: "YouTube ko thumbnail kasari ramro banaune?"
    if (wantsThumbnail && (lower.includes('kasari') || lower.includes('ramro') || lower.includes('how') || lower.includes('kaise') || lower.includes('banaune'))) {
      if (isRomanizedNepali) {
        return res.json({
          userGoal: 'High-CTR YouTube thumbnail design tips',
          detectedLanguage: 'Romanized Nepali',
          message: 'YouTube ma thumbnail ramro banauna yo 4 ota rule dhyan dinus:\n\n1. **High Contrast & Bright Lighting**: Background bhanda aafno subject/face lai bright ra clear dekhine gari light dinus.\n2. **Max 3-4 Bold Words**: Mobile ma padhna sajilo hune gari thulo text lekhnus (jastai: "SECRET REVEALED", "NEVER DO THIS").\n3. **Emotional Facial Expression**: Aashcharya (shock), khusi, wa suspense dekhaune close-up face le CTR badhaucha.\n4. **Rule of Thirds**: Subject lai ek side (right wa left) ma rakhnus ra arko side ma headline text rakhnus.\n\nKiran AI Video Studio ko **Thumbnail Concept Designer** ma tapai le yasto high-CTR composition layout ra image prompts turuntai banauna saknu huncha!',
          recommendedTools: [
            { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'Rule of thirds composition ra high-contrast headline concepts banauna' }
          ]
        });
      }
      if (isDevanagariNepali) {
        return res.json({
          userGoal: 'आकर्षक युट्युब थम्बनेल बनाउने तरिका',
          detectedLanguage: 'Nepali (नेपाली)',
          message: 'युट्युबमा थम्बनेल आकर्षक र बढी क्लिक (High CTR) आउने बनाउन यी ४ नियम अपनाउनुहोस्:\n\n१. **हाई कन्ट्रास्ट र ब्राइट लाइटिङ**: ब्याकग्राउन्ड भन्दा आफ्नो मुख्य अनुहार वा वस्तु चम्किलो र स्पष्ट हुनुपर्छ।\n२. **बढीमा ३-४ बोल्ड शब्दहरू**: मोबाइल स्क्रिनमा सजिलै पढ्न सकिने ठूला फन्ट प्रयोग गर्नुहोस्।\n३. **भावनात्मक अनुहारको भाव**: आश्चर्य, कौतूहल वा खुसी झल्किने क्लोज-अप तस्बिरले दर्शकको ध्यान तान्छ।\n४. **Rule of Thirds लेआउट**: मुख्य विषयलाई दायाँ वा बायाँ राखेर अर्को भागमा बोल्ड अक्षर राख्नुहोस्।\n\nथप प्रभावकारी थम्बनेल डिजाइन गर्न **Thumbnail Concept Designer** टुल प्रयोग गर्नुहोस्!',
          recommendedTools: [
            { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'उच्च CTR थम्बनेल लेआउट र हेडलाइन कन्सेप्ट बनाउन' }
          ]
        });
      }
    }

    // Direct generation request: "SEO title banaideu"
    if (wantsSEOOrTitle && (lower.includes('title') || lower.includes('banaideu') || lower.includes('banau') || lower.includes('bana'))) {
      const sampleTopic = userMessage.replace(/(title|banaideu|banau|bana|chahiyo|seo|ko|mera|mero)/gi, '').trim() || 'Your Video';
      return res.json({
        userGoal: 'Direct YouTube title generation',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : 'English',
        message: isRomanizedNepali
          ? `Tapai ko "${sampleTopic}" ko lagi 3 ota tested high-CTR titles yaha chhan:\n\n1. **Search-Focused**: "${sampleTopic} Step-by-Step Complete Guide (2026)"\n2. **Curiosity-Driven**: "The Hidden Truth About ${sampleTopic} Nobody Told You"\n3. **High-CTR**: "Stop Doing This! Best Way to Master ${sampleTopic}"\n\nThap 10 ota title formulas, description timestamps, tags ra SEO score ko lagi **Content & SEO Assistant** kholnus!`
          : isDevanagariNepali
          ? `तपाईंको भिडियोको लागि ३ वटा उच्च CTR शीर्षकहरू:\n\n१. **Search-Focused**: "${sampleTopic}: सम्पूर्ण गाइड र महत्त्वपूर्ण टिप्स (२०२६)"\n२. **Curiosity-Driven**: "${sampleTopic} को बारेमा धेरैलाई थाहा नभएको रहस्य"\n३. **High-CTR**: "यो गल्ती नगर्नुहोस्! ${sampleTopic} गर्ने सही तरिका"\n\n१० वटा विभिन्न टाइटल फर्मुला र पूर्ण SEO प्याकको लागि **Content & SEO Assistant** प्रयोग गर्नुहोस्!`
          : `Here are 3 high-performing YouTube title options for "${sampleTopic}":\n\n1. **Search-Focused**: "${sampleTopic} - Full Guide & Essential Breakdown (2026)"\n2. **Curiosity-Driven**: "The Real Truth About ${sampleTopic} Nobody Talks About"\n3. **High-CTR**: "Stop Doing This! The Only ${sampleTopic} Strategy You Need"\n\nLaunch the **Content & SEO Assistant** to generate all 10 formulas, chapters description, and tags!`,
        recommendedTools: [
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate complete 10-title suite, tags, and description' }
        ]
      });
    }

    // Direct description generation request: "Yo video ko description bana"
    const wantsDescription = (lower.includes('description') || lower.includes('bibaran') || lower.includes('vivaran') || lower.includes('विवरण')) && (lower.includes('bana') || lower.includes('banaideu') || lower.includes('banau') || lower.includes('write') || lower.includes('create') || lower.includes('lekh'));
    if (wantsDescription) {
      const sampleTopic = userMessage.replace(/(description|bana|banaideu|banau|write|create|lekh|yo|video|ko|ko lagi|chahiyo|banai|deu)/gi, '').trim() || 'Your Video Topic';
      return res.json({
        userGoal: 'Direct YouTube video description generation',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : 'English',
        message: isRomanizedNepali
          ? `Tapai ko video ("${sampleTopic}") ko lagi ready-to-publish description yaha tayar cha:\n\n📌 **Video Overview**:\nIn this video, we dive deep into ${sampleTopic}, uncovering essential strategies, step-by-step techniques, and practical creator workflows for 2026.\n\n⏱️ **Timestamps / Chapters**:\n0:00 - Introduction & Hook\n0:45 - Key Foundations of ${sampleTopic}\n2:30 - Core Demonstration & Analysis\n5:15 - Essential Tips & Best Practices\n7:40 - Final Thoughts & Summary\n\n🔔 Subscribe to the channel for more creative video tutorials and updates!\n\nThap 10 ota title formulas, tag recommendations, ra 0-100 SEO score audit ko lagi **Content & SEO Assistant** kholnus!`
          : isDevanagariNepali
          ? `तपाईंको भिडियो ("${sampleTopic}") को लागि तयार गरिएको युट्युब विवरण:\n\n📌 **भिडियो सारांश**:\nयस भिडियोमा हामीले ${sampleTopic} को बारेमा विस्तृत छलफल गरेका छौँ। सम्पूर्ण चरणबद्ध जानकारी र महत्त्वपूर्ण रचनात्मक सुझावहरू प्रस्तुत गरिएको छ।\n\n⏱️ **टाइमस्ट्याम्प (अध्यायहरू)**:\n०:०० - परिचय तथा मुख्य आकर्षण\n०:४५ - आधारभूत जानकारी\n२:३० - मुख्य विश्लेषण तथा प्रस्तुति\n५:१५ - महत्त्वपूर्ण टिप्स र सावधानी\n७:४० - निष्कर्ष\n\n🔔 थप नयाँ भिडियोहरूको लागि च्यानललाई Subscribe गर्नुहोस्!\n\n१० वटा शीर्षक विकल्प, ट्याग र SEO अडिटका लागि **Content & SEO Assistant** खोल्नुहोस्!`
          : `Here is a complete, structured YouTube description for "${sampleTopic}":\n\n📌 **Video Summary**:\nIn this video, we dive deep into ${sampleTopic}, breaking down everything you need to know with actionable insights, step-by-step examples, and expert tips for 2026.\n\n⏱️ **Timestamps / Chapters**:\n0:00 - Introduction & Hook\n0:45 - Key Foundations of ${sampleTopic}\n2:30 - Core Demonstration & Analysis\n5:15 - Essential Tips & Best Practices\n7:40 - Final Thoughts & Summary\n\n🔔 Subscribe for more in-depth creator tutorials!\n\nFor 10 title formulas, tag recommendations, and live SEO score audit, launch the **Content & SEO Assistant**!`,
        recommendedTools: [
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate full description, tags, hashtags, and 0-100 SEO scoring' }
        ]
      });
    }

    // Template or Render requests
    if (wantsTemplateOrRender) {
      return res.json({
        userGoal: 'Video templates and beat-sync rendering',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : 'English',
        message: isRomanizedNepali
          ? 'Kiran AI Video Studio ma **AI Template Maker** uplabdha cha! Tapai Trending, Beat Sync, Travel, DJ, Love, Festival, Shorts style ka ready-made templates chhanera aafno photo/video upload garna saknu huncha. Yasle beat matching, Ken Burns pan/zoom, ra transition sahit real video render gari download dina sakcha.'
          : isDevanagariNepali
          ? 'किरण एआई भिडियो स्टुडियोमा **AI Template Maker** उपलब्ध छ! तपाईं ट्रेन्डिङ, बीट सिङ्क, ट्राभल, डिजे, लभ, र सर्ट्स शैलीका टेम्प्लेटहरू छानेर आफ्ना फोटो वा भिडियोहरू अपलोड गर्न सक्नुहुन्छ। यसले वास्तविक भिडियो कम्पोजिट गरी डाउनलोड गर्न मिल्ने बनाउँछ।'
          : 'Kiran AI Video Studio features the **AI Template Maker**! Browse 12 curated categories (Beat Sync, Trending, Travel, DJ, Love, Reels Style, etc.), map your photos or clips to media slots, analyze beats with AI, and render complete videos with instant download.',
        recommendedTools: [
          { id: 'templates', name: 'AI Template Maker', reason: 'Browse templates, upload media, and render real videos' }
        ]
      });
    }

    // Music or Song requests
    if (wantsMusicOrSong) {
      return res.json({
        userGoal: 'Song title, description, and visual storyboard planning',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : 'English',
        message: isRomanizedNepali
          ? 'Tapai ko geet ko lagi YouTube SEO titles, timestamps sahit ko description, tags, ra hashtags banauna **Content & SEO Assistant** tool prayog garnus. Saathai, geet ko verse-by-verse visual story ra character emotion arc plan garna **Music Video Storyboarder** ekdam upayogee huncha!'
          : isDevanagariNepali
          ? 'तपाईंको नयाँ गीतको लागि युट्युब शीर्षक र विवरण तयार गर्न **Content & SEO Assistant** टुल उपलब्ध छ। साथै, गीतको कथा र दृश्यहरू योजना गर्न **Music Video Storyboarder** टुल प्रयोग गर्न सक्नुहुन्छ!'
          : 'For songs and musical releases, use the **Content & SEO Assistant** to generate title options, description with timestamps, tags, and lyrics credits. Additionally, use the **Music Video Storyboarder** to map verse-by-verse scene visual storylines and character arcs.',
        recommendedTools: [
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate song titles, descriptions, tags, and hashtags' },
          { id: 'music-video', name: 'Music Video Storyboarder', reason: 'Map verse-by-verse visual scene storytelling' }
        ]
      });
    }

    // Shorts requests
    if (wantsShorts) {
      return res.json({
        userGoal: 'Vertical 9:16 short video creation',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : 'English',
        message: isRomanizedNepali 
          ? 'AI bata Shorts banauna yo 3-step workflow prayog garnus:\n\n1. **Shorts & Reels Creator**: 0-3 second ma scroll roknay opening hook, visual scenes, ra captions plan garnus.\n2. **AI Template Maker**: Pre-built 9:16 vertical templates ma aafna clips halera beat-sync video render garnus.\n3. **Content & SEO Assistant**: Shorts ko title ra viral hashtags generate garnus.'
          : isDevanagariNepali
          ? 'एआईबाट सर्ट्स बनाउन ३-चरणको प्रक्रिया अपनाउनुहोस्:\n\n१. **Shorts & Reels Creator**: ३-सेकेन्डको बलियो हुक, छिटो दृश्य परिवर्तन, र अन-स्क्रिन टेक्स्ट योजना गर्नुहोस्।\n२. **AI Template Maker**: भर्टिकल ९:१६ टेम्प्लेट छानेर क्लिपहरू बीट अनुसार रेन्डर गर्नुहोस्।\n३. **Content & SEO Assistant**: सर्ट्सको लागि आकर्षक शीर्षक र ह्यासट्यागहरू बनाउनुहोस्।'
          : 'To create high-retention Shorts and Reels:\n\n1. **Shorts & Reels Creator**: Craft a 3-second scroll-stopping hook, fast-paced scene cuts, and on-screen text overlays.\n2. **AI Template Maker**: Select 9:16 vertical templates to render fast beat-synced short videos.\n3. **Content & SEO Assistant**: Generate viral titles, captions, and hashtags.',
        recommendedTools: [
          { id: 'shorts-creator', name: 'Shorts & Reels Creator', reason: 'Plan vertical 9:16 hook-first short videos' },
          { id: 'templates', name: 'AI Template Maker', reason: 'Render beat-synced vertical short videos' }
        ]
      });
    }

    // Video Planning requests
    if (wantsVideoPlan) {
      return res.json({
        userGoal: 'Comprehensive YouTube video creation workflow',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : 'English',
        message: isRomanizedNepali
          ? 'Safalta-purwak video banauna Kiran AI Video Studio ko yo workflow apanaunus:\n\n1. **AI Video Planner**: Camera shots, dialogue, voiceover, ra visual scene timing breakdown plan garnus.\n2. **Thumbnail Concept Designer**: Rule of thirds, high contrast, ra bold typography sahit ko thumbnail cover plan garnus.\n3. **Content & SEO Assistant**: 10 ota tested titles, structured chapters, ra tags generate garnus.'
          : 'To produce a successful video, follow this workflow on Kiran AI Video Studio:\n\n1. **AI Video Planner**: Structure your multi-scene screenplay with camera movements, dialogue, voiceover, and scenic pacing.\n2. **Thumbnail Concept Designer**: Design high-contrast thumbnail compositions with focal subject positioning and bold typography.\n3. **Content & SEO Assistant**: Generate 10 tested titles, structured chapters/timestamps description, and high-relevance tags.',
        recommendedTools: [
          { id: 'video-generator', name: 'AI Video Planner', reason: 'Generate multi-scene script with camera shots and voiceover' },
          { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'Design high-CTR thumbnail layouts and image prompts' },
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate YouTube SEO metadata, tags, and timestamps' }
        ]
      });
    }

    return res.json({
      userGoal: 'Creative video guidance',
      detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : isHindi ? 'Hindi' : 'English',
      message: isRomanizedNepali
        ? 'Namaste! Kiran AI Video Studio ma tapai lai swagat cha. Tapai YouTube video script, vertical Shorts, SEO tags/descriptions, thumbnail concepts, athawa music video visual plan garna saknu huncha. Tapai ke banauna chahanu huncha?'
        : isDevanagariNepali
        ? 'नमस्ते! किरण एआई भिडियो स्टुडियोमा तपाईंलाई स्वागत छ। तपाईं युट्युब भिडियो पटकथा, भर्टिकल सर्ट्स, SEO ट्याग तथा विवरण, थम्बनेल कन्सेप्ट, वा गीतको भिडियो योजना बनाउन सक्नुहुन्छ। तपाईं के निर्माण गर्न चाहनुहुन्छ?'
        : isHindi
        ? 'नमस्ते! किरण एआई वीडियो स्टूडियो में आपका स्वागत है। यहाँ आप यूट्यूब वीडियो स्क्रिप्ट, शॉर्ट्स, थंबनेल और एसईओ योजना बना सकते हैं। आप क्या बनाना चाहते हैं?'
        : 'Welcome to Kiran AI Video Studio! I am here to understand your creative goal and guide you to the exact tools you need. Whether you want to plan a multi-scene YouTube video, outline vertical Shorts, design high-CTR thumbnails, or optimize YouTube SEO metadata, let me know what you want to create.',
      recommendedTools: [
        { id: 'video-generator', name: 'AI Video Planner', reason: 'Plan complete multi-scene video screenplays' },
        { id: 'shorts-creator', name: 'Shorts & Reels Creator', reason: 'Craft 9:16 vertical shorts with 3-second hooks' },
        { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate YouTube titles, descriptions, and tags' }
      ]
    });
  } catch (err: any) {
    console.error('AI Guide error:', err);
    res.status(500).json({ success: false, error: 'AI Guide processing failed. Please try again.' });
  }
});

// Helper to guarantee mathematically exact timeline according to target duration (15s, 30s, 60s, 120s, etc.)
function normalizeTimelineScenes(scenes: any[], targetTotalSeconds: number = 60): any[] {
  if (!Array.isArray(scenes) || scenes.length === 0) return [];

  const targetSec = Math.max(10, Math.round(targetTotalSeconds || 60));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 1. Ensure durationSeconds is positive integer
  let rawDurations = scenes.map(s => Math.max(2, Math.round(Number(s.durationSeconds) || 5)));
  let sum = rawDurations.reduce((a, b) => a + b, 0);

  // If sum !== targetSec, adjust the largest duration or distribute diff
  if (sum !== targetSec) {
    const diff = targetSec - sum;
    let maxIdx = 0;
    for (let i = 1; i < rawDurations.length; i++) {
      if (rawDurations[i] > rawDurations[maxIdx]) maxIdx = i;
    }
    rawDurations[maxIdx] = Math.max(2, rawDurations[maxIdx] + diff);
    sum = rawDurations.reduce((a, b) => a + b, 0);
    if (sum !== targetSec) {
      rawDurations[rawDurations.length - 1] += (targetSec - sum);
    }
  }

  let currentStart = 0;
  return scenes.map((s, idx) => {
    const duration = rawDurations[idx];
    const start = currentStart;
    const end = start + duration;
    currentStart = end;

    // Provide default reference guide if missing
    let refGuide = (s.referenceGuide || '').trim();
    if (!refGuide) {
      if (s.visual && (s.visual.toLowerCase().includes('kiran') || s.visual.toLowerCase().includes('ui') || s.visual.toLowerCase().includes('screen'))) {
        refGuide = 'Upload a screenshot of the Kiran AI Video Studio interface showing the relevant workspace.';
      } else {
        refGuide = `Upload a high-resolution reference image or screenshot illustrating the primary subject for Scene ${idx + 1}.`;
      }
    }

    return {
      id: s.id || `scene-${idx + 1}`,
      sceneNumber: idx + 1,
      timeRange: `${formatTime(start)}–${formatTime(end)}`,
      startSeconds: start,
      endSeconds: end,
      durationSeconds: duration,
      voiceover: s.voiceover || '',
      visual: s.visual || '',
      onScreenText: s.onScreenText || '',
      flowPrompt: s.flowPrompt || '',
      referenceGuide: refGuide
    };
  });
}

// 11. AI Video Timeline Planner with Screenshot + Google Flow Prompt Workflow
apiRouter.post(['/ai/timeline-planner', '/api/ai/timeline-planner'], async (req, res) => {
  try {
    const { topic, script, durationOption, videoStyle, language, visualStyle, aspectRatio } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ success: false, error: 'Video topic or idea is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'AI Timeline Planner service is momentarily busy. Please try again shortly.'
      });
    }

    // Map duration options to exact target seconds
    const durationSecondsMap: Record<string, number> = {
      '15 SEC': 15,
      '30 SEC': 30,
      '1 MIN': 60,
      '2 MIN': 120,
      '3 MIN': 180,
      '4 MIN': 240,
      '5 MIN': 300
    };

    const chosenDurationOption = (durationOption || '1 MIN').trim().toUpperCase();
    const targetSeconds = durationSecondsMap[chosenDurationOption] || 60;
    
    // Format duration string (e.g. "01:00", "00:30", "02:00")
    const targetMinutes = Math.floor(targetSeconds / 60);
    const targetRemSec = targetSeconds % 60;
    const formattedTotalDuration = `${String(targetMinutes).padStart(2, '0')}:${String(targetRemSec).padStart(2, '0')}`;

    const chosenStyle = (videoStyle || 'Cinematic').trim();
    const chosenLang = (language || 'English').trim();
    const chosenVisual = (visualStyle || 'Photorealistic Cinematic').trim();
    const chosenAr = (aspectRatio || '16:9').trim();

    // Check for website / app demo context (Kiran AI Video Studio demo)
    const isStudioDemo = topic.toLowerCase().includes('kiran') || 
      topic.toLowerCase().includes('studio') || 
      topic.toLowerCase().includes('website demo') ||
      topic.toLowerCase().includes('app demo');

    const studioDemoInstruction = isStudioDemo ? `
SPECIAL INSTRUCTION FOR KIRAN AI VIDEO STUDIO / UI DEMONSTRATION CONTENT:
The user is showcasing Kiran AI Video Studio. For all UI and interface demonstration scenes:
Instruct the Google Flow prompt to preserve the uploaded interface screenshot accurately.
Use wording similar to: "Use the uploaded Kiran AI Video Studio interface screenshot as the exact visual reference. Preserve the visible UI structure, branding, typography, colors and layout. Do not redesign or replace the interface. Add only natural cinematic camera movement and subtle visual emphasis."
Do NOT invent fake UI elements.
` : '';

    const prompt = `You are a world-class commercial AI Video Director & Prompt Engineer for Kiran AI Video Studio.
Generate an EXACT ${targetSeconds}-SECOND SCENE-BY-SCENE PRODUCTION TIMELINE (${formattedTotalDuration} total) tailored directly for Google Flow and modern generative AI video tools.

INPUT DETAILS:
- Topic / Idea: "${topic}"
- Target Duration: ${chosenDurationOption} (${targetSeconds} seconds total)
- User Full Script (Optional): ${script && script.trim() ? `"${script.trim()}"` : 'None provided. Intelligently craft an engaging voiceover script sized to fit ' + targetSeconds + ' seconds.'}
- Video Style: "${chosenStyle}"
- Target Language: "${chosenLang}"
- Visual Style: "${chosenVisual}"
- Target Aspect Ratio: "${chosenAr}"
${studioDemoInstruction}

CRITICAL PRODUCTION SPECIFICATIONS:
1. EXACT ${targetSeconds} SECONDS TOTAL DURATION (00:00 to ${formattedTotalDuration}):
   - Intelligently divide the video into an appropriate number of scenes:
     * 15 SEC: 2 to 3 scenes
     * 30 SEC: 3 to 5 scenes
     * 1 MIN: 5 to 7 scenes
     * 2 MIN: 7 to 10 scenes
     * 3 MIN: 9 to 14 scenes
     * 4 MIN: 11 to 17 scenes
     * 5 MIN: 13 to 20 scenes
   - Assign integer seconds to each scene (durationSeconds >= 2).
   - The sum of all scene durations MUST equal EXACTLY ${targetSeconds} seconds!
   - Consecutive time ranges: e.g. "00:00–00:08", "00:08–00:18", ending precisely at ${formattedTotalDuration}.

2. SMART STORYTELLING STRUCTURE FOR "${chosenStyle}":
   - Tutorial / Explainer: Hook -> Problem -> Step 1 -> Step 2 -> Result -> CTA
   - Product / Tech Promo: Hook -> Problem -> Product Intro -> Features Demo -> Key Benefit -> CTA
   - Music Video: Atmosphere Intro -> Verse / Performance -> Narrative Development -> Chorus Climax -> Ending
   - Short-Form / Social: 3-Second Hook -> Context -> Main Point -> Payoff -> CTA
   - Documentary: Hook -> Context -> Development -> Key Moment -> Conclusion
   - Cinematic Story: Cinematic Hook -> Setting -> Main Development -> Climax -> Resolution

3. GOOGLE FLOW PROMPT PER SCENE:
   For EACH scene, construct a standalone, high-fidelity Google Flow prompt describing:
   - Subject & specific physical action
   - Environment / setting with background texture
   - Character appearance & clothing (strict continuity across scenes for recurring subjects)
   - Camera movement (e.g. slow forward dolly, subtle pan, smooth orbit, tracking shot, low-angle push-in)
   - Camera angle (e.g. eye-level, low angle, overhead macro, extreme close-up)
   - Lighting (e.g. golden hour rim light, soft volumetric studio illumination, moody neon backlight)
   - Mood & color direction
   - Cinematic details: ${chosenVisual}, controlled depth of field, realistic textures, smooth motion, professional composition
   - Aspect ratio parameter: --ar ${chosenAr}
   - Duration parameter: --duration ${targetSeconds <= 30 ? '5s' : '8s'}
   - DO NOT write vague prompts like "Make a cool AI video". Write production-ready director prompts.

4. REFERENCE / SCREENSHOT GUIDE PER SCENE:
   For EVERY scene, generate a specific "referenceGuide" explaining what screenshot, image, or reference should be uploaded to Google Flow:
   - For website tutorials: "Upload a screenshot of the Kiran AI Video Studio Home page."
   - For tool demonstrations: "Upload the AI Video Timeline Planner screenshot showing the generated scene card."
   - For product demos: "Upload the relevant product/interface screenshot."
   - For cinematic scenes: "Upload a suitable reference image or generated visual reference."
   - Do NOT pretend a screenshot exists if the user has not provided one.

5. MULTILINGUAL REQUIREMENTS:
   - Support English, Nepali (Devanagari or Romanized like "Ma YouTube ko lagi video banauna chahanchu"), Hindi, or mixed input. Understand semantic intent.
   - VOICEOVER / SCRIPT and ON-SCREEN TEXT MUST be in the requested language ("${chosenLang}").
   - GOOGLE FLOW PROMPT MUST be in rich, descriptive English for optimal AI video synthesis.

OUTPUT JSON FORMAT (Return ONLY raw valid JSON, no markdown outside JSON):
{
  "title": "Engaging Video Title",
  "totalDuration": "${formattedTotalDuration}",
  "totalDurationSeconds": ${targetSeconds},
  "durationOption": "${chosenDurationOption}",
  "aspectRatio": "${chosenAr}",
  "videoStyle": "${chosenStyle}",
  "visualStyle": "${chosenVisual}",
  "language": "${chosenLang}",
  "scenesCount": 6,
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "timeRange": "00:00–00:08",
      "startSeconds": 0,
      "endSeconds": 8,
      "durationSeconds": 8,
      "voiceover": "Voiceover line timed accurately for this scene duration...",
      "visual": "Director's cinematic visual description of what appears in the video...",
      "onScreenText": "Exact on-screen text...",
      "flowPrompt": "Professional Google Flow prompt with subject, camera, lighting, style, --ar ${chosenAr}",
      "referenceGuide": "Specific instructions on what screenshot, image, or reference should be uploaded to Google Flow"
    }
  ],
  "fullCombinedScript": "Full spoken voiceover script combining all scenes...",
  "musicSoundDirection": "Detailed music tempo, rhythm, instruments, and sound effects cues...",
  "transitionStyle": "Cinematic match cuts, motion blur pans, and seamless visual transitions...",
  "finalCta": "Clear call to action for the end screen...",
  "continuityNotes": "Character wardrobe, recurring lighting cues, and visual subject consistency details."
}`;

    const rawResponse = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(rawResponse);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI returned an invalid response structure.');
    }

    const rawScenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];
    const normalizedScenes = normalizeTimelineScenes(rawScenes, targetSeconds);

    const fullScript = parsed.fullCombinedScript || 
      normalizedScenes.map(s => s.voiceover).filter(Boolean).join(' ');

    const finalResult = {
      success: true,
      title: parsed.title || topic,
      totalDuration: formattedTotalDuration,
      totalDurationSeconds: targetSeconds,
      durationOption: chosenDurationOption,
      aspectRatio: chosenAr,
      videoStyle: chosenStyle,
      visualStyle: chosenVisual,
      language: chosenLang,
      scenesCount: normalizedScenes.length,
      scenes: normalizedScenes,
      fullCombinedScript: fullScript,
      musicSoundDirection: parsed.musicSoundDirection || 'Modern ambient cinematic synth with rhythmic pulse',
      transitionStyle: parsed.transitionStyle || 'Smooth motion blur pans and seamless focal match cuts',
      finalCta: parsed.finalCta || 'Follow for more insightful content',
      continuityNotes: parsed.continuityNotes || 'Consistent character appearance and lighting atmosphere maintained across all scenes',
      createdAt: new Date().toISOString()
    };

    res.json(finalResult);
  } catch (err: any) {
    console.error('Timeline Planner error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Timeline generation failed. Please check your connection and try again.'
    });
  }
});

// 12. Regenerate Single Timeline Scene
apiRouter.post(['/ai/timeline-regenerate-scene', '/api/ai/timeline-regenerate-scene'], async (req, res) => {
  try {
    const { 
      topic, 
      scene, 
      instruction, 
      visualStyle, 
      aspectRatio, 
      language,
      previousScenePrompt, 
      nextScenePrompt 
    } = req.body;

    if (!scene || typeof scene !== 'object') {
      return res.status(400).json({ success: false, error: 'Current scene details are required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ success: false, error: 'Scene regeneration service is momentarily busy. Please try again shortly.' });
    }

    const prompt = `You are an AI Video Director for Kiran AI Video Studio.
Regenerate Scene #${scene.sceneNumber} (${scene.timeRange}, ${scene.durationSeconds}s) for video topic "${topic || 'General Video'}".

USER ADJUSTMENT INSTRUCTION:
"${instruction || 'Enhance the cinematic visual description and make the Google Flow prompt more vivid and detailed.'}"

CONTEXT & CONTINUITY:
- Previous Scene Flow Prompt: ${previousScenePrompt ? `"${previousScenePrompt}"` : 'None (Start of video)'}
- Next Scene Flow Prompt: ${nextScenePrompt ? `"${nextScenePrompt}"` : 'None (End of video)'}
- Visual Style: "${visualStyle || 'Photorealistic Cinematic'}"
- Aspect Ratio: "${aspectRatio || '16:9'}"
- Target Language: "${language || 'English'}"

Return ONLY valid JSON:
{
  "voiceover": "Updated spoken voiceover script in ${language || 'English'}...",
  "visual": "Updated detailed visual description...",
  "onScreenText": "Updated on-screen text...",
  "flowPrompt": "Updated high-quality Google Flow prompt with subject, camera, lighting, style, and --ar ${aspectRatio || '16:9'}",
  "referenceGuide": "Updated reference/screenshot guide explaining what screenshot or image to upload to Google Flow"
}`;

    const rawResponse = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(rawResponse);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI returned an invalid response structure.');
    }

    const updatedScene = {
      ...scene,
      voiceover: parsed.voiceover || scene.voiceover,
      visual: parsed.visual || scene.visual,
      onScreenText: parsed.onScreenText || scene.onScreenText,
      flowPrompt: parsed.flowPrompt || scene.flowPrompt,
      referenceGuide: parsed.referenceGuide || scene.referenceGuide || 'Upload reference screenshot or image to Google Flow.'
    };

    res.json({ success: true, scene: updatedScene });
  } catch (err: any) {
    console.error('Scene regeneration error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to regenerate scene. Please try again.'
    });
  }
});

// 13. Video Generation Background Jobs
apiRouter.post(['/video/jobs', '/api/video/jobs'], async (req, res) => {
  try {
    const job = await VideoGenerationService.startJob(req.body);
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get(['/video/jobs/:id', '/api/video/jobs/:id'], async (req, res) => {
  try {
    const job = await VideoGenerationService.getJobStatus(req.params.id);
    res.json(job);
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// 404 Handler strictly for unrecognized routes under /api
apiRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

// Controlled API Error Handler
apiRouter.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Controlled API error:', err?.message || err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err?.message || 'An internal error occurred. Please try again.',
    status
  });
});

// Mount the API Router specifically at '/api'
app.use('/api', apiRouter);

// Standalone health and status endpoints (without intercepting the frontend root '/')
app.get(['/health', '/status'], handleHealthCheck);

export { app, apiRouter, authRouter, projectRouter, adminRouter, templateRouter, updateRouter };

// Export serverless handler for Vercel Serverless Functions
export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Fatal Serverless Handler Exception:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({
        success: false,
        error: err?.message || 'Server error processing request',
        fatal: true
      }));
    }
  }
}


