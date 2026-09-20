import React from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  Scale, 
  Mail,
  Layers
} from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (route: string) => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
  const contactEmail = 'contact@kiranvideostudio.com';

  return (
    <LegalLayout
      currentRoute="terms-of-service"
      onNavigate={onNavigate}
      title="Terms of Service"
      subtitle="The rules, terms, and mutual responsibilities governing your use of Kiran AI Video Studio creative tools."
      lastUpdated="September 20, 2026"
    >
      {/* 1. Acceptance of Terms */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <CheckCircle className="w-5 h-5 text-indigo-400" />
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using <strong>Kiran AI Video Studio</strong> ("the Service", "the Platform", or "we"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you must not access or use our website, video generation planners, timeline editor, or creator tools.
        </p>
        <p>
          These Terms apply to all visitors, content creators, and users who access the Service.
        </p>
      </section>

      {/* 2. License & Permitted Use */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          2. Permitted Use & Creative Tools
        </h2>
        <p>
          Kiran AI Video Studio grants you a personal, non-exclusive, non-transferable, revocable license to access and use our suite of web-based creative tools, including:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm ml-2">
          <li><strong>AI Video Planner & Storyboard Generator:</strong> Formulating multi-scene video concepts, visual directions, and audio cues.</li>
          <li><strong>Shorts Creator (9:16):</strong> Scripting, hook structuring, and vertical visual pacing for YouTube Shorts and short-form video.</li>
          <li><strong>Multi-Track Video Editor:</strong> Browser timeline assembly, clip trimming, splitting, speed adjustments, and previewing.</li>
          <li><strong>Thumbnail Maker:</strong> Designing high-CTR visual cover graphics and composition banners.</li>
          <li><strong>AI Content & SEO Assistant:</strong> Generating titles, descriptions, hashtags, timestamps, and search optimization suggestions.</li>
        </ul>
      </section>

      {/* 3. Intellectual Property Rights */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          3. Intellectual Property & User Content
        </h2>
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">A. Your Content & Ownership</h3>
          <p>
            You retain all ownership, title, and copyright in the original text prompts, scripts, media files, and creative works that you input, produce, or assemble within Kiran AI Video Studio. We claim no ownership over the video concepts, ideas, or content you generate.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">B. Studio Intellectual Property</h3>
          <p>
            The software, visual layout, code, design architecture, graphics, and brand assets of Kiran AI Video Studio are the proprietary property of the Studio and are protected by applicable intellectual property and copyright laws. You may not copy, decompile, reverse-engineer, or redistribute the underlying platform code without prior written authorization.
          </p>
        </div>
      </section>

      {/* 4. Acceptable Use Policy */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          4. Prohibited Conduct & Content Guidelines
        </h2>
        <p>When using the Studio, you agree not to generate, assemble, or distribute content that:</p>
        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm ml-2">
          <li>Is illegal, fraudulent, harassing, defamatory, obscene, or promotes violence or hatred against individuals or groups.</li>
          <li>Infringes on any patent, trademark, trade secret, copyright, or privacy rights of any third party.</li>
          <li>Attempts to bypass or disrupt server infrastructure, execute automated denial-of-service (DoS) attacks, or inject malicious scripts.</li>
          <li>Impersonates any individual or entity or falsely implies endorsement by Kiran AI Video Studio or YouTube.</li>
          <li>Systematically scrapes or mass-extracts data from the platform through automated bots or spiders without permission.</li>
        </ul>
      </section>

      {/* 5. AI Generation Disclaimer */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <AlertTriangle className="w-5 h-5 text-indigo-400" />
          5. AI-Generated Output Responsibility
        </h2>
        <p>
          You acknowledge that the video concepts, scene outlines, scripts, tags, and titles are produced using artificial intelligence models. While we strive to provide helpful and high-quality creative assistance:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm ml-2">
          <li>Outputs are probabilistic suggestions intended for creative inspiration and drafting.</li>
          <li>You are solely responsible for reviewing, verifying, and editing generated scripts and assets prior to publishing on third-party channels (such as YouTube, TikTok, or Instagram).</li>
          <li>We do not guarantee that AI-generated video concepts or SEO tags will achieve specific YouTube ranking, monetization approval, or algorithmic reach.</li>
        </ul>
      </section>

      {/* 6. Service Availability & Changes */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          6. Disclaimer of Warranties & Limitation of Liability
        </h2>
        <p>
          The Service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or uninterrupted availability.
        </p>
        <p>
          In no event shall Kiran AI Video Studio, its developers, or contributors be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or inability to use the Service or any loss of creative data.
        </p>
      </section>

      {/* 7. Modifications to Terms */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white border-b border-white/10 pb-2">
          7. Modifications to the Terms
        </h2>
        <p>
          We reserve the right to revise or replace these Terms at any time. When updates are published, the revised version will be indicated by the "Last Updated" date at the top of this document. Your continued use of the Studio after any changes indicates your acceptance of the updated Terms.
        </p>
      </section>

      {/* 8. Contact Information */}
      <section className="p-5 rounded-2xl bg-[#111520] border border-white/10 space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-400" />
          8. Contact for Terms & Legal Questions
        </h3>
        <p className="text-sm text-slate-300">
          For any questions, clarifications, or notices regarding these Terms of Service, please reach out to:
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
