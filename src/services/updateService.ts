import { StudioUpdate } from '../types';

export class UpdateService {
  /**
   * Fetch newest pinned/published update for Home page banner
   */
  static async getLatestUpdate(): Promise<StudioUpdate | null> {
    try {
      const res = await fetch('/api/updates/latest');
      if (!res.ok) return null;
      const data = await res.json();
      return data.success && data.update ? data.update : null;
    } catch (err) {
      console.warn('UpdateService getLatestUpdate notice:', err);
      return null;
    }
  }

  /**
   * Fetch all published updates
   */
  static async getPublishedUpdates(): Promise<StudioUpdate[]> {
    try {
      const res = await fetch('/api/updates');
      if (!res.ok) return [];
      const data = await res.json();
      return data.success && Array.isArray(data.updates) ? data.updates : [];
    } catch (err) {
      console.warn('UpdateService getPublishedUpdates notice:', err);
      return [];
    }
  }
}
