import { VideoTemplate, Project } from '../types';

export interface StudioTemplateItem {
  id: string;
  title: string;
  category: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  duration: string;
  description: string;
  samplePrompt: string;
  thumbnailUrl: string;
}

export const INITIAL_TEMPLATES: VideoTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Nepali Music Video',
    description: 'Cinematic romantic story set in Kathmandu with traditional melodies, rain-soaked streets, and soulful ambiance.',
    category: 'Music Video',
    aspectRatio: '16:9',
    duration: '3 minutes',
    style: 'Romantic',
    prompt: 'Cinematic Nepali romantic music video about two lovers reconnecting in historic Patan and Kathmandu during gentle monsoon rain with acoustic Sarangi elements.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    status: 'published'
  },
  {
    id: 'tmpl-2',
    name: 'Romantic Acoustic Story',
    description: 'Warm golden hour visuals, slow-motion emotional glances, and heartfelt poetry.',
    category: 'Music Video',
    aspectRatio: '16:9',
    duration: '2 minutes',
    style: 'Romantic',
    prompt: 'Emotional romance narrative, sunset backlight, tender eye contact, acoustic guitar rhythms.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    status: 'published'
  },
  {
    id: 'tmpl-3',
    name: 'High-Retention YouTube Short',
    description: 'Punchy 9:16 vertical hook within 3 seconds, dynamic auto-captions, and high-retention pacing.',
    category: 'Short Form',
    aspectRatio: '9:16',
    duration: '30 seconds',
    style: 'Realistic',
    prompt: 'High-retention viral YouTube Shorts explaining a mind-blowing creative hack with bold animated typography.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    status: 'published'
  },
  {
    id: 'tmpl-4',
    name: 'Travel Documentary',
    description: 'Cinematic mountain vistas, cultural immersions, and scenic mountain trails.',
    category: 'Travel',
    aspectRatio: '16:9',
    duration: '2 minutes',
    style: 'Travel',
    prompt: 'Panoramic drone flight through the Himalayas, prayer flags fluttering over Namche Bazaar, vibrant culture.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    status: 'published'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    userId: 'local-creator',
    name: 'Kathmandu Monsoon Romance',
    type: 'Music Video',
    aspectRatio: '16:9',
    duration: '3 minutes',
    style: 'Romantic',
    voice: 'Custom',
    language: 'Nepali',
    music: 'AI Background Music',
    ideaPrompt: 'Create a cinematic Nepali romantic music video about two people meeting in Kathmandu during rain.',
    status: 'Completed',
    createdAt: '2026-09-15T14:30:00Z',
    updatedAt: '2026-09-15T15:10:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    scenes: [
      {
        id: 'sc-1',
        sceneNumber: 1,
        timeRange: '0:00 - 0:30',
        title: 'Rain Over Durbar Square',
        description: 'Slow motion rain falling on red brick pavement, ancient temple silhouettes in misty fog.',
        visualPrompt: 'Cinematic wide shot of Kathmandu historic square in monsoon downpour, glowing warm shop lanterns.',
        cameraMovement: 'Slow tracking crane down',
        voiceoverText: 'मनको कुनामा कतै तिम्रै सम्झना सल्बलाई रह्यो...',
        soundEffects: 'Gentle monsoon thunder, umbrella rain patter',
        musicMood: 'Acoustic Sarangi and subtle cello',
        previewColor: '#1e293b'
      },
      {
        id: 'sc-2',
        sceneNumber: 2,
        timeRange: '0:30 - 1:15',
        title: 'Under the Pagoda Canopy',
        description: 'Two pairs of eyes meet under an old pagoda roof sheltering from a sudden cloudburst.',
        visualPrompt: 'Close up eye contact, water dripping from canopy, warm amber backlight, romantic atmosphere.',
        cameraMovement: 'Subtle slow-motion dolly in',
        voiceoverText: 'नबोली पनि हजारौँ कुरा भनिसकेका आँखाहरू...',
        soundEffects: 'Distant temple bell, heartbeat swell',
        musicMood: 'Romantic acoustic fingerpicking',
        previewColor: '#0f172a'
      }
    ]
  }
];

export const STUDIO_TEMPLATES: StudioTemplateItem[] = [
  {
    id: 'st-1',
    title: 'Cinematic Nepali Romance',
    category: 'Nepali Folk / Modern Song Concept',
    aspectRatio: '16:9',
    duration: '3 minutes',
    description: 'Soulful acoustic narrative set across rain-slicked heritage squares and mountain valleys.',
    samplePrompt: 'Cinematic Nepali romantic ballad about two estranged friends reuniting in Kathmandu during twilight monsoon rain.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-2',
    title: 'High-Retention 3-Second Short',
    category: 'YouTube Shorts',
    aspectRatio: '9:16',
    duration: '30 seconds',
    description: 'Fast vertical hook designed to maximize first-3-second retention on Shorts and Reels.',
    samplePrompt: 'Stop scrolling! Here are the 3 visual editing secrets that double video retention in 2026.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-3',
    title: 'Himalayan Mountain Odyssey',
    category: 'Cinematic Travel',
    aspectRatio: '16:9',
    duration: '2 minutes',
    description: 'Aerial drone vistas, prayer flag time-lapses, and atmospheric mountain soundscapes.',
    samplePrompt: 'Cinematic high-altitude travel documentary through Annapurna and Everest base trails with morning golden light.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-4',
    title: 'Tech Breakdown / Explainer',
    category: 'News / Explainer',
    aspectRatio: '16:9',
    duration: '90 seconds',
    description: 'Structured educational explainer with clear step-by-step breakdown and visual cues.',
    samplePrompt: 'How AI language and video models process multi-modal tokens explained simply in 90 seconds.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
  }
];
