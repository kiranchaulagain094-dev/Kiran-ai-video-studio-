import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ override: true });

import { GoogleGenAI } from '@google/genai';
import { VideoGenerationService } from '../src/services/videoGeneration.ts';

const app = express();

// CORS Headers for all incoming requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// JSON and URL-encoded body parsers with safety limit
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Dedicated API Router mounted at both /api and root /
const apiRouter = express.Router();

// Helper to safely extract JSON from Gemini text responses
function extractJsonFromText(rawText: string): any {
  let cleaned = (rawText || '').trim();
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  }
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }
  return JSON.parse(cleaned);
}

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'kiran-ai-video-studio'
        }
      }
    });
  }
  return geminiClient;
}

// Resilient Gemini text caller with fallback and timeouts
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  promptOrContents: any,
  config?: any
): Promise<string> {
  // Candidate models with maximum availability across tiers
  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: promptOrContents,
        config: config || {
          responseMimeType: 'application/json'
        }
      });
      // 9 second timeout per candidate
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout requesting model ${model}`)), 9000)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);
      const text = response.text || '';
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Candidate model ${model} encountered an issue:`, err?.message || err);
    }
  }

  const errMsg = String(lastError?.message || lastError || '');
  if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429') || errMsg.includes('quota')) {
    const customErr: any = new Error('Gemini API quota is currently exceeded. Please wait a brief moment and retry.');
    customErr.status = 429;
    throw customErr;
  }
  if (errMsg.includes('overloaded') || errMsg.includes('503') || errMsg.includes('UNAVAILABLE')) {
    const customErr: any = new Error('The AI model API is currently experiencing peak traffic. Please retry in a moment.');
    customErr.status = 503;
    throw customErr;
  }

  throw lastError || new Error('All AI service candidates were temporarily unavailable. Please retry.');
}

// System Status & Health Probes
apiRouter.get(['/', '/health', '/api/health'], (req, res) => {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
    process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'
  );

  res.json({
    status: 'ok',
    appName: 'Kiran AI Video Studio',
    operator: 'Kiran Chaulagain',
    contactEmail: 'kiranchaulagain094@gmail.com',
    features: {
      geminiServerSide: hasGemini,
      videoPlanner: true,
      shortsCreator: true,
      contentAssistant: true,
      writingTools: true,
      contentSuite: true,
      thumbnailMaker: true,
      thumbnailVisionAnalysis: true,
      musicVideoPlanner: true
    }
  });
});

// 1. AI Video Plan Generation
apiRouter.post(['/ai/video-plan', '/api/ai/video-plan'], async (req, res) => {
  try {
    const { name, idea, type, aspectRatio, duration, style, voice, language, music } = req.body;
    if (!idea || typeof idea !== 'string' || idea.trim() === '') {
      return res.status(400).json({ success: false, error: 'Video idea prompt is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in your environment variables.'
      });
    }

    const prompt = `You are a professional video director and screenwriter for Kiran AI Video Studio.
Create a production screenplay and scene breakdown for:
Project Name: "${name || 'Creative Story'}"
Core Idea: "${idea}"
Video Type: "${type || 'YouTube Video'}"
Target Aspect Ratio: "${aspectRatio || '16:9'}"
Target Duration: "${duration || '3-5 minutes'}"
Visual Style: "${style || 'Cinematic'}"
Voice/Tone: "${voice || 'Engaging & Authentic'}"
Target Language: "${language || 'English / Nepali'}"
Music Direction: "${music || 'Inspirational Cinematic'}"

IMPORTANT INSTRUCTIONS:
1. Divide the video into 4 to 6 sequential scenes with precise time ranges.
2. Provide a narrative summary and complete voiceover / dialogue script.
3. For each scene provide: sceneNumber, title, description, visualPrompt (AI image/video prompt), timeRange, cameraMovement, audioNotes, voiceoverText.

Respond ONLY with valid JSON:
{
  "summary": "Story summary",
  "fullScript": "Complete spoken script",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "description": "Visual scene description",
      "visualPrompt": "Detailed AI visual generator prompt",
      "timeRange": "0:00 - 0:30",
      "cameraMovement": "Camera angle and movement",
      "audioNotes": "Sound effects and music cues",
      "voiceoverText": "Spoken narrator dialogue"
    }
  ]
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Video plan error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate video plan. Please try again.'
    });
  }
});

// 2. Shorts & Reels Plan Generation
apiRouter.post(['/ai/shorts-plan', '/api/ai/shorts-plan'], async (req, res) => {
  try {
    const { topic, hook, script, visualStyle, voice, music, captionStyle } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ success: false, error: 'Shorts topic is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in your environment variables.'
      });
    }

    const prompt = `You are a vertical video retention strategist for YouTube Shorts, Reels, and TikTok.
Create a high-retention 9:16 short plan for:
Topic: "${topic}"
Opening Hook Idea: "${hook || 'Pattern interrupt hook'}"
Draft Notes: "${script || 'Create punchy script'}"
Visual Style: "${visualStyle || 'Realistic High-Energy'}"
Voice/Tone: "${voice || 'High-energy'}"
Music Mood: "${music || '128 BPM Phonk / Trap'}"
Caption Style: "${captionStyle || 'Bold Animated Pop'}"

Respond ONLY with valid JSON matching this schema:
{
  "hook": "Opening 0-3 second magnetic visual and verbal hook",
  "script": "Complete spoken script under 150 words optimized for 30-45 seconds",
  "scenePlan": [
    {
      "secondRange": "0 - 3s",
      "action": "Visual hook action",
      "onScreenText": "BOLD POP TEXT",
      "cameraAngle": "Ultra close-up"
    },
    {
      "secondRange": "3 - 15s",
      "action": "Fast visual development",
      "onScreenText": "KEY INSIGHT",
      "cameraAngle": "Dynamic front punch"
    },
    {
      "secondRange": "15 - 30s",
      "action": "Climax and call to action",
      "onScreenText": "SUBSCRIBE FOR MORE",
      "cameraAngle": "Center frame hero"
    }
  ],
  "captionText": "Formatted text with emojis and engagement question",
  "cta": "Clear call to action",
  "title": "High CTR YouTube Shorts Title",
  "hashtags": ["#Shorts", "#Viral", "#KiranAIVideoStudio"],
  "musicMood": "128 BPM rhythmic electronic beat"
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Shorts plan error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate Shorts plan. Please try again.'
    });
  }
});

