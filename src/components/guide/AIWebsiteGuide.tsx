import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Send, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Bot, 
  User, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Video,
  Film,
  Scissors,
  Image as ImageIcon,
  LayoutTemplate,
  FolderGit2,
  Info,
  Mail,
  RefreshCw,
  Copy,
  Check,
  Paperclip,
  X
} from 'lucide-react';
import { StudioApiService } from '../../services/api';
import { AIGuideChatMessage, RecommendedTool } from '../../types';
import { CURRENT_STUDIO_TOOLS, VALID_TOOL_IDS, getToolById } from '../../data/studioTools';

interface AIWebsiteGuideProps {
  onNavigate: (route: string) => void;
}

const STORAGE_KEY = 'kiran_ai_website_guide_chat';

const INITIAL_GREETING_MESSAGE: AIGuideChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `**What are you trying to create or accomplish?**

Welcome to Kiran AI Video Studio! I am your personal AI Guide. Tell me your project idea or creative challenge in **any language** (Nepali, Romanized Nepali, Hindi, English, Spanish, or a mix). You can also upload a reference image or thumbnail for an AI visual audit.

I will understand your goal, explain which real tools in our studio can help, and guide you through the process.`,
  timestamp: new Date().toISOString(),
  detectedLanguage: 'Multilingual'
};

const SUGGESTED_PROMPTS = [
  { label: 'I want to make a YouTube video', icon: Video },
  { label: 'mero song ko lagi title ra description chahiyo', icon: Sparkles },
  { label: 'I need a thumbnail idea', icon: ImageIcon },
  { label: 'Help me with YouTube SEO', icon: Sparkles },
  { label: 'Shorts / Reels vertical video banaune kasari?', icon: Film },
  { label: 'Multi-scene documentary script for Nepal tourism', icon: Compass }
];

