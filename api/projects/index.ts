import { extractSessionCredentials, validateSession } from '../../server/auth.ts';
import { query, isDbConfigured } from '../../server/db.ts';
import type { Project, ProjectStatus } from '../../src/types/index.ts';

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
    scenesCount: row.scenes_count || 3,
    quality: row.quality || '1080p Full HD',
    script: row.script || '',
    scenes: Array.isArray(row.scenes) ? row.scenes : []
  };
}

export default async function handler(req: any, res: any) {
  // 1. Authenticate user
  const creds = extractSessionCredentials(req);
  if (!creds) {
    if (typeof res.status === 'function') {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Authentication required.' }));
  }

  const user = await validateSession(creds.sessionId, creds.token);
  if (!user) {
    if (typeof res.status === 'function') {
      return res.status(401).json({ success: false, error: 'Session expired. Please sign in again.' });
    }
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Session expired. Please sign in again.' }));
  }

  // 2. GET: List user projects
  if (req.method === 'GET') {
    try {
      const rows = await query<any>(
        `SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
        [user.id]
      );
      const projects = rows.map(mapRowToProject);
      if (typeof res.status === 'function') {
        return res.status(200).json({ success: true, projects });
      }
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, projects }));
    } catch (err: any) {
      if (typeof res.status === 'function') {
        return res.status(500).json({ success: false, error: err?.message || 'Database error fetching projects.' });
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: err?.message || 'Database error fetching projects.' }));
    }
  }

  // 3. POST: Create new project
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }

      const id = body.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const title = (body.name || body.title || 'Untitled Project').trim();
      const desc = body.description || body.ideaPrompt || '';
      const type = body.type || 'YouTube Video';
      const aspectRatio = body.aspectRatio || '16:9';
      const duration = body.duration || '60 seconds';
      const status = frontendToDbStatus(body.status);
      const thumb = body.thumbnailUrl || null;
      const video = body.videoUrl || null;
      const tags = Array.isArray(body.tags) ? body.tags : ['AI Video'];
      const scenesCount = Number(body.scenesCount) || (Array.isArray(body.scenes) ? body.scenes.length : 3);
      const quality = body.quality || '1080p Full HD';
      const script = body.fullScript || body.script || '';
      const scenes = JSON.stringify(Array.isArray(body.scenes) ? body.scenes : []);
      const style = body.style || 'Cinematic';
      const voice = body.voice || 'Female';
      const language = body.language || 'English';
      const music = body.music || 'AI Background Music';
      const ideaPrompt = body.ideaPrompt || '';

      const inserted = await query<any>(
        `INSERT INTO projects (
          id, user_id, title, description, type, aspect_ratio, duration, status, 
          thumbnail_url, video_url, tags, scenes_count, quality, script, scenes, 
          style, voice, language, music, idea_prompt, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 
          $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          id, user.id, title, desc, type, aspectRatio, duration, status,
          thumb, video, tags, scenesCount, quality, script, scenes,
          style, voice, language, music, ideaPrompt
        ]
      );

      const saved = mapRowToProject(inserted[0]);
      if (typeof res.status === 'function') {
        return res.status(201).json({ success: true, project: saved });
      }
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, project: saved }));
    } catch (err: any) {
      if (typeof res.status === 'function') {
        return res.status(500).json({ success: false, error: err?.message || 'Database error saving project.' });
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: err?.message || 'Database error saving project.' }));
    }
  }

  if (typeof res.status === 'function') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  res.statusCode = 405;
  return res.end('Method Not Allowed');
}
