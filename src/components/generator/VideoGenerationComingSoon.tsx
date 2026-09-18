import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Clock, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Smartphone, 
  Clapperboard, 
  BellRing, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface VideoGenerationComingSoonProps {
  onGoToPlanner: () => void;
  onGoToMusicVideo?: () => void;
}

export const VideoGenerationComingSoon: React.FC<VideoGenerationComingSoonProps> = ({
  onGoToPlanner,
  onGoToMusicVideo
}) => {
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');

  const plannedCapabilities = [
    {
      title: 'Text-to-Video',
      description: 'Generate hyper-realistic cinematic sequences directly from rich descriptive prompts with temporal consistency.',
      icon: Film,
      badge: 'In Pipeline'
    },
    {
      title: 'Image-to-Video',
      description: 'Breathe motion and life into existing photos, concept art, and digital illustrations with dynamic camera control.',
      icon: ImageIcon,
      badge: 'In Pipeline'
    },
    {
      title: 'AI Music Video',
      description: 'Synchronize rhythmic visual beats and automated visual storytelling to uploaded audio tracks and lyrics.',
      icon: Music,
      badge: 'In Pipeline'
    },
    {
      title: 'Cinematic Video',
      description: 'Native 24fps motion blur, anamorphic lighting, and film stock emulations designed for high-end narratives.',
      icon: Clapperboard,
      badge: 'In Pipeline'
    },
    {
      title: 'Long-form Video',
      description: 'Multi-scene narrative synthesis with persistent character identities, spatial continuity, and smooth transitions.',
      icon: Layers,
      badge: 'In Pipeline'
    },
    {
      title: 'Shorts & Vertical Video',
      description: 'Instant 9:16 high-retention vertical renders optimized specifically for YouTube Shorts, Reels, and TikTok.',
      icon: Smartphone,
      badge: 'In Pipeline'
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscriberEmail.trim()) {
      setEmailSubscribed(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6 pb-20">
      {/* Hero Badge & Announcement */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          <span>AI Video Generation • Coming Soon</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Turn your ideas into <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">cinematic AI videos.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          This feature is currently under active engineering and will be available soon. In the meantime, use our full studio planning, scriptwriting, storyboard, and SEO tools.
        </p>

        {/* Primary CTA to AI Video Planner */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onGoToPlanner}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Video Planner</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onGoToMusicVideo && (
            <button
              onClick={onGoToMusicVideo}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#171c2b] hover:bg-[#20273b] text-slate-200 hover:text-white font-bold text-sm border border-white/10 transition-all"
            >
              <Music className="w-4 h-4 text-violet-400" />
              <span>Explore Music Video Suite</span>
            </button>
          )}
        </div>
      </div>

      {/* Planned Feature Bento Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Upcoming Video Render Pipeline</h2>
            <p className="text-xs text-slate-400">Features currently scheduled for release in Kiran AI Video Studio</p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Phase 2 Rollout
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plannedCapabilities.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#121622] border border-white/5 hover:border-indigo-500/30 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waitlist / Notification Opt-in */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#151a28] to-[#10131d] border border-white/10 shadow-2xl max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
          <BellRing className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-white">Get Notified on Launch</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Be among the first creators to access high-bitrate AI video generation when the rendering cluster goes live.
        </p>

        {emailSubscribed ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>You're on the priority notification list! We'll notify you when generation opens.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
              placeholder="Enter your creator email..."
              className="flex-1 bg-[#1a2030] text-white text-xs px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-all active:scale-95"
            >
              Notify Me
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
