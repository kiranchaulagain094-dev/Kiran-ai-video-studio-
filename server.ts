import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ override: true });

import { VideoGenerationService } from './src/services/videoGeneration';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Create dedicated API Router mounted at both /api and root /
const apiRouter = express.Router();

// Helper to clean JSON from Gemini output
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
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
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Resilient Gemini model caller with fast fallback and strict timeouts for Vercel Serverless
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<string> {
  // Use approved high-availability Gemini models from @google/genai specification:
  // 'gemini-3.1-flash-lite' is ultra-fast (~1.5s) to guarantee serverless execution within Vercel limits
  // 'gemini-flash-latest' and 'gemini-3.8-flash' provide high-depth screenplays
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: config || {
          responseMimeType: 'application/json'
        }
      });
      // 7.5 second timeout per model to stay strictly within Vercel's serverless function window
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout requesting ${model}`)), 7500)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);
      const text = response.text || '';
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini candidate model ${model} failed, trying next candidate:`, err?.message || err);
    }
  }

  throw lastError || new Error('All Gemini model candidates were unavailable.');
}

// System Status & Health
apiRouter.get(['/health', '/api/health'], (req, res) => {
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
      thumbnailMaker: true,
      musicVideoPlanner: true
    }
  });
});

// AI Video Plan Generation
apiRouter.post(['/ai/video-plan', '/api/ai/video-plan'], async (req, res) => {
  try {
    const { name, idea, type, aspectRatio, duration, style, voice, language, music } = req.body;
    if (!idea || typeof idea !== 'string' || idea.trim() === '') {
      return res.status(400).json({ error: 'Core video idea prompt is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI configuration is missing.',
        details: 'GEMINI_API_KEY is not configured in Vercel project environment variables. Please add GEMINI_API_KEY in Vercel Project Settings > Environment Variables.'
      });
    }

    const prompt = `You are a professional video director and screenwriter for Kiran AI Video Studio.
Create a detailed, high-retention video production screenplay and scene breakdown for:
Project Name: "${name || 'Creative Story'}"
Core Idea: "${idea}"
Video Type: "${type || 'YouTube Video'}"
Aspect Ratio: "${aspectRatio || '16:9'}"
Target Duration: "${duration || '60 seconds'}"
Visual Style: "${style || 'Cinematic'}"
Voiceover Profile: "${voice || 'Male'}"
Language: "${language || 'English'}"
Music/Audio Style: "${music || 'AI Background Music'}"

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "summary": "Brief executive summary of the video production plan",
  "fullScript": "Complete word-for-word voiceover script with timing brackets",
  "scenes": [
    {
      "sceneNumber": 1,
      "timeRange": "0:00 - 0:15",
      "title": "Scene title",
      "description": "Narrative action description",
      "visualPrompt": "Detailed visual generator prompt with camera lens, lighting, color grading",
      "cameraMovement": "Camera motion type",
      "voiceoverText": "Spoken text or dialogue",
      "soundEffects": "Foley and ambient sound cues",
      "musicMood": "Musical pacing and instrumentation cues",
      "previewColor": "#1e293b"
    }
  ]
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    if (!parsed || !Array.isArray(parsed.scenes)) {
      throw new Error('AI model generated invalid scene structure.');
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Video plan generation failed:', err);
    const errMsg = String(err?.message || err);
    return res.status(503).json({
      error: 'AI service is temporarily unavailable.',
      details: errMsg.includes('API_KEY_INVALID') || errMsg.includes('403')
        ? 'The configured GEMINI_API_KEY is invalid or unauthorized.'
        : 'The AI model request failed. Please try again with a descriptive prompt.'
    });
  }
});

// AI Shorts Creator Plan
apiRouter.post(['/ai/shorts-plan', '/api/ai/shorts-plan'], async (req, res) => {
  try {
    const { topic, hook, script, visualStyle, voice, music, captionStyle } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ error: 'Topic is required for Shorts generation.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI configuration is missing.',
        details: 'GEMINI_API_KEY is not configured in Vercel project environment variables. Please add GEMINI_API_KEY in Vercel Project Settings > Environment Variables.'
      });
    }

    const prompt = `You are a vertical video director for Kiran AI Video Studio.
Generate an ultra-retention 9:16 vertical short script and production plan for:
Topic: "${topic}"
Initial Hook: "${hook || ''}"
Script/Context: "${script || ''}"
Visual Style: "${visualStyle || 'Realistic'}"
Voice: "${voice || 'Male'}"
Music: "${music || 'AI Background Music'}"
Caption Style: "${captionStyle || 'Bold Pop'}"

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "hook": "The opening 3-second hook that stops scrolling instantly",
  "script": "Full verbatim spoken script punctuated for fast speech",
  "scenePlan": [
    {
      "secondRange": "0-3s",
      "action": "Visual hook action",
      "onScreenText": "BOLD POP TEXT",
      "cameraAngle": "Extreme close-up snap zoom"
    },
    {
      "secondRange": "3-15s",
      "action": "Visual development",
      "onScreenText": "REVEAL FACT",
      "cameraAngle": "Fast panning shot"
    },
    {
      "secondRange": "15-30s",
      "action": "Call to action climax",
      "onScreenText": "SUBSCRIBE FOR MORE",
      "cameraAngle": "Center frame hero shot"
    }
  ],
  "captionText": "Formatted text with emojis and high engagement questions",
  "cta": "Clear specific call to action",
  "title": "High CTR YouTube Shorts Title",
  "hashtags": ["#Shorts", "#Viral", "#AIStudio"],
  "musicMood": "Fast-paced rhythmic beat with subtle builds"
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Shorts generation failed:', err);
    const errMsg = String(err?.message || err);
    return res.status(503).json({
      error: 'AI service is temporarily unavailable.',
      details: errMsg.includes('API_KEY_INVALID') || errMsg.includes('403')
        ? 'The configured GEMINI_API_KEY is invalid or unauthorized.'
        : 'The AI model request failed. Please try again with a descriptive topic.'
    });
  }
});