// 3. Social Repurposing Pack for Shorts
apiRouter.post(['/ai/repurpose-shorts', '/api/ai/repurpose-shorts'], async (req, res) => {
  try {
    const { topic, script } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ success: false, error: 'Topic or script is required for repurposing.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured.'
      });
    }

    const prompt = `You are a social media repurposing strategist.
Repurpose this video topic into multiple high-performing assets:
Topic: "${topic}"
Script/Notes: "${script || 'Create fresh viral variations'}"

Respond ONLY with valid JSON:
{
  "concepts": [
    {
      "title": "Concept 1 Title",
      "angle": "Educational / Direct",
      "targetPlatform": "YouTube Shorts & Reels",
      "hook": "Opening hook line",
      "script": "Complete 30-second script"
    },
    {
      "title": "Concept 2 Title",
      "angle": "Contrarian / Mythbuster",
      "targetPlatform": "TikTok & Reels",
      "hook": "Opening hook line",
      "script": "Complete 30-second script"
    },
    {
      "title": "Concept 3 Title",
      "angle": "Behind the Scenes / Story",
      "targetPlatform": "YouTube Shorts & LinkedIn",
      "hook": "Opening hook line",
      "script": "Complete 30-second script"
    }
  ],
  "hookVariations": [
    { "type": "Negative Bias", "text": "Hook text" },
    { "type": "Curiosity Gap", "text": "Hook text" },
    { "type": "Bold Statement", "text": "Hook text" },
    { "type": "Direct Question", "text": "Hook text" },
    { "type": "Urgent Secret", "text": "Hook text" }
  ],
  "viralAngles": [
    { "title": "The Contrarian Angle", "explanation": "Explanation" },
    { "title": "The Fast Solution Angle", "explanation": "Explanation" },
    { "title": "The Transformation Angle", "explanation": "Explanation" }
  ],
  "carouselSlides": [
    { "slideNumber": 1, "headline": "Cover Headline", "body": "Subtitle" },
    { "slideNumber": 2, "headline": "Point 1", "body": "Explanation" },
    { "slideNumber": 3, "headline": "Point 2", "body": "Explanation" },
    { "slideNumber": 4, "headline": "Point 3", "body": "Explanation" },
    { "slideNumber": 5, "headline": "Key Takeaway", "body": "Summary" },
    { "slideNumber": 6, "headline": "Action Call", "body": "CTA" }
  ]
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Repurposing error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate repurposing pack.'
    });
  }
});

// 4. Content Assistant (Full AIContentPack with 10 Title Archetypes & SEO Audit)
apiRouter.post(['/ai/content-assistant', '/api/ai/content-assistant'], async (req, res) => {
  try {
    const { videoType, targetAudience, language, mainKeyword } = req.body;
    const userTopic = (req.body.prompt || req.body.topic || req.body.idea || '').trim();
    if (!userTopic) {
      return res.status(400).json({ success: false, error: 'Video concept or topic is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured.'
      });
    }

    const prompt = `You are a YouTube algorithm and SEO optimization specialist for Kiran AI Video Studio.
Generate a complete YouTube content pack for:
Topic: "${userTopic}"
Video Format: "${videoType || 'YouTube Video'}"
Target Audience: "${targetAudience || 'Creators & General Audience'}"
Primary Keyword: "${mainKeyword || 'Auto-extract'}"
Language: "${language || 'Nepali / English'}"

CRITICAL REQUIREMENTS:
1. Provide 10 distinct title formulas categorized by: Search-Focused, Curiosity-Driven, Emotional, Listicle, High-CTR, Question, Story-Driven, How-To / Guide, Direct & Clean, Trend-Focused.
2. Provide a full YouTube description with introduction, timestamps outline, and credits.
3. 15-20 comma-separated tags and 5-8 hashtags.
4. Thumbnail text hook (2-4 words maximum).
5. Pinned comment, community post, shorts caption, tiktok caption, facebook caption.
6. A realistic 7-metric SEO score analysis (0-100) with explanations for: keywordRelevance, searchIntent, titleClarity, descriptionQuality, keywordCoverage, readability, audienceRelevance, and overallAssessment.

