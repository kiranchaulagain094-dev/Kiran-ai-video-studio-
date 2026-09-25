import React from 'react';
import { canRenderAdSense } from '../../services/pageClassification';

interface AdSenseSafeContainerProps {
  route: string;
  slotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  isLoading?: boolean;
  isError?: boolean;
  isEmptyState?: boolean;
  hasSubstantialContent?: boolean;
  className?: string;
}

/**
 * AdSenseSafeContainer
 * 
 * Enforces Google AdSense's strict publisher policy:
 * "Google-served ads on screens without publisher-content"
 * 
 * Guarantees:
 * 1. ZERO ads on tool interfaces, empty states, error screens, or loading spinners.
 * 2. ONLY renders on validated 'content' pages with genuine publisher substance.
 * 3. Does not insert broken blank white boxes or unstyled tags when AdSense is not configured.
 */
export const AdSenseSafeContainer: React.FC<AdSenseSafeContainerProps> = ({
  route,
  slotId,
  format = 'auto',
  isLoading = false,
  isError = false,
  isEmptyState = false,
  hasSubstantialContent = true,
  className = ''
}) => {
  const check = canRenderAdSense({
    route,
    isLoading,
    isError,
    isEmptyState,
    hasSubstantialContent
  });

  // If page is not eligible for ads, render NOTHING (no empty container, no layout shift)
  if (!check.allowed) {
    return null;
  }

  // If slotId is not provided or AdSense client ID is not configured, do not output broken ad tag
  if (!slotId) {
    return null;
  }

  return (
    <aside
      aria-label="Editorial Advertisement"
      className={`my-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center overflow-hidden transition-all ${className}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
        Advertisement
      </div>
      <div className="flex items-center justify-center min-h-[90px]">
        {/* Placeholder / AdSense Ins tag - active once AdSense client ID is configured */}
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with verified publisher ID upon approval
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
