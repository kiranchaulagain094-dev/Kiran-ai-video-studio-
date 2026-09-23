import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ override: true });

import { GoogleGenAI } from '@google/genai';
import { VideoGenerationService } from '../src/services/videoGeneration.ts';

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Dedicated API Router mounted at both /api and root /
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

// Resilient Gemini caller with fast fallback and strict timeouts for Vercel Serverless
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<string> {
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
      // 7.5 second timeout per candidate to stay well within Vercel execution window
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

  const errMsg = lastError?.message || String(lastError || '');
  if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429') || errMsg.includes('quota')) {
    const customErr: any = new Error('Gemini API quota is temporarily exhausted. Please check your billing or try again in a few moments.');
    customErr.status = 429;
    throw customErr;
  }

  throw lastError || new Error('All Gemini model candidates were unavailable.');
}

// System Status & Health
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
Target Aspect Ratio: "${aspectRatio || '16:9'}"
Target Duration: "${duration || '3-5 minutes'}"
Visual Style: "${style || 'Cinematic'}"
Voice/Tone: "${voice || 'Engaging & Authentic'}"
Target Language: "${language || 'English / Nepali'}"
Music Direction: "${music || 'Inspirational Cinematic'}"

IMPORTANT INSTRUCTIONS:
1. Divide the video into 4 to 7 coherent sequential scenes with explicit timeRange brackets.
2. Provide a compelling high-level narrative summary of the video.
3. Provide the full complete spoken voiceover or narrator script.
4. For each scene:
   - sceneNumber (integer)
   - description (cinematic action description)
   - visualPrompt (concise image/video generator prompt with lighting and composition details)
   - timeRange (e.g. "0:00 - 0:45")
   - cameraAngle (e.g. "Wide Establishing Aerial Shot", "Medium Close-up Tracking Shot")
   - audioNotes (e.g. "Gentle acoustic guitar swells, distant birds chirping")
   - narratorText (exact spoken words for this scene)

Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "High level story and narrative overview",
  "fullScript": "Complete unbroken voiceover / dialogue script",
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "Scene action description",
      "visualPrompt": "AI Image/Veo Prompt for this shot",
      "timeRange": "0:00 - 0:30",
      "cameraAngle": "Camera shot description",
      "audioNotes": "Sound design notes",
      "narratorText": "Spoken dialogue"
    }
  ]
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    if (!parsed.summary || !Array.isArray(parsed.scenes)) {
      throw new Error('Malformed screenplay JSON structure returned by Gemini.');
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Video plan generation error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      error: 'Failed to generate video plan.',
      details: err?.message || 'Gemini API call failed.'
    });
  }
});

// Shorts & Reels Plan Generation
apiRouter.post(['/ai/shorts-plan', '/api/ai/shorts-plan'], async (req, res) => {
  try {
    const { topic, hook, script, visualStyle, voice, music, captionStyle } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ error: 'Shorts topic is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI configuration is missing.',
        details: 'GEMINI_API_KEY is not configured in Vercel project environment variables.'
      });
    }

    const prompt = `You are a viral vertical video strategist specialized in 9:16 YouTube Shorts, Instagram Reels, and TikTok.
Create an ultra-high retention vertical short plan for:
Topic: "${topic}"
Initial Hook Idea: "${hook || 'Pattern interrupt hook'}"
Draft Notes: "${script || 'Create fresh high-energy script'}"
Visual Style: "${visualStyle || 'Dynamic Modern'}"
Voice/Tone: "${voice || 'High-energy & Punchy'}"
Music Mood: "${music || 'Upbeat energetic rhythm'}"
Caption Style: "${captionStyle || 'Bold pop-word animations'}"

Respond ONLY with a valid JSON object matching this schema:
{
  "hook": "Opening 0-3 second magnetic visual and verbal hook",
  "script": "Complete spoken script under 150 words optimized for 30-45 seconds",
  "scenes": [
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
    console.error('Shorts plan generation error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      error: 'Failed to generate Shorts plan.',
      details: err?.message || 'Gemini API call failed.'
    });
  }
});

// Content & SEO Assistant
apiRouter.post(['/ai/content-assistant', '/api/ai/content-assistant'], async (req, res) => {
  try {
    const { prompt: userTopic, videoType, targetAudience, language, mainKeyword } = req.body;
    if (!userTopic || typeof userTopic !== 'string' || userTopic.trim() === '') {
      return res.status(400).json({ error: 'Video topic or script summary is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI configuration is missing.',
        details: 'GEMINI_API_KEY is not configured in Vercel project environment variables.'
      });
    }

    const prompt = `You are a YouTube algorithm and SEO optimization specialist for Kiran AI Video Studio.
Generate an elite YouTube content pack for:
Topic/Script: "${userTopic}"
Video Format: "${videoType || 'YouTube Video'}"
Target Audience: "${targetAudience || 'Creators & General Audience'}"
Primary Keyword: "${mainKeyword || 'Auto-extract primary keyword'}"
Language: "${language || 'English / Nepali'}"

CRITICAL REQUIREMENTS:
1. Provide 5 distinct title variations categorized by psychological angle: High CTR Curiosity, Search SEO Optimized, Emotional Story, How-To/Educational, and Viral Question.
2. Provide a structured description containing:
   - 2-sentence hook above the fold (first 150 characters crucial)
   - Detailed value synopsis
   - Chapter timestamp outline
   - Resource links section placeholder
   - Connect with creator section