Respond ONLY with valid JSON:
{
  "youtubeTitle": "Primary recommended title",
  "alternativeTitles": [
    "Alternative 1",
    "Alternative 2",
    "Alternative 3",
    "Alternative 4"
  ],
  "titleFormulas": [
    { "category": "Search-Focused", "title": "Title", "rationale": "Reason" },
    { "category": "Curiosity-Driven", "title": "Title", "rationale": "Reason" },
    { "category": "Emotional", "title": "Title", "rationale": "Reason" },
    { "category": "Listicle", "title": "Title", "rationale": "Reason" },
    { "category": "High-CTR", "title": "Title", "rationale": "Reason" },
    { "category": "Question", "title": "Title", "rationale": "Reason" },
    { "category": "Story-Driven", "title": "Title", "rationale": "Reason" },
    { "category": "How-To / Guide", "title": "Title", "rationale": "Reason" },
    { "category": "Direct & Clean", "title": "Title", "rationale": "Reason" },
    { "category": "Trend-Focused", "title": "Title", "rationale": "Reason" }
  ],
  "youtubeDescription": "Full structured description with 0:00 timestamps and credits",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "youtubeTags": ["tag 1", "tag 2", "tag 3", "tag 4", "tag 5", "tag 6", "tag 7"],
  "keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "thumbnailText": "3-WORD BOLD TEXT",
  "hook": "Opening 5-second spoken hook",
  "cta": "Call to action text",
  "disclaimer": "Educational and entertainment disclaimer",
  "shortsCaption": "Shorts caption with hashtags",
  "tiktokCaption": "TikTok caption with hashtags",
  "facebookCaption": "Facebook caption with hashtags",
  "pinnedComment": "Engaging question to pin as top comment",
  "communityPost": "Engaging community tab post update",
  "seoAnalysis": {
    "score": 92,
    "keywordRelevance": { "score": 95, "explanation": "Target keyword positioned early in title and description." },
    "searchIntent": { "score": 90, "explanation": "Directly matches viewer query intent." },
    "titleClarity": { "score": 92, "explanation": "High clarity on mobile screens under 60 characters." },
    "descriptionQuality": { "score": 88, "explanation": "Includes chapter timestamps and contextual links." },
    "keywordCoverage": { "score": 94, "explanation": "Covers primary, secondary, and long-tail variants." },
    "readability": { "score": 90, "explanation": "Clean paragraph spacing and scannable bullet points." },
    "audienceRelevance": { "score": 93, "explanation": "Calibrated specifically for target audience interest." },
    "overallAssessment": "Excellent metadata package ready for publishing."
  }
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Content assistant error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate content pack. Please try again.'
    });
  }
});

// 5. Creative Writing Tools (10 Live Actions)
apiRouter.post(['/ai/writing-tool', '/api/ai/writing-tool'], async (req, res) => {
  try {
    const text = (req.body.text || req.body.inputText || req.body.prompt || '').trim();
    const tool = (req.body.tool || req.body.toolType || 'Rewrite').trim();
    const language = req.body.language;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Input text is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured.'
      });
    }

    const prompt = `You are an elite creative editor for video scripts and digital content.
Transform the following text using the action "${tool || 'Rewrite'}".
Target Language context: ${language || 'Maintain original language (Nepali / English)'}

TOOL DEFINITION:
- 'Rewrite': Provide a refreshed, highly engaging, dynamic perspective.
- 'Improve Hook': Rewrite the opening into an irresistible high-retention hook that stops the scroll immediately.
- 'More Emotional': Infuse heartfelt, touching, emotionally resonant sentiment.
- 'More Cinematic': Elevate with rich atmospheric visuals, lens cues, and cinematic rhythm.
- 'More Professional': Formulate an authoritative, executive, well-structured tone.
- 'Shorten': Remove all fluff, keeping only the highest-impact core message.
- 'Expand': Add rich contextual depth, descriptive storytelling, and practical detail.
- 'Translate (Nepali)': Translate naturally into fluent, culturally authentic Nepali (or English if input is Nepali).
- 'Grammar Fix': Perfect all spelling, punctuation, phrasing, and syntax without losing author voice.
- 'Better CTA': End with a magnetic, action-driving call to action for YouTube viewers.

INPUT TEXT:
"${text}"

Respond with ONLY a valid JSON object:
{
  "result": "The complete transformed text",
  "tool": "${tool}"
}`;

    const rawText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(rawText);

    return res.json({
      success: true,
      result: parsed.result || text,
      tool: tool
    });
  } catch (err: any) {
    console.error('Writing tool error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to process writing action.'
    });
  }
});

