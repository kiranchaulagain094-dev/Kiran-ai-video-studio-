import { extractSessionCredentials, validateSession } from '../../server/auth';
import { query } from '../../server/db';
import { Project, ProjectStatus } from '../../src/types';

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

  const id = req.query?.id || (req.url ? req.url.split('/').pop()?.split('?')[0] : '');

  // PUT: Update project
  if (req.method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }

      // Check ownership
      const check = await query<any>(`SELECT id FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1`, [id, user.id]);
      if (check.length === 0) {
        if (typeof res.status === 'function') {
          return res.status(404).json({ success: false, error: 'Project not found or unauthorized.' });
        }
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: 'Project not found or unauthorized.' }));
      }

      const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
      const params: any[] = [];
      let idx = 1;

      if (body.name !== undefined || body.title !== undefined) {
        updates.push(`title = $${idx++}`);
        params.push(body.name || body.title);
      }
      if (body.description !== undefined || body.ideaPrompt !== undefined) {
        updates.push(`description = $${idx++}`);
        params.push(body.description || body.ideaPrompt);
      }
      if (body.status !== undefined) {
        updates.push(`status = $${idx++}`);
        params.push(frontendToDbStatus(body.status));
      }
      if (body.thumbnailUrl !== undefined) {
        updates.push(`thumbnail_url = $${idx++}`);
        params.push(body.thumbnailUrl);
      }
      if (body.videoUrl !== undefined) {
        updates.push(`video_url = $${idx++}`);
        params.push(body.videoUrl);
      }
      if (body.fullScript !== undefined || body.script !== undefined) {
        updates.push(`script = $${idx++}`);
        params.push(body.fullScript || body.script);
      }
      if (body.scenes !== undefined) {
        updates.push(`scenes = $${idx++}`);
        params.push(JSON.stringify(body.scenes));
      }

      params.push(id);
      params.push(user.id);
      const sqlText = `UPDATE projects SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx++} RETURNING *`;
      const updated = await query<any>(sqlText, params);

      const saved = mapRowToProject(updated[0]);
      if (typeof res.status === 'function') {
        return res.status(200).json({ success: true, project: saved });
      }
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, project: saved }));
    } catch (err: any) {
      if (typeof res.status === 'function') {
        return res.status(500).json({ success: false, error: err?.message || 'Update failed.' });
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: err?.message || 'Update failed.' }));
    }
  }

  // DELETE: Delete project
  if (req.method === 'DELETE') {
    try {
      const delRes = await query(`DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`, [id, user.id]);
      if (delRes.length === 0) {
        if (typeof res.status === 'function') {
          return res.status(404).json({ success: false, error: 'Project not found.' });
        }
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: 'Project not found.' }));
      }
      if (typeof res.status === 'function') {
        return res.status(200).json({ success: true, message: 'Deleted successfully.' });
      }
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, message: 'Deleted successfully.' }));
    } catch (err: any) {
      if (typeof res.status === 'function') {
        return res.status(500).json({ success: false, error: err?.message || 'Delete failed.' });
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: err?.message || 'Delete failed.' }));
    }
  }

  if (typeof res.status === 'function') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  res.statusCode = 405;
  return res.end('Method Not Allowed');
}
