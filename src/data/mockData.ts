import { VideoTemplate, Project, Announcement, AdminUsageControl, ConnectedYouTubeChannel } from '../types';

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
    name: 'Romantic Music',
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
    name: 'Sad Music',
    description: 'Melancholic blue hour aesthetic, reflective water droplets, deep solitude and healing.',
    category: 'Music Video',
    aspectRatio: '16:9',
    duration: '2 minutes',
    style: 'Emotional',
    prompt: 'Heartbreaking ballad visualizer, midnight blue lighting, solitary window gaze, nostalgic memories flashing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    status: 'published'
  },
  {
    id: 'tmpl-4',
    name: 'DJ Remix',
    description: 'High-energy club visualizer with neon strobes, heavy bass drops, and rapid tempo transitions.',
    category: 'Dance & DJ',
    aspectRatio: '16:9',
    duration: '90 seconds',
    style: 'Cinematic',
    prompt: 'Electric rave party visuals, cybernetic neon laser grid, festival stage crowds jumping to drops.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    status: 'published'
  },
  {
    id: 'tmpl-5',
    name: 'YouTube Shorts',
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
    id: 'tmpl-6',
    name: 'TikTok Viral Story',
    description: 'Fast-paced storytelling with trendy sound effects, meme cuts, and compelling call-to-action.',
    category: 'Short Form',
    aspectRatio: '9:16',
    duration: '15 seconds',
    style: 'Realistic',
    prompt: 'Relatable lifestyle micro-drama hook, vibrant casual smartphone camera look, quick snap zooms.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579869847556-905149303d7c?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    status: 'published'
  },
  {
    id: 'tmpl-7',
    name: 'Cinematic Story',
    description: 'Widescreen anamorphic color grading, deep character arcs, and atmospheric sound design.',
    category: 'Film & Drama',
    aspectRatio: '16:9',
    duration: '3 minutes',
    style: 'Cinematic',
    prompt: 'High-production cinematic drama with dramatic lighting, shallow depth of field, and orchestral crescendo.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    status: 'published'
  },
  {
    id: 'tmpl-8',
    name: 'Travel Documentary',
    description: 'Breathtaking 4K drone vistas, cultural immersions, and scenic mountain trails.',
    category: 'Travel',
    aspectRatio: '16:9',
    duration: '2 minutes',
    style: 'Travel',
    prompt: 'Panoramic drone flight through the Himalayas, prayer flags fluttering over Namche Bazaar, vibrant culture.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    status: 'published'
  },
  {
    id: 'tmpl-9',
    name: 'Promotional Video',
    description: 'Sleek product showcase with sharp typography, modern motion graphics, and high conversion CTA.',
    category: 'Marketing',
    aspectRatio: '16:9',
    duration: '60 seconds',
    style: '3D',
    prompt: 'High-tech product commercial, glossy reflections, fluid camera spin, compelling value proposition.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    status: 'published'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    userId: 'user-1',
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
    exportedResolution: '1080p',
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
        title: 'Under the Yellow Umbrella',
        description: 'Two pairs of eyes meet under an old pagoda roof sheltering from a sudden cloudburst.',
        visualPrompt: 'Close up eye contact, water dripping from canopy, warm amber backlight, romantic atmosphere.',
        cameraMovement: 'Subtle slow-motion dolly in',
        voiceoverText: 'नबोली पनि हजारौँ कुरा भनिसकेका आँखाहरू...',
        soundEffects: 'Distant temple bell, heartbeat swell',
        musicMood: 'Romantic acoustic fingerpicking',
        previewColor: '#0f172a'
      }
    ]
  },
  {
    id: 'proj-2',
    userId: 'user-1',
    name: 'Top 5 AI Tools in 2026',
    type: 'YouTube Shorts',
    aspectRatio: '9:16',
    duration: '60 seconds',
    style: 'Realistic',
    voice: 'Male',
    language: 'English',
    music: 'AI Background Music',
    ideaPrompt: 'Fast vertical short breaking down top video AI generators with catchy retention hooks.',
    status: 'Exported',
    createdAt: '2026-09-16T10:15:00Z',
    updatedAt: '2026-09-16T10:45:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    exportedResolution: '1080p'
  },
  {
    id: 'proj-3',
    userId: 'user-1',
    name: 'Himalayan Sunrise Time-lapse',
    type: 'Cinematic Video',
    aspectRatio: '16:9',
    duration: '2 minutes',
    style: 'Travel',
    voice: 'No Voice',
    language: 'English',
    music: 'AI Background Music',
    ideaPrompt: 'Golden sunlight breaking through Annapurna peaks with ethereal clouds rolling over the valleys.',
    status: 'Draft',
    createdAt: '2026-09-16T19:00:00Z',
    updatedAt: '2026-09-16T19:00:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to Kiran AI Video Studio v2.4',
    message: 'New multi-track timeline, instant YouTube SEO Assistant, and 9:16 Shorts Generator are now live for all creators!',
    type: 'success',
    isActive: true,
    startDate: '2026-09-01',
    endDate: '2026-10-01'
  },
  {
    id: 'ann-2',
    title: '4K Export & Modular Rendering Update',
    message: 'High-bitrate 4K rendering profiles are now available on Pro tier. Connect your custom GPU or cloud rendering provider anytime.',
    type: 'info',
    isActive: true,
    startDate: '2026-09-10',
    endDate: '2026-10-15'
  }
];

export const DEFAULT_USAGE_CONTROL: AdminUsageControl = {
  dailyAIGenerations: 50,
  monthlyAIGenerations: 500,
  maxVideoDurationSec: 180,
  maxExportResolution: '4K',
  maxProjectCount: 100,
  storageLimitMB: 5120,
  shortsGenerationLimit: 120
};