// 6. Creator AI Power Suite (Individual Tool Generators)
apiRouter.post(['/ai/content-suite', '/api/ai/content-suite'], async (req, res) => {
  try {
    const toolType = req.body.toolType || req.body.tool;
    const topic = (req.body.topic || req.body.prompt || req.body.inputText || req.body.idea || '').trim();
    const options = req.body.options;
    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured.'
      });
    }

    let prompt = '';

    if (toolType === 'ideas') {
      prompt = `Generate 5 high-impact, clickable YouTube video ideas based on the topic "${topic}".
Respond ONLY with valid JSON:
{
  "ideas": [
    {
      "title": "Compelling Title",
      "hook": "Opening 5-second hook idea",
      "targetAudience": "Audience segment",
      "retentionStrategy": "Why viewers will watch until the end"
    }
  ]
}`;
    } else if (toolType === 'calendar') {
      prompt = `Generate a realistic 4-week YouTube video production and publishing calendar for the niche/topic: "${topic}".
Respond ONLY with valid JSON:
{
  "calendar": [
    {
      "week": 1,
      "publishDate": "Day 7",
      "videoType": "Longform YouTube",
      "title": "Video title",
      "productionMilestone": "Script by Day 2, Shoot Day 4, Edit Day 6"
    },
    {
      "week": 2,
      "publishDate": "Day 14",
      "videoType": "9:16 Shorts Hook",
      "title": "Short title",
      "productionMilestone": "Batch record 3 variations"
    },
    {
      "week": 3,
      "publishDate": "Day 21",
      "videoType": "Deep Dive Tutorial",
      "title": "Tutorial title",
      "productionMilestone": "Screen capture and timestamps"
    },
    {
      "week": 4,
      "publishDate": "Day 28",
      "videoType": "Story / Climax",
      "title": "Story title",
      "productionMilestone": "Cinematic B-roll and color grade"
    }
  ]
}`;
    } else if (toolType === 'script') {
      prompt = `Write a complete, ready-to-record YouTube spoken video script for: "${topic}".
Respond ONLY with valid JSON:
{
  "title": "Suggested Title",
  "estimatedDuration": "3-5 minutes",
  "hook": "Opening 0-15s magnetic hook",
  "introduction": "15-45s context and promise",
  "bodyPoints": [
    { "heading": "Point 1", "spokenText": "Dialogue...", "visualCue": "Visual note" },
    { "heading": "Point 2", "spokenText": "Dialogue...", "visualCue": "Visual note" },
    { "heading": "Point 3", "spokenText": "Dialogue...", "visualCue": "Visual note" }
  ],
  "callToAction": "Final CTA spoken line"
}`;
    } else if (toolType === 'prompt') {
      prompt = `Generate 4 copy-ready cinematic visual prompts for Imagen 3, Midjourney, and Flux based on the video topic: "${topic}".
Respond ONLY with valid JSON:
{
  "prompts": [
    { "scene": "Establishing Hero Shot", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" },
    { "scene": "Emotional Close-Up", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" },
    { "scene": "Dynamic Action Movement", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" },
    { "scene": "Atmospheric Backdrop", "prompt": "Detailed 8k cinematic prompt with lighting and lens notes" }
  ]
}`;
    } else {
      // shorts-caption default
      prompt = `Generate 3 high-converting social media captions with emojis and hashtags for vertical short videos about: "${topic}".
Respond ONLY with valid JSON:
{
  "captions": [
    { "platform": "YouTube Shorts", "text": "Caption text with hashtags and emojis" },
    { "platform": "Instagram Reels", "text": "Caption text with hashtags and emojis" },
    { "platform": "TikTok", "text": "Caption text with hashtags and emojis" }
  ]
}`;
    }

    const rawText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(rawText);

    return res.json({
      success: true,
      toolType,
      data: parsed
    });
  } catch (err: any) {
    console.error('Content suite error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate suite content.'
    });
  }
});

