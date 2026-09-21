import React, { useState, useRef, useEffect } from 'react';
import { 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Sliders, 
  Type, 
  Music, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Plus, 
  Trash2, 
  Copy, 
  DownloadCloud, 
  Split, 
  Undo, 
  Redo, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Upload,
  Subtitles,
  Wand2,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Save,
  Check
} from 'lucide-react';
import { Project, TimelineTrackItem, AspectRatio } from '../../types';

interface VideoEditorProps {
  project?: Project | null;
  onSaveProject?: (project: Project) => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ project, onSaveProject }) => {
  // Active tab in left sidebar
  const [activeTab, setActiveTab] = useState<'media' | 'text' | 'audio' | 'images' | 'captions' | 'effects' | 'transitions'>('media');

  // Preview & Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(project?.aspectRatio || '16:9');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(12.4); // in seconds
  const [totalDuration, setTotalDuration] = useState(60.0); // in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);

  // Selected track item on timeline
  const [selectedItemId, setSelectedItemId] = useState<string>('clip-1');

  // Timeline track items
  const [timelineItems, setTimelineItems] = useState<TimelineTrackItem[]>([
    {
      id: 'clip-1',
      trackId: 'video',
      name: 'Kathmandu Monsoon Scene 1.mp4',
      start: 0,
      duration: 15,
      type: 'video',
      volume: 100,
      speed: 1.0,
      filter: 'none',
      color: 'bg-indigo-600/60 border-indigo-400'
    },
    {
      id: 'clip-2',
      trackId: 'video',
      name: 'Patan Temple Rain Scene 2.mp4',
      start: 15,
      duration: 20,
      type: 'video',
      volume: 80,
      speed: 1.0,
      filter: 'warm',
      color: 'bg-indigo-600/60 border-indigo-400'
    },
    {
      id: 'audio-1',
      trackId: 'audio',
      name: 'Sarangi & Rain Melody.mp3',
      start: 0,
      duration: 35,
      type: 'audio',
      volume: 90,
      color: 'bg-emerald-600/60 border-emerald-400'
    },
    {
      id: 'text-1',
      trackId: 'text',
      name: 'Title: Monsoon Romance',
      start: 1,
      duration: 6,
      type: 'text',
      content: 'Kathmandu Monsoon Romance',
      color: 'bg-violet-600/60 border-violet-400'
    },
    {
      id: 'text-2',
      trackId: 'text',
      name: 'Subtitle: Maya Ko Jhari',
      start: 8,
      duration: 8,
      type: 'subtitles',
      content: 'मायाको झरीमा कतै हराएका यादहरू...',
      color: 'bg-amber-600/60 border-amber-400'
    }
  ]);

  // Active item properties
  const selectedItem = timelineItems.find(i => i.id === selectedItemId);

  // Property controls
  const [volume, setVolume] = useState<number>(selectedItem?.volume ?? 100);
  const [speed, setSpeed] = useState<number>(selectedItem?.speed ?? 1.0);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Cinematic Teal & Orange');
  const [activeTransition, setActiveTransition] = useState('Cross Dissolve');

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportResolution, setExportResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFinished, setExportFinished] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);

  const handleSaveProject = () => {
    const projToSave: Project = project ? {
      ...project,
      aspectRatio,
      updatedAt: new Date().toISOString(),
    } : {
      id: 'proj-' + Date.now(),
      userId: 'user-1',
      name: 'Custom Studio Edit',
      type: aspectRatio === '9:16' ? 'YouTube Shorts' : 'Music Video',
      aspectRatio,
      duration: `${Math.round(totalDuration)} seconds` as any,
      style: 'Cinematic',
      voice: 'Custom',
      language: 'English',
      music: 'AI Background Music',
      ideaPrompt: 'Timeline multi-track project edit',
      status: 'Completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
      scenes: []
    };

    if (onSaveProject) {
      onSaveProject(projToSave);
    }
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 2200);
  };

  // Update properties when selection changes
  useEffect(() => {
    if (selectedItem) {
      setVolume(selectedItem.volume ?? 100);
      setSpeed(selectedItem.speed ?? 1.0);
    }
  }, [selectedItemId]);

  // Playhead simulation timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.2;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Actions
  const handleSplitClip = () => {
    if (!selectedItem) return;
    const splitPoint = Math.max(1, Math.min(selectedItem.duration - 1, currentTime - selectedItem.start));
    if (splitPoint <= 0 || splitPoint >= selectedItem.duration) return;

    const firstHalf: TimelineTrackItem = {
      ...selectedItem,
      duration: splitPoint
    };
    const secondHalf: TimelineTrackItem = {
      ...selectedItem,
      id: 'clip-' + Date.now(),
      name: `${selectedItem.name} (Part 2)`,
      start: selectedItem.start + splitPoint,
      duration: selectedItem.duration - splitPoint
    };

    setTimelineItems(items => items.map(i => i.id === selectedItem.id ? firstHalf : i).concat(secondHalf));
  };

  const handleDeleteClip = () => {
    if (!selectedItem) return;
    setTimelineItems(items => items.filter(i => i.id !== selectedItem.id));
    setSelectedItemId(timelineItems[0]?.id || '');
  };

  const handleDuplicateClip = () => {
    if (!selectedItem) return;
    const dup: TimelineTrackItem = {
      ...selectedItem,
      id: 'clip-' + Date.now(),
      name: `${selectedItem.name} (Copy)`,
      start: selectedItem.start + selectedItem.duration
    };
    setTimelineItems(items => [...items, dup]);
  };

  const handleExportTimelineJSON = () => {
    setIsExporting(true);
    try {
      const exportPayload = {
        studio: "Kiran AI Video Studio",
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        project: {
          id: project?.id || 'studio-project',
          name: project?.name || 'Untitled Timeline Project',
          aspectRatio,
          duration: Math.max(...timelineItems.map(i => i.start + i.duration), 30),
          tracks: [
            { id: 'track-video', name: 'Video Layer 1', items: timelineItems.filter(i => i.type === 'video') },
            { id: 'track-audio', name: 'Audio Layer 2', items: timelineItems.filter(i => i.type === 'audio') },
            { id: 'track-text', name: 'Text Overlays 3', items: timelineItems.filter(i => i.type === 'text') }
          ]
        }
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(project?.name || 'studio-timeline').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-project.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportFinished(true);
      if (onSaveProject && project) {
        onSaveProject({
          ...project,
          status: 'Exported',
          updatedAt: new Date().toISOString()
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[700px] bg-[#090b10] text-slate-100 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Top Editor Toolbar */}
      <div className="bg-[#0f131d] px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Scissors className="w-4 h-4 text-indigo-400" />
            <span>{project?.name || 'Studio Timeline Editor'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 bg-[#171c2b] p-1 rounded-lg border border-white/5">
            {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Center undo / redo */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" title="Undo">
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" title="Redo">
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions: Save Project & Export */}
        <div className="flex items-center gap-2">
          <button
            id="editor-save-btn"
            onClick={handleSaveProject}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              savedRecently 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-[#171c2b] text-slate-300 hover:text-white border-white/10 hover:bg-[#202638]'
            }`}
          >
            {savedRecently ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{savedRecently ? 'Saved!' : 'Save Project'}</span>
          </button>
          <button
            id="editor-export-btn"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Export Video</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Left Nav, Center Canvas, Right Properties) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbox (Media, Text, Audio, Images, Captions, Effects, Transitions) */}
        <div className="w-64 bg-[#0d1017] border-r border-white/10 flex flex-col">
          {/* Tab buttons */}
          <div className="grid grid-cols-4 p-1 bg-[#090b10] border-b border-white/5 text-[10px] font-semibold text-slate-400">
            <button
              onClick={() => setActiveTab('media')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 ${activeTab === 'media' ? 'bg-[#151926] text-indigo-400' : 'hover:text-white'}`}
            >
              <VideoIcon className="w-3.5 h-3.5" /> Media
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 ${activeTab === 'text' ? 'bg-[#151926] text-indigo-400' : 'hover:text-white'}`}
            >
              <Type className="w-3.5 h-3.5" /> Text
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 ${activeTab === 'audio' ? 'bg-[#151926] text-indigo-400' : 'hover:text-white'}`}
            >
              <Music className="w-3.5 h-3.5" /> Audio
            </button>
            <button
              onClick={() => setActiveTab('captions')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 ${activeTab === 'captions' ? 'bg-[#151926] text-indigo-400' : 'hover:text-white'}`}
            >
              <Subtitles className="w-3.5 h-3.5" /> Captions
            </button>
          </div>

          {/* Tab content */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {activeTab === 'media' && (
              <>
                <div className="border border-dashed border-white/15 rounded-xl p-4 text-center hover:border-indigo-500/50 cursor-pointer bg-[#111520]/50 transition-colors">
                  <Upload className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-white">Upload Media</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">MP4, MOV, WebM (up to 500MB)</p>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-3">Studio Project Assets</p>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs hover:border-indigo-500/30 cursor-pointer">
                    <span className="truncate text-slate-300">Durbar Square Rain.mp4</span>
                    <span className="text-[10px] text-indigo-400 font-mono">15s</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs hover:border-indigo-500/30 cursor-pointer">
                    <span className="truncate text-slate-300">Yellow Umbrella Pagoda.mp4</span>
                    <span className="text-[10px] text-indigo-400 font-mono">20s</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'text' && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Add Typography</p>
                <button
                  onClick={() => {
                    const newItem: TimelineTrackItem = {
                      id: 'text-' + Date.now(),
                      trackId: 'text',
                      name: 'Cinematic Title',
                      start: currentTime,
                      duration: 5,
                      type: 'text',
                      content: 'NEW TITLE',
                      color: 'bg-violet-600/60 border-violet-400'
                    };
                    setTimelineItems(prev => [...prev, newItem]);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-left text-xs font-bold text-white border border-white/5 flex items-center justify-between"
                >
                  <span>+ Add Cinematic Title</span>
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button
                  onClick={() => {
                    const newItem: TimelineTrackItem = {
                      id: 'sub-' + Date.now(),
                      trackId: 'text',
                      name: 'Subtitles',
                      start: currentTime,
                      duration: 4,
                      type: 'subtitles',
                      content: 'Spoken dialogue line',
                      color: 'bg-amber-600/60 border-amber-400'
                    };
                    setTimelineItems(prev => [...prev, newItem]);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-left text-xs font-bold text-white border border-white/5 flex items-center justify-between"
                >
                  <span>+ Add Subtitle Box</span>
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audio Tracks</p>
                <div className="p-2.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-white block">Acoustic Sarangi & Rain</span>
                  <span className="text-[10px] text-slate-400 block font-mono">128 BPM • Romantic</span>
                </div>
                <label className="w-full py-2 px-3 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-xs font-semibold text-indigo-400 border border-white/5 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Audio File</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const newAudioItem: TimelineTrackItem = {
                          id: 'audio-custom-' + Date.now(),
                          trackId: 'audio',
                          name: file.name.replace(/\.[^/.]+$/, ''),
                          start: currentTime,
                          duration: 30,
                          type: 'audio',
                          color: 'bg-emerald-600/70 border-emerald-400'
                        };
                        setTimelineItems(prev => [...prev, newAudioItem]);
                        setSelectedItemId(newAudioItem.id);
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {activeTab === 'captions' && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Auto Captions Engine</p>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
                  Transcribe voiceover and generate synchronized karaoke subtitles automatically.
                </div>
                <button
                  id="editor-auto-captions-btn"
                  onClick={() => {
                    const sceneTexts = (project?.scenes && project.scenes.length > 0)
                      ? project.scenes.map((s, idx) => ({
                          id: `auto-sub-${idx + 1}-${Date.now()}`,
                          trackId: 'text',
                          name: `Subtitle ${idx + 1}`,
                          start: idx * 5,
                          duration: 4.5,
                          type: 'subtitles',
                          content: s.voiceoverText || s.title || `Dialogue scene ${idx + 1}`,
                          color: 'bg-amber-600/70 border-amber-400'
                        }))
                      : [
                          {
                            id: `auto-sub-1-${Date.now()}`,
                            trackId: 'text',
                            name: 'Subtitle 1',
                            start: 0,
                            duration: 4,
                            type: 'subtitles',
                            content: 'मायाको झरीमा कतै हराएका यादहरू...',
                            color: 'bg-amber-600/70 border-amber-400'
                          },
                          {
                            id: `auto-sub-2-${Date.now()}`,
                            trackId: 'text',
                            name: 'Subtitle 2',
                            start: 4.5,
                            duration: 4,
                            type: 'subtitles',
                            content: 'नबोली पनि हजारौँ कुरा भनिसकेका आँखाहरू...',
                            color: 'bg-amber-600/70 border-amber-400'
                          }
                        ];

                    setTimelineItems(prev => {
                      const withoutOldSubs = prev.filter(item => item.type !== 'subtitles');
                      return [...withoutOldSubs, ...sceneTexts];
                    });
                    setSelectedItemId(sceneTexts[0].id);
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Generate Captions</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Video Preview Canvas */}
        <div className="flex-1 bg-[#07090e] p-4 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Main Monitor Display */}
          <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center transition-all ${
            aspectRatio === '16:9' ? 'w-full max-w-2xl aspect-video' :
            aspectRatio === '9:16' ? 'h-full max-h-[380px] aspect-[9/16]' :
            'h-full max-h-[360px] aspect-square'
          }`}>
            <img
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1000&auto=format&fit=crop&q=80"
              alt="Video Preview"
              className="w-full h-full object-cover"
              style={{
                filter: activeFilter === 'Cinematic Teal & Orange' ? 'contrast(1.1) saturate(1.2)' : 'none'
              }}
            />

            {/* Subtitle / Text overlay on video */}
            <div className="absolute bottom-6 left-4 right-4 text-center pointer-events-none">
              <span className="inline-block bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-white font-bold text-xs sm:text-sm drop-shadow-md">
                मायाको झरीमा कतै हराएका यादहरू...
              </span>
            </div>

            {/* Timecode badge */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-cyan-300">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>

          {/* Center Playback Controls Bar */}
          <div className="mt-3 flex items-center gap-4 bg-[#11141e] px-4 py-2 rounded-2xl border border-white/10 text-xs shadow-lg">
            <button
              onClick={() => setCurrentTime(0)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              title="Return to start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              id="editor-play-pause-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-indigo-600/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <span className="font-mono text-slate-300 text-[11px]">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-64 bg-[#0d1017] border-l border-white/10 p-4 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Properties</span>
            <span className="text-[10px] text-indigo-400 font-mono truncate max-w-[120px]">
              {selectedItem ? selectedItem.name : 'No Clip Selected'}
            </span>
          </div>

          {selectedItem ? (
            <>
              {/* Volume Slider */}
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="text-slate-300 font-medium">Volume</span>
                  <span className="font-mono text-indigo-400">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Speed Slider */}
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="text-slate-300 font-medium">Speed</span>
                  <span className="font-mono text-indigo-400">{speed}x</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeed(spd)}
                      className={`py-1 rounded text-[10px] font-bold ${
                        speed === spd ? 'bg-indigo-600 text-white' : 'bg-[#151924] text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Fade Controls */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer">
                  <span>Fade In</span>
                  <input
                    type="checkbox"
                    checked={fadeIn}
                    onChange={(e) => setFadeIn(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer">
                  <span>Fade Out</span>
                  <input
                    type="checkbox"
                    checked={fadeOut}
                    onChange={(e) => setFadeOut(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
              </div>

              {/* Filters */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Color Grading Filter
                </span>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-2.5 py-2 border border-white/10"
                >
                  <option value="none">Standard Natural</option>
                  <option value="Cinematic Teal & Orange">Cinematic Teal & Orange</option>
                  <option value="Monsoon Mood Blue">Monsoon Mood Blue</option>
                  <option value="Warm Sunset Glow">Warm Sunset Glow</option>
                  <option value="Black & White Noir">Black & White Noir</option>
                </select>
              </div>

              {/* Transitions */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Transition Effect
                </span>
                <select
                  value={activeTransition}
                  onChange={(e) => setActiveTransition(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-2.5 py-2 border border-white/10"
                >
                  <option value="Cut">Standard Cut</option>
                  <option value="Cross Dissolve">Cross Dissolve</option>
                  <option value="Fade to Black">Fade to Black</option>
                  <option value="Whip Pan">Whip Pan</option>
                  <option value="Zoom Blur">Zoom Blur</option>
                </select>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              Click a clip on the timeline to adjust properties.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Timeline */}
      <div className="h-56 bg-[#0b0e14] border-t border-white/10 flex flex-col">
        {/* Timeline Action Header */}
        <div className="px-4 py-2 bg-[#0e121a] border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSplitClip}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181d2a] hover:bg-[#202738] text-slate-300 font-semibold"
              title="Split at Playhead"
            >
              <Split className="w-3.5 h-3.5 text-indigo-400" />
              <span>Split</span>
            </button>

            <button
              onClick={handleDuplicateClip}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181d2a] hover:bg-[#202738] text-slate-300 font-semibold"
              title="Duplicate Clip"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={handleDeleteClip}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181d2a] hover:bg-rose-500/20 text-rose-400 font-semibold"
              title="Delete Clip"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          {/* Timeline zoom */}
          <div className="flex items-center gap-2">
            <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(Number(e.target.value))}
              className="w-20 accent-indigo-500"
            />
            <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        {/* Multi-track timeline rows */}
        <div className="flex-1 overflow-x-auto p-3 space-y-2 relative">
          {/* Playhead marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          >
            <div className="w-2.5 h-2.5 bg-rose-500 rotate-45 -ml-1 -mt-1 shadow-md" />
          </div>

          {/* Track 1: Video / Visuals */}
          <div className="flex items-center gap-3">
            <span className="w-16 text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Video Track
            </span>
            <div className="flex-1 h-9 bg-[#121622] rounded-xl relative overflow-hidden border border-white/5">
              {timelineItems.filter(i => i.trackId === 'video').map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    left: `${(item.start / totalDuration) * 100}%`,
                    width: `${(item.duration / totalDuration) * 100}%`
                  }}
                  className={`absolute top-0 bottom-0 rounded-lg p-1.5 text-[10px] font-semibold text-white border flex items-center justify-between cursor-pointer transition-all ${
                    item.color
                  } ${selectedItemId === item.id ? 'ring-2 ring-white shadow-lg' : 'opacity-85'}`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="font-mono text-[9px]">{item.duration}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: Audio */}
          <div className="flex items-center gap-3">
            <span className="w-16 text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Audio Track
            </span>
            <div className="flex-1 h-8 bg-[#121622] rounded-xl relative overflow-hidden border border-white/5">
              {timelineItems.filter(i => i.trackId === 'audio').map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    left: `${(item.start / totalDuration) * 100}%`,
                    width: `${(item.duration / totalDuration) * 100}%`
                  }}
                  className={`absolute top-0 bottom-0 rounded-lg p-1 text-[10px] font-semibold text-white border flex items-center justify-between cursor-pointer ${
                    item.color
                  } ${selectedItemId === item.id ? 'ring-2 ring-white shadow-lg' : 'opacity-85'}`}
                >
                  <span className="truncate flex items-center gap-1">
                    <Music className="w-3 h-3" /> {item.name}
                  </span>
                  <span className="font-mono text-[9px]">{item.duration}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track 3: Subtitles / Text */}
          <div className="flex items-center gap-3">
            <span className="w-16 text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Captions
            </span>
            <div className="flex-1 h-8 bg-[#121622] rounded-xl relative overflow-hidden border border-white/5">
              {timelineItems.filter(i => i.trackId === 'text').map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    left: `${(item.start / totalDuration) * 100}%`,
                    width: `${(item.duration / totalDuration) * 100}%`
                  }}
                  className={`absolute top-0 bottom-0 rounded-lg p-1 text-[10px] font-semibold text-white border flex items-center justify-between cursor-pointer ${
                    item.color
                  } ${selectedItemId === item.id ? 'ring-2 ring-white shadow-lg' : 'opacity-85'}`}
                >
                  <span className="truncate">{item.content || item.name}</span>
                  <span className="font-mono text-[9px]">{item.duration}s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Export Project Timeline</h3>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            {!exportFinished ? (
              <div className="space-y-4">
                {/* Real JSON Project Export */}
                <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Timeline Sequence (.JSON)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                      Production Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Download the structured multi-track configuration, clip timestamps, audio levels, and split positions as a JSON archive.
                  </p>
                  <button
                    onClick={handleExportTimelineJSON}
                    className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Download Project JSON</span>
                  </button>
                </div>

                {/* Honest Video Generation / MP4 Notice */}
                <div className="p-4 rounded-2xl bg-[#171c2b]/60 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      Direct MP4 Video Rendering
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Video generation tool — Coming Soon. Direct client-side MP4 video rendering is currently in active development. You can export your timeline data above and assemble footage in DaVinci Resolve, Premiere Pro, or CapCut.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Project JSON Exported!</h4>
                  <p className="text-xs text-slate-400 mt-1">Timeline configuration downloaded to your device.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setExportFinished(false);
                      setShowExportModal(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#171c2b] text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
