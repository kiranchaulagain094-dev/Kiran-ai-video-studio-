export interface StudioTool {
  id: string;
  name: string;
  badge?: string;
  route: string;
  shortDescription: string;
  detailedPurpose: string;
  howToUse: string;
  expectedResult: string;
  keywords: string[];
}

// Single Source of Truth for all active, real tools on Kiran AI Video Studio
export const CURRENT_STUDIO_TOOLS: StudioTool[] = [
  {
    id: 'video-generator',
    name: 'AI Video Planner',
    badge: 'AI Planner',
    route: 'video-generator',
    shortDescription: 'Multi-scene screenplay & script planner with timing brackets, camera movements, dialogue, voiceover, sound cues, and visual prompts.',
    detailedPurpose: 'Plans comprehensive long-form videos and screenplays scene-by-scene for documentaries, YouTube videos, tutorials, travel vlogs, and narrative films.',
    howToUse: 'Enter your video topic, select duration (e.g. 1-3 minutes), visual style (e.g. Cinematic, Realistic), and language, then click Generate Plan.',
    expectedResult: 'A complete multi-scene screenplay breakdown with exact timestamps, camera angles, voiceover lines, and visual prompts ready for shooting or animating.',
    keywords: ['video', 'script', 'screenplay', 'scene', 'camera', 'voiceover', 'youtube video', 'documentary', 'tourism', 'vlog', 'story', 'visual prompt', 'film', 'shot', 'long form', 'katha', 'video banaune']
  },
  {
    id: 'timeline-planner',
    name: 'AI Video Timeline Planner',
    badge: 'Flow Ready',
    route: 'timeline-planner',
    shortDescription: 'Scene-by-scene video timeline planner (15s to 5m) with copyable Google Flow prompts, exact duration math, and screenshot upload guides.',
    detailedPurpose: 'Generates structured video production timelines with exact time brackets, voiceover lines, on-screen text, screenshot/reference upload guides, and production prompts for Google Flow.',
    howToUse: 'Enter video idea or script, select duration (15s, 30s, 1m, 2m, 3m, 4m, 5m), style, and language, then click Generate Timeline. Use Screenshot Mode or copy prompts directly into Google Flow.',
    expectedResult: 'Exact-duration scene cards with copyable Flow prompts, screenshot reference guides, in-place editing, and 📸 Screenshot Mode.',
    keywords: ['flow', 'google flow', 'timeline', 'scene by scene', '1-min', '1 minute', 'screenshot mode', 'reference guide', 'flow prompt', 'video timeline', 'production plan', 'scene cards']
  },
  {
    id: 'shorts-creator',
    name: 'Shorts & Reels Creator',
    badge: '9:16 Vertical',
    route: 'shorts-creator',
    shortDescription: '9:16 vertical video storyboarder and pacing strategist with 3-second hook scripts, rapid scene cuts, on-screen text, and caption copy.',
    detailedPurpose: 'Designed specifically for high-retention vertical short-form videos on YouTube Shorts, Instagram Reels, and TikTok.',
    howToUse: 'Input your short topic or hook idea, choose visual style and music mood, and generate a 15-60 second rapid cut plan.',
    expectedResult: 'A hook-first vertical video script with second-by-second on-screen text overlays, camera angles, and viral-ready caption text.',
    keywords: ['shorts', 'short', 'reel', 'reels', 'tiktok', 'vertical', '9:16', 'hook', 'viral short', 'short video', 'choto video']
  },
  {
    id: 'content-assistant',
    name: 'Content & SEO Assistant',
    badge: 'SEO Pack',
    route: 'content-assistant',
    shortDescription: 'YouTube SEO and metadata optimizer. Generates 5 high-CTR titles, structured descriptions with chapters/timestamps, tags, hashtags, and objective 0-100 SEO scoring.',
    detailedPurpose: 'Optimizes video metadata to align with YouTube search intent, improve click-through rates, and provide structured video chapters.',
    howToUse: 'Enter your video topic, target keywords, and language, then click Generate SEO Pack.',
    expectedResult: '5 alternative titles, copy-ready YouTube description with timestamps, comma-separated tags, hashtags, and a detailed 7-point SEO score breakdown.',
    keywords: ['seo', 'title', 'titles', 'description', 'tag', 'tags', 'hashtag', 'hashtags', 'keywords', 'timestamps', 'chapters', 'metadata', 'youtube seo', 'search', 'rank', 'nam', 'bibaran']
  },
  {
    id: 'thumbnail-maker',
    name: 'Thumbnail Concept Designer',
    badge: 'CTR Design',
    route: 'thumbnail-maker',
    shortDescription: 'High-CTR YouTube thumbnail composition architect with rule-of-thirds visual hierarchy, emotional focal points, bold headline text, and AI image prompts.',
    detailedPurpose: 'Helps creators design compelling, high-contrast video covers that maximize viewer curiosity and click-through rate.',
    howToUse: 'Provide your video idea, optional headline text, and chosen style (e.g. Viral, Minimalist, Cinematic), then generate thumbnail concepts.',
    expectedResult: 'Visual layout guidelines (subject positioning, rule of thirds), color palette, bold headline text ideas, and copy-ready AI image generator prompts.',
    keywords: ['thumbnail', 'thumbnails', 'cover', 'ctr', 'image prompt', 'poster', 'thumbnail idea', 'photo', 'design', 'tasbir']
  },
  {
    id: 'video-editor',
    name: 'Timeline Video Editor',
    badge: 'Timeline',
    route: 'video-editor',
    shortDescription: 'In-browser multi-track timeline video editor. Arrange video clips, audio tracks, and subtitle layers with trim, playhead scrub, volume balance, and canvas preview.',
    detailedPurpose: 'Enables creators to organize and inspect their scene sequences, layer background audio, add subtitle text, and preview timing in real-time.',
    howToUse: 'Load any created video project, drag and trim clips on the timeline tracks, adjust volume sliders, and scrub the playhead.',
    expectedResult: 'An organized multi-track project timeline with visual playback preview and project state saved locally in browser.',
    keywords: ['editor', 'edit', 'timeline', 'trim', 'cut', 'audio track', 'combine', 'preview playback', 'layers', 'video editing', 'tracks']
  },
  {
    id: 'music-video',
    name: 'Music Video Storyboarder',
    badge: 'Music Arc',
    route: 'music-video',
    shortDescription: 'Narrative storyboarder specialized for songs (Nepali folk, acoustic, modern pop, romantic). Breaks songs into Intro, Verse, Chorus, and Climax with character emotion arcs.',
    detailedPurpose: 'Tailored for songwriters, singers, and directors planning visual storylines for musical releases, connecting lyrics with acoustic and visual pacing.',
    howToUse: 'Enter song title, artist name, genre (e.g. Nepali Folk / Lok Dohori, Romantic, Acoustic), and core theme, then generate song storyboard.',
    expectedResult: 'Verse-by-verse scene breakdown, character emotional progression, acoustic instrument visual cues, and scenic location notes.',
    keywords: ['song', 'music', 'music video', 'folk', 'lok dohori', 'acoustic', 'lyrics', 'geet', 'gaana', 'singer', 'melody', 'storyboard']
  },
  {
    id: 'templates',
    name: 'Templates Library',
    badge: 'Presets',
    route: 'templates',
    shortDescription: 'Curated collection of pre-made video templates (Travel Vlogs, Tech Reviews, Documentary, Folk Music Video, Storytelling Shorts) ready to load directly into the planner.',
    detailedPurpose: 'Gives creators quick starting points with proven structures so they don’t have to start from a blank prompt.',
    howToUse: 'Browse categories, choose a template, and click Use Template to immediately populate the AI Video Planner.',
    expectedResult: 'Instantly pre-filled video generator with optimized prompts, duration settings, and visual styles.',
    keywords: ['template', 'templates', 'sample', 'preset', 'ready made', 'starter', 'framework']
  },
  {
    id: 'projects',
    name: 'My Projects',
    badge: 'Workspace',
    route: 'projects',
    shortDescription: 'Local workspace project manager. View saved video plans, re-open them in the video editor, export as JSON, or organize drafts in browser storage.',
    detailedPurpose: 'Stores and organizes all user-created scripts, scene plans, and video projects directly in the user’s browser with zero required login.',
    howToUse: 'Access My Projects from the sidebar or header to review past plans, duplicate, or open directly in the editor.',
    expectedResult: 'List of saved projects with status badges, scene counts, duration, and one-click edit/export options.',
    keywords: ['project', 'projects', 'saved', 'draft', 'drafts', 'history', 'export', 'my work', 'storage']
  },
  {
    id: 'about-us',
    name: 'About Us',
    badge: 'Studio',
    route: 'about-us',
    shortDescription: 'Learn about creator Kiran Chaulagain, studio mission, architecture, and transparent creator policies.',
    detailedPurpose: 'Provides clear background on who built the studio, development motivation, and engineering principles.',
    howToUse: 'Click About Us in the navigation menu or footer.',
    expectedResult: 'Comprehensive creator biography, contact details, and platform philosophy.',
    keywords: ['about', 'who made this', 'kiran', 'chaulagain', 'developer', 'creator', 'mission', 'story']
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    badge: 'Support',
    route: 'contact-us',
    shortDescription: 'Direct contact form and email (kiranchaulagain094@gmail.com) for inquiries, feedback, and support.',
    detailedPurpose: 'Allows visitors to directly contact developer Kiran Chaulagain for questions, feature requests, or technical bug reports.',
    howToUse: 'Fill out the contact form with your name, email, subject, and message, or email directly.',
    expectedResult: 'Direct message submission to developer with confirmed delivery acknowledgment.',
    keywords: ['contact', 'email', 'support', 'feedback', 'bug', 'report', 'help', 'question']
  }
];

export const VALID_TOOL_IDS = new Set(CURRENT_STUDIO_TOOLS.map(t => t.id));

export function getToolById(id: string): StudioTool | undefined {
  return CURRENT_STUDIO_TOOLS.find(t => t.id === id);
}
