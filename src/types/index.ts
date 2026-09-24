export type AspectRatio = '16:9' | '9:16' | '1:1';

export type VideoType = 
  | 'YouTube Video'
  | 'YouTube Shorts'
  | 'TikTok/Reels'
  | 'Music Video'
  | 'Story Video'
  | 'Promotional Video'
  | 'Cinematic Video';

export type DurationOption = 
  | '15 seconds'
  | '30 seconds'
  | '60 seconds'
  | '90 seconds'
  | '2 minutes'
  | '3 minutes';

export type VisualStyle = 
  | 'Cinematic'
  | 'Realistic'
  | 'Anime'
  | '3D'
  | 'Documentary'
  | 'Music Video'
  | 'Romantic'
  | 'Emotional'
  | 'Action'
  | 'Travel'
  | 'Custom';

export type VoiceOption = 'No Voice' | 'Male' | 'Female' | 'Custom';
export type LanguageOption = 'Nepali' | 'English' | 'Hindi' | 'Custom';
export type MusicOption = 'No Music' | 'AI Background Music' | 'Upload Music';

export type ProjectStatus = 'Draft' | 'Generating' | 'Completed' | 'Failed' | 'Exported';

export interface VideoScene {
  id?: string;
  sceneNumber: number;
  timeRange: string;
  title: string;
  description: string;
  visualPrompt: string;
  cameraMovement: string;
  voiceoverText?: string;
  soundEffects?: string;
  audioNotes?: string;
  musicMood?: string;
  previewColor?: string;
}

export interface Project {
  id: string;
  userId?: string;
  name: string;
  type: VideoType;
  aspectRatio: AspectRatio;
  duration: DurationOption;
  style: VisualStyle;
  voice: VoiceOption;
  language: LanguageOption;
  music: MusicOption;
  ideaPrompt: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  scenes?: VideoScene[];
  script?: string;
  description?: string;
  videoUrl?: string;
  tags?: string[];
  scenesCount?: number;
  quality?: string;
}

export interface TimelineTrackItem {
  id: string;
  trackId: 'video' | 'audio' | 'text';
  name: string;
  start: number; // in seconds
  duration: number; // in seconds
  type: 'video' | 'image' | 'audio' | 'text' | 'subtitles';
  content?: string;
  volume?: number;
  speed?: number;
  color?: string;
  filter?: string;
  transition?: string;
}

export interface SEOAnalysisResult {
  score: number; // 0 - 100
  keywordRelevance: { score: number; explanation: string };
  searchIntent: { score: number; explanation: string };
  titleClarity: { score: number; explanation: string };
  descriptionQuality: { score: number; explanation: string };
  keywordCoverage: { score: number; explanation: string };
  readability: { score: number; explanation: string };
  audienceRelevance: { score: number; explanation: string };
  overallAssessment: string;
}

export interface AIContentPack {
  youtubeTitle: string;
  alternativeTitles: string[];
  titleFormulas?: {
    category: string;
    title: string;
    rationale: string;
  }[];
  youtubeDescription: string;
  hashtags: string[];
  youtubeTags: string[];
  keywords: string[];
  thumbnailText: string;
  hook: string;
  cta: string;
  disclaimer: string;
  shortsCaption: string;
  tiktokCaption: string;
  facebookCaption: string;
  seoAnalysis: SEOAnalysisResult;
  pinnedComment?: string;
  communityPost?: string;
}

export interface ShortsGenerationPlan {
  hook: string;
  script: string;
  scenePlan: {
    secondRange: string;
    action: string;
    onScreenText: string;
    cameraAngle: string;
  }[];
  captionText: string;
  cta: string;
  title: string;
  hashtags: string[];
  musicMood: string;
}

export interface ThumbnailConcept {
  concept: string;
  layoutDescription: string;
  mainHeadline: string;
  subHeadline?: string;
  colorPalette: string[];
  badgeText?: string;
  imagePrompt: string;
  recommendedAspect?: '16:9' | '9:16';
  style: string;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  aspectRatio: AspectRatio;
  duration: DurationOption;
  style: VisualStyle;
  prompt: string;
  thumbnailUrl: string;
  isFeatured?: boolean;
  status: 'published' | 'draft';
}

export type TemplateCategory =
  | 'Romantic Video'
  | 'Music Video'
  | 'YouTube Shorts'
  | 'Motivational Story'
  | 'Business Ad'
  | 'Product Promo'
  | 'Cinematic Travel'
  | 'News / Explainer'
  | 'Nepali Folk / Modern Song Concept'
  | 'DJ Remix Visualizer';

export interface RecommendedTool {
  id: string;
  name: string;
  reason: string;
  actionText?: string;
}

export interface AIGuideResponse {
  userGoal: string;
  detectedLanguage: string;
  message: string;
  recommendedTools: RecommendedTool[];
}

export interface AIGuideChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  userGoal?: string;
  recommendedTools?: RecommendedTool[];
  detectedLanguage?: string;
  imageUrl?: string;
}

