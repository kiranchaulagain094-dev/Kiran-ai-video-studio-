import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  RefreshCw, 
  Film, 
  Camera, 
  Layers, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Scissors, 
  Volume2, 
  Tv, 
  HelpCircle,
  FileText,
  RotateCcw,
  Camera as CameraIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  ExternalLink,
  BookOpen,
  Monitor
} from 'lucide-react';
import { OneMinuteTimelinePlan, OneMinuteTimelineScene, Project } from '../../types';
import { StudioApiService } from '../../services/api';

interface OneMinuteTimelinePlannerProps {
  onOpenEditor?: (project: Project) => void;
  onNavigateHome?: () => void;
}

export const OneMinuteTimelinePlanner: React.FC<OneMinuteTimelinePlannerProps> = ({
  onOpenEditor,
  onNavigateHome
}) => {
  // Input form state
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [showScriptInput, setShowScriptInput] = useState(false);
  const [durationOption, setDurationOption] = useState<string>('1 MIN');
  const [videoStyle, setVideoStyle] = useState('Cinematic');
  const [language, setLanguage] = useState('English');
  const [visualStyle, setVisualStyle] = useState('Photorealistic Cinematic');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<OneMinuteTimelinePlan | null>(null);

  // Screenshot Mode state
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [screenshotSceneIndex, setScreenshotSceneIndex] = useState(0);

  // In-place Editing state
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<OneMinuteTimelineScene>>({});
  
  // Single scene regeneration state
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [showRegenModalForId, setShowRegenModalForId] = useState<string | null>(null);

  // Copy feedback state: tracks copied status by scene ID and field
  const [copiedFlowId, setCopiedFlowId] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [copiedVisualId, setCopiedVisualId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<string | null>(null);

  // Flow Guide expandable accordion state
  const [isFlowGuideOpen, setIsFlowGuideOpen] = useState(true);

  // Active scene highlight from clicking timeline bar
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const sceneCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const durationOptionsList = [
    { label: '15 SEC', desc: '15 seconds' },
    { label: '30 SEC', desc: '30 seconds' },
    { label: '1 MIN', desc: '60 seconds (Default)' },
    { label: '2 MIN', desc: '120 seconds' },
    { label: '3 MIN', desc: '180 seconds' },
    { label: '4 MIN', desc: '240 seconds' },
    { label: '5 MIN', desc: '300 seconds' }
  ];

  // Quick sample templates for testing
  const sampleScenarios = [
    {
      title: 'YouTube Explainer (AI Video)',
      topic: 'Create a 1-minute YouTube video explaining AI video generation and diffusion models to beginners.',
      duration: '1 MIN',
      videoStyle: 'YouTube Explainer',
      language: 'English',
      visualStyle: 'Photorealistic Cinematic',
      aspectRatio: '16:9' as const
    },
    {
      title: 'Kiran Studio Demo Workflow',
      topic: 'Tutorial demonstrating Kiran AI Video Studio: How to plan videos, copy Google Flow prompts, and upload UI screenshots.',
      duration: '1 MIN',
      videoStyle: 'Tutorial',
      language: 'English',
      visualStyle: 'Studio High-Key Commercial',
      aspectRatio: '16:9' as const
    },
    {
      title: 'Romanized Nepali Creator Guide',
      topic: 'Ma YouTube ko lagi AI bata video banauna chahanchu, step by step creator guide.',
      duration: '1 MIN',
      videoStyle: 'Social Media',
      language: 'Romanized Nepali',
      visualStyle: 'Clean Minimalist 4K',
      aspectRatio: '9:16' as const
    },
    {
      title: 'Acoustic Music Video Story',
      topic: 'Acoustic Indie Folk: Rain falling on old Kathmandu rooftops, solitary tea stall, and emotional longing.',
      duration: '2 MIN',
      videoStyle: 'Music Video',
      language: 'English',
      visualStyle: 'Vintage Film / 35mm',
      aspectRatio: '16:9' as const
    },
    {
      title: 'SaaS Mobile App 30s Hook',
      topic: 'NextGen AI Video Studio mobile app: Turn raw smartphone ideas into 4K cinematic scenes in seconds.',
      duration: '30 SEC',
      videoStyle: 'Product/Tech Promo',
      language: 'English',
      visualStyle: 'Studio High-Key Commercial',
      aspectRatio: '9:16' as const
    }
  ];

  const handleLoadSample = (sample: typeof sampleScenarios[0]) => {
    setTopic(sample.topic);
    setDurationOption(sample.duration);
    setVideoStyle(sample.videoStyle);
    setLanguage(sample.language);
    setVisualStyle(sample.visualStyle);
    setAspectRatio(sample.aspectRatio);
    setError(null);
  };

  const handleClear = () => {
    setTopic('');
    setScript('');
    setShowScriptInput(false);
    setError(null);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a video topic, idea, or script.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedPlan = await StudioApiService.generateOneMinuteTimeline({
        topic: topic.trim(),
        script: script.trim() ? script.trim() : undefined,
        durationOption,
        videoStyle,
        language,
        visualStyle,
        aspectRatio
      });
      setPlan(generatedPlan);
      setIsScreenshotMode(false);
      setScreenshotSceneIndex(0);

      // Scroll to result smoothly
      setTimeout(() => {
        const el = document.getElementById('timeline-results-view');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err?.message || 'Timeline generation failed. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Timeline Math Rebalancer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const recalculateTimestamps = (scenes: OneMinuteTimelineScene[]): OneMinuteTimelineScene[] => {
    let currentStart = 0;
    return scenes.map((s, idx) => {
      const duration = Math.max(2, Math.round(s.durationSeconds));
      const start = currentStart;
      const end = start + duration;
      currentStart = end;
      return {
        ...s,
        sceneNumber: idx + 1,
        timeRange: `${formatTime(start)}–${formatTime(end)}`,
        startSeconds: start,
        endSeconds: end,
        durationSeconds: duration
      };
    });
  };

  const targetDurationSeconds = plan?.totalDurationSeconds || 60;
  const totalCurrentSeconds = plan?.scenes.reduce((sum, s) => sum + s.durationSeconds, 0) || targetDurationSeconds;

  const handleAutoBalance = () => {
    if (!plan || !plan.scenes.length) return;
    const scenes = [...plan.scenes];
    const sum = scenes.reduce((a, b) => a + b.durationSeconds, 0);
    const diff = targetDurationSeconds - sum;

    let maxIdx = 0;
    for (let i = 1; i < scenes.length; i++) {
      if (scenes[i].durationSeconds > scenes[maxIdx].durationSeconds) maxIdx = i;
    }
    scenes[maxIdx] = {
      ...scenes[maxIdx],
      durationSeconds: Math.max(2, scenes[maxIdx].durationSeconds + diff)
    };

    const rebalanced = recalculateTimestamps(scenes);
    setPlan({
      ...plan,
      scenes: rebalanced
    });
  };

  // In-Place Scene Editing
  const startEditingScene = (scene: OneMinuteTimelineScene) => {
    setEditingSceneId(scene.id);
    setEditData({ ...scene });
  };

  const saveEditingScene = () => {
    if (!plan || !editingSceneId) return;
    const updatedScenes = plan.scenes.map(s => {
      if (s.id === editingSceneId) {
        return {
          ...s,
          ...editData,
          durationSeconds: Math.max(2, Math.round(Number(editData.durationSeconds) || s.durationSeconds))
        } as OneMinuteTimelineScene;
      }
      return s;
    });

    const recomputed = recalculateTimestamps(updatedScenes);
    setPlan({
      ...plan,
      scenes: recomputed
    });
    setEditingSceneId(null);
    setEditData({});
  };

  const cancelEditingScene = () => {
    setEditingSceneId(null);
    setEditData({});
  };

  // Single Scene AI Regeneration
  const handleRegenerateScene = async (sceneId: string) => {
    if (!plan) return;
    const sceneIdx = plan.scenes.findIndex(s => s.id === sceneId);
    if (sceneIdx === -1) return;

    const currentScene = plan.scenes[sceneIdx];
    const prevScene = sceneIdx > 0 ? plan.scenes[sceneIdx - 1] : undefined;
    const nextScene = sceneIdx < plan.scenes.length - 1 ? plan.scenes[sceneIdx + 1] : undefined;

    setRegeneratingSceneId(sceneId);
    setShowRegenModalForId(null);

    try {
      const res = await StudioApiService.regenerateTimelineScene({
        topic: plan.title,
        scene: currentScene,
        instruction: regenInstruction.trim() || undefined,
        visualStyle: plan.visualStyle,
        aspectRatio: plan.aspectRatio,
        language: plan.language,
        previousScenePrompt: prevScene?.flowPrompt,
        nextScenePrompt: nextScene?.flowPrompt
      });

      if (res.success && res.scene) {
        const newScenes = [...plan.scenes];
        newScenes[sceneIdx] = {
          ...res.scene,
          id: currentScene.id,
          sceneNumber: currentScene.sceneNumber,
          timeRange: currentScene.timeRange,
          startSeconds: currentScene.startSeconds,
          endSeconds: currentScene.endSeconds,
          durationSeconds: currentScene.durationSeconds,
          referenceGuide: res.scene.referenceGuide || currentScene.referenceGuide
        };

        setPlan({
          ...plan,
          scenes: newScenes,
          fullCombinedScript: newScenes.map(s => s.voiceover).filter(Boolean).join(' ')
        });
      }
    } catch (err: any) {
      alert(`Scene regeneration error: ${err?.message || 'Could not regenerate scene'}`);
    } finally {
      setRegeneratingSceneId(null);
      setRegenInstruction('');
    }
  };

  // Real Clipboard Copy Functionality
  const copyToClipboard = async (text: string, type: 'flow' | 'script' | 'visual' | 'summary', id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'flow' && id) {
        setCopiedFlowId(id);
        setTimeout(() => setCopiedFlowId(null), 2200);
      } else if (type === 'script' && id) {
        setCopiedScriptId(id);
        setTimeout(() => setCopiedScriptId(null), 2200);
      } else if (type === 'visual' && id) {
        setCopiedVisualId(id);
        setTimeout(() => setCopiedVisualId(null), 2200);
      } else {
        setCopiedSummary(type);
        setTimeout(() => setCopiedSummary(null), 2200);
      }
    } catch {
      // Fallback
    }
  };

  // Download Timeline File with full prompts & guides
  const handleDownloadTimeline = () => {
    if (!plan) return;
    let content = `====================================================\n`;
    content += `KIRAN AI VIDEO STUDIO - VIDEO PRODUCTION TIMELINE\n`;
    content += `SCREENSHOT + GOOGLE FLOW PROMPT WORKFLOW\n`;
    content += `====================================================\n\n`;
    content += `PROJECT TITLE: ${plan.title}\n`;
    content += `TARGET DURATION: ${plan.durationOption || '1 MIN'} (${plan.totalDuration})\n`;
    content += `ASPECT RATIO: ${plan.aspectRatio}\n`;
    content += `VIDEO STYLE: ${plan.videoStyle}\n`;
    content += `VISUAL STYLE: ${plan.visualStyle}\n`;
    content += `LANGUAGE: ${plan.language}\n`;
    content += `SCENES COUNT: ${plan.scenesCount}\n\n`;
    content += `====================================================\n`;
    content += `SCENE-BY-SCENE BREAKDOWN & GOOGLE FLOW PROMPTS\n`;
    content += `====================================================\n\n`;

    plan.scenes.forEach(s => {
      content += `SCENE ${String(s.sceneNumber).padStart(2, '0')}\n`;
      content += `TIMING: ${s.timeRange} (Duration: ${s.durationSeconds}s)\n\n`;
      content += `VOICEOVER / SCRIPT:\n"${s.voiceover}"\n\n`;
      content += `VISUAL DESCRIPTION:\n${s.visual}\n\n`;
      content += `ON-SCREEN TEXT:\n"${s.onScreenText}"\n\n`;
      content += `GOOGLE FLOW PROMPT:\n${s.flowPrompt}\n\n`;
      content += `REFERENCE / SCREENSHOT GUIDE:\n${s.referenceGuide || 'Upload suitable visual reference to Google Flow.'}\n\n`;
      content += `----------------------------------------------------\n\n`;
    });

    content += `====================================================\n`;
    content += `FINAL PRODUCTION SUMMARY\n`;
    content += `====================================================\n\n`;
    content += `FULL COMBINED VOICEOVER:\n${plan.fullCombinedScript}\n\n`;
    content += `MUSIC & SOUND DIRECTION:\n${plan.musicSoundDirection}\n\n`;
    content += `TRANSITION STYLE:\n${plan.transitionStyle}\n\n`;
    content += `FINAL CALL TO ACTION:\n${plan.finalCta}\n\n`;
    content += `CONTINUITY NOTES:\n${plan.continuityNotes || 'N/A'}\n\n`;
    content += `HOW TO CREATE WITH GOOGLE FLOW:\n`;
    content += `1. Review the scene visual & screenshot guide.\n`;
    content += `2. Copy the scene Google Flow prompt.\n`;
    content += `3. Upload the referenced screenshot/image into Google Flow.\n`;
    content += `4. Generate your video clip.\n`;
    content += `5. Repeat for all scenes and combine in CapCut or video editor.\n\n`;
    content += `Generated with Kiran AI Video Studio - Independent Video Workspace by Kiran Chaulagain\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_timeline.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Convert to Kiran Studio Project & Open in Video Editor
  const handleOpenInEditor = () => {
    if (!plan || !onOpenEditor) return;
    const newProject: Project = {
      id: 'timeline-' + Date.now(),
      name: plan.title,
      type: plan.videoStyle.includes('Short') || plan.aspectRatio === '9:16' ? 'YouTube Shorts' : 'YouTube Video',
      aspectRatio: plan.aspectRatio,
      duration: `${plan.totalDurationSeconds} seconds` as any,
      style: plan.videoStyle as any,
      voice: 'Custom',
      language: plan.language as any,
      music: 'AI Background Music',
      ideaPrompt: topic,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
      scenes: plan.scenes.map(s => ({
        id: s.id,
        sceneNumber: s.sceneNumber,
        timeRange: s.timeRange,
        title: `Scene ${s.sceneNumber} (${s.timeRange})`,
        description: s.visual,
        visualPrompt: s.flowPrompt,
        cameraMovement: 'Cinematic Camera Flow',
        voiceoverText: s.voiceover,
        soundEffects: s.onScreenText ? `Text Cue: "${s.onScreenText}"` : undefined
      })),
      script: plan.fullCombinedScript,
      description: `${plan.totalDuration} Video Plan: ${plan.title}. Generated with AI Video Timeline Planner.`
    };
    onOpenEditor(newProject);
  };

  // Timeline segment colors for proportional visual bar
  const segmentGradients = [
    'from-indigo-600 to-indigo-500',
    'from-violet-600 to-violet-500',
    'from-fuchsia-600 to-fuchsia-500',
    'from-pink-600 to-pink-500',
    'from-amber-600 to-amber-500',
    'from-emerald-600 to-emerald-500',
    'from-teal-600 to-teal-500',
    'from-cyan-600 to-cyan-500'
  ];

  const scrollToScene = (sceneId: string) => {
    setActiveHighlightId(sceneId);
    const target = sceneCardRefs.current[sceneId];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setActiveHighlightId(null), 3000);
  };

  // Screenshot Mode scene navigation
  const currentScreenshotScene = plan?.scenes[screenshotSceneIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Tool Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121624] via-[#0f121d] to-[#0a0c13] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <CameraIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Screenshot + Google Flow Prompt Workflow</span>
              <span className="text-white/40">•</span>
              <span className="text-cyan-400 font-mono">15s to 5m</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              AI Video Timeline Planner
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Turn any idea or script into a complete scene-by-scene video production plan.
              Review exact timing brackets, voiceovers, on-screen text, screenshot upload guides, and copy-ready Google Flow prompts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('sample-loader-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Presets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Flow Workflow Explainer Card (Accordion) */}
      <div className="rounded-3xl bg-[#0f1320] border border-cyan-500/20 overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setIsFlowGuideOpen(!isFlowGuideOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-indigo-950/20 to-transparent hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              <Film className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>How to Create Your Video with Google Flow</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-normal lowercase">10-step guide</span>
              </h2>
              <p className="text-xs text-slate-400">Kiran Studio generates the production blueprint; you copy prompts directly into Google Flow.</p>
            </div>
          </div>
          <span className="text-xs text-cyan-400 font-semibold">
            {isFlowGuideOpen ? 'Hide Guide' : 'Show Guide'}
          </span>
        </button>

        {isFlowGuideOpen && (
          <div className="p-6 border-t border-white/5 space-y-4 text-xs text-slate-300 bg-[#0d101b]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#141828] border border-white/5 space-y-1">
                <span className="font-mono text-cyan-400 font-bold">Step 1 & 2:</span>
                <p className="text-white font-semibold">Generate Timeline & Review Visuals</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">Enter your idea, pick duration (e.g. 1 MIN), and review scene timing and visual descriptions.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141828] border border-white/5 space-y-1">
                <span className="font-mono text-cyan-400 font-bold">Step 3 & 4:</span>
                <p className="text-white font-semibold">Screenshot Guide & Copy Flow Prompt</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">Check the recommended screenshot/image reference, then click <strong className="text-cyan-300">📋 COPY FLOW PROMPT</strong>.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141828] border border-white/5 space-y-1">
                <span className="font-mono text-cyan-400 font-bold">Step 5, 6 & 7:</span>
                <p className="text-white font-semibold">Open Google Flow & Paste</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">Open Google Flow, upload your reference image or UI screenshot, paste the prompt, and generate the clip.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141828] border border-white/5 space-y-1">
                <span className="font-mono text-cyan-400 font-bold">Step 8, 9 & 10:</span>
                <p className="text-white font-semibold">Repeat & Combine in CapCut</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">Repeat for every scene card, then stitch your generated video clips together in CapCut or your favorite video editor.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Independent Service Advisory:</strong> Google Flow is a separate external generative video service. Kiran AI Video Studio provides the intelligent screenplay architecture, exact timing brackets, screenshot upload guidance, and calibrated prompts.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Formulation Card */}
      <div className="rounded-3xl bg-[#111522] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Video Blueprint Parameters</h2>
              <p className="text-xs text-slate-400">Configure your concept, duration, language, and aesthetic style.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Video Topic / Idea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Video Topic / Idea <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="timeline-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Create a 1-minute video explaining AI video generation and diffusion models, or paste a raw idea in Nepali / Romanized Nepali..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-[#161b2a] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Toggleable Full Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowScriptInput(!showScriptInput)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showScriptInput ? 'Hide Full Script (Optional)' : '+ Add Your Own Script (Optional)'}</span>
              </button>
              <span className="text-[11px] text-slate-500">
                {showScriptInput ? 'We will parse your script into exact scenes' : 'If left empty, AI writes the complete voiceover'}
              </span>
            </div>

            {showScriptInput && (
              <textarea
                id="timeline-script-input"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your voiceover script or dialogue here. The AI will analyze the script and divide it intelligently into scenes matching your selected duration..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-[#161b2a] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
            )}
          </div>

          {/* VIDEO DURATION SELECTOR (15 SEC to 5 MIN) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Video Duration <span className="text-cyan-400">(Exact Math Guarantee)</span>
              </label>
              <span className="text-xs font-mono font-bold text-indigo-400">
                Selected: {durationOption}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {durationOptionsList.map((opt) => {
                const isSelected = durationOption === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDurationOption(opt.label)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-[1.02]'
                        : 'bg-[#161b2a] text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-normal opacity-70 mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Video Style */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Video Style</label>
              <select
                id="timeline-video-style"
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#161b2a] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Cinematic">Cinematic</option>
                <option value="Documentary">Documentary</option>
                <option value="YouTube Explainer">YouTube Explainer</option>
                <option value="Tutorial">Tutorial / Website Demo</option>
                <option value="Social Media">Social Media (Reels/Shorts)</option>
                <option value="Music Video">Music Video</option>
                <option value="Product/Tech Promo">Product/Tech Promo</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Language</label>
              <select
                id="timeline-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#161b2a] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Nepali">Nepali (नेपाली)</option>
                <option value="Romanized Nepali">Romanized Nepali</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Mixed Language">Mixed Language</option>
              </select>
            </div>

            {/* Visual Style */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Visual Style</label>
              <select
                id="timeline-visual-style"
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#161b2a] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Photorealistic Cinematic">Photorealistic Cinematic</option>
                <option value="3D Render / Unreal Engine">3D Render / Unreal Engine</option>
                <option value="Anime / Manga">Anime / Manga</option>
                <option value="Clean Minimalist 4K">Clean Minimalist 4K</option>
                <option value="Cyberpunk / Neon">Cyberpunk / Neon</option>
                <option value="Vintage Film / 35mm">Vintage Film / 35mm</option>
                <option value="Studio High-Key Commercial">Studio High-Key Commercial</option>
                <option value="Dark Moody Noir">Dark Moody Noir</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['16:9', '9:16', '1:1'] as const).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      aspectRatio === ar
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-[#161b2a] text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Sample Selector Bar */}
          <div id="sample-loader-section" className="pt-2">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Quick Test Presets:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {sampleScenarios.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="p-2.5 rounded-xl bg-[#161b2a] hover:bg-[#1a2133] border border-white/5 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                    {sample.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">{sample.duration}</span>
                    <span>•</span>
                    <span>{sample.aspectRatio}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message with TRY AGAIN button */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Timeline Generation Failed</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5 shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full copy-ready Flow prompts, exact duration math, and screenshot upload guides.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                id="timeline-generate-btn"
                disabled={isGenerating || !topic.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Directing {durationOption} Timeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Generate Timeline ({durationOption})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SCREENSHOT MODE OVERLAY (Clean, focused, no clutter) */}
      {isScreenshotMode && plan && currentScreenshotScene && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center animate-fadeIn">
          {/* Top Bar of Screenshot Mode */}
          <div className="w-full max-w-3xl flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <CameraIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📸 SCREENSHOT MODE</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (Scene {screenshotSceneIndex + 1} of {plan.scenes.length})
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">High-readability card designed for capturing a reference screenshot.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScreenshotSceneIndex(Math.max(0, screenshotSceneIndex - 1))}
                disabled={screenshotSceneIndex === 0}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={() => setScreenshotSceneIndex(Math.min(plan.scenes.length - 1, screenshotSceneIndex + 1))}
                disabled={screenshotSceneIndex === plan.scenes.length - 1}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsScreenshotMode(false)}
                className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold flex items-center gap-1 ml-2 cursor-pointer"
                title="Exit Screenshot Mode"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Mode</span>
              </button>
            </div>
          </div>

          {/* Pristine Centered Screenshot Card */}
          <div className="w-full max-w-3xl rounded-3xl bg-[#0f1320] border-2 border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest">
                  KIRAN AI VIDEO STUDIO • PRODUCTION BLUEPRINT
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                  SCENE {String(currentScreenshotScene.sceneNumber).padStart(2, '0')}
                </h4>
              </div>

              <div className="text-right font-mono">
                <span className="text-lg font-black text-emerald-400">{currentScreenshotScene.timeRange}</span>
                <p className="text-xs text-slate-400">Duration: {currentScreenshotScene.durationSeconds}s</p>
              </div>
            </div>

            {/* VOICEOVER / SCRIPT */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                VOICEOVER / SCRIPT:
              </span>
              <blockquote className="pl-4 py-2 border-l-4 border-indigo-500 text-slate-100 text-base font-semibold leading-relaxed bg-white/[0.03] rounded-r-2xl pr-4">
                “{currentScreenshotScene.voiceover}”
              </blockquote>
            </div>

            {/* VISUAL & ON-SCREEN TEXT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  VISUAL DESCRIPTION:
                </span>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed bg-[#141828] p-3.5 rounded-2xl border border-white/5">
                  {currentScreenshotScene.visual}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  ON-SCREEN TEXT:
                </span>
                <div className="p-3.5 rounded-2xl bg-[#141828] border border-white/5 text-amber-300 font-bold text-xs sm:text-sm">
                  {currentScreenshotScene.onScreenText || 'None'}
                </div>
              </div>
            </div>

            {/* REFERENCE / SCREENSHOT GUIDE */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                REFERENCE / SCREENSHOT GUIDE:
              </span>
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm leading-relaxed">
                {currentScreenshotScene.referenceGuide || 'Upload a clean visual reference of the scene subject to Google Flow.'}
              </div>
            </div>

            {/* GOOGLE FLOW PROMPT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  GOOGLE FLOW PROMPT:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentScreenshotScene.flowPrompt, 'flow', currentScreenshotScene.id)}
                  className="px-3 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedFlowId === currentScreenshotScene.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Flow Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-[#080a11] border border-cyan-500/30 text-slate-100 text-xs sm:text-sm font-mono whitespace-pre-wrap break-words leading-relaxed selection:bg-cyan-500 selection:text-black">
                {currentScreenshotScene.flowPrompt}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {plan && (
        <div id="timeline-results-view" className="space-y-8 animate-fadeIn">
          {/* Header Summary Banner */}
          <div className="rounded-3xl bg-[#111522] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    TOTAL DURATION: {plan.totalDuration} ({plan.totalDurationSeconds}s)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                    {plan.aspectRatio}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                    {plan.videoStyle}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                    {plan.language}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {plan.title}
                </h2>
                <p className="text-xs text-slate-400">
                  Visual Style: <span className="text-slate-200 font-semibold">{plan.visualStyle}</span> • 
                  Scenes: <span className="text-slate-200 font-semibold">{plan.scenesCount}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 📸 SCREENSHOT MODE TOGGLE */}
                <button
                  type="button"
                  id="timeline-screenshot-mode-btn"
                  onClick={() => {
                    setScreenshotSceneIndex(0);
                    setIsScreenshotMode(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CameraIcon className="w-3.5 h-3.5" />
                  <span>📸 SCREENSHOT MODE</span>
                </button>

                <button
                  type="button"
                  id="timeline-copy-script-btn"
                  onClick={() => copyToClipboard(plan.fullCombinedScript, 'summary')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSummary === 'summary' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSummary === 'summary' ? 'Copied Full Script!' : 'Copy Script'}</span>
                </button>

                <button
                  type="button"
                  id="timeline-download-btn"
                  onClick={handleDownloadTimeline}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download Timeline</span>
                </button>

                {onOpenEditor && (
                  <button
                    type="button"
                    id="timeline-open-editor-btn"
                    onClick={handleOpenInEditor}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Open in Editor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Timeline Bar (00:00 ───── ... ───── FINISH) */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="font-bold text-emerald-400">00:00 START</span>
                <span className="text-[11px] text-slate-500">Interactive Proportional Scene Track (Click scene to inspect)</span>
                <span className="font-bold text-indigo-400">{plan.totalDuration} FINISH</span>
              </div>

              {/* Multi-segment visual bar */}
              <div className="h-8 w-full bg-[#0a0c12] rounded-xl overflow-hidden p-1 flex gap-1 border border-white/10">
                {plan.scenes.map((s, idx) => {
                  const widthPercent = (s.durationSeconds / targetDurationSeconds) * 100;
                  const gradient = segmentGradients[idx % segmentGradients.length];
                  const isHighlighted = activeHighlightId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollToScene(s.id)}
                      style={{ width: `${widthPercent}%` }}
                      title={`Scene ${s.sceneNumber}: ${s.timeRange} (${s.durationSeconds}s)`}
                      className={`h-full rounded-lg bg-gradient-to-r ${gradient} transition-all relative group flex items-center justify-center cursor-pointer ${
                        isHighlighted ? 'ring-2 ring-white scale-105 z-10' : 'hover:opacity-90'
                      }`}
                    >
                      <span className="text-[10px] font-black text-white/90 drop-shadow truncate px-1 font-mono">
                        S{s.sceneNumber} ({s.durationSeconds}s)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Timestamp Markers Row */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono overflow-x-auto py-1">
                {plan.scenes.map((s) => (
                  <span key={s.id} className="hover:text-indigo-400 cursor-pointer" onClick={() => scrollToScene(s.id)}>
                    {s.timeRange.split('–')[0]}
                  </span>
                ))}
                <span>{plan.totalDuration}</span>
              </div>

              {/* Auto-Balance Warning if edited */}
              {totalCurrentSeconds !== targetDurationSeconds && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Duration sum is currently <strong>{totalCurrentSeconds}s</strong> (must equal {targetDurationSeconds}s).</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Auto-Balance to {targetDurationSeconds}s
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot-Friendly Scene Cards Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Scene-by-Scene Production Cards</span>
                  <span className="text-xs text-cyan-400 font-mono font-normal">({plan.scenes.length} Scenes)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Clean visual cards optimized for mobile and desktop screenshot reference during Google Flow generation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setScreenshotSceneIndex(0);
                  setIsScreenshotMode(true);
                }}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CameraIcon className="w-3.5 h-3.5" />
                <span>Open in Screenshot Mode</span>
              </button>
            </div>

            {/* List of Screenshot-Friendly Cards */}
            <div className="space-y-6">
              {plan.scenes.map((scene, idx) => {
                const isEditing = editingSceneId === scene.id;
                const isRegenerating = regeneratingSceneId === scene.id;
                const isHighlighted = activeHighlightId === scene.id;

                return (
                  <div
                    key={scene.id}
                    ref={(el) => (sceneCardRefs.current[scene.id] = el)}
                    className={`rounded-3xl bg-[#121622] border transition-all duration-300 overflow-hidden shadow-xl ${
                      isHighlighted 
                        ? 'border-indigo-400 ring-2 ring-indigo-500/40 shadow-indigo-500/20' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Scene Card Header */}
                    <div className="bg-[#171c2b] px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono font-black text-sm tracking-wider">
                          SCENE {String(scene.sceneNumber).padStart(2, '0')}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-bold text-white">{scene.timeRange}</span>
                          <span className="text-slate-500">•</span>
                          <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                            Duration: {scene.durationSeconds}s
                          </span>
                        </div>
                      </div>

                      {/* Scene Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 📋 COPY FLOW PROMPT */}
                        <button
                          type="button"
                          id={`copy-flow-btn-${scene.sceneNumber}`}
                          onClick={() => copyToClipboard(scene.flowPrompt, 'flow', scene.id)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Copy Google Flow Prompt"
                        >
                          {copiedFlowId === scene.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>📋 COPY FLOW PROMPT</span>
                            </>
                          )}
                        </button>

                        {/* 📋 COPY SCRIPT */}
                        <button
                          type="button"
                          id={`copy-script-btn-${scene.sceneNumber}`}
                          onClick={() => copyToClipboard(scene.voiceover, 'script', scene.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Copy Voiceover Line"
                        >
                          {copiedScriptId === scene.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              <span>📋 COPY SCRIPT</span>
                            </>
                          )}
                        </button>

                        {/* 📋 COPY VISUAL DESCRIPTION */}
                        <button
                          type="button"
                          id={`copy-visual-btn-${scene.sceneNumber}`}
                          onClick={() => copyToClipboard(scene.visual, 'visual', scene.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Copy Visual Description"
                        >
                          {copiedVisualId === scene.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-3.5 h-3.5" />
                              <span>📋 COPY VISUAL</span>
                            </>
                          )}
                        </button>

                        {/* Screenshot Mode for this scene */}
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotSceneIndex(idx);
                            setIsScreenshotMode(true);
                          }}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="View in Screenshot Mode"
                        >
                          <CameraIcon className="w-3.5 h-3.5" />
                        </button>

                        {/* In-Place Edit Button */}
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => startEditingScene(scene)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Edit Scene Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={saveEditingScene}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                        )}

                        {/* Regenerate Single Scene */}
                        <button
                          type="button"
                          disabled={isRegenerating}
                          onClick={() => setShowRegenModalForId(showRegenModalForId === scene.id ? null : scene.id)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Regenerate this scene with AI"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Scene Regeneration Modal */}
                    {showRegenModalForId === scene.id && (
                      <div className="p-4 bg-[#1a2133] border-b border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            Regenerate Scene #{scene.sceneNumber} with Specific Direction
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowRegenModalForId(null)}
                            className="text-xs text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <input
                          type="text"
                          value={regenInstruction}
                          onChange={(e) => setRegenInstruction(e.target.value)}
                          placeholder="e.g., Make the camera movement more dynamic, or change character facial expression..."
                          className="w-full px-3 py-2 rounded-xl bg-[#121622] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={isRegenerating}
                            onClick={() => handleRegenerateScene(scene.id)}
                            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer"
                          >
                            {isRegenerating ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Regenerating...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                <span>Confirm Regeneration</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Scene Card Body */}
                    <div className="p-6 space-y-5 text-sm">
                      {isEditing ? (
                        /* Editing Form */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-1">
                                Duration (Seconds)
                              </label>
                              <input
                                type="number"
                                min={2}
                                max={60}
                                value={editData.durationSeconds || ''}
                                onChange={(e) => setEditData({ ...editData, durationSeconds: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-xl bg-[#171c2b] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-1">
                                On-Screen Text
                              </label>
                              <input
                                type="text"
                                value={editData.onScreenText || ''}
                                onChange={(e) => setEditData({ ...editData, onScreenText: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-[#171c2b] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Voiceover / Script
                            </label>
                            <textarea
                              rows={2}
                              value={editData.voiceover || ''}
                              onChange={(e) => setEditData({ ...editData, voiceover: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-[#171c2b] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Visual Description
                            </label>
                            <textarea
                              rows={2}
                              value={editData.visual || ''}
                              onChange={(e) => setEditData({ ...editData, visual: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-[#171c2b] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Reference / Screenshot Guide
                            </label>
                            <textarea
                              rows={2}
                              value={editData.referenceGuide || ''}
                              onChange={(e) => setEditData({ ...editData, referenceGuide: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-[#171c2b] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Google Flow Prompt
                            </label>
                            <textarea
                              rows={3}
                              value={editData.flowPrompt || ''}
                              onChange={(e) => setEditData({ ...editData, flowPrompt: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-[#171c2b] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={cancelEditingScene}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveEditingScene}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Presentation Mode (Optimized for Direct Screenshot & Readability) */
                        <>
                          {/* VOICEOVER / SCRIPT */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                              <span>VOICEOVER / SCRIPT:</span>
                            </div>
                            <blockquote className="pl-4 py-1.5 border-l-2 border-indigo-500/60 text-slate-100 text-sm italic font-medium leading-relaxed bg-white/[0.02] rounded-r-xl pr-3">
                              “{scene.voiceover}”
                            </blockquote>
                          </div>

                          {/* VISUAL & ON-SCREEN TEXT GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                                <span>VISUAL DESCRIPTION:</span>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed">
                                {scene.visual}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Tv className="w-3.5 h-3.5 text-amber-400" />
                                <span>ON-SCREEN TEXT:</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#161b2a] border border-white/5 text-amber-300 font-bold text-xs">
                                {scene.onScreenText || 'None'}
                              </div>
                            </div>
                          </div>

                          {/* REFERENCE / SCREENSHOT GUIDE */}
                          <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>REFERENCE / SCREENSHOT GUIDE:</span>
                            </div>
                            <p className="text-emerald-200/90 text-xs leading-relaxed">
                              {scene.referenceGuide || 'Upload a clean visual reference or interface screenshot to Google Flow.'}
                            </p>
                          </div>

                          {/* GOOGLE FLOW PROMPT BOX */}
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>GOOGLE FLOW PROMPT:</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(scene.flowPrompt, 'flow', scene.id)}
                                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedFlowId === scene.id ? (
                                  <span className="text-emerald-400 font-semibold">Copied!</span>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Prompt</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="relative group/prompt">
                              <pre className="p-3.5 rounded-2xl bg-[#0b0e16] border border-cyan-500/20 text-slate-200 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed selection:bg-cyan-500 selection:text-black">
                                {scene.flowPrompt}
                              </pre>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Production Summary Card */}
          <div className="rounded-3xl bg-[#111522] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-white/5 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Final Production Summary
                </h3>
                <p className="text-xs text-slate-400">
                  Synthesized script, audio cues, transition strategy, and visual continuity guidelines.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
                {plan.totalDuration} Total
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Full Voiceover */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">
                    Full Combined Voiceover Script
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(plan.fullCombinedScript, 'summary')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Full Script</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-[#161b2a] border border-white/5 text-slate-200 leading-relaxed font-medium">
                  {plan.fullCombinedScript}
                </div>
              </div>

              {/* Music / Sound Direction */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  Music & Sound Direction
                </span>
                <p className="p-3.5 rounded-xl bg-[#161b2a] border border-white/5 text-slate-300 leading-relaxed">
                  {plan.musicSoundDirection}
                </p>
              </div>

              {/* Transition Style */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-violet-400" />
                  Transition Style
                </span>
                <p className="p-3.5 rounded-xl bg-[#161b2a] border border-white/5 text-slate-300 leading-relaxed">
                  {plan.transitionStyle}
                </p>
              </div>

              {/* Final CTA */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  Final Call to Action (CTA)
                </span>
                <p className="p-3.5 rounded-xl bg-[#161b2a] border border-white/5 text-slate-300 leading-relaxed">
                  {plan.finalCta}
                </p>
              </div>

              {/* Continuity Notes */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Visual Subject Continuity
                </span>
                <p className="p-3.5 rounded-xl bg-[#161b2a] border border-white/5 text-slate-300 leading-relaxed">
                  {plan.continuityNotes || 'Maintain consistent character wardrobe, lighting tone, and focal camera depth.'}
                </p>
              </div>
            </div>

            {/* Google Flow & AI Diffusion Disclaimer */}
            <div className="pt-4 border-t border-white/5 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Production Workflow Note:</strong> Google Flow is a separate generative video creation service. The prompts generated above include camera movement, controlled lighting, subject continuity, and aspect ratio parameters (<code className="text-cyan-400 font-mono">--ar {plan.aspectRatio}</code>) so you can directly copy them into Google Flow alongside your screenshot or reference images.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