// AI Content Assistant (All Deliverables + SEO Analysis)
apiRouter.post(['/ai/content-assistant', '/api/ai/content-assistant'], async (req, res) => {
  try {
    const { prompt: userIdea, videoType, targetAudience, language, mainKeyword } = req.body;
    if (!userIdea || typeof userIdea !== 'string' || userIdea.trim() === '') {
      return res.status(400).json({ error: 'Video prompt or concept is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI configuration is missing.',
        details: 'GEMINI_API_KEY is not configured in Vercel project environment variables. Please add GEMINI_API_KEY in Vercel Project Settings > Environment Variables.'
      });
    }

    const prompt = `You are Kiran AI Video Studio's YouTube SEO & Content Strategist.
Analyze this video concept thoroughly:
Video Idea: "${userIdea}"
Video Type: "${videoType || 'YouTube Video'}"
Target Audience: "${targetAudience || 'Creators, Music Fans, General Audience'}"
Language: "${language || 'Nepali / English'}"
Main Focus Keyword: "${mainKeyword || ''}"

Generate a complete, high-performing content optimization package with:
1. YouTube Title
2. 5 Alternative Titles (Search-focused, Curiosity-based, Emotional, Listicle, High-CTR)
3. YouTube Description (complete with timestamps outline, links section, keywords, social tags)
4. 10 Trending Hashtags
5. 20 YouTube Tags (comma separated)
6. 15 Target Keywords
7. Thumbnail Text (max 4-5 punchy words)
8. Hook (first 10 seconds)
9. CTA (Call To Action)
10. Disclaimer (Ethical AI & Copyright notice)
11. Shorts Caption
12. TikTok Caption
13. Facebook Caption
14. SEO Analysis (Provide numeric scores 0-100 and clear, objective explanations for:
    - Keyword relevance
    - Search intent
    - Title clarity
    - Description quality
    - Keyword coverage
    - Readability
    - Audience relevance
    IMPORTANT: Do NOT promise guaranteed viral views or guaranteed #1 rank. Provide realistic, evidence-based SEO advice).
Also include:
- Pinned Comment
- Community Post

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "youtubeTitle": "Main optimized title",
  "alternativeTitles": ["Alt 1", "Alt 2", "Alt 3", "Alt 4", "Alt 5"],
  "youtubeDescription": "Complete structured description",
  "hashtags": ["#Tag1", "#Tag2"],
  "youtubeTags": ["tag1", "tag2"],
  "keywords": ["keyword1", "keyword2"],
  "thumbnailText": "PUNCHY TEXT",
  "hook": "Spoken hook text",
  "cta": "Spoken CTA",
  "disclaimer": "Standard ethical disclaimer",
  "shortsCaption": "Shorts caption with tags",
  "tiktokCaption": "TikTok caption with tags",
  "facebookCaption": "Facebook post caption",
  "pinnedComment": "Friendly engaging pinned comment with question",
  "communityPost": "Engaging community tab post",
  "seoAnalysis": {
    "score": 88,
    "keywordRelevance": {"score": 90, "explanation": "Why keywords fit"},
    "searchIntent": {"score": 88, "explanation": "How it satisfies search queries"},
    "titleClarity": {"score": 92, "explanation": "Clarity assessment"},
    "descriptionQuality": {"score": 85, "explanation": "Structure analysis"},
    "keywordCoverage": {"score": 87, "explanation": "Coverage across short and long tail"},
    "readability": {"score": 89, "explanation": "Flesch-Kincaid & visual spacing evaluation"},
    "audienceRelevance": {"score": 91, "explanation": "Resonance with target viewers"},
    "overallAssessment": "Overall objective strategic advice"
  }
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Content assistant generation failed:', err);
    const errMsg = String(err?.message || err);
    return res.status(503).json({
      error: 'AI service is temporarily unavailable.',
      details: errMsg.includes('API_KEY_INVALID') || errMsg.includes('403')
        ? 'The configured GEMINI_API_KEY is invalid or unauthorized.'
        : 'The AI model request failed. Please try again with a descriptive prompt.'
    });
  }
});

// Thumbnail Concept Generation
apiRouter.post(['/ai/thumbnail-concept', '/api/ai/thumbnail-concept'], async (req, res) => {
  try {
    const { idea, title, style, aspectRatio } = req.body;
    if (!idea || typeof idea !== 'string' || idea.trim() === '') {
      return res.status(400).json({ error: 'Thumbnail idea is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI configuration is missing.',
        details: 'GEMINI_API_KEY is not configured in Vercel project environment variables. Please add GEMINI_API_KEY in Vercel Project Settings > Environment Variables.'
      });
    }

    const prompt = `You are Kiran AI Video Studio's master thumbnail designer.
Create a high CTR thumbnail concept for:
Idea: "${idea}"
Main Title: "${title || ''}"
Style: "${style || 'Viral-style creator thumbnail'}"
Aspect Ratio: "${aspectRatio || '16:9'}"

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "concept": "Core visual thumbnail composition concept",
  "layoutDescription": "Rule of thirds arrangement, subject position, text zone",
  "mainHeadline": "3-4 word high contrast headline",
  "subHeadline": "Optional punchy subheader",
  "colorPalette": ["#6366F1", "#06B6D4", "#F59E0B", "#111827"],
  "badgeText": "4K HDR",
  "imagePrompt": "Full AI image generation prompt for Imagen or Midjourney with cinematic camera lenses, lighting, and textures",
  "style": "${style || 'Viral'}"
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Thumbnail concept generation failed:', err);
    const errMsg = String(err?.message || err);
    return res.status(503).json({
      error: 'AI service is temporarily unavailable.',
      details: errMsg.includes('API_KEY_INVALID') || errMsg.includes('403')
        ? 'The configured GEMINI_API_KEY is invalid or unauthorized.'
        : 'The AI model request failed. Please try again with a descriptive thumbnail idea.'
    });
  }
});

