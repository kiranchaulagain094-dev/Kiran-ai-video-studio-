import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

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
      throw new Error('Video generation is currently unavailable because no Gemini API key is configured. Please configure GEMINI_API_KEY in your .env file or settings.');
    }

    if (apiKey === 'YOUR_GEMINI_API_KEY' || apiKey === 'YOUR_VEO_API_KEY') {
      throw new Error('Placeholder API key detected. Please replace it with a valid credential.');
    }

    const jobId = 'vjob-' + Date.now();
    const job: VideoJob = {
      id: jobId,
      projectId: 'proj-' + Date.now(),
      status: 'queued',
      progress: 0,
      currentScene: 0,
      totalScenes: 1, // First step: test single 8-second generation
      provider: 'Veo 3.1 (Google Gemini)',
    };
    
    activeJobs.set(jobId, job);
    
    // Kick off background processing
    this.processJob(jobId, params, apiKey).catch(err => {
      
      const j = activeJobs.get(jobId);
      if (j) {
        j.status = 'failed';
        j.error = err.message;
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
          model: 'gemini-3.6-flash',
          contents: scriptPrompt
        });
        if (scriptResponse.text) {
          visualPrompt = scriptResponse.text;
        }
      } catch (scriptErr: any) {
        console.log('Script enhancement failed (likely quota), falling back to raw prompt.');
        // Fallback to raw prompt if flash model hits quota
        visualPrompt = params.idea;
      }

      // 2. Rendering Stage
      job.status = 'rendering';
      job.progress = 20;
      job.projectData = {
        fullScript: visualPrompt,
        scenes: [{ sceneNumber: 1, description: visualPrompt, visualPrompt: visualPrompt, timeRange: '0:00 - 0:08' }]
      };

      console.log(`Starting Veo 3.1 generation for job ${jobId} with prompt: ${visualPrompt}`);

      // Wait 10 seconds before polling to avoid early quota errors, though op is returned immediately usually.
      let op = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        source: {
          prompt: visualPrompt
        },
        config: {
          numberOfVideos: 1
        }
      });
      
      job.progress = 30;

      // Poll until done
      while (!op.done) {
        await new Promise(r => setTimeout(r, 10000));
        console.log(`Polling job ${jobId}...`);
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
        console.log(`Job ${jobId} completed successfully!`);
      } else {
        throw new Error('No video was generated by the API.');
      }
      
    } catch (err: any) {
      
      job.status = 'failed';
      // Provide a clean error message for the UI
      if (err.status === 429 || (err.message && err.message.includes('429'))) {
        job.error = 'API Quota Exceeded for Veo Generation. Please check your Gemini API plan.';
      } else {
        job.error = err.message || 'Unknown error during video generation.';
      }
    }
  }
}
