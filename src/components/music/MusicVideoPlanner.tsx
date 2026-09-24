import React, { useState } from 'react';
import { 
  Music, 
  Sparkles, 
  Upload, 
  FileText, 
  Play, 
  Copy, 
  Check, 
  Clock, 
  Layers, 
  Film, 
  Image as ImageIcon, 
  Share2, 
  ChevronRight,
  Disc,
  Mic2,
  ListOrdered
} from 'lucide-react';
import { Project } from '../../types';
import { StudioApiService } from '../../services/api';

interface MusicVideoPlan {
  songTitle: string;
  artist: string;
  genre: string;
  tempo: string;
  mood: string;
  theme: string;
  lyricsAnalysis: string;
  sections: {
    sectionName: string;
    timestamp: string;
    lyricsExcerpt: string;
    visualAction: string;
    cameraMovement: string;
    lighting: string;
    visualPrompt: string;
  }[];
  lyricsCaptionPlan: {
    fontStyle: string;
    animation: string;
    colorPalette: string;
  };
  thumbnailConcept: {
    headline: string;
    visualComposition: string;
    imagePrompt: string;
  };
  youtubeMetadata: {
    title: string;
    description: string;
    tags: string[];
    hashtags: string[];
  };
}

interface MusicVideoPlannerProps {
  onSaveAsProject?: (project: Project) => void;
  onOpenSEO?: (title: string, description: string) => void;
}

