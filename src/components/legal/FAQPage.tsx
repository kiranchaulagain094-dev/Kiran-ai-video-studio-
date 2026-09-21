import React, { useState } from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Video, 
  HardDrive, 
  Mail, 
  Youtube,
  Lock,
  Globe2,
  ExternalLink
} from 'lucide-react';

interface FAQPageProps {
  onNavigate: (route: string) => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'General & Access',
      question: 'What is Kiran AI Video Studio?',
      answer: 'Kiran AI Video Studio is an independent web-based creative workspace developed by Kiran Chaulagain. It provides free, browser-based tools to help creators plan video screenplays, structure 9:16 vertical Shorts, arrange multi-track timelines, design high-CTR thumbnails, and optimize YouTube SEO metadata.'
    },
    {
      category: 'General & Access',
      question: 'Is Kiran AI Video Studio completely free to use?',
      answer: 'Yes. All current features—including the Video Planner, Shorts Creator, Content Assistant, Thumbnail Concept Designer, and Video Editor—are free to access. There are no paywalls, mandatory credit card prompts, or hidden premium tiers.'
    },
    {
      category: 'General & Access',
      question: 'Do I need to create an account or provide personal login details?',
      answer: 'No. The studio operates in an open creator mode. You can plan video concepts, edit timelines, format 9:16 Shorts, and generate SEO tags without mandatory account registration or passwords.'
    },
    {
      category: 'Video Tools & Capabilities',
      question: 'Does the studio generate completed MP4 video files automatically?',
      answer: 'Kiran AI Video Studio generates comprehensive production blueprints: scene-by-scene screenplays, timing brackets, camera directions, voiceover scripts, dialogue, and AI image prompts. Direct in-browser MP4 video rendering is currently in active development (Coming Soon). In the meantime, you can export your complete timeline structure as a JSON project file or use the scene plan to shoot or edit in Premiere, DaVinci Resolve, or CapCut.'
    },
    {
      category: 'Video Tools & Capabilities',
      question: 'How does the AI Video Planner work?',
      answer: 'You provide a core storyline idea, choose your desired duration and visual style, and the AI synthesizes a multi-scene breakdown complete with camera movements, dialogue, audio cues, and visual generation prompts.'
    },
    {
      category: 'Video Tools & Capabilities',
      question: 'What is the Shorts & Reels Creator designed for?',
      answer: 'It is built specifically for 9:16 vertical short-form content on YouTube Shorts, Instagram Reels, and TikTok. It focuses on the crucial 3-second opening hook, high-retention visual cut pacing (every 2-4 seconds), on-screen text overlays, and caption copy.'
    },
    {
      category: 'Ownership & Copyright',
      question: 'Who owns the scripts, storyboards, and metadata I generate?',
      answer: 'You retain 100% ownership of all creative concepts, scripts, storyboards, and metadata you produce using Kiran AI Video Studio. You are free to monetize your videos on YouTube or use your production plans for commercial projects.'
    },
    {
      category: 'Ownership & Copyright',
      question: 'Can I monetize videos planned on Kiran AI Video Studio?',
      answer: 'Yes. Your scripts and metadata are yours to use across personal and commercial YouTube channels, Facebook, Instagram, TikTok, and commercial client productions.'
    },
    {
      category: 'Storage & Privacy',
      question: 'Where are my video drafts and projects stored?',
      answer: 'All projects, drafts, and user preferences are stored directly in your computer’s web browser via HTML5 localStorage. We do not store your drafts or personal data on remote tracking servers. If you clear your browser cache, your locally stored drafts will be reset.'
    },
    {
      category: 'Storage & Privacy',
      question: 'How do I clear or reset my stored project data?',
      answer: 'You can delete individual projects from the My Projects manager, or visit Studio Settings to reset your workspace. You can also clear site data directly in your browser settings.'
    },
    {
      category: 'YouTube SEO & Performance',
      question: 'Does Kiran AI Video Studio guarantee viral views or channel growth?',
      answer: 'No. We believe in complete transparency: no tool can guarantee viral reach, algorithmic recommendations, or subscriber numbers. Algorithmic success depends on genuine viewer retention, storytelling quality, thumbnail appeal, and audience interest. Our tools provide structured planning and evidence-based SEO suggestions to help you produce better content.'
    },
    {
      category: 'YouTube SEO & Performance',
      question: 'What is included in the YouTube SEO Pack?',
      answer: 'The SEO Pack includes 5 alternative title formulations (High CTR, Search Intent, Question, Curiosity, Direct Match), a complete description with chapter timestamps, ready-to-paste comma-separated tags, hashtags, and an objective 0-100 SEO score evaluating search intent and keyword coverage.'
    },
    {
      category: 'Languages & Support',
      question: 'What languages are supported by the studio?',
      answer: 'The studio supports 10 languages including Nepali (नेपाली), Romanized Nepali, Hindi (हिन्दी), English, Spanish, French, German, Japanese, Korean, and Arabic. You can even set separate languages for the spoken dialogue and YouTube metadata.'
    },
    {
      category: 'Languages & Support',
      question: 'How can I contact developer Kiran Chaulagain or report a bug?',
      answer: 'You can contact Kiran Chaulagain directly by emailing kiranchaulagain094@gmail.com, filling out the Contact Us form, or visiting the official YouTube channel @kiranaimusic-94.'
    },
    {
      category: 'Advertising & Compliance',
      question: 'How does the website handle advertising and Google AdSense?',
      answer: 'To keep all studio tools 100% free for creators, Kiran AI Video Studio may display clean, non-intrusive advertisements served through Google AdSense. Third-party advertising vendors, including Google, use cookies to serve ads based on prior visits. For full details on cookie controls and opt-out options, see our Cookie Policy and Privacy Policy.'
    }
  ];

  const categories = ['All', 'General & Access', 'Video Tools & Capabilities', 'Ownership & Copyright', 'Storage & Privacy', 'YouTube SEO & Performance', 'Languages & Support', 'Advertising & Compliance'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <LegalLayout
      currentRoute="faq"
      onNavigate={onNavigate}
      title="Frequently Asked Questions (FAQ)"
      subtitle="Comprehensive, honest answers to common questions about features, pricing, data storage, copyright, and AI capabilities."
      lastUpdated="September 20, 2026"
    >
      {/* Search & Category Filter */}
      <section className="space-y-4 not-prose">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. storage, free, video rendering, copyright, SEO)..."
            className="w-full bg-[#121622] text-white text-xs sm:text-sm pl-11 pr-4 py-3 rounded-2xl border border-white/10 focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <span>Questions & Answers ({filteredFaqs.length})</span>
        </h2>

        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#121622] border border-white/5 space-y-2">
            <p className="text-sm text-slate-300 font-semibold">No questions matched your search.</p>
            <p className="text-xs text-slate-500">Try searching for a different keyword or select "All" categories.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#121622] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-[#0f131c]/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Still Have Questions Box */}
      <section className="p-6 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-400" />
          Still have a question?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          If your question isn't answered above, feel free to reach out directly to developer Kiran Chaulagain. We are happy to help creators get the most out of our tools.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="mailto:kiranchaulagain094@gmail.com"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
          >
            Email: kiranchaulagain094@gmail.com
          </a>
          <button
            onClick={() => onNavigate('contact-us')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
          >
            Open Contact Form
          </button>
        </div>
      </section>
    </LegalLayout>
  );
};