// AI Website Guide Endpoint
apiRouter.post(['/ai/guide', '/api/ai/guide'], async (req, res) => {
  try {
    const { message, history } = req.body;
    const userMessage = (message || '').trim();

    if (!userMessage) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const ai = getGeminiClient();

    // Whitelist of valid tool IDs currently live on Kiran AI Video Studio
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
        purpose: 'YouTube SEO and metadata optimizer. Generates 5 high-CTR titles, structured descriptions with chapters/timestamps, tags, hashtags, and objective 0-100 SEO scoring.'
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
3. "content-assistant" (Content & SEO Assistant): YouTube SEO, 5 title variations, full structured description with chapters/timestamps, keyword tags, hashtags, 0-100 objective SEO score.
4. "thumbnail-maker" (Thumbnail Concept Designer): High-CTR thumbnail composition, visual layout rules (Rule of Thirds, Split Screen), bold headline typography, color palettes, and AI image generator prompts.
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
- If the visitor writes in Romanized Nepali (e.g., "mero song ko lagi title ra description chahiyo", "Shorts kasari banaune?"), reply naturally in Romanized Nepali / Nepali style!
- If the visitor writes in Devanagari Nepali, reply in Devanagari Nepali.
- If the visitor writes in Hindi, reply in Hindi.
- If the visitor writes in English, reply in English.
- If the visitor mixes languages (e.g. English + Nepali), reply naturally in the same mixed conversational style. Do NOT force English.

2. HONESTY & ACCURACY:
- Only recommend tools from the exact list above.
- NEVER invent a feature.
- NEVER pretend a feature works if it does not exist (for example: we do NOT have automated cloud MP4 rendering, direct auto-uploading to YouTube, or AI voice cloning).
- If none of the current tools can solve the user's request, be honest in their language:
  "Currently, Kiran AI Video Studio does not have a tool for that." (or translated to user's language).
- If the user asks something unrelated to video creation (e.g. math, coding, cooking), answer briefly if appropriate, and then explain whether Kiran AI Video Studio has a relevant creative feature.

3. NO FALSE CLAIMS:
- NEVER make claims like: guaranteed viral, guaranteed views, guaranteed subscribers, guaranteed monetization, or 100% accurate.
- Be genuinely helpful rather than promotional.

4. EXPLANATION STRUCTURE:
In your response message:
- Clearly state what the visitor wants to accomplish.
- Explain which Kiran AI tool(s) can help them.
- Explain why each tool is relevant.
- Explain how to use it.
- Explain what result they can expect.
- If more than one tool is useful, explain them in a simple, logical sequence (e.g., 1. Video Planner -> 2. Thumbnail -> 3. SEO Assistant).

OUTPUT FORMAT:
Respond with ONLY valid JSON (no markdown ticks):
{
  "userGoal": "Concise summary of user's goal",
  "detectedLanguage": "Detected language/dialect name",
  "message": "Your helpful response explaining their goal, recommended tools, how to use them, and what to expect in their language",
  "recommendedTools": [
    {
      "id": "one-of-the-allowed-ids-above",
      "name": "Exact Name of Tool",
      "reason": "Short reason why this tool helps their goal (in user's language)"
    }
  ]
}`;

        const prompt = `${systemPrompt}

${formattedHistory ? `PREVIOUS CONVERSATION:\n${formattedHistory}\n\n` : ''}LATEST VISITOR MESSAGE:
"${userMessage}"`;

        const rawText = await generateGeminiContentWithFallback(ai, prompt);
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const parsed = JSON.parse(cleaned);

        // Sanitize recommendedTools so only real whitelist tools can ever be returned
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
        console.warn('Gemini AI Guide using semantic fallback:', err?.message || String(err));
      }
    }

    // High quality intelligent offline / fallback analyzer
    const lower = userMessage.toLowerCase();

    // Language detection heuristics
    const isRomanizedNepali = /\b(mero|chahiyo|kasari|geet|banaune|suno|namaste|hunchha|huncha|pani|lai|cha|ko|ma|garnu|banauna|thaha|kasto)\b/i.test(lower);
    const isDevanagariNepali = /[\u0900-\u097F]/.test(userMessage);
    const isHindi = /\b(kaise|kare|mujhe|chahiye|karna|hai|mera|meri|gaana|bana|sakte|kripya)\b/i.test(lower) || /[\u0900-\u097F]/.test(userMessage) && /(चाहिए|कैसे|करें|बनाना|थंबनेल)/.test(userMessage);

    // Intent checks (support both ASCII and Unicode without \b for Devanagari)
    const wantsMusicOrSong = /(song|music|geet|gaana|lyrics|melody|singer|गीत|गाना|संगीत)/i.test(lower);
    const wantsSEOOrTitle = /(title|description|seo|tag|tags|hashtag|hashtags|keywords|शीर्षक|विवरण|ट्याग)/i.test(lower);
    const wantsThumbnail = /(thumbnail|cover|poster|photo|image|banner|थम्बनेल|थंबनेल|तस्बिर|फोटो)/i.test(lower);
    const wantsShorts = /(short|shorts|reel|reels|tiktok|vertical|9:16|hook|कथा)/i.test(lower);
    const wantsEditor = /(edit|editor|timeline|trim|cut|audio track|volume|layers|एडिटर|सम्पादन)/i.test(lower);
    const wantsVideoPlan = /(video|script|screenplay|youtube|tourism|documentary|vlog|travel|nepal|camera|भिडियो|योजना)/i.test(lower);
    const wantsAbout = /(about|who made|kiran|chaulagain|creator|developer|किरण)/i.test(lower);
    const wantsContact = /(contact|email|support|feedback|bug|help|सम्पर्क)/i.test(lower);

    // Check for clearly unsupported features
    const wantsDirectRender = /(render.*mp4|mp4.*render|download.*mp4|make.*mp4|generate.*mp4|export.*mp4|direct.*mp4|mp4|upload to youtube|direct upload|voice clone|deepfake)/i.test(lower);
    const isUnrelated = /\b(python|javascript|bitcoin|crypto|math|physics|biology|weather|recipe|cooking|president)\b/i.test(lower);

    if (wantsDirectRender) {
      if (isDevanagariNepali) {
        return res.json({
          userGoal: 'सिधै क्लाउड MP4 भिडियो रेन्डर गर्ने सुविधा',
          detectedLanguage: 'Nepali (नेपाली)',
          message: 'Currently, Kiran AI Video Studio does not have a tool for direct cloud MP4 rendering. किरण एआई भिडियो स्टुडियोले मल्टि-सिन पटकथा (screenplay) योजना, क्यामेरा एंगल्स, र इन-ब्राउजर टाइमलाइन भिडियो एडिटर प्रदान गर्दछ, तर सिधै MP4 फाइल रेन्डर गर्ने फार्म उपलब्ध छैन। तपाईं आफ्नो भिडियो दृश्य योजना तयार गरेर टाइमलाइन एडिटरमा ट्र्याकहरू मिलाउन सक्नुहुन्छ।',
          recommendedTools: [
            { id: 'video-generator', name: 'AI Video Planner', reason: 'सम्पूर्ण भिडियोको सिन र दृश्य योजना तयार गर्न' },
            { id: 'video-editor', name: 'Timeline Video Editor', reason: 'ब्राउजर टाइमलाइनमा भिडियो र अडियो ट्र्याक मिलाउन' }
          ]
        });
      }
      if (isRomanizedNepali) {
        return res.json({
          userGoal: 'Automated direct MP4 video rendering',
          detectedLanguage: 'Romanized Nepali',
          message: 'Currently, Kiran AI Video Studio does not have a tool for that. Kiran AI Video Studio le scene-by-scene screenplay planning, camera directions, ra browser timeline editor pradan garcha, tara automatic cloud MP4 video rendering farm uplabdha chaina. Tapai aafno project ko scene plan tayar gari timeline editor ma review garna saknu huncha.',
          recommendedTools: [
            { id: 'video-generator', name: 'AI Video Planner', reason: 'Video screenplay ra scene breakdown plan garna' },
            { id: 'video-editor', name: 'Timeline Video Editor', reason: 'Browser timeline ma clips ra audio review garna' }
          ]
        });
      }
      return res.json({
        userGoal: 'Automated direct MP4 video rendering',
        detectedLanguage: 'English',
        message: 'Currently, Kiran AI Video Studio does not have a tool for direct cloud MP4 video rendering. Kiran AI Video Studio is specialized for multi-scene screenplay planning, 9:16 vertical shorts pacing, high-CTR thumbnail composition, and YouTube SEO optimization. You can plan your full video scenes with exact camera angles and assemble tracks in our browser Timeline Video Editor.',
        recommendedTools: [
          { id: 'video-generator', name: 'AI Video Planner', reason: 'Structure your complete multi-scene screenplay and visual prompts' },
          { id: 'video-editor', name: 'Timeline Video Editor', reason: 'Inspect and trim media tracks on an in-browser timeline' }
        ]
      });
    }

    if (isUnrelated) {
      return res.json({
        userGoal: 'General non-video inquiry',
        detectedLanguage: isDevanagariNepali ? 'Nepali (नेपाली)' : isRomanizedNepali ? 'Romanized Nepali' : 'English',
        message: isDevanagariNepali
          ? 'Currently, Kiran AI Video Studio does not have a tool for that. किरण एआई भिडियो स्टुडियो भिडियो निर्माता, युट्युबर, र संगीतकारहरूका लागि भिडियो पटकथा, युट्युब SEO, थम्बनेल, र सर्ट्स योजना गर्न बनाइएको प्लेटफर्म हो।'
          : isRomanizedNepali
          ? 'Currently, Kiran AI Video Studio does not have a tool for that. Kiran AI Video Studio video creators, YouTubers, ra musicians haru ko lagi video scripts, YouTube SEO, thumbnails, ra shorts planning garna banaiyeko creative workspace ho.'
          : 'Currently, Kiran AI Video Studio does not have a tool for that inquiry. Kiran AI Video Studio is focused specifically on video creation: screenplay script planning, YouTube Shorts pacing, high-CTR thumbnail concepts, and YouTube SEO optimization.',
        recommendedTools: []
      });
    }

    // Devanagari Nepali Thumbnail
    if (isDevanagariNepali && wantsThumbnail) {
      return res.json({
        userGoal: 'थम्बनेल डिजाइन र कन्सेप्ट योजना',
        detectedLanguage: 'Nepali (नेपाली)',
        message: 'तपाईंको युट्युब भिडियोको लागि थम्बनेल योजना गर्न किरण एआई भिडियो स्टुडियोको **Thumbnail Concept Designer** टुल उपलब्ध छ। यसले Rule of Thirds भिजुअल लेआउट, रङ्ग कन्ट्रास्ट, बोल्ड शीर्षक अक्षरहरू (typography), र एआई इमेज प्रम्प्टहरू प्रदान गर्दछ।',
        recommendedTools: [
          { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'उच्च CTR भएको थम्बनेल लेआउट र प्रम्प्ट योजना गर्न' }
        ]
      });
    }

    // Romanized Nepali Song/SEO
    if (isRomanizedNepali && wantsMusicOrSong) {
      return res.json({
        userGoal: 'Song title, description, and visual storyboard planning',
        detectedLanguage: 'Romanized Nepali',
        message: 'Tapai ko song ko lagi title ra description tayar garna Kiran AI Video Studio ko **Content & SEO Assistant** tool le madat garcha. Yo tool le 5 ota high-CTR YouTube titles, timestamps sahitko description, tags, ra hashtags banai dincha.\n\nSaathai, yadi tapai lai aafno geet ko visual storyline, verse-by-verse scene pacing, ra character emotions plan garna man cha bhane **Music Video Storyboarder** tool pani ekdam upayogee huncha!',
        recommendedTools: [
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Song ko lagi YouTube SEO titles, description, ra tags banauna' },
          { id: 'music-video', name: 'Music Video Storyboarder', reason: 'Geet ko verse ra chorus visual storyline plan garna' }
        ]
      });
    }

    // Devanagari Nepali Song/SEO
    if (isDevanagariNepali && wantsMusicOrSong) {
      return res.json({
        userGoal: 'गीतको शीर्षक, विवरण र भिडियो योजना',
        detectedLanguage: 'Nepali (नेपाली)',
        message: 'तपाईंको नयाँ गीतको लागि युट्युब शीर्षक र विवरण तयार गर्न **Content & SEO Assistant** टुल उपलब्ध छ। यसले ५ वटा आकर्षक शीर्षकहरू, टाइमस्ट्याम्प सहितको विवरण, र ट्यागहरू बनाउँछ।\n\nसाथै, गीतको कथा र दृश्यहरू (storyboard) योजना गर्न **Music Video Storyboarder** टुल प्रयोग गर्न सक्नुहुन्छ!',
        recommendedTools: [
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'गीतको लागि युट्युब शीर्षक र विवरण तयार गर्न' },
          { id: 'music-video', name: 'Music Video Storyboarder', reason: 'गीतको दृश्य कथा र क्यारेक्टर भावना योजना गर्न' }
        ]
      });
    }

    // Thumbnail specific request
    if (wantsThumbnail) {
      if (isRomanizedNepali) {
        return res.json({
          userGoal: 'Thumbnail concept & visual design idea',
          detectedLanguage: 'Romanized Nepali',
          message: 'Tapai ko video ko lagi thumbnail concept banauna **Thumbnail Concept Designer** tool uplabdha cha. Yasle Rule of Thirds layout, visual contrast, bold headline typography ideas, ra AI image generator prompt pradan garcha.',
          recommendedTools: [
            { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'High-CTR YouTube thumbnail ideas ra AI visual prompt prapta garna' }
          ]
        });
      }
      return res.json({
        userGoal: 'High-CTR thumbnail concept & composition',
        detectedLanguage: 'English',
        message: 'To get compelling thumbnail ideas, you can use our **Thumbnail Concept Designer**. It provides proven Rule of Thirds layout architecture, focal subject guidelines, high-contrast bold typography suggestions, color palettes, and copy-ready AI image prompts.',
        recommendedTools: [
          { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'Create visual composition guidelines and headline concepts' }
        ]
      });
    }

    // Shorts / Reels specific
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

    // Nepal Tourism / YouTube Video Workflow
    if (wantsVideoPlan) {
      if (isRomanizedNepali) {
        return res.json({
          userGoal: 'YouTube video production workflow',
          detectedLanguage: 'Romanized Nepali',
          message: 'YouTube video plan garna tapai 3 ota tools step-by-step prayog garna saknu huncha:\n\n1. **AI Video Planner**: Scene-by-scene script, camera movements, ra voiceover plan garna.\n2. **Thumbnail Concept Designer**: High-contrast thumbnail visual ideas ra layout tayar garna.\n3. **Content & SEO Assistant**: 5 ota catchy titles, timestamps sahitko description, ra tags generate garna.',
          recommendedTools: [
            { id: 'video-generator', name: 'AI Video Planner', reason: 'Full video screenplay ra camera shots plan garna' },
            { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'Clickable thumbnail composition banauna' },
            { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'YouTube SEO titles, description, ra tags prapta garna' }
          ]
        });
      }
      return res.json({
        userGoal: 'Comprehensive YouTube video creation workflow',
        detectedLanguage: 'English',
        message: 'To produce a successful YouTube video, you can follow this simple 3-step workflow on Kiran AI Video Studio:\n\n1. **AI Video Planner**: Structure your multi-scene screenplay with camera movements, dialogue, voiceover, and scenic pacing.\n2. **Thumbnail Concept Designer**: Design high-contrast thumbnail compositions with focal subject positioning and bold typography.\n3. **Content & SEO Assistant**: Generate 5 optimized titles, structured chapters/timestamps description, and high-relevance tags.',
        recommendedTools: [
          { id: 'video-generator', name: 'AI Video Planner', reason: 'Generate multi-scene script with camera shots and voiceover' },
          { id: 'thumbnail-maker', name: 'Thumbnail Concept Designer', reason: 'Design high-CTR thumbnail layouts and image prompts' },
          { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate YouTube SEO metadata, tags, and timestamps' }
        ]
      });
    }

    // Default welcoming guide response
    return res.json({
      userGoal: 'Creative video guidance',
      detectedLanguage: isRomanizedNepali ? 'Romanized Nepali' : 'English',
      message: isRomanizedNepali
        ? 'Namaste! Kiran AI Video Studio ma tapai lai swagat cha. Tapai YouTube video script, vertical Shorts, SEO tags/descriptions, thumbnail concepts, athawa music video visual plan garna saknu huncha. Tapai ke banauna chahanu huncha?'
        : 'Welcome to Kiran AI Video Studio! I am here to understand your creative goal and guide you to the exact tools you need. Whether you want to plan a multi-scene YouTube video, outline vertical Shorts, design high-CTR thumbnails, or optimize YouTube SEO metadata, let me know what you want to create.',
      recommendedTools: [
        { id: 'video-generator', name: 'AI Video Planner', reason: 'Plan complete multi-scene video screenplays' },
        { id: 'shorts-creator', name: 'Shorts & Reels Creator', reason: 'Craft 9:16 vertical shorts with 3-second hooks' },
        { id: 'content-assistant', name: 'Content & SEO Assistant', reason: 'Generate YouTube titles, descriptions, and tags' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: 'AI Guide processing failed. Please try again.' });
  }
});


// Video Generation Job Endpoints
apiRouter.post(['/video/jobs', '/api/video/jobs'], async (req, res) => {
  try {
    const job = await VideoGenerationService.startJob(req.body);
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Mount the API Router at both '/api' and root '/'
// This guarantees that requests with or without the '/api' prefix (e.g. from Vercel rewrites or direct fetch) always resolve correctly.
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Explicit 404 Handler for unrecognized /api endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}` });
});

// Global Express error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: err?.message || 'An internal server error occurred. Please try again.',
    status: 500
  });
});

// Vite Middleware Setup for Dev & Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kiran AI Video Studio server running on http://0.0.0.0:${PORT}`);
  });
}

// Auto-start server in standalone Node or Cloud Run container
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.SERVERLESS
);

if (!isServerless && process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
