import React, { useState } from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Youtube, 
  ExternalLink, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface ContactUsProps {
  onNavigate: (route: string) => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ onNavigate }) => {
  const primaryEmail = 'kiranchaulagain094@gmail.com';
  const supportEmail = 'kiranchaulagain094@gmail.com';

  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry & Feedback',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<{
    ticketId: string;
    name: string;
    subject: string;
  } | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate swift submission and receipt generation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedMessage({
        ticketId: `KV-${Math.floor(100000 + Math.random() * 900000)}`,
        name: formData.name,
        subject: formData.subject || 'Studio Inquiry'
      });
      setFormData({
        name: '',
        email: '',
        category: 'General Inquiry & Feedback',
        subject: '',
        message: ''
      });
    }, 600);
  };

  const faqItems = [
    {
      q: 'Do I need an account to use Kiran AI Video Studio?',
      a: 'No. The studio operates with open creator access. You can plan video concepts, edit timelines, format 9:16 Shorts, and generate SEO tags without mandatory account registration or passwords.'
    },
    {
      q: 'Can I use the video concepts and assets for commercial YouTube channels?',
      a: 'Yes. You retain full ownership of the scripts, video concepts, and creative edits you produce within the studio for your personal or commercial YouTube channels.'
    },
    {
      q: 'How do I clear my stored project drafts?',
      a: 'Drafts are stored locally in your browser’s localStorage. You can delete individual projects from the My Projects manager or clear your browser site data at any time.'
    },
    {
      q: 'Who can I contact regarding Privacy Policy or DMCA questions?',
      a: 'Use the contact form below or email us directly at kiranchaulagain094@gmail.com with "Policy / DMCA" in the subject line for prompt handling.'
    }
  ];

  return (
    <LegalLayout
      currentRoute="contact-us"
      onNavigate={onNavigate}
      title="Contact Us"
      subtitle="Have questions, feature feedback, or policy inquiries? Reach out to the Kiran AI Video Studio team."
      lastUpdated="September 20, 2026"
    >
      {/* Upper Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-8">
        
        {/* Primary Contact Card */}
        <div className="p-5 rounded-2xl bg-[#111520] border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Direct Email Inquiries</h3>
              <p className="text-[11px] text-slate-400">Configurable support channels</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="p-2.5 rounded-xl bg-[#161b29] border border-white/5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">General & Policy</span>
                <a href={`mailto:${primaryEmail}`} className="text-xs font-mono text-indigo-300 hover:text-indigo-200">
                  {primaryEmail}
                </a>
              </div>
              <button
                onClick={() => handleCopy(primaryEmail, 'primary')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copy email"
                aria-label="Copy primary email"
              >
                {copied === 'primary' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#161b29] border border-white/5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Creator Support</span>
                <a href={`mailto:${supportEmail}`} className="text-xs font-mono text-indigo-300 hover:text-indigo-200">
                  {supportEmail}
                </a>
              </div>
              <button
                onClick={() => handleCopy(supportEmail, 'support')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copy email"
                aria-label="Copy support email"
              >
                {copied === 'support' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Typical response window: Within 24-48 business hours.</span>
          </p>
        </div>

        {/* Community & Config Card */}
        <div className="p-5 rounded-2xl bg-[#111520] border border-white/10 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Creator Community</h3>
                <p className="text-[11px] text-slate-400">Official YouTube Channel</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Join our community channel for video guides, sound tracks, AI music demonstrations, and platform updates.
            </p>

            <a
              href="https://youtube.com/@kiranaimusic-94?si=mTfia-Y4ZdAQqOFl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all group"
            >
              <Youtube className="w-4 h-4" />
              <span>Visit @kiranaimusic-94</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-[#161b29] border border-white/5">
            <span className="text-[10px] text-emerald-400 font-semibold block">Official Studio Contact</span>
            <span className="text-[11px] text-slate-400">
              For direct business inquiries, copyright, and creator support: <a href="mailto:kiranchaulagain094@gmail.com" className="text-indigo-300 font-mono underline hover:text-white">kiranchaulagain094@gmail.com</a>
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Contact Form */}
      <section className="space-y-4 not-prose">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Send Us a Message
          </h2>
          <span className="text-xs text-slate-400">All fields required</span>
        </div>

        {submittedMessage ? (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Thank you, {submittedMessage.name}!</h3>
              <p className="text-xs text-emerald-300 mt-1">
                Your message regarding "{submittedMessage.subject}" has been recorded.
              </p>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Reference ID: <span className="text-indigo-300 font-bold">{submittedMessage.ticketId}</span>
              </p>
            </div>
            <button
              onClick={() => setSubmittedMessage(null)}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl bg-[#111520] border border-white/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Creator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b29] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b29] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Inquiry Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b29] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="General Inquiry & Feedback">General Inquiry & Feedback</option>
                  <option value="Privacy & Data Question">Privacy & Data Question</option>
                  <option value="Terms of Service & Licensing">Terms of Service & Licensing</option>
                  <option value="DMCA / Copyright Notice">DMCA / Copyright Notice</option>
                  <option value="Feature Request / Tool Bug">Feature Request / Tool Bug</option>
                  <option value="Advertising & Partnerships">Advertising & Partnerships</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of your inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b29] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message Content *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe your question, issue, or feedback in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b29] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Your message is handled confidentially and never shared with third parties.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 not-prose">
          {faqItems.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#111520] border border-white/10 space-y-1.5">
              <h4 className="text-xs font-bold text-white flex items-start gap-2">
                <span className="text-indigo-400 font-mono font-bold">Q:</span>
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-5">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </LegalLayout>
  );
};
