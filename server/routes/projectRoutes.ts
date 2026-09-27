import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../auth';
import { query, isDbConfigured } from '../db';
import { Project, ProjectStatus } from '../../src/types';

const router = express.Router();

// Helper to map DB project_status enum to frontend ProjectStatus
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

// Helper to map frontend ProjectStatus to DB project_status enum
function frontendToDbStatus(feStatus?: string): string {
  switch (feStatus?.toLowerCase()) {
    case 'generating':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'exported':
      return 'rendered';
    case 'failed':
      return 'draft'; // fallback to draft in db enum
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

/**
 * GET /api/projects
 * Fetches all projects for the currently authenticated user
 */
router.get(['/', '/api/projects'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Database is not configured. DATABASE_URL is required to load user projects.'
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
      error: 'Failed to retrieve projects from database.'
    });
  }
});

/**
 * POST /api/projects
 * Creates a new project in Neon belonging to the authenticated user
 */
router.post(['/', '/api/projects'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Database is not configured. DATABASE_URL is required to save projects.'
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
    // Upsert project
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

/**
 * PUT /api/projects/:id
 * Updates an existing project owned by the user
 */
router.put(['/:id', '/api/projects/:id'], requireAuth, async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Database is not configured. DATABASE_URL is required to update projects.'
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

/**
 * DELETE /api/projects/:id
 * Deletes a project owned by the user
 */
router.delete(['/:id', '/api/projects/:id'], requireAuth, async (req: Request, res: Response) => {
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

export default router;