export const AIWebsiteGuide: React.FC<AIWebsiteGuideProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<AIGuideChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [INITIAL_GREETING_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedMimeType, setAttachedMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on message change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist messages in local browser storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history to localStorage:', e);
    }
  }, [messages]);

  const handleClearChat = () => {
    if (messages.length > 1) {
      if (window.confirm('Clear conversation history in this browser?')) {
        const reset = [{ ...INITIAL_GREETING_MESSAGE, timestamp: new Date().toISOString() }];
        setMessages(reset);
        localStorage.removeItem(STORAGE_KEY);
        setError(null);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if ((!query && !attachedImageBase64) || isLoading) return;

    setError(null);
    const userMsg: AIGuideChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query || 'Please analyze this attached reference image and advise me.',
      imageUrl: attachedImageBase64 || undefined,
      timestamp: new Date().toISOString()
    };

    const currentAttachedBase64 = attachedImageBase64;
    const currentMimeType = attachedMimeType;

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setAttachedImageBase64(null);
    setIsLoading(true);

    try {
      // Build past history (excluding initial greeting to save tokens)
      const historyPayload = newMessages
        .filter(m => m.id !== 'welcome-msg')
        .slice(-6)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const res = await StudioApiService.askAIGuide({
        message: query || 'Please analyze this attached image and guide me on how our studio can help.',
        history: historyPayload,
        imageBase64: currentAttachedBase64 || undefined,
        mimeType: currentMimeType || undefined
      });

      // Filter and validate recommended tools against the live tools whitelist
      const validatedTools: RecommendedTool[] = (res.recommendedTools || []).filter(
        tool => tool && typeof tool.id === 'string' && VALID_TOOL_IDS.has(tool.id)
      );

      const assistantMsg: AIGuideChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: res.message,
        timestamp: new Date().toISOString(),
        userGoal: res.userGoal,
        detectedLanguage: res.detectedLanguage,
        recommendedTools: validatedTools
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Guide Error:', err);
      setError(err?.message || 'Unable to communicate with the guide service. Please try again.');
    } finally {
      setIsLoading(false);
      // Refocus textarea on desktop
      if (window.innerWidth > 768) {
        textareaRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'video-generator': return Video;
      case 'shorts-creator': return Film;
      case 'content-assistant': return Sparkles;
      case 'thumbnail-maker': return ImageIcon;
      case 'video-editor': return Scissors;
      case 'music-video': return Sparkles;
      case 'templates': return LayoutTemplate;
      case 'projects': return FolderGit2;
      case 'about-us': return Info;
      case 'contact-us': return Mail;
      default: return ArrowRight;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div 
        id="ai-guide-card"
        className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Standalone Creative Assistant</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Website Guide
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
              Tell us what you want to create. Our AI will understand your goal and guide you to the right tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <div className="px-3 py-1.5 rounded-xl bg-[#171c2b] border border-white/5 flex items-center gap-2 text-xs text-slate-300">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>All Languages Supported</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#171c2b] border border-white/5 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browser-Stored Only</span>
            </div>

            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                id="clear-guide-chat-button"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/15 text-slate-300 hover:text-red-300 border border-white/10 hover:border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Studio Active Features Strip */}
        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">AI Video Planner</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Shorts & Reels (9:16)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">YouTube SEO Pack</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Thumbnail Concepts</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">Quick Goal Prompts</span>
          <span>Click any prompt to ask</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => {
            const Icon = prompt.icon;
            return (
              <button
                key={idx}
                id={`guide-suggested-prompt-${idx}`}
                onClick={() => {
                  setInputMessage(prompt.label);
                  handleSendMessage(prompt.label);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#121622] hover:bg-[#1a2133] border border-white/10 hover:border-indigo-500/40 text-xs text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-left font-medium">{prompt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Window */}
      <div 
        id="ai-guide-chat-interface"
        className="rounded-3xl bg-[#121622] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Chat Messages Body */}
        <div className="p-4 sm:p-6 space-y-6 min-h-[380px] max-h-[600px] overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`space-y-3 max-w-[90%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Meta tags for assistant */}
                  {!isUser && (msg.detectedLanguage || msg.userGoal) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.detectedLanguage && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300">
                          Language: {msg.detectedLanguage}
                        </span>
                      )}
                      {msg.userGoal && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-semibold text-indigo-300">
                          Goal: {msg.userGoal}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Content Bubble */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-md font-medium'
                        : 'bg-[#171c2b] text-slate-200 rounded-bl-sm border border-white/5 space-y-3 shadow-inner'
                    }`}
                  >
                    {/* Render User Uploaded Reference Image if present */}
                    {msg.imageUrl && (
                      <div className="mb-2 max-w-xs rounded-xl overflow-hidden border border-white/20 shadow-md">
                        <img 
                          src={msg.imageUrl} 
                          alt="Uploaded reference" 
                          className="w-full max-h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Formatted body with paragraph breaks and markdown bolding */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.content.split('\n\n').map((paragraph, pIdx) => {
                        // Render bold text markdown
                        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={pIdx}>
                            {parts.map((part, partIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={partIdx} className="font-bold text-white">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>

                    {/* Copy button for assistant responses */}
                    {!isUser && msg.id !== 'welcome-msg' && (
                      <div className="flex justify-end pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                          title="Copy message text"
                        >
                          {copiedIndex === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy explanation</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recommended Real Tools Cards */}
                  {!isUser && msg.recommendedTools && msg.recommendedTools.length > 0 && (
                    <div className="space-y-2 pt-1 w-full">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recommended Real Tools in Studio</span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.recommendedTools.map((tool) => {
                          const toolDetails = getToolById(tool.id);
                          const ToolIcon = getToolIcon(tool.id);
                          const toolName = toolDetails?.name || tool.name;

                          return (
                            <div
                              key={tool.id}
                              className="p-3.5 rounded-2xl bg-[#141824] border border-white/10 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                                      <ToolIcon className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-white text-xs">
                                      {toolName}
                                    </span>
                                  </div>
                                  {toolDetails?.badge && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                                      {toolDetails.badge}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-300 leading-normal line-clamp-2">
                                  {tool.reason || toolDetails?.shortDescription}
                                </p>
                              </div>

                              <button
                                onClick={() => onNavigate(tool.id)}
                                id={`open-recommended-tool-${tool.id}`}
                                className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white border border-indigo-500/30 hover:border-indigo-500 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span>Open {toolName}</span>
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 text-slate-300 text-xs flex items-center gap-2.5 shadow-inner">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Understanding your goal and matching real studio features...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-200 font-bold ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0d1017] border-t border-white/10 space-y-2">
          {/* Attached image preview banner if active */}
          {attachedImageBase64 && (
            <div className="flex items-center gap-2 p-2 bg-[#171c2b] border border-white/10 rounded-xl max-w-sm">
              <img 
                src={attachedImageBase64} 
                alt="Selected reference" 
                className="w-10 h-10 object-cover rounded-lg border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-white font-bold block truncate">Attached Reference Image</span>
                <span className="text-[10px] text-slate-400 block">Will be analyzed with Gemini Vision</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImageBase64(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleImageSelect} 
              className="hidden" 
            />

            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                id="guide-chat-input"
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you trying to create or accomplish? (e.g. YouTube video about Nepal, song SEO, thumbnail idea...)"
                disabled={isLoading}
                className="w-full bg-[#141824] text-white text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-2xl border border-white/10 focus:border-indigo-500 focus:outline-none placeholder-slate-500 resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach reference image or thumbnail for AI Vision analysis"
                className="absolute right-3 top-3 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <button
                type="submit"
                id="guide-send-message-button"
                disabled={(!inputMessage.trim() && !attachedImageBase64) || isLoading}
                className={`px-5 py-2.5 sm:py-0 sm:h-full rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  (inputMessage.trim() || attachedImageBase64) && !isLoading
                    ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/25 active:scale-95'
                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Privacy Footnote */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy protected: Conversations are saved only in your local browser storage.</span>
            </span>
            <span className="text-slate-400 text-[10px] mt-1 sm:mt-0">
              Honest recommendations &bull; No false claims &bull; Real studio features only
            </span>
          </div>
        </div>
      </div>

      {/* Directory of Real Studio Tools for Reference */}
      <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Current Studio Tools Directory
              </h3>
              <p className="text-[11px] text-slate-400">
                The AI Guide only recommends from this verified, working tool set.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold text-[10px] border border-cyan-500/20">
            {CURRENT_STUDIO_TOOLS.length} Active Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CURRENT_STUDIO_TOOLS.map((tool) => {
            const ToolIcon = getToolIcon(tool.id);
            return (
              <div
                key={tool.id}
                className="p-3.5 rounded-2xl bg-[#171c2b] border border-white/5 flex flex-col justify-between space-y-2.5 hover:border-white/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ToolIcon className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-white text-xs">{tool.name}</span>
                    </div>
                    {tool.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-semibold">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate(tool.id)}
                  id={`directory-open-tool-${tool.id}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors w-fit pt-1"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
