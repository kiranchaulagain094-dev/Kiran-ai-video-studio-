import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'kiran_pwa_install_dismissed';
const INSTALLED_KEY = 'kiran_pwa_installed';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);

            // Listen for waiting updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New service worker version available.');
                    window.dispatchEvent(new CustomEvent('kiran:pwa-update-available'));
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration note:', err);
          });
      });
    }

    // 2. Check if running in standalone display mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleMobile);

    // 4. Check localStorage dismissal and installed state
    const alreadyDismissed = localStorage.getItem(DISMISS_KEY);
    const alreadyInstalled = localStorage.getItem(INSTALLED_KEY);

    if (checkStandalone || alreadyInstalled) {
      setIsDismissed(true);
      return;
    }

    if (alreadyDismissed) {
      // If dismissed more than 14 days ago, can reconsider, otherwise stay dismissed
      const dismissedTime = parseInt(alreadyDismissed, 10);
      if (!isNaN(dismissedTime) && Date.now() - dismissedTime < 14 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    // Delay showing the banner slightly for non-intrusive arrival
    const timer = setTimeout(() => {
      setIsDismissed(false);
    }, 2500);

    // 5. Native beforeinstallprompt capture
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setIsDismissed(true);
      setDeferredPrompt(null);
      setShowInstructions(false);
      console.log('[PWA] App successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem(INSTALLED_KEY, 'true');
          setIsDismissed(true);
        } else {
          // User declined native prompt; respect choice and dismiss banner
          handleDismiss();
        }
      } catch (err) {
        console.warn('[PWA] Native install prompt error:', err);
        setShowInstructions(true);
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback instruction for browsers where deferredPrompt is not exposed (iOS Safari, Edge, or Firefox)
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom / Banner Prompt */}
      <aside 
        aria-label="Install Kiran AI Video Studio"
        className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-md bg-[#0f1422]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-4 shadow-2xl shadow-cyan-950/40 animate-slideUp text-left"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-600/25 p-2">
            <Smartphone className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Web App
              </span>
              <span className="text-[10px] text-slate-400">• Offline Ready</span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">
              📱 Install Kiran AI Video Studio
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">
              Install the app for faster access.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                id="kiran-pwa-install-btn"
                onClick={handleInstallClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Not Now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Clear Fallback Installation Instructions Modal */}
      {showInstructions && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#121622] border border-cyan-500/30 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add to Home Screen</h3>
                <p className="text-xs text-slate-400">Install Kiran AI Video Studio</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="leading-relaxed">To install on iOS Safari:</p>
                <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> at bottom of Safari</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Tap <strong>Add</strong> in top-right corner</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="leading-relaxed">
                  Open your browser menu and choose <strong>Add to Home Screen</strong>.
                </p>
                <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Tap the <strong>three dots (⋮)</strong> browser menu</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Choose <strong>Add to Home Screen</strong> or <strong>Install App</strong></span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowInstructions(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs shadow cursor-pointer text-center"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