export interface StudioTemplateItem {
  id: string;
  title: string;
  category: any;
  aspectRatio: '16:9' | '9:16' | '1:1';
  duration: string;
  description: string;
  samplePrompt: string;
  thumbnailUrl: string;
}

export const STUDIO_TEMPLATES: StudioTemplateItem[] = [
  {
    id: 'tpl-romantic',
    title: 'Monsoon Love in Kathmandu',
    category: 'Romantic Video',
    aspectRatio: '16:9',
    duration: '3 minutes',
    description: 'Cinematic romantic story set in Kathmandu with traditional melodies, rain-soaked streets, and soulful ambiance.',
    samplePrompt: 'Create a cinematic Nepali romantic music video about two people meeting in Kathmandu during rain with acoustic Sarangi elements.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-music',
    title: 'Soulful Acoustic Music Video',
    category: 'Music Video',
    aspectRatio: '16:9',
    duration: '2 minutes',
    description: 'Warm golden hour visuals, slow-motion emotional glances, and heartfelt poetry.',
    samplePrompt: 'An acoustic ballad music video with warm golden hour backlighting, guitar close-ups, and emotional gaze.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-shorts',
    title: 'Viral 3-Second Retention Short',
    category: 'YouTube Shorts',
    aspectRatio: '9:16',
    duration: '30 seconds',
    description: 'Punchy 9:16 vertical hook within 3 seconds, dynamic auto-captions, and high-retention pacing.',
    samplePrompt: 'Top 3 Visual Editing Tricks for Viral Retention in 2026 with bold Alex Hormozi animated pop captions.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-motivational',
    title: 'From Struggle to Mountain Peak',
    category: 'Motivational Story',
    aspectRatio: '16:9',
    duration: '2 minutes',
    description: 'Inspirational narrative documenting perseverance, early morning discipline, and ultimate victory.',
    samplePrompt: 'A motivational mini-documentary about an athlete training through harsh winters before reaching the summit.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-business',
    title: 'SaaS Platform Commercial',
    category: 'Business Ad',
    aspectRatio: '16:9',
    duration: '60 seconds',
    description: 'High-converting video advertisement with problem-solution framework and clear call to action.',
    samplePrompt: 'A sleek tech commercial showcasing how modern creative teams save 10 hours a week with AI video automation.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-product',
    title: 'Luxury Watch Showcase',
    category: 'Product Promo',
    aspectRatio: '16:9',
    duration: '30 seconds',
    description: 'Ultra high-definition macro lens shots with dynamic studio lighting and smooth pedestal sweeps.',
    samplePrompt: 'Cinematic 3D macro promo highlighting precision mechanical craftsmanship, sapphire crystal reflections, and titanium finish.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-travel',
    title: 'Himalayan Sunrise Odyssey',
    category: 'Cinematic Travel',
    aspectRatio: '16:9',
    duration: '2 minutes',
    description: 'Breathtaking 4K drone sweeps across snow-capped Annapurna peaks and terraced green hills.',
    samplePrompt: 'An epic travel cinematic through Nepal: bustling Kathmandu stupas, peaceful Pokhara lake reflections, and majestic Annapurna peaks.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-news',
    title: 'Tech Breakdown & Explainer',
    category: 'News / Explainer',
    aspectRatio: '16:9',
    duration: '90 seconds',
    description: 'Clear graphics-driven educational video with animated lower thirds, diagrams, and concise narration.',
    samplePrompt: 'An engaging explainer analyzing how generative video engines will transform social media storytelling in 2026.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-folk',
    title: 'Nepali Folk Lok Dohori Modern Beat',
    category: 'Nepali Folk / Modern Song Concept',
    aspectRatio: '16:9',
    duration: '3 minutes',
    description: 'Vibrant cultural tapestry featuring traditional Nepali instruments with contemporary cinematic grade.',
    samplePrompt: 'A lively Nepali folk celebration video in a rural village with Madal rhythm, colorful traditional attire, and joyous dancing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'tpl-dj',
    title: 'Neon Cyberpunk DJ Remix Visualizer',
    category: 'DJ Remix Visualizer',
    aspectRatio: '16:9',
    duration: '90 seconds',
    description: 'Audio-reactive neon strobe visuals, heavy sub-bass pulses, and fast EDM club lighting.',
    samplePrompt: 'Futuristic EDM club visualizer with glowing neon equalizers, heavy bass wobble ripples, and lasers flashing to 130 BPM.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
  }
];

export const DEFAULT_ADMIN_YT_CHANNEL: ConnectedYouTubeChannel = {
  id: 'yt-kiranaimusic-94',
  channelName: 'Kiran AI Music',
  handle: '@kiranaimusic-94',
  url: 'https://youtube.com/@kiranaimusic-94?si=mTfia-Y4ZdAQqOFl',
  shareUrl: 'https://youtube.com/@kiranaimusic-94',
  description: 'Official AI Music Production, Nepali Beats & Cinematic Soundscapes YouTube channel for Kiran AI Video Studio.',
  avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
  verifiedAdmin: true,
  connectedEmail: 'kiranchaulagain094@gmail.com',
  connectedAt: '2026-09-18T09:25:00Z',
  category: 'AI Music & Video Productions',
  subscribersCount: 'Verified Creator',
  videosCount: 'Official Catalog',
  status: 'Connected',
  featuredPlaylists: [
    { title: 'Nepali AI Music & Folk Fusion', count: 12 },
    { title: 'Cinematic Visualizers & Lo-Fi Beats', count: 8 },
    { title: 'High Energy DJ Remixes & Shorts', count: 16 }
  ]
};