export const MusicVideoPlanner: React.FC<MusicVideoPlannerProps> = ({
  onSaveAsProject,
  onOpenSEO
}) => {
  const [songTitle, setSongTitle] = useState('मायाको झरी (Rain of Love)');
  const [artistName, setArtistName] = useState('Kiran & Melody Collective');
  const [genre, setGenre] = useState('Nepali Romantic Acoustic Folk-Pop');
  const [language, setLanguage] = useState('Nepali');
  const [lyricsInput, setLyricsInput] = useState(
    `[Intro - Sarangi & Rain]
काठमाडौँको यो चिसो झरीमा, कतै हराएका यादहरू फेरि ब्यूँतिए झैँ लाग्छ...

[Verse 1]
झरी पर्यो सिमसिम मुटुभित्र तिम्रै नाम
तिम्रो हात समाई हिँड्ने थियो मेरो रहर सधैँभरि
पटनको गल्लीमा तिमीलाई पर्खिरहँदा
समय रोकिए झैँ भयो...

[Chorus]
मायाको झरीमा रुझ्दैछु म आज
तिमी हौ मेरो धड्कन तिमी नै मेरो प्राण
बादल पारिको घाम झैँ तिम्रो त्यो मुस्कान

[Outro]
र यहीँबाट सुरु हुन्छ कहिल्यै नटुङ्गिने हाम्रो यात्रा...`
  );
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [musicPlan, setMusicPlan] = useState<MusicVideoPlan | null>({
    songTitle: 'मायाको झरी (Rain of Love)',
    artist: 'Kiran & Melody Collective',
    genre: 'Nepali Romantic Acoustic Folk-Pop',
    tempo: '78 BPM (Gentle Sway)',
    mood: 'Melancholic, Nostalgic, Heartfelt, Romantic',
    theme: 'Unconditional love rekindled during a monsoon downpour in ancient Kathmandu.',
    lyricsAnalysis: 'The lyrics contrast the cold, transient exterior rain of Kathmandu with the enduring emotional warmth of reconnecting with a cherished companion. Natural imagery of rain and temple cobblestones serves as a metaphor for lingering memories.',
    sections: [
      {
        sectionName: 'Intro & Atmosphere',
        timestamp: '0:00 - 0:25',
        lyricsExcerpt: 'काठमाडौँको यो चिसो झरीमा...',
        visualAction: 'Extreme wide shot of Patan Durbar Square during monsoon. Water cascading off pagoda eaves, glowing oil lamps in courtyard.',
        cameraMovement: 'Slow crane down from temple rooftop to wet stone courtyard.',
        lighting: 'Cool blue ambient rain tones contrasted with warm amber lantern highlights.',
        visualPrompt: 'Cinematic wide shot of Patan Durbar Square Nepal in heavy monsoon rain, wet cobblestones reflecting glowing brass oil lamps, mist and raindrops falling, 35mm film, anamorphic lens, 8k.'
      },
      {
        sectionName: 'Verse 1: The Solitary Wait',
        timestamp: '0:25 - 1:10',
        lyricsExcerpt: 'झरी पर्यो सिमसिम मुटुभित्र तिम्रै नाम...',
        visualAction: 'Protagonist holding a transparent umbrella, walking past ancient carved wooden pillars. Reflections in puddles show passing figures.',
        cameraMovement: 'Tracking slider shot moving alongside subject at eye level.',
        lighting: 'Soft diffused natural rain light with warm rim glow.',
        visualPrompt: 'Medium close-up portrait of Nepali youth holding umbrella under ancient wooden temple carving, raindrops dripping, thoughtful nostalgic expression, 85mm portrait lens, f/1.4 shallow depth of field.'
      },
      {
        sectionName: 'Chorus: The Convergence',
        timestamp: '1:10 - 2:05',
        lyricsExcerpt: 'मायाको झरीमा रुझ्दैछु म आज, तिमी हौ मेरो धड्कन...',
        visualAction: 'The two subjects meet under a temple pavilion. Smiles of recognition, shared shelter from the storm, slow motion rain splashing around them.',
        cameraMovement: 'Smooth 360-degree orbital camera rotation around the couple.',
        lighting: 'Warm golden backlight breaking through rainclouds.',
        visualPrompt: 'Two people smiling emotionally under wooden temple overhang, golden hour sunbeams cutting through rain drops, magical bokeh, hyper-realistic cinematic masterpiece.'
      },
      {
        sectionName: 'Outro: Eternal Journey',
        timestamp: '2:05 - 2:50',
        lyricsExcerpt: 'र यहीँबाट सुरु हुन्छ कहिल्यै नटुङ्गिने हाम्रो यात्रा...',
        visualAction: 'Couple walking together into the vibrant evening glow of Kathmandu valley as rain clears into a vivid twilight sky.',
        cameraMovement: 'High angle pull-back drone shot drifting into the misty twilight.',
        lighting: 'Deep indigo twilight skies with golden city lanterns glowing below.',
        visualPrompt: 'Aerial cinematic drone view of Kathmandu rooftops at twilight after rain, glowing streetlamps reflecting on wet roofs, deep indigo and gold palette, photorealistic 8k.'
      }
    ],
    lyricsCaptionPlan: {
      fontStyle: 'Modern Devanagari Sans-Serif with delicate glowing drop shadow',
      animation: 'Subtle karaoke highlight with gentle floating fade-in',
      colorPalette: '#FFFFFF primary text with #FBBF24 golden active phrase accent'
    },
    thumbnailConcept: {
      headline: 'मायाको झरी',
      visualComposition: 'Right 40%: Emotional tender gaze of couple. Left 60%: High-contrast bold typography with falling rain embers.',
      imagePrompt: 'YouTube thumbnail composition, couple under umbrella in Kathmandu monsoon, emotional expression, high-contrast golden rim light, dramatic rain droplets, bold cinematic layout, 8k resolution.'
    },
    youtubeMetadata: {
      title: 'मायाको झरी - Rain of Love (Official Music Video) | Kiran AI Video Studio',
      description: 'Experience the official music video for "मायाको झरी (Rain of Love)" by Kiran & Melody Collective.\n\nDirected & Produced using Kiran AI Video Studio.\n\nStreaming now in 4K UHD. Headphones recommended for immersive spatial sound.',
      tags: ['nepali romantic song', 'mayako jhari', 'kiran ai video studio', 'kathmandu monsoon romance', 'nepali music video 2026', 'acoustic nepali song'],
      hashtags: ['#NepaliMusicVideo', '#RainOfLove', '#KiranAIVideoStudio', '#KathmanduVibes', '#NewNepaliSong2026']
    }
  });

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      if (!songTitle || songTitle === 'मायाको झरी (Rain of Love)') {
        setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAnalyzeAndPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      // Call AI Video Plan API tuned for music
      const res = await StudioApiService.generateVideoPlan({
        name: songTitle,
        idea: `Music Video for song "${songTitle}" by artist "${artistName}". Genre: ${genre}. Lyrics: ${lyricsInput}`,
        type: 'Music Video',
        aspectRatio: '16:9',
        duration: '3 minutes',
        style: 'Romantic',
        voice: 'Custom',
        language,
        music: 'AI Background Music'
      });

      if (res && res.scenes && res.scenes.length > 0) {
        setMusicPlan({
          songTitle,
          artist: artistName || 'Creator Artist',
          genre,
          tempo: '80 BPM Melodic Flow',
          mood: 'Romantic, Cinematic, Atmospheric',
          theme: res.summary || 'A cinematic musical narrative of devotion and visual harmony.',
          lyricsAnalysis: 'Structured musical storytelling synchronized with lyrical crescendos and emotional beats.',
          sections: res.scenes.map((s, idx) => ({
            sectionName: s.title || `Movement ${idx + 1}`,
            timestamp: s.timeRange || `0:${idx * 30} - 0:${(idx + 1) * 30}`,
            lyricsExcerpt: s.voiceoverText || 'Harmonic musical progression',
            visualAction: s.description,
            cameraMovement: s.cameraMovement,
            lighting: 'Cinematic three-point lighting with atmospheric volumetric fill',
            visualPrompt: s.visualPrompt
          })),
          lyricsCaptionPlan: {
            fontStyle: 'Modern high-legibility display font with soft shadow',
            animation: 'Word-by-word synchronised lyric pop-up',
            colorPalette: '#FFFFFF base with glowing #6366F1 violet accent'
          },
          thumbnailConcept: {
            headline: songTitle.toUpperCase().slice(0, 18),
            visualComposition: 'Cinematic key scene frame with high emotional resonance on right; bold contrast title on left.',
            imagePrompt: `Cinematic music video thumbnail, ${songTitle}, artist aesthetic, dramatic atmospheric lighting, 8k, photorealistic.`
          },
          youtubeMetadata: {
            title: `${songTitle} (Official Music Video) | Kiran AI Video Studio`,
            description: `Official Music Video for ${songTitle} by ${artistName}.\n\nProduced with Kiran AI Video Studio.\n\nEnjoy in 4K UHD.`,
            tags: [songTitle.toLowerCase(), 'music video', 'official video', 'kiran ai video studio', genre.toLowerCase()],
            hashtags: ['#MusicVideo', '#OfficialMusicVideo', '#KiranAIVideoStudio', '#NewMusic']
          }
        });
      }
    } catch (err: any) {
      console.error('Music Video Planner error:', err);
      setErrorMessage(err?.message || 'Failed to analyze lyrics and plan music video. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center justify-between gap-3 animate-in fade-in">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 font-bold shrink-0 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-2 border border-violet-500/30">
            <Disc className="w-3.5 h-3.5" />
            <span>Studio Production Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Music Video Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Turn your songs, audio tracks, and lyrics into a complete scene-by-scene cinematic music video blueprint, timeline, visual prompts, and YouTube metadata.
          </p>
        </div>

        {musicPlan && onSaveAsProject && (
          <button
            onClick={() => {
              const newProj: Project = {
                id: 'proj-' + Date.now(),
                userId: 'current',
                name: musicPlan.songTitle,
                type: 'Music Video',
                aspectRatio: '16:9',
                duration: '3 minutes',
                style: 'Romantic',
                voice: 'Custom',
                language: language as any,
                music: 'Upload Music',
                ideaPrompt: `Music Video for ${musicPlan.songTitle}: ${musicPlan.theme}`,
                status: 'Completed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                scenes: musicPlan.sections.map((s, idx) => ({
                  id: 'scene-' + idx,
                  sceneNumber: idx + 1,
                  timeRange: s.timestamp,
                  title: s.sectionName,
                  description: s.visualAction,
                  visualPrompt: s.visualPrompt,
                  cameraMovement: s.cameraMovement,
                  voiceoverText: s.lyricsExcerpt
                }))
              };
              onSaveAsProject(newProj);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Save as Studio Project</span>
          </button>
        )}
      </div>

      {/* Input Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form (5 cols) */}
        <form onSubmit={handleAnalyzeAndPlan} className="lg:col-span-5 space-y-5 p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Music className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Song & Audio Input</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Song Title</label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="e.g. मायाको झरी / Monsoon Memories"
                className="w-full bg-[#171c2b] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Artist / Band</label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g. Kiran Sharma"
                  className="w-full bg-[#171c2b] text-white text-xs px-3 py-2 rounded-xl border border-white/10 focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs px-3 py-2 rounded-xl border border-white/10 focus:border-violet-500 focus:outline-none"
                >
                  <option value="Nepali">Nepali (नेपाली)</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Genre & Musical Style</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Nepali Folk-Pop / Cinematic Acoustic"
                className="w-full bg-[#171c2b] text-white text-xs px-3 py-2 rounded-xl border border-white/10 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Audio File Drag & Drop */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Song Audio (Optional MP3 / WAV)
              </label>
              <label className="border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#171c2b]/50 hover:bg-[#171c2b] transition-all">
                <Upload className="w-5 h-5 text-violet-400 mb-1.5" />
                <span className="text-xs text-slate-300 font-medium">
                  {audioFileName || 'Click or drag & drop audio track'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">MP3, WAV, AAC up to 50MB</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Lyrics Input Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Song Lyrics & Verse Cues</span>
                </label>
                <span className="text-[10px] text-slate-500">Paste full lyrics</span>
              </div>
              <textarea
                value={lyricsInput}
                onChange={(e) => setLyricsInput(e.target.value)}
                rows={7}
                placeholder="Paste lyrics with section markers like [Intro], [Verse 1], [Chorus]..."
                className="w-full bg-[#171c2b] text-white text-xs p-3 rounded-xl border border-white/10 focus:border-violet-500 focus:outline-none font-mono leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Music & Sequencing Scenes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Music Video Blueprint</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right: Output Blueprint (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {musicPlan && (
            <div className="space-y-6">
              {/* Song Summary Card */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Song Concept</span>
                    <h3 className="text-lg font-black text-white">{musicPlan.songTitle}</h3>
                    <p className="text-xs text-slate-400">By {musicPlan.artist} • {musicPlan.genre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 font-semibold">
                      {musicPlan.tempo}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold">
                      {musicPlan.mood.split(',')[0]}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                      Narrative Theme
                    </span>
                    <p className="text-slate-200 leading-relaxed bg-[#171c2b] p-3 rounded-xl border border-white/5">
                      {musicPlan.theme}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                      Lyrics Emotional Analysis
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {musicPlan.lyricsAnalysis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scene Breakdown Timeline */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Scene-by-Scene Timeline ({musicPlan.sections.length} Movements)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Cinematic Cut Sequence</span>
                </div>

                <div className="space-y-3">
                  {musicPlan.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 hover:border-violet-500/30 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{section.sectionName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded">
                          {section.timestamp}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 pl-7 space-y-2">
                        <p className="text-[11px] text-violet-300/90 italic font-mono bg-violet-950/20 p-2 rounded-lg border border-violet-500/20">
                          Lyrics: "{section.lyricsExcerpt}"
                        </p>
                        <p className="text-[11px] text-slate-300">
                          <strong className="text-white">Action:</strong> {section.visualAction}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                          <div>
                            <span className="text-slate-500">Camera:</span> {section.cameraMovement}
                          </div>
                          <div>
                            <span className="text-slate-500">Lighting:</span> {section.lighting}
                          </div>
                        </div>

                        {/* Prompt Box */}
                        <div className="mt-2 p-2.5 rounded-xl bg-[#0e1118] border border-white/5 flex items-start justify-between gap-2">
                          <p className="text-[10px] font-mono text-slate-400 line-clamp-2">
                            {section.visualPrompt}
                          </p>
                          <button
                            onClick={() => copyText(section.visualPrompt, `prompt-${idx}`)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
                            title="Copy Visual Generator Prompt"
                          >
                            {copiedKey === `prompt-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lyrics Caption & Thumbnail Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lyrics / Caption Strategy */}
                <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Mic2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>Caption & Lyric Styling</span>
                  </div>
                  <div className="text-[11px] space-y-1.5 text-slate-300">
                    <p><strong className="text-slate-400">Typography:</strong> {musicPlan.lyricsCaptionPlan.fontStyle}</p>
                    <p><strong className="text-slate-400">Animation:</strong> {musicPlan.lyricsCaptionPlan.animation}</p>
                    <p><strong className="text-slate-400">Color Palette:</strong> {musicPlan.lyricsCaptionPlan.colorPalette}</p>
                  </div>
                </div>

                {/* Thumbnail Blueprint */}
                <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Thumbnail Blueprint</span>
                    </div>
                    <button
                      onClick={() => copyText(musicPlan.thumbnailConcept.imagePrompt, 'thumb-prompt')}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      {copiedKey === 'thumb-prompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Prompt</span>
                    </button>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-300">
                    <p><strong className="text-slate-400">Main Text:</strong> "{musicPlan.thumbnailConcept.headline}"</p>
                    <p className="line-clamp-2 text-slate-400 text-[10px]">{musicPlan.thumbnailConcept.visualComposition}</p>
                  </div>
                </div>
              </div>

              {/* YouTube Ready Metadata */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      YouTube Publishing Metadata
                    </h3>
                  </div>
                  {onOpenSEO && (
                    <button
                      onClick={() => onOpenSEO(musicPlan.youtubeMetadata.title, musicPlan.youtubeMetadata.description)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Open in SEO Suite</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 font-semibold">Video Title</span>
                      <button
                        onClick={() => copyText(musicPlan.youtubeMetadata.title, 'meta-title')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedKey === 'meta-title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="p-2.5 rounded-xl bg-[#171c2b] text-white font-medium border border-white/5">
                      {musicPlan.youtubeMetadata.title}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 font-semibold">Tags & Hashtags</span>
                      <button
                        onClick={() => copyText(musicPlan.youtubeMetadata.tags.join(', '), 'meta-tags')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedKey === 'meta-tags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy All Tags</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {musicPlan.youtubeMetadata.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                          {h}
                        </span>
                      ))}
                      {musicPlan.youtubeMetadata.tags.map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
