import React from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Youtube, 
  Layers, 
  ExternalLink, 
  ShieldAlert,
  Mail,
  CheckCircle2
} from 'lucide-react';

interface DisclaimerProps {
  onNavigate: (route: string) => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onNavigate }) => {
  const contactEmail = 'contact@kiranvideostudio.com';

  return (
    <LegalLayout
      currentRoute="disclaimer"
      onNavigate={onNavigate}
      title="Disclaimer"
      subtitle="Important legal, creative, and performance disclaimers for creators using Kiran AI Video Studio."
      lastUpdated="September 20, 2026"
    >
      {/* 1. General Creative & Informational Notice */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <AlertCircle className="w-5 h-5 text-indigo-400" />
          1. General Creative Notice
        </h2>
        <p>
          The information, tools, video generation planners, scripts, timeline editors, and SEO scoring features provided on <strong>Kiran AI Video Studio</strong> ("the Platform") are designed exclusively for creative, educational, and video production assistance.
        </p>
        <p>
          All tools are provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any generated content or recommendations.
        </p>
      </section>

      {/* 2. AI Generation & Machine Learning Disclaimer */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          2. Artificial Intelligence & Algorithmic Outputs
        </h2>
        <p>
          Kiran AI Video Studio utilizes generative artificial intelligence models to assist you in formulating storyboard concepts, multi-scene breakdowns, narrative scripts, camera angles, lighting cues, and audio suggestions.
        </p>
        <div className="p-4 rounded-xl bg-[#131722] border border-white/10 space-y-2 text-sm text-slate-300">
          <p className="font-bold text-white">Please be advised:</p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-400">
            <li>AI outputs are probabilistic recommendations and creative drafts, not final verified facts.</li>
            <li>Generative models may occasionally produce fictional statements, inaccurate historical dates, or unintended semantic interpretations (commonly known as hallucinations).</li>
            <li>You, as the creator and publisher, are solely responsible for fact-checking, reviewing, and editing any scripts or narrative content prior to publishing or distributing your final videos.</li>
          </ul>
        </div>
      </section>

      {/* 3. YouTube Performance & Growth Disclaimer */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          3. YouTube Performance & SEO Disclaimer
        </h2>
        <p>
          Our <strong>AI Content Assistant</strong> and <strong>YouTube SEO Scoring Engine</strong> provide metadata generation, title variations, click-through-rate (CTR) composition suggestions, hashtag recommendations, and objective readability audits based on industry best practices.
        </p>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-sm space-y-2">
          <p className="font-semibold text-white">No Guarantee of Views, Subscribers, or Monetization:</p>
          <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
            Kiran AI Video Studio does NOT guarantee that utilizing our generated titles, thumbnails, scripts, or SEO suggestions will result in specific view counts, subscriber growth, YouTube algorithm promotion, or monetization acceptance into the YouTube Partner Program. Algorithmic distribution depends on countless external factors beyond our control, including viewer retention, external competition, niche dynamics, and platform policy compliance.
          </p>
        </div>
      </section>

      {/* 4. Third-Party Trademarks & Assets */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          4. Third-Party Trademarks & Copyright Notice
        </h2>
        <p>
          "YouTube", "Google", "Google AdSense", "Shorts", and any related logos or trademarks referenced on this website are registered trademarks of Google LLC.
        </p>
        <p>
          Any other third-party trademarks, service marks, platform names (such as TikTok, Instagram), or brand names mentioned are the property of their respective owners. Reference to them does not constitute or imply any affiliation with, sponsorship of, or endorsement by these entities.
        </p>
        <p className="text-xs text-slate-400">
          Stock photos and background artwork utilized in UI mockups or templates are sourced via royalty-free licenses (such as Unsplash) and remain the intellectual property of their original creators.
        </p>
      </section>

      {/* 5. External Links Disclaimer */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <ExternalLink className="w-5 h-5 text-indigo-400" />
          5. External Links Disclaimer
        </h2>
        <p>
          The Platform may contain links to external websites, community channels (such as our official YouTube channel <a href="https://youtube.com/@kiranaimusic-94?si=mTfia-Y4ZdAQqOFl" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 font-semibold underline">@kiranaimusic-94</a>), or third-party resources that are not operated or controlled by us.
        </p>
        <p className="text-sm text-slate-300">
          We do not warrant, endorse, guarantee, or assume responsibility for the accuracy, completeness, or reliability of any information offered by third-party websites linked through our platform.
        </p>
      </section>

      {/* 6. Limitation of Liability */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          6. Limitation of Liability
        </h2>
        <p>
          Under no circumstances shall Kiran AI Video Studio, its operators, or contributors have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information, scripts, or video assets generated via the site. Your use of the site and your reliance on any tools is solely at your own risk.
        </p>
      </section>

      {/* 7. Contact Section */}
      <section className="p-5 rounded-2xl bg-[#111520] border border-white/10 space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-400" />
          7. Questions Regarding This Disclaimer
        </h3>
        <p className="text-sm text-slate-300">
          If you require any more information or have questions about our site's disclaimer, please feel free to contact us:
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <a
            href={`mailto:${contactEmail}`}
            className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold w-fit transition-colors"
          >
            {contactEmail}
          </a>
          <button
            onClick={() => onNavigate('contact-us')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold w-fit transition-colors"
          >
            Open Contact Form →
          </button>
        </div>
      </section>
    </LegalLayout>
  );
};
