import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Bell, Rocket, Tag } from 'lucide-react';
import { StudioUpdate } from '../../types';
import { UpdateService } from '../../services/updateService';
import { useAuth } from '../../context/AuthContext';

interface WhatsNewBannerProps {
  onNavigateTo: (route: string) => void;
}

export const WhatsNewBanner: React.FC<WhatsNewBannerProps> = ({ onNavigateTo }) => {
  const { isAuthenticated } = useAuth();
  const [update, setUpdate] = useState<StudioUpdate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only show after user logs in per user requirement 5
    if (!isAuthenticated) {
      setUpdate(null);
      setIsLoading(false);
      return;
    }

    const fetchLatestUpdate = async () => {
      setIsLoading(true);
      try {
        const latest = await UpdateService.getLatestUpdate();
        setUpdate(latest);
      } catch (err) {
        console.warn('Failed to load home updates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestUpdate();
  }, [isAuthenticated]);

  if (!isAuthenticated || isLoading || !update) {
    return null;
  }

  const handleActionClick = () => {
    const link = update.button_link || '/templates';
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.location.href = link;
    } else {
      const cleanRoute = link.replace(/^\/+/, '');
      onNavigateTo(cleanRoute || 'templates');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 px-4 sm:px-6 animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/60 via-[#141828] to-indigo-950/50 border border-violet-500/30 p-5 sm:p-6 shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            {update.image_url ? (
              <img
                src={update.image_url}
                alt=""
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-white/10 shadow-lg hidden sm:block"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/20">
                <Rocket className="w-6 h-6" />
              </div>
            )}

            <div className="space-y-1.5">
              {/* Clean unboxed metadata per design constitution */}
              <div className="flex items-center gap-2 text-xs text-violet-300 font-semibold">
                <span className="flex items-center gap-1">
                  <span>🆕</span>
                  <span>{update.tag || 'New Update'}</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400 font-normal">
                  {update.published_at ? new Date(update.published_at).toLocaleDateString() : 'Latest Announcement'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {update.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {update.description}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 self-start md:self-center">
            <button
              onClick={handleActionClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{update.button_text || 'Try Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
