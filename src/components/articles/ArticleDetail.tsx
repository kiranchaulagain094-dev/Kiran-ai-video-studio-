import React, { useEffect, useState } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Calendar, 
  User, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  BookOpen,
  Compass,
  Lightbulb,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Article } from '../../types';
import { getRelatedArticles, getPreviousAndNextArticles } from '../../data/articles';
import { AdSenseSafeContainer } from '../common/AdSenseSafeContainer';

interface ArticleDetailProps {
  article: Article;
  onNavigateBack: () => void;
  onSelectArticle: (slug: string) => void;
  onOpenTool: (route: string, prefillContext?: any) => void;
  onNavigateHome: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  onNavigateBack,
  onSelectArticle,
  onOpenTool,
  onNavigateHome
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const { previous, next } = getPreviousAndNextArticles(article.slug);
  const relatedArticles = getRelatedArticles(article.slug, 3);

  // SEO & OpenGraph synchronization (following applet-seo skill)
  useEffect(() => {
    // 1. Title Tag
    const originalTitle = document.title;
    document.title = `${article.title} | Kiran AI Video Studio`;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute('content', article.metaDescription);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', article.metaDescription);
      document.head.appendChild(metaDesc);
    }

    // 3. OpenGraph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', article.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', article.metaDescription);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);

    // 4. Schema.org Article Structured Data (JSON-LD)
    const scriptId = 'article-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      alternativeHeadline: article.englishTitle,
      description: article.metaDescription,
      inLanguage: 'ne',
      datePublished: article.publishedDate,
      dateModified: article.updatedDate,
      author: {
        '@type': 'Person',
        name: 'Kiran Chaulagain',
        jobTitle: 'Independent Developer & Video Creator',
        email: 'kiranchaulagain094@gmail.com'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Kiran AI Video Studio',
        logo: {
          '@type': 'ImageObject',
          url: 'https://ais-dev-bmjexe4ocjchrv7alhy42l-774957247669.asia-southeast1.run.app/favicon.ico'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href
      },
      keywords: article.keywords.join(', ')
    };
    scriptTag.textContent = JSON.stringify(jsonLdData);

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) metaDesc.setAttribute('content', originalDesc);
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [article]);

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(identifier);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.metaDescription,
        url
      }).catch(() => {});
    } else {
      copyToClipboard(url, 'share-url');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <button 
          onClick={onNavigateHome} 
          className="hover:text-white transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button 
          onClick={onNavigateBack} 
          className="hover:text-white transition-colors cursor-pointer"
        >
          Creator Guides
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-500">{article.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-indigo-400 font-semibold truncate max-w-[220px]">
          Guide #{article.topicNumber}
        </span>
      </nav>

      {/* Back to Guides Button */}
      <div>
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All 30 Guides</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4 pb-6 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
              Guide #{article.topicNumber}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 font-semibold text-xs border border-white/10">
              {article.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Share this guide"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedText === 'share-url' ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-400 font-medium">
          {article.englishTitle}
        </p>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kiran Chaulagain</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Updated: {article.updatedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </header>

      {/* Prominent Real Article -> Tool Integration CTA Card */}
      <section 
        aria-label="Connected Creative Tool"
        className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#141828] to-[#121622] border-2 border-indigo-500/40 shadow-xl space-y-4"
      >
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>🎯 Try This Tool in Kiran AI Video Studio</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-lg font-bold text-white">
              {article.targetTool.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "अब तपाईंले यस लेखमा सिकेको ज्ञानलाई स्टुडियोको वास्तविक AI उपकरणमा तुरुन्तै अभ्यास गरेर हेर्न सक्नुहुन्छ।"
            </p>
            <p className="text-[11px] text-slate-400">
              {article.targetTool.description}
            </p>
          </div>

          <button
            onClick={() => onOpenTool(article.targetTool.route, article.targetTool.prefillContext)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{article.targetTool.buttonLabel || `Open ${article.targetTool.name}`}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Section 1: Introduction */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>परिचय र सन्दर्भ (Introduction)</span>
        </h2>
        <div className="text-sm sm:text-base text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
          {article.introduction}
        </div>
      </section>

      {/* Section 2: Step-by-Step Blueprint */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>चरणबद्ध प्रक्रिया (Step-by-Step Practical Blueprint)</span>
        </h2>

        <div className="space-y-4">
          {article.stepByStep.map((step) => (
            <div 
              key={step.stepNumber}
              className="p-5 rounded-2xl bg-[#121622] border border-white/5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0">
                  {step.stepNumber}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {step.stepTitle}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-10">
                {step.stepContent}
              </p>

              {step.example && (
                <div className="ml-10 p-3.5 rounded-xl bg-[#171c2b] border border-white/5 text-xs text-slate-300 font-mono space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Example / प्रम्प्ट उदाहरण:</span>
                    <button
                      onClick={() => copyToClipboard(step.example!, `step-${step.stepNumber}`)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === `step-${step.stepNumber}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-200">{step.example}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Practical Real-World Examples */}
      {article.practicalExamples.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>व्यावहारिक उदाहरणहरू (Practical Real-World Examples)</span>
          </h2>

          <div className="space-y-4">
            {article.practicalExamples.map((ex, idx) => (
              <div 
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#121622] border border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {ex.title}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(ex.outputOrDemonstration, `example-${idx}`)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-white/5"
                  >
                    {copiedText === `example-${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Example</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">सन्दर्भ / Input:</strong> {ex.inputOrContext}
                </div>

                <div className="p-4 rounded-xl bg-[#171c2b] border border-white/5 text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">
                  {ex.outputOrDemonstration}
                </div>

                <p className="text-xs text-slate-400 italic">
                  💡 <strong className="text-slate-300">किन प्रभावकारी छ:</strong> {ex.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Pro Tips */}
      {article.proTips.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>विशेषज्ञ सुझावहरू (Pro Tips & Best Practices)</span>
          </h2>

          <div className="p-5 rounded-2xl bg-[#121622] border border-white/5 space-y-3">
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {article.proTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Section 5: Common Mistakes & How to Fix Them */}
      {article.commonMistakes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>सामान्य गल्तीहरू र समाधान (Common Mistakes & Fixes)</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {article.commonMistakes.map((m, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-red-950/15 border border-red-500/20 space-y-2 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <span>❌ गल्ती:</span>
                  <span>{m.mistake}</span>
                </div>
                <p className="text-slate-400 text-xs">
                  <strong className="text-slate-300">किन असफल हुन्छ:</strong> {m.whyItFails}
                </p>
                <p className="text-emerald-400 text-xs font-semibold">
                  ✅ <strong className="text-emerald-300">सहि तरिका (Fix):</strong> {m.fix}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mid/Post Content Tool Callout */}
      <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Ready to apply this?</span>
          <h4 className="text-base font-bold text-white">अभ्यास सुरु गर्नुहोस्: {article.targetTool.name}</h4>
          <p className="text-xs text-slate-400">तपाईंको ब्राउजरमै पूर्णतया निःशुल्क र सुरक्षित रूपमा उपलब्ध।</p>
        </div>
        <button
          onClick={() => onOpenTool(article.targetTool.route, article.targetTool.prefillContext)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <span>{article.targetTool.buttonLabel || 'Open Tool'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 6: Concise FAQs Accordion */}
      {article.faqs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>प्रायः सोधिने प्रश्नहरू (Concise FAQs)</span>
          </h2>

          <div className="space-y-2">
            {article.faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl bg-[#121622] border border-white/5 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-500 text-lg font-mono">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-[#141826]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Official YouTube Policy & Platform Updates Notice */}
      <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>YouTube नीति तथा प्लेटफर्म नियमसम्बन्धी महत्त्वपूर्ण जानकारी:</span>
        </div>
        <p className="leading-relaxed">
          YouTube का अल्गोरिदम, कम्युनिटी गाइडलाइन्स र फिचरहरू समयसँगै परिवर्तन हुन सक्छन्। यस निर्देशिकामा उल्लेख गरिएका सुझावहरू सामान्य सिर्जनात्मक अभ्यास र वर्तमान उत्तम अभ्यासमा आधारित छन्। आधिकारिक, अद्यावधिक र कानुनी नियमहरूका लागि सधैँ आधिकारिक <strong>YouTube Creator Studio</strong> र <strong>Google Policy</strong> कागजातहरू अध्ययन गर्न अनुरोध गरिन्छ।
        </p>
      </section>

      {/* AdSense Safe Editorial Placement (Only active on approved content with substantial body) */}
      <AdSenseSafeContainer route="article-detail" hasSubstantialContent={true} />

      {/* Section 7: Summary & Conclusion */}
      <section className="p-6 rounded-3xl bg-[#121622] border border-white/5 space-y-2">
        <h3 className="text-base font-bold text-white">निष्कर्ष (Summary)</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {article.summary}
        </p>
      </section>

      {/* Previous & Next Navigation */}
      <nav aria-label="Previous and Next Articles" className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {previous ? (
          <button
            onClick={() => onSelectArticle(previous.slug)}
            className="p-4 rounded-2xl bg-[#121622] hover:bg-[#151a2a] border border-white/5 hover:border-indigo-500/30 text-left space-y-1 transition-all group cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 group-hover:text-indigo-400">
              <ArrowLeft className="w-3 h-3" />
              <span>Previous Guide</span>
            </span>
            <p className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-300">
              #{previous.topicNumber}: {previous.title}
            </p>
          </button>
        ) : <div />}

        {next ? (
          <button
            onClick={() => onSelectArticle(next.slug)}
            className="p-4 rounded-2xl bg-[#121622] hover:bg-[#151a2a] border border-white/5 hover:border-indigo-500/30 text-right space-y-1 transition-all group cursor-pointer sm:ml-auto w-full"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-end gap-1 group-hover:text-indigo-400">
              <span>Next Guide</span>
              <ArrowRight className="w-3 h-3" />
            </span>
            <p className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-300">
              #{next.topicNumber}: {next.title}
            </p>
          </button>
        ) : <div />}
      </nav>

      {/* Related Guides Section */}
      {relatedArticles.length > 0 && (
        <section className="pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">सम्बन्धित अन्य निर्देशिकाहरू (Related Guides)</h3>
            <button
              onClick={onNavigateBack}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              View All 30 →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectArticle(rel.slug)}
                className="p-4 rounded-2xl bg-[#121622] hover:bg-[#151a2a] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-2 cursor-pointer group"
              >
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-bold">
                    Guide #{rel.topicNumber}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 mt-2 line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-white/5">
                  <span>{rel.readTime}</span>
                  <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">Read →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
