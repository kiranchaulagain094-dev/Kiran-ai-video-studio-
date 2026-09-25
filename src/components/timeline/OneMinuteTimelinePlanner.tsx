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
  Sliders, 
  Layers, 
  Share2, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Maximize2, 
  Scissors, 
  Volume2, 
  Tv, 
  HelpCircle,
  FileText,
  RotateCcw
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
  const [videoStyle, setVideoStyle] = useState('Cinematic');
  const [language, setLanguage] = useState('English');
  const [visualStyle, setVisualStyle] = useState('Photorealistic Cinematic');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<OneMinuteTimelinePlan | null>(null);

  // Editing state
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<OneMinuteTimelineScene>>({});
  
  // Single scene regeneration state
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [showRegenModalForId, setShowRegenModalForId] = useState<string | null>(null);

  // Copy feedback state
  const [copiedFlowId, setCopiedFlowId] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<string | null>(null);

  // Active scene highlight from clicking timeline bar
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const sceneCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Quick sample templates for instant testing
  const sampleScenarios = [
    {
      title: 'YouTube Explainer (AI Video)',
      topic: 'Create a 1-minute YouTube video explaining AI video generation and diffusion models to beginners.',
      videoStyle: 'YouTube Explainer',
      language: 'English',
      visualStyle: 'Photorealistic Cinematic',
      aspectRatio: '16:9' as const
    },
    {
      title: 'Romanized Nepali Script',
      topic: 'Ma YouTube ko lagi AI bata video banauna chahanchu, step by step creator guide.',
      videoStyle: 'Social Media',
      language: 'Romanized Nepali',
      visualStyle: 'Clean Minimalist 4K',
      aspectRatio: '9:16' as const
    },
    {
      title: 'Music Video Concept',
      topic: 'Acoustic Indie Folk: Rain falling on old Kathmandu rooftops, solitary tea stall, and emotional longing.',
      videoStyle: 'Music Video',
      language: 'English',
      visualStyle: 'Vintage Film / 35mm',
      aspectRatio: '16:9' as const
    },
    {
      title: 'Product / SaaS Promo',
      topic: 'NextGen AI Video Studio mobile app: Turn raw smartphone ideas into 4K cinematic scenes in seconds.',
      videoStyle: 'Product/Tech Promo',
      language: 'English',
      visualStyle: 'Studio High-Key Commercial',
      aspectRatio: '9:16' as const
    }
  ];

  const handleLoadSample = (sample: typeof sampleScenarios[0]) => {
    setTopic(sample.topic);
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
        videoStyle,
        language,
        visualStyle,
        aspectRatio
      });
      setPlan(generatedPlan);
      // Scroll to result smoothly
      setTimeout(() => {
        const el = document.getElementById('timeline-results-view');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate 1-minute timeline. Please retry.');
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

  const totalCurrentSeconds = plan?.scenes.reduce((sum, s) => sum + s.durationSeconds, 0) || 60;

  const handleAutoBalanceTo60 = () => {
    if (!plan || !plan.scenes.length) return;
    const scenes = [...plan.scenes];
    const sum = scenes.reduce((a, b) => a + b.durationSeconds, 0);
    const diff = 60 - sum;

    // Distribute diff to the largest scene
    let maxIdx = 0;
    for (let i = 1; i < scenes.length; i++) {
      if (scenes[i].durationSeconds > scenes[maxIdx].durationSeconds) maxIdx = i;
    }
    scenes[maxIdx] = {
      ...scenes[maxIdx],
      durationSeconds: Math.max(3, scenes[maxIdx].durationSeconds + diff)
    };

    const rebalanced = recalculateTimestamps(scenes);
    setPlan({
      ...plan,
      scenes: rebalanced,
      totalDurationSeconds: 60,
      totalDuration: '01:00'
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
          durationSeconds: currentScene.durationSeconds
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

  // Copy Helpers
  const copyToClipboard = async (text: string, type: 'flow' | 'script' | 'summary', id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'flow' && id) {
        setCopiedFlowId(id);
        setTimeout(() => setCopiedFlowId(null), 2000);
      } else if (type === 'script' && id) {
        setCopiedScriptId(id);
        setTimeout(() => setCopiedScriptId(null), 2000);
      } else {
        setCopiedSummary(type);
        setTimeout(() => setCopiedSummary(null), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Download Timeline File
  const handleDownloadTimeline = () => {
    if (!plan) return;
    let content = `====================================================\n`;
    content += `KIRAN AI VIDEO STUDIO - 1-MINUTE PRODUCTION TIMELINE\n`;
    content += `====================================================\n\n`;
    content += `TITLE: ${plan.title}\n`;
    content += `TOTAL DURATION: 01:00 (60 Seconds)\n`;
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
      content += `VISUAL:\n${s.visual}\n\n`;
      content += `ON-SCREEN TEXT:\n"${s.onScreenText}"\n\n`;
      content += `GOOGLE FLOW PROMPT:\n${s.flowPrompt}\n\n`;
      content += `----------------------------------------------------\n\n`;
    });

    content += `====================================================\n`;
    content += `FINAL PRODUCTION SUMMARY\n`;
    content += `====================================================\n\n`;
    content += `TOTAL COMBINED SCRIPT:\n${plan.fullCombinedScript}\n\n`;
    content += `MUSIC & SOUND DIRECTION:\n${plan.musicSoundDirection}\n\n`;
    content += `TRANSITION STYLE:\n${plan.transitionStyle}\n\n`;
    content += `FINAL CALL TO ACTION:\n${plan.finalCta}\n\n`;
    content += `CONTINUITY NOTES:\n${plan.continuityNotes || 'N/A'}\n\n`;
    content += `Generated with Kiran AI Video Studio - Independent Video Workspace by Kiran Chaulagain\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_1min_timeline.txt`;
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
      duration: '60 seconds',
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
      description: `60-Second Video Plan: ${plan.title}. Generated with 1-Minute AI Timeline Planner.`
    };
    onOpenEditor(newProject);
  };

  // Timeline segment colors for proportional bar
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Tool Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121624] via-[#0f121d] to-[#0a0c13] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Exact 60-Second Production</span>
              <span className="text-white/40">•</span>
              <span className="text-cyan-400">Google Flow Ready</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              1-Minute AI Video Timeline
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Turn your idea or script into a complete scene-by-scene production plan.
              Generate exact timing brackets, voiceovers, visual direction, and copy-paste prompts ready for Google Flow.
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
              <span>Load Sample Ideas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Formulation Card */}
      <div className="rounded-3xl bg-[#111522] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Video Blueprint & Directing Parameters</h2>
              <p className="text-xs text-slate-400">Specify your concept, visual style, language, and target platform format.</p>
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

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Video Topic / Idea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Video Topic / Idea <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="timeline-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Create a 1-minute YouTube video explaining AI video generation and diffusion models, or paste a raw idea in Nepali / Romanized Nepali..."
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
                {showScriptInput ? 'We will parse your script into exact 60s scenes' : 'If left empty, AI writes the 60s script'}
              </span>
            </div>

            {showScriptInput && (
              <textarea
                id="timeline-script-input"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your voiceover script or dialogue here. The AI will analyze the script and divide it intelligently across 60 seconds of scenes..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-[#161b2a] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
            )}
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
                <option value="Social Media">Social Media</option>
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
                <option value="Custom">Custom / Mixed</option>
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
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {sampleScenarios.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="p-2.5 rounded-xl bg-[#161b2a] hover:bg-[#1a2133] border border-white/5 hover:border-indigo-500/40 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                    {sample.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/5">{sample.videoStyle}</span>
                    <span>•</span>
                    <span>{sample.aspectRatio}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Generation Error</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Generates copyable Google Flow prompts, exact 60s math, and screenshot cards.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                id="timeline-generate-btn"
                disabled={isGenerating || !topic.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Directing 60-Second Timeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Generate Timeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

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
                    TOTAL DURATION: 01:00 (60s)
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
                <button
                  type="button"
                  id="timeline-copy-script-btn"
                  onClick={() => copyToClipboard(plan.fullCombinedScript, 'summary')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
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
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download Timeline</span>
                </button>

                {onOpenEditor && (
                  <button
                    type="button"
                    id="timeline-open-editor-btn"
                    onClick={handleOpenInEditor}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Open in Editor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Timeline Bar (00:00 ───── 00:08 ───── ... ───── 01:00) */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="font-bold text-emerald-400">00:00 START</span>
                <span className="text-[11px] text-slate-500">Interactive Proportional Scene Track (Click scene to inspect)</span>
                <span className="font-bold text-indigo-400">01:00 FINISH</span>
              </div>

              {/* Multi-segment visual bar */}
              <div className="h-8 w-full bg-[#0a0c12] rounded-xl overflow-hidden p-1 flex gap-1 border border-white/10">
                {plan.scenes.map((s, idx) => {
                  const widthPercent = (s.durationSeconds / 60) * 100;
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
                <span>01:00</span>
              </div>

              {/* Auto-Balance Warning if edited */}
              {totalCurrentSeconds !== 60 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Duration sum is currently <strong>{totalCurrentSeconds}s</strong> (must be exactly 60s).</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoBalanceTo60}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs transition-colors"
                  >
                    Auto-Balance to 60s
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot-Friendly Scene Cards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Scene-by-Scene Production Cards
                </h3>
                <p className="text-xs text-slate-400">
                  Clean visual cards optimized for desktop and mobile screenshot capture during video generation in Google Flow.
                </p>
              </div>

              <div className="text-xs text-slate-400 hidden sm:block">
                Showing {plan.scenes.length} Scenes
              </div>
            </div>

            {/* List of Screenshot-Friendly Cards */}
            <div className="space-y-6">
              {plan.scenes.map((scene) => {
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
                      <div className="flex items-center gap-2">
                        {/* Copy Flow Prompt */}
                        <button
                          type="button"
                          id={`copy-flow-btn-${scene.sceneNumber}`}
                          onClick={() => copyToClipboard(scene.flowPrompt, 'flow', scene.id)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          title="Copy Google Flow Prompt"
                        >
                          {copiedFlowId === scene.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied Flow Prompt!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Flow Prompt</span>
                            </>
                          )}
                        </button>

                        {/* Copy Script */}
                        <button
                          type="button"
                          id={`copy-script-btn-${scene.sceneNumber}`}
                          onClick={() => copyToClipboard(scene.voiceover, 'script', scene.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
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
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>

                        {/* In-Place Edit Button */}
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => startEditingScene(scene)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Edit Scene Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={saveEditingScene}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                          >
                            Save
                          </button>
                        )}

                        {/* Regenerate Single Scene */}
                        <button
                          type="button"
                          disabled={isRegenerating}
                          onClick={() => setShowRegenModalForId(showRegenModalForId === scene.id ? null : scene.id)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
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
                            className="text-xs text-slate-400 hover:text-white"
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
                            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
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
                                max={30}
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
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveEditingScene}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
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
                              <span>Voiceover / Script</span>
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
                                <span>Visual</span>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed">
                                {scene.visual}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Tv className="w-3.5 h-3.5 text-amber-400" />
                                <span>On-Screen Text</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#161b2a] border border-white/5 text-amber-300 font-bold text-xs">
                                {scene.onScreenText || 'None'}
                              </div>
                            </div>
                          </div>

                          {/* GOOGLE FLOW PROMPT BOX */}
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Google Flow Prompt</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(scene.flowPrompt, 'flow', scene.id)}
                                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                              >
                                {copiedFlowId === scene.id ? (
                                  <span className="text-emerald-400 font-semibold">Copied!</span>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
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

              <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                60 Seconds Total
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
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
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
                <strong>Production Note:</strong> Generative video models (like Google Flow, Runway, Kling, or Midjourney) create stochastic variations. The scene prompts generated above contain camera angle, lighting, character consistency, and aspect ratio parameters (<code className="text-cyan-400 font-mono">--ar {plan.aspectRatio}</code>) to provide the highest visual continuity across your 60-second video.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