// 7. Thumbnail Concept Blueprint
apiRouter.post(['/ai/thumbnail-concept', '/api/ai/thumbnail-concept'], async (req, res) => {
  try {
    const { idea, title, style, aspectRatio } = req.body;
    if (!idea || typeof idea !== 'string' || idea.trim() === '') {
      return res.status(400).json({ success: false, error: 'Video concept or title is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured.'
      });
    }

    const prompt = `You are a YouTube thumbnail art director specialized in high click-through rates (CTR).
Design a thumbnail blueprint for:
Video Idea: "${idea}"
Video Title: "${title || 'Creative Video'}"
Visual Style: "${style || 'Viral-style creator thumbnail'}"
Aspect Ratio: "${aspectRatio || '16:9'}"

Respond ONLY with valid JSON:
{
  "concept": "High-concept thumbnail summary",
  "layoutDescription": "Rule of thirds composition description",
  "subjectPlacement": "Where the focal face or subject is positioned",
  "background": "Background lighting, depth of field, and atmosphere",
  "lighting": "Key, fill, and rim light direction",
  "mainHeadline": "2-4 BOLD CONTRAST WORDS",
  "subHeadline": "OFFICIAL 4K",
  "badgeText": "MUST WATCH",
  "colorPalette": ["#FBBF24", "#6366F1", "#06B6D4", "#111827"],
  "imagePrompt": "Photorealistic 8k prompt for Imagen 3, Midjourney, or Flux with cinematic lighting, depth of field, and compositional framing",
  "negativePrompt": "blurry, low quality, distorted anatomy, text artifacts, cartoonish, oversaturated skin, flat lighting",
  "recommendedAspect": "${aspectRatio || '16:9'}",
  "style": "${style || 'Viral-style creator thumbnail'}"
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Thumbnail concept error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to generate thumbnail blueprint.'
    });
  }
});

// 8. Thumbnail Reference Image Vision Analysis (Gemini Multimodal Vision)
apiRouter.post(['/ai/analyze-thumbnail-image', '/api/ai/analyze-thumbnail-image'], async (req, res) => {
  try {
    const { imageBase64, mimeType, topic } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Base64 image data is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured.'
      });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `You are an expert YouTube thumbnail art director.
Analyze this uploaded reference image for its suitability as a high-CTR YouTube thumbnail (Topic: "${topic || 'General video'}").
Evaluate:
1. Subject framing, gaze, and facial expression clarity on small mobile screens.
2. Lighting contrast, background separation, and color vibrancy.
3. Negative space for bold headline overlay text.
4. Clickability score from 0 to 100 with objective criteria.
5. 3 specific actionable adjustments to boost CTR.

Respond ONLY with valid JSON:
{
  "subjectAnalysis": "Detailed observation of subject and emotional hook",
  "lightingAndContrast": "Evaluation of shadows, rim light, and background separation",
  "compositionFeedback": "Rule of thirds and typography space assessment",
  "clickabilityScore": 84,
  "recommendedAdjustments": [
    "Adjustment 1",
    "Adjustment 2",
    "Adjustment 3"
  ]
}`
          }
        ]
      }
    ];

    const rawText = await generateGeminiContentWithFallback(ai, contents);
    const parsed = extractJsonFromText(rawText);

    return res.json({
      success: true,
      ...parsed
    });
  } catch (err: any) {
    console.error('Thumbnail vision analysis error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      success: false,
      error: err?.message || 'Failed to analyze reference image with AI Vision.'
    });
  }
});

// 9. AI Thumbnail Image Generation (Imagen / Gemini Flash Image)
apiRouter.post(['/ai/generate-thumbnail-image', '/api/ai/generate-thumbnail-image'], async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ success: false, error: 'Image prompt is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured.'
      });
    }

    try {
      // Attempt image generation via imagen-3.0-generate-002
      const imgRes = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `${prompt}, high contrast, 8k resolution, photorealistic cinematic lighting, YouTube thumbnail composition`,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9'
        }
      });

      if (imgRes && imgRes.generatedImages && imgRes.generatedImages.length > 0) {
        const img = imgRes.generatedImages[0];
        const base64 = img.image?.imageBytes;
        if (base64) {
          return res.json({
            success: true,
            imageBase64: `data:image/jpeg;base64,${base64}`,
            mimeType: 'image/jpeg'
          });
        }
      }
    } catch (imgErr: any) {
      console.warn('Imagen 3 direct generation not enabled on this key tier:', imgErr?.message || imgErr);
    }

    // Honest, transparent response per Requirement 6 & 9
    return res.status(422).json({
      success: false,
      error: 'Direct AI Image Generation requires an image-generation enabled Gemini API key tier. You can use the copy-ready High-CTR prompt generated above directly in Imagen 3, Midjourney, or Flux, or upload your custom background photo onto the interactive canvas.'
    });
  } catch (err: any) {
    console.error('Image generation endpoint error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Image generation service error.'
    });
  }
});

// 10. AI Website Guide (Multilingual + Vision Support)
apiRouter.post(['/ai/guide', '/api/ai/guide'], async (req, res) => {
  try {
    const { message, history, imageBase64, mimeType } = req.body;
    const userMessage = (message || '').trim();

    if (!userMessage && !imageBase64) {
      return res.status(400).json({ success: false, error: 'Message or image cannot be empty.' });
    }

    const ai = getGeminiClient();

    const VALID_TOOL_METADATA: Record<string, { name: string; route: string; purpose: string }> = {
      'video-generator': {
        name: 'AI Video Planner',
        route: 'video-generator',
        purpose: 'Multi-scene screenplay & script planner with scene timing brackets, camera movements, dialogue, voiceover, sound cues, visual prompts.'
      },
      'shorts-creator': {
        name: 'Shorts & Reels Creator',
        route: 'shorts-creator',
        purpose: '9:16 vertical video storyboarder and pacing strategist with 3-second hook script, rapid visual scene cuts, on-screen text, and caption copy.'
      },
      'content-assistant': {
        name: 'Content & SEO Assistant',
        route: 'content-assistant',
        purpose: 'YouTube SEO and metadata suite: 10 title formulas, description with timestamps, tags, hashtags, hook, pinned comment, community post, and 10 instant creative writing tools.'
      },
      'thumbnail-maker': {
        name: 'Thumbnail Concept Designer',
        route: 'thumbnail-maker',
        purpose: 'High-CTR YouTube thumbnail composition architect with rule-of-thirds visual hierarchy, emotional focal subject, bold headline text, and AI image prompts.'
      },
      'video-editor': {
        name: 'Timeline Video Editor',
        route: 'video-editor',
        purpose: 'In-browser multi-track timeline video editor. Arrange video clips, audio tracks, and subtitle layers with trim, playhead scrub, volume balance, and canvas preview.'
      },
      'music-video': {
        name: 'Music Video Storyboarder',
        route: 'music-video',
        purpose: 'Narrative storyboarder specialized for songs (Nepali folk, acoustic, modern pop, romantic). Breaks songs into Intro, Verse, Chorus, and Climax with character emotion arcs.'
      },
      'templates': {
        name: 'Templates Library',
        route: 'templates',
        purpose: 'Curated collection of pre-made video templates (Travel Vlogs, Tech Reviews, Documentary, Folk Music Video, Storytelling Shorts) ready to load directly into the planner.'
      },
      'projects': {
        name: 'My Projects',
        route: 'projects',
        purpose: 'Local workspace project manager. View saved video plans, re-open them in the video editor, export as JSON, or organize drafts in browser storage.'
      },
      'about-us': {
        name: 'About Us',
        route: 'about-us',
        purpose: 'Learn about creator Kiran Chaulagain, studio mission, architecture, and transparent creator policies.'
      },
      'contact-us': {
        name: 'Contact Us',
        route: 'contact-us',
        purpose: 'Direct contact form and email (kiranchaulagain094@gmail.com) for inquiries, feedback, and support.'
      }
    };

    if (ai) {
      try {
        const formattedHistory = Array.isArray(history) 
          ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'Visitor' : 'Guide'}: ${h.content}`).join('\n')
          : '';

        const systemPrompt = `You are the "AI Website Guide" for Kiran AI Video Studio, created by Kiran Chaulagain.
Your purpose: Understand what the visitor needs and explain which Kiran AI Video Studio tools/features can help them.

CURRENT AVAILABLE TOOLS ON KIRAN AI VIDEO STUDIO:
1. "video-generator" (AI Video Planner): Multi-scene screenplay, scriptwriting, camera movements, dialogue, voiceover, sound cues, visual prompts for full videos.
2. "shorts-creator" (Shorts & Reels Creator): 9:16 vertical video storyboarder, 3-second hook scripts, fast visual pacing, on-screen text, captions for YouTube Shorts/TikTok/Reels.
3. "content-assistant" (Content & SEO Assistant): YouTube SEO, 10 title formulas, description with timestamps, tags, hashtags, pinned comment, community post, 10 creative writing tools, and 7-metric SEO score.
4. "thumbnail-maker" (Thumbnail Concept Designer): High-CTR thumbnail composition, visual layout rules (Rule of Thirds), bold headline typography, color palettes, and AI image generator prompts.
5. "video-editor" (Timeline Video Editor): In-browser multi-track timeline video editor to arrange video, audio, and subtitle layers, trim clips, and preview playback.
6. "music-video" (Music Video Storyboarder): Narrative storyboarder specialized for songs (Nepali folk, acoustic, modern pop, romantic) with verse-by-verse scene breakdowns and character emotion arcs.
7. "templates" (Templates Library): Pre-built video & short templates ready to load into the planner.
8. "projects" (My Projects): Workspace project manager stored in browser to manage and reopen saved video plans.
9. "about-us" (About Us): Creator biography of Kiran Chaulagain and studio mission.
10. "contact-us" (Contact Us): Direct contact form and official email (kiranchaulagain094@gmail.com).

CRITICAL RULES:
1. LANGUAGE SUPPORT:
- Support ALL languages (Nepali, Romanized Nepali, Hindi, English, Spanish, etc.).
- Automatically detect the language and dialect the user is using.
- ALWAYS respond in the EXACT same language and style!
- If the visitor writes in Romanized Nepali (e.g. "mero geet ko title ra description chahiyo", "Shorts kasari banaune?"), reply naturally in Romanized Nepali / Nepali style!
- If the visitor writes in Devanagari Nepali, reply in Devanagari Nepali.
- If the visitor writes in Hindi, reply in Hindi.
- If the visitor writes in English, reply in English.
- If the visitor mixes languages, reply naturally in the same mixed conversational style.

2. HONESTY & ACCURACY:
- Only recommend tools from the exact list above.
- NEVER invent a feature.
- NEVER pretend a feature works if it does not exist (we do NOT have automated cloud MP4 rendering, direct auto-uploading to YouTube, or AI voice cloning).
- If none of the current tools can solve the user's request, be honest in their language:
  "Currently, Kiran AI Video Studio does not have a tool for that."
- If the user asks something unrelated to video creation, answer briefly and explain what video creative tools are available.

3. NO FALSE CLAIMS:
- NEVER claim guaranteed viral views or guaranteed subscribers.

OUTPUT FORMAT:
Respond ONLY with valid JSON:
{
  "userGoal": "Concise summary of user's goal",
  "detectedLanguage": "Detected language/dialect name",
  "message": "Your helpful response in their language explaining recommended tools, how to use them, and what to expect",
  "recommendedTools": [
    {
      "id": "one-of-the-allowed-ids-above",
      "name": "Exact Name of Tool",
      "reason": "Short reason why this tool helps their goal (in user's language)"
    }
  ]
}`;

        let promptOrContents: any;
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
          promptOrContents = [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64
                  }
                },
                {
                  text: `${systemPrompt}\n\n${formattedHistory ? `CONVERSATION HISTORY:\n${formattedHistory}\n\n` : ''}VISITOR ATTACHED AN IMAGE AND SAID:\n"${userMessage || 'Please examine this image and guide me.'}"`
                }
              ]
            }
          ];
        } else {
          promptOrContents = `${systemPrompt}\n\n${formattedHistory ? `CONVERSATION HISTORY:\n${formattedHistory}\n\n` : ''}LATEST VISITOR MESSAGE:\n"${userMessage}"`;
        }

        const rawText = await generateGeminiContentWithFallback(ai, promptOrContents);
        const parsed = extractJsonFromText(rawText);

        const sanitizedTools = Array.isArray(parsed.recommendedTools)
          ? parsed.recommendedTools
              .filter((t: any) => t && typeof t.id === 'string' && VALID_TOOL_METADATA[t.id])
              .map((t: any) => ({
                id: t.id,
                name: VALID_TOOL_METADATA[t.id].name,
                reason: String(t.reason || '').trim() || VALID_TOOL_METADATA[t.id].purpose
              }))
          : [];

        return res.json({
          userGoal: parsed.userGoal || 'Creative video assistance',
          detectedLanguage: parsed.detectedLanguage || 'Natural language',
          message: parsed.message || 'Here is how Kiran AI Video Studio can help you.',
          recommendedTools: sanitizedTools
        });
      } catch (err: any) {
        console.warn('Gemini Guide using semantic fallback:', err?.message || String(err));
      }
    }

    // Semantic Offline / Fallback Guide Logic
    const lower = userMessage.toLowerCase();
    const isRomanizedNepali = /\b(mero|chahiyo|kasari|geet|banaune|suno|namaste|hunchha|huncha|pani|lai|cha|ko|ma|garnu|banauna|thaha|kasto)\b/i.test(lower);
    const isDevanagariNepali = /[\u0900-\u097F]/.test(userMessage);
    const isHindi = /\b(kaise|kare|mujhe|chahiye|karna|hai|mera|meri|gaana|bana|sakte|kripya)\b/i.test(lower);

    const wantsMusicOrSong = /(song|music|geet|gaana|lyrics|melody|singer|गीत|गाना|संगीत)/i.test(lower);
    const wantsSEOOrTitle = /(title|description|seo|tag|tags|hashtag|hashtags|keywords|शीर्षक|विवरण|ट्याग)/i.test(lower);
    const wantsThumbnail = /(thumbnail|cover|poster|photo|image|banner|थम्बनेल|थंबनेल|तस्बिर|फोटो)/i.test(lower);
    const wantsShorts = /(short|shorts|reel|reels|tiktok|vertical|9:16|hook|कथा)/i.test(lower);
    const wantsEditor = /(edit|editor|timeline|trim|cut|audio track|volume|layers|एडिटर|सम्पादन)/i.test(lower);
    const wantsVideoPlan = /(video|script|screenplay|youtube|tourism|documentary|vlog|travel|nepal|camera|भिडियो|योजना)/i.test(lower);
    const wantsDirectRender = /(render.*mp4|mp4.*render|download.*mp4|make.*mp4|generate.*mp4|export.*mp4|direct.*mp4|mp4|upload to youtube|direct upload|voice clone|deepfake)/i.test(lower);
    const isUnrelated = /\b(python|javascript|bitcoin|crypto|math|physics|biology|weather|recipe|cooking|president)\b/i.test(lower);

    if (wantsDirectRender) {
      if (isDevanagariNepali) {
        return res.json({
          userGoal: 'सिधै क्लाउड MP4 भिडियो रेन्डर गर्ने सुविधा',
          detectedLanguage: 'Nepali (नेपाली)',
          message: 'Currently, Kiran AI Video Studio does not have a tool for direct cloud MP4 rendering. किरण एआई भिडियो स्टुडियोले मल्टि-सिन पटकथा (screenplay) योजना, क्यामेरा एंगल्स, र इन-ब्राउजर टाइमलाइन भिडियो एडिटर प्रदान गर्दछ, तर सिधै सर्भरमा MP4 फाइल रेन्डर गर्ने सुविधा छैन। तपाईं आफ्नो भिडियो दृश्य योजना तयार गरेर टाइमलाइन एडिटरमा ट्र्याकहरू मिलाउन सक्नुहुन्छ।',
          recommendedTools: [
            { id: 'video-generator', name: 'AI Video Planner', reason: 'सम्पूर्ण भिडियोको सिन र दृश्य योजना तयार गर्न' },
            { id: 'video-editor', name: 'Timeline Video Editor', reason: 'ब्राउजर टाइमलाइनमा भिडियो र अडियो ट्र्याक मिलाउन' }
          ]
        });
      }
      return res.json({
        userGoal: 'Automated direct MP4 video rendering',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : 'English',
        message: 'Currently, Kiran AI Video Studio does not have a tool for direct cloud MP4 video rendering. Kiran AI Video Studio specializes in multi-scene screenplay scriptwriting, 9:16 vertical shorts retention pacing, high-CTR thumbnail composition, and YouTube SEO optimization.',
        recommendedTools: [
          { id: 'video-generator', name: 'AI Video Planner', reason: 'Structure your complete multi-scene screenplay' },
          { id: 'video-editor', name: 'Timeline Video Editor', reason: 'Inspect and trim media tracks on an in-browser timeline' }
        ]
      });
    }

    if (isUnrelated) {
      return res.json({
        userGoal: 'General non-video inquiry',
        detectedLanguage: isDevanagariNepali ? 'Nepali (नेपाली)' : isRomanizedNepali ? 'Romanized Nepali' : 'English',
        message: 'Currently, Kiran AI Video Studio does not have a tool for that inquiry. Kiran AI Video Studio is focused specifically on video creation: screenplay script planning, YouTube Shorts pacing, high-CTR thumbnail concepts, and YouTube SEO metadata optimization.',
        recommendedTools: []
      });
    }

    if (isRomanizedNepali && wantsMusicOrSong) {
      return res.json({
        userGoal: 'Song title, description, and visual storyboard planning',
        detectedLanguage: 'Romanized Nepali',
        message: 'Tapai ko song ko lagi title ra description tayar garna Kiran AI Video Studio ko **Content & SEO Assistant** tool le madat garcha. Yo tool le 10 ota high-CTR YouTube titles, timestamps sahitko description, tags, ra hashtags banai dincha.\n\nSaathai, yadi tapai lai aafno geet ko visual storyline, verse-by-verse scene pacing, ra character emotions plan garna man cha bhane **Music Video Storyboarder** tool pani ekdam upayogee huncha!',
        recommendedTools: [
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Song ko lagi YouTube SEO titles, description, ra tags banauna' },
          { id: 'music-video', name: 'Music Video Storyboarder', reason: 'Geet ko verse ra chorus visual storyline plan garna' }
        ]
      });
    }

    if (isDevanagariNepali && wantsMusicOrSong) {
      return res.json({
        userGoal: 'गीतको शीर्षक, विवरण र भिडियो योजना',
        detectedLanguage: 'Nepali (नेपाली)',
        message: 'तपाईंको नयाँ गीतको लागि युट्युब शीर्षक र विवरण तयार गर्न **Content & SEO Assistant** टुल उपलब्ध छ। यसले १० वटा आकर्षक शीर्षकहरू, टाइमस्ट्याम्प सहितको विवरण, र ट्यागहरू बनाउँछ।\n\nसाथै, गीतको कथा र दृश्यहरू (storyboard) योजना गर्न **Music Video Storyboarder** टुल प्रयोग गर्न सक्नुहुन्छ!',
        recommendedTools: [
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'गीतको लागि युट्युब शीर्षक र विवरण तयार गर्न' },
          { id: 'music-video', name: 'Music Video Storyboarder', reason: 'गीतको दृश्य कथा र क्यारेक्टर भावना योजना गर्न' }
        ]
      });
    }

    if (wantsThumbnail) {
      return res.json({
        userGoal: 'High-CTR thumbnail concept & composition',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : 'English',
        message: isRomanizedNepali 
          ? 'Tapai ko video ko lagi thumbnail concept banauna **Thumbnail Concept Designer** tool uplabdha cha. Yasle Rule of Thirds layout, visual contrast, bold headline typography ideas, ra AI image generator prompt pradan garcha.'
          : isDevanagariNepali
          ? 'तपाईंको युट्युब भिडियोको लागि थम्बनेल योजना गर्न **Thumbnail Concept Designer** टुल उपलब्ध छ। यसले Rule of Thirds भिजुअल लेआउट, रङ्ग कन्ट्रास्ट, बोल्ड शीर्षक अक्षरहरू, र एआई इमेज प्रम्प्टहरू प्रदान गर्दछ।'
          : 'To design compelling thumbnails, use our **Thumbnail Concept Designer**. It provides proven Rule of Thirds composition architecture, focal subject positioning, high-contrast bold typography suggestions, and copy-ready AI image prompts.',
        recommendedTools: [
          { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'Create visual composition guidelines and headline concepts' }
        ]
      });
    }

    if (wantsShorts) {
      return res.json({
        userGoal: 'Vertical 9:16 short video creation',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : 'English',
        message: isRomanizedNepali 
          ? 'Shorts, Reels wa TikTok video banauna **Shorts & Reels Creator** prayog garnus. Yasle 3-second opening hook, rapid visual cuts, ra on-screen text overlays plan gari dincha.'
          : 'To create vertical short-form content for YouTube Shorts, Reels, or TikTok, use the **Shorts & Reels Creator**. It crafts 3-second high-retention hooks, second-by-second scene cuts, and on-screen caption copy.',
        recommendedTools: [
          { id: 'shorts-creator', name: 'Shorts & Reels Creator', reason: 'Plan vertical 9:16 hook-first short videos' }
        ]
      });
    }

    if (wantsVideoPlan) {
      return res.json({
        userGoal: 'Comprehensive YouTube video creation workflow',
        detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : 'English',
        message: 'To produce a successful video, follow this workflow on Kiran AI Video Studio:\n\n1. **AI Video Planner**: Structure your multi-scene screenplay with camera movements, dialogue, voiceover, and scenic pacing.\n2. **Thumbnail Concept Designer**: Design high-contrast thumbnail compositions with focal subject positioning and bold typography.\n3. **Content & SEO Assistant**: Generate 10 tested titles, structured chapters/timestamps description, and high-relevance tags.',
        recommendedTools: [
          { id: 'video-generator', name: 'AI Video Planner', reason: 'Generate multi-scene script with camera shots and voiceover' },
          { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'Design high-CTR thumbnail layouts and image prompts' },
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate YouTube SEO metadata, tags, and timestamps' }
        ]
      });
    }

    return res.json({
      userGoal: 'Creative video guidance',
      detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : isDevanagariNepali ? 'Nepali (नेपाली)' : isHindi ? 'Hindi' : 'English',
      message: isRomanizedNepali
        ? 'Namaste! Kiran AI Video Studio ma tapai lai swagat cha. Tapai YouTube video script, vertical Shorts, SEO tags/descriptions, thumbnail concepts, athawa music video visual plan garna saknu huncha. Tapai ke banauna chahanu huncha?'
        : isDevanagariNepali
        ? 'नमस्ते! किरण एआई भिडियो स्टुडियोमा तपाईंलाई स्वागत छ। तपाईं युट्युब भिडियो पटकथा, भर्टिकल सर्ट्स, SEO ट्याग तथा विवरण, थम्बनेल कन्सेप्ट, वा गीतको भिडियो योजना बनाउन सक्नुहुन्छ। तपाईं के निर्माण गर्न चाहनुहुन्छ?'
        : isHindi
        ? 'नमस्ते! किरण एआई वीडियो स्टूडियो में आपका स्वागत है। यहाँ आप यूट्यूब वीडियो स्क्रिप्ट, शॉर्ट्स, थंबनेल और एसईओ योजना बना सकते हैं। आप क्या बनाना चाहते हैं?'
        : 'Welcome to Kiran AI Video Studio! I am here to understand your creative goal and guide you to the exact tools you need. Whether you want to plan a multi-scene YouTube video, outline vertical Shorts, design high-CTR thumbnails, or optimize YouTube SEO metadata, let me know what you want to create.',
      recommendedTools: [
        { id: 'video-generator', name: 'AI Video Planner', reason: 'Plan complete multi-scene video screenplays' },
        { id: 'shorts-creator', name: 'Shorts & Reels Creator', reason: 'Craft 9:16 vertical shorts with 3-second hooks' },
        { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate YouTube titles, descriptions, and tags' }
      ]
    });
  } catch (err: any) {
    console.error('AI Guide error:', err);
    res.status(500).json({ success: false, error: 'AI Guide processing failed. Please try again.' });
  }
});

// 11. Video Generation Background Jobs
apiRouter.post(['/video/jobs', '/api/video/jobs'], async (req, res) => {
  try {
    const job = await VideoGenerationService.startJob(req.body);
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get(['/video/jobs/:id', '/api/video/jobs/:id'], async (req, res) => {
  try {
    const job = await VideoGenerationService.getJobStatus(req.params.id);
    res.json(job);
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// Mount the API Router at both '/api' and root '/'
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Explicit 404 Handler for unrecognized API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

// Controlled Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Controlled server error:', err?.message || err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err?.message || 'An internal error occurred. Please try again.',
    status
  });
});

export { app, apiRouter };
export default app;
