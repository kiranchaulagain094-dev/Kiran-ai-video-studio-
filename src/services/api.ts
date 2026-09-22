import { 
  Project, 
  VideoTemplate, 
  AIContentPack,
  ShortsGenerationPlan,
  ThumbnailConcept,
  VideoScene,
  AIGuideResponse
} from '../types';

import { INITIAL_PROJECTS, INITIAL_TEMPLATES } from '../data/mockData';

const STORAGE_KEYS = {
  PROJECTS: 'kiran_studio_projects',
  TEMPLATES: 'kiran_studio_templates'
};

export class StudioApiService {
  // Local storage helpers
  private static getStored<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Local storage write error:', e);
    }
  }

  // Projects CRUD with Local Storage Persistence
  static getProjects(): Project[] {
    return this.getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  static saveProject(project: Project): Project {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    let updated: Project[];
    if (existingIndex >= 0) {
      updated = [...projects];
      updated[existingIndex] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...projects];
    }
    this.setStored(STORAGE_KEYS.PROJECTS, updated);
    return project;
  }

  static deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.setStored(STORAGE_KEYS.PROJECTS, projects);
  }

  static duplicateProject(id: string): Project | null {
    const projects = this.getProjects();
    const original = projects.find(p => p.id === id);
    if (!original) return null;
    const duplicated: Project = {
      ...original,
      id: 'proj-' + Date.now(),
      name: `${original.name} (Copy)`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveProject(duplicated);
    return duplicated;
  }

  // Templates
  static getTemplates(): VideoTemplate[] {
    return this.getStored<VideoTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  }

  // Server API calls with clear error reporting
  private static async parseError(res: Response, defaultMessage: string): Promise<string> {
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const err = typeof data.error === 'string' ? data.error : '';
          const details = typeof data.details === 'string' ? data.details : '';
          if (err && details) return `${err} ${details}`;
          if (err) return err;
          if (details) return details;
          if (typeof data.message === 'string') return data.message;
        }
      }
      const text = await res.text();
      if (text && !text.includes('<!DOCTYPE') && text.length < 200) {
        return text.trim();
      }
    } catch {
      // Fallback
    }
    return `${defaultMessage} (Status ${res.status})`;
  }

  static async generateVideoPlan(params: {
    name: string;
    idea: string;
    type: string;
    aspectRatio: string;
    duration: string;
    style: string;
    voice: string;
    language: string;
    music: string;
  }): Promise<{ summary: string; fullScript: string; scenes: VideoScene[] }> {
    const res = await fetch('/api/ai/video-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorMsg = await this.parseError(res, 'Failed to generate video plan');
      throw new Error(errorMsg);
    }
    return await res.json();
  }

  static async generateShortsPlan(params: {
    topic: string;
    hook?: string;
    script?: string;
    visualStyle?: string;
    voice?: string;
    music?: string;
    captionStyle?: string;
  }): Promise<ShortsGenerationPlan> {
    const res = await fetch('/api/ai/shorts-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorMsg = await this.parseError(res, 'Failed to generate Shorts plan');
      throw new Error(errorMsg);
    }
    return await res.json();
  }

  static async generateContentAssistant(params: {
    prompt: string;
    videoType?: string;
    targetAudience?: string;
    language?: string;
    mainKeyword?: string;
  }): Promise<AIContentPack> {
    const res = await fetch('/api/ai/content-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorMsg = await this.parseError(res, 'Failed to generate content pack');
      throw new Error(errorMsg);
    }
    return await res.json();
  }

  static async generateThumbnailConcept(params: {
    idea: string;
    title?: string;
    style?: string;
    aspectRatio?: '16:9' | '9:16';
  }): Promise<ThumbnailConcept> {
    const res = await fetch('/api/ai/thumbnail-concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorMsg = await this.parseError(res, 'Failed to generate thumbnail concept');
      throw new Error(errorMsg);
    }
    return await res.json();
  }

  static async askAIGuide(params: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }): Promise<AIGuideResponse> {
    const res = await fetch('/api/ai/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorMsg = await this.parseError(res, 'Failed to reach AI Website Guide');
      throw new Error(errorMsg);
    }
    return await res.json();
  }
}
