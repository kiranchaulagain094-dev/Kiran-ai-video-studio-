import React, { useState } from 'react';
import { 
  Rocket, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Info,
  X
} from 'lucide-react';
import { 
  CURRENT_APP_VERSION, 
  APP_VERSION_STORAGE_KEY, 
  getVersionChangelog, 
  VersionChangelog 
} from '../../config/version';

interface UpdateNotificationModalProps {
  detectedVersion?: string;
  minimumSupportedVersion?: string;
  isRequired?: boolean;
  updateTitle?: string;
  updateDescription?: string;
  releaseNotes?: string;
  requiresSignIn?: boolean;
  onUpdateAcknowledged?: (version: string) => void;
  onLater?: () => void;
  onClose?: () => void;
  isPreviewMode?: boolean;
  isCompactPatch?: boolean;
}

export const UpdateNotificationModal: React.FC<UpdateNotificationModalProps> = ({
  detectedVersion = CURRENT_APP_VERSION,
  minimumSupportedVersion = '1.0.0',
  isRequired = false,
  updateTitle,
  updateDescription,
  releaseNotes,
  requiresSignIn = false,
  onUpdateAcknowledged,
  onLater,
  onClose,
  isPreviewMode = false,
  isCompactPatch = false
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetailedNotes, setShowDetailedNotes] = useState(false);
  const changelog: VersionChangelog = getVersionChangelog(detectedVersion);

  const displayTitle = updateTitle || changelog.title;
  const displayDescription = updateDescription || changelog.description;

  const handleUpdateNow = async () => {
    setIsUpdating(true);

    try {
      // 1. Mark version as acknowledged in localStorage
      localStorage.setItem(APP_VERSION_STORAGE_KEY, detectedVersion);

      // 2. Clear stale browser asset caches if Cache API is supported (Vercel deployment cache-busting)
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys
              .filter(key => key.includes('kiran') || key.includes('vite') || key.includes('workbox') || key.includes('assets') || key.includes('app'))
              .map(key => caches.delete(key))
          );
        } catch (cacheErr) {
          console.warn('Cache clearing notice:', cacheErr);
        }
      }

      // 3. Update service worker and skip waiting
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.update();
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        } catch (swErr) {
          console.warn('Service worker check notice:', swErr);
        }
      }

      // Smooth visual feedback
      await new Promise(r => setTimeout(r, 600));

      if (onUpdateAcknowledged) {
        onUpdateAcknowledged(detectedVersion);
      }

      // 4. Request fresh application assets via cache-busted URL
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_v', detectedVersion);
      currentUrl.searchParams.set('_ts', Date.now().toString());

      // Use window.location.replace to prevent back-button navigation loops
      window.location.replace(currentUrl.toString());
    } catch (err) {
      console.error('Update reload error:', err);
      window.location.reload();
    }
  };

  const handleLater = () => {
    if (isRequired) return; // Non-dismissible
    if (onLater) onLater();
    else if (onClose) onClose();
  };

  // Compact patch banner option if requested for patch releases (only when not required)
  if (!isRequired && isCompactPatch && changelog.type === 'patch') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl bg-[#111522] border border-cyan-500/30 p-4 shadow-2xl animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">🚀 Update Available</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">v{detectedVersion}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">A new version of Kiran AI Video Studio is available.</p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleLater}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleUpdateNow}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs shadow hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />}
                <span>Update Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-Screen Update Modal
  return (
    <div 
      id="kiran-studio-update-modal"
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6 md:p-8 flex items-center justify-center animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className={`relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#131726] via-[#0f1320] to-[#0a0c13] border p-6 sm:p-8 shadow-2xl space-y-6 my-auto text-left ${
        isRequired ? 'border-amber-500/40 shadow-amber-950/50' : 'border-cyan-500/30 shadow-cyan-950/50'
      }`}>
        {/* Close button ONLY if NOT required */}
        {!isRequired && (isPreviewMode || onClose) && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Glow ambient background element */}
        <div className={`absolute top-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isRequired ? 'bg-gradient-to-br from-amber-500/15 to-rose-600/15' : 'bg-gradient-to-br from-cyan-500/15 to-indigo-600/15'
        }`} />

        {/* Header Section */}
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {isRequired ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <span>⚠️ UPDATE REQUIRED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Rocket className="w-3.5 h-3.5" />
                <span>🚀 UPDATE AVAILABLE</span>
              </div>
            )}

            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-xs font-semibold">
              v{detectedVersion}
            </span>
            {requiresSignIn && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                Requires Sign-in
              </span>
            )}
            <span className="text-slate-400 text-xs">• {changelog.releaseDate}</span>
          </div>

          <div>
            <h2 id="update-modal-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isRequired 
                ? "Please update Kiran AI Video Studio to continue."
                : "A new version of Kiran AI Video Studio is available."}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              {displayDescription}
            </p>
          </div>
        </div>

        {/* Release Notes or Highlights */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>What's New in v{detectedVersion}</span>
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {displayTitle}
            </span>
          </div>

          {releaseNotes ? (
            <div className="p-4 rounded-2xl bg-[#161b2a] border border-white/5 text-xs text-slate-300 space-y-1.5 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto">
              {releaseNotes}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
              {changelog.highlights.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-2xl bg-[#161b2a] border border-white/5 hover:border-white/10 transition-colors flex items-start gap-2.5"
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-white truncate">{item.text}</p>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expandable Detailed Notes */}
          {!releaseNotes && changelog.details && changelog.details.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowDetailedNotes(!showDetailedNotes)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{showDetailedNotes ? 'Hide Release Details' : 'View Full Release Details'}</span>
                {showDetailedNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showDetailedNotes && (
                <ul className="mt-2 p-3.5 rounded-2xl bg-[#0c0f16] border border-white/5 space-y-1.5 text-xs text-slate-300">
                  {changelog.details.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1 text-[10px]">•</span>
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Data Safety Assurance */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Your data is safe:</strong> Updating refreshes your studio with the latest features without deleting your saved projects, custom prompts, or studio preferences.
          </span>
        </div>

        {/* Action Buttons: [ Update Now ] and [ Later ] */}
        <div className="relative z-10 pt-2 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              id="kiran-update-now-btn"
              onClick={handleUpdateNow}
              disabled={isUpdating}
              className="w-full flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Update Now</span>
                </>
              )}
            </button>

            {!isRequired && (
              <button
                type="button"
                id="kiran-update-later-btn"
                onClick={handleLater}
                disabled={isUpdating}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center cursor-pointer border border-white/10"
              >
                Later
              </button>
            )}
          </div>

          {isRequired && (
            <p className="text-[11px] text-center text-amber-400/90 font-medium">
              ⚠️ This update contains critical enhancements. Please update now to continue using the studio.
            </p>
          )}

          {!isRequired && (
            <p className="text-[11px] text-center text-slate-500">
              Clicking Update Now loads the newest application assets.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