3. 20-30 comma-separated keyword tags.
4. 5-8 relevant hashtags.
5. An objective 0-100 SEO score with 3 concrete bullet points for improvement.

Respond ONLY with a valid JSON object matching this schema:
{
  "titles": [
    "Title option 1",
    "Title option 2",
    "Title option 3",
    "Title option 4",
    "Title option 5"
  ],
  "description": "Full structured YouTube description with timestamps and links",
  "tags": ["tag1", "tag2", "tag3"],
  "hashtags": ["#tag1", "#tag2"],
  "seoScore": 92,
  "seoFeedback": [
    "Strength 1",
    "Strength 2",
    "Actionable tip"
  ]
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Content assistant error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      error: 'Failed to generate content pack.',
      details: err?.message || 'Gemini API call failed.'
    });
  }
});

// Thumbnail Concept Designer
apiRouter.post(['/ai/thumbnail-concept', '/api/ai/thumbnail-concept'], async (req, res) => {
  try {
    const { idea, title, style, aspectRatio } = req.body;
    if (!idea || typeof idea !== 'string' || idea.trim() === '') {
      return res.status(400).json({ error: 'Video concept or title is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI configuration is missing.',
        details: 'GEMINI_API_KEY is not configured in Vercel project environment variables.'
      });
    }

    const prompt = `You are a YouTube thumbnail art director responsible for high-CTR thumbnail compositions.
Design a thumbnail visual blueprint for:
Video Idea: "${idea}"
Video Title: "${title || 'Creative Video'}"
Visual Style: "${style || 'Bold & High Contrast'}"
Aspect Ratio: "${aspectRatio || '16:9'}"

Provide:
1. Headline text: 2 to 4 words maximum in bold contrasting typography.
2. Layout structure: Rule of Thirds, Left-Right Split, or Center Shock.
3. Focal point description: Primary expressive subject/face or object.
4. Color palette: 3 complementary high-contrast colors (e.g., Electric Yellow, Midnight Blue, Crisp White).
5. Background scene description.
6. A copy-ready AI Image generation prompt for Midjourney / Imagen 3 / DALL-E.

Respond ONLY with a valid JSON object matching this schema:
{
  "headlineText": "3-WORD BOLD HOOK",
  "layoutStructure": "Rule of Thirds: Subject on right, bold typography anchored left",
  "focalPoint": "Expressive creator face with shocked expression looking towards glowing object",
  "colorPalette": ["#FFD700", "#1E3A8A", "#FFFFFF"],
  "backgroundScene": "Dark cinematic atmospheric backdrop with subtle neon rim lighting",
  "imagePrompt": "Cinematic 8k close-up photograph of an expressive creator looking at glowing device, volumetric rim lighting, vibrant high contrast colors, photorealistic, 16:9 ratio"
}`;

    const text = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = extractJsonFromText(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Thumbnail concept error:', err);
    res.status(err.status === 429 ? 429 : 500).json({
      error: 'Failed to generate thumbnail concept.',
      details: err?.message || 'Gemini API call failed.'
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
- Support ALL languages (Nepali, Romanized Nepali, Hindi, English, etc.).
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
- NEVER make claims like: guaranteed viral, guaranteed views, guaranteed subscribers, or 100% accurate.

OUTPUT FORMAT:
Respond with ONLY valid JSON (no markdown ticks):
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

        const prompt = `${systemPrompt}

${formattedHistory ? `PREVIOUS CONVERSATION:\n${formattedHistory}\n\n` : ''}LATEST VISITOR MESSAGE:
"${userMessage}"`;

        const rawText = await generateGeminiContentWithFallback(ai, prompt);
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const parsed = JSON.parse(cleaned);

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

    // Intent checks
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
          message: 'Currently, Kiran AI Video Studio does not have a tool for direct cloud MP4 rendering. किरण एआई भिडियो स्टुडियोले मल्टि-सिन पटकथा (screenplay) योजना, क्यामेरा एंगल्स, र इन-ब्राउजर टाइमलाइन भिडियो एडिटर प्रदान गर्दछ, तर सिधै MP4 फाइल रेन्डर गर्ने सुविधा उपलब्ध छैन। तपाईं आफ्नो भिडियो दृश्य योजना तयार गरेर टाइमलाइन एडिटरमा ट्र्याकहरू मिलाउन सक्नुहुन्छ।',
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
          message: 'Currently, Kiran AI Video Studio does not have a tool for that. Kiran AI Video Studio le scene-by-scene screenplay planning, camera directions, ra browser timeline editor pradan garcha, tara automatic cloud MP4 video rendering uplabdha chaina. Tapai aafno project ko scene plan tayar gari timeline editor ma review garna saknu huncha.',
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

    // Video plan workflow
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

apiRouter.get(['/video/jobs/:id', '/api/video/jobs/:id'], async (req, res) => {
  try {
    const job = await VideoGenerationService.getJobStatus(req.params.id);
    res.json(job);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Mount the API Router at both '/api' and root '/'
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
  res.status(err.status || 500).json({
    error: err?.message || 'An internal server error occurred. Please try again.',
    status: err.status || 500
  });
});

export { app, apiRouter };
export default app;
