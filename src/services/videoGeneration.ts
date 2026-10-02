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

export class VideoGenerationService {
  /**
   * Starts a new video generation job via the secure server proxy.
   */
  static async startJob(params: any): Promise<VideoJob> {
    const res = await fetch('/api/video/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to start video generation job');
    }
    return await res.json();
  }

  /**
   * Retrieves the current status of an active video generation job.
   */
  static async getJobStatus(jobId: string): Promise<VideoJob> {
    const res = await fetch(`/api/video/jobs/${encodeURIComponent(jobId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to get job status');
    }
    return await res.json();
  }
}
