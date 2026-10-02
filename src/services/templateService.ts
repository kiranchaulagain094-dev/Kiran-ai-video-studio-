import { DbTemplate, Project } from '../types';

export const FALLBACK_DB_TEMPLATES: DbTemplate[] = [
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

export class TemplateService {
  /**
   * Fetch all published templates from database with resilient fallback
   */
  static async getTemplates(category?: string, featured?: boolean): Promise<DbTemplate[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') {
        params.append('category', category);
      }
      if (featured) {
        params.append('featured', 'true');
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/templates${queryString}`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
          return data.templates;
        }
      }
    } catch (err: any) {
      console.warn('TemplateService getTemplates network notice:', err?.message || err);
    }

    // Fallback to rich default templates
    let list = FALLBACK_DB_TEMPLATES;
    if (category && category !== 'All') {
      list = list.filter((t) => t.category === category);
    }
    if (featured) {
      list = list.filter((t) => t.is_featured);
    }
    return list;
  }

  /**
   * Fetch single template by ID
   */
  static async getTemplate(id: string): Promise<DbTemplate | null> {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.template) {
          return data.template;
        }
      }
    } catch (err) {
      console.warn('TemplateService getTemplate notice:', err);
    }
    return FALLBACK_DB_TEMPLATES.find((t) => t.id === id) || null;
  }

  /**
   * Initialize a project using a template
   */
  static async useTemplate(id: string): Promise<{ template: DbTemplate; project: Project }> {
    const res = await fetch(`/api/templates/${id}/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to use template (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      template: data.template,
      project: data.project
    };
  }

  /**
   * Deterministic Video Rendering Pipeline
   */
  static async renderTemplate(params: {
    templateId: string;
    title: string;
    mediaItems: Array<{ slotIndex: number; url: string; type: string; label?: string }>;
  }): Promise<{ project: Project; renderSummary: any }> {
    const res = await fetch('/api/templates/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to render video template (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      project: data.project,
      renderSummary: data.renderSummary
    };
  }
}
