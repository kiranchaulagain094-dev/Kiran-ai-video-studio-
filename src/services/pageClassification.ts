/**
 * AdSense-Safe Page Classification System
 * 
 * Enforces Google AdSense Publisher Policies:
 * - Content Pages: Eligible for clean, non-intrusive editorial ad placement only after AdSense approval.
 * - Tool Pages: Application/utility interfaces. NO ads in empty/loading/error states; do not interrupt primary creator workflow.
 * - Error Pages: Strictly NO ads.
 * - Loading Pages: Strictly NO ads.
 * - Navigation / Menu Screens: Strictly NO ads.
 * - Empty States: Strictly NO ads.
 * - Under-Construction Screens: Strictly NO ads.
 */

export type PageCategory = 
  | 'content'
  | 'tool'
  | 'error'
  | 'loading'
  | 'navigation'
  | 'empty'
  | 'under-construction';

export interface PagePolicy {
  category: PageCategory;
  isAdSenseAllowed: boolean;
  minWordCount: number;
  reason: string;
}

export const ROUTE_POLICIES: Record<string, PagePolicy> = {
  // Editorial Content Pages (Publisher Content)
  'articles': {
    category: 'content',
    isAdSenseAllowed: true,
    minWordCount: 300,
    reason: 'Educational knowledge hub containing publisher guides and editorial directory.'
  },
  'article-detail': {
    category: 'content',
    isAdSenseAllowed: true,
    minWordCount: 500,
    reason: 'In-depth original educational guide with step-by-step instructions, examples, and analysis.'
  },
  'about-us': {
    category: 'content',
    isAdSenseAllowed: true,
    minWordCount: 400,
    reason: 'Substantial publisher about page detailing the website purpose, creator, and technology.'
  },
  'how-to-use': {
    category: 'content',
    isAdSenseAllowed: true,
    minWordCount: 500,
    reason: 'Comprehensive walkthrough documentation for creative workflows.'
  },
  'faq': {
    category: 'content',
    isAdSenseAllowed: true,
    minWordCount: 400,
    reason: 'In-depth factual questions and answers regarding YouTube creation and AI tools.'
  },
  'privacy-policy': {
    category: 'content',
    isAdSenseAllowed: false, // Standard practice: Keep legal compliance pages clean of ads
    minWordCount: 500,
    reason: 'Legal compliance policy.'
  },
  'terms-of-service': {
    category: 'content',
    isAdSenseAllowed: false,
    minWordCount: 500,
    reason: 'Legal compliance terms.'
  },
  'cookie-policy': {
    category: 'content',
    isAdSenseAllowed: false,
    minWordCount: 400,
    reason: 'Legal cookie disclosure.'
  },
  'disclaimer': {
    category: 'content',
    isAdSenseAllowed: false,
    minWordCount: 300,
    reason: 'Legal disclaimer.'
  },
  'contact-us': {
    category: 'content',
    isAdSenseAllowed: false,
    minWordCount: 200,
    reason: 'Direct contact interface.'
  },
  'landing': {
    category: 'content',
    isAdSenseAllowed: true,
    minWordCount: 600,
    reason: 'Homepage with rich creator guides directory, platform overview, and educational sections.'
  },

  // Interactive Tool Interfaces (Tool Pages - Ads prohibited from interrupting utility)
  'video-generator': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Interactive screenplay planning application. Ads must not interrupt creative input.'
  },
  'shorts-creator': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Interactive vertical video pacing and hook writing tool.'
  },
  'video-editor': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'In-browser timeline video editor workspace.'
  },
  'content-assistant': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Interactive metadata and SEO analysis utility.'
  },
  'thumbnail-maker': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Canvas thumbnail composer and AI Vision analyzer.'
  },
  'music-video': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Song concept and storyboard planner tool.'
  },
  'projects': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'User project management dashboard.'
  },
  'templates': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Interactive project template selector.'
  },
  'ai-guide': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Interactive conversational website navigator.'
  },
  'settings': {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Local browser settings and storage management.'
  }
};

/**
 * Returns whether a specific screen or route is AdSense policy compliant.
 */
export function getPagePolicy(route: string): PagePolicy {
  return ROUTE_POLICIES[route] || {
    category: 'tool',
    isAdSenseAllowed: false,
    minWordCount: 0,
    reason: 'Default safe policy: Ads disabled on unclassified routes.'
  };
}

/**
 * Determines if an ad slot can be safely rendered on the current screen.
 */
export function canRenderAdSense(params: {
  route: string;
  isLoading?: boolean;
  isError?: boolean;
  isEmptyState?: boolean;
  hasSubstantialContent?: boolean;
}): { allowed: boolean; reason: string } {
  if (params.isError) {
    return { allowed: false, reason: 'Google AdSense policy: No ads on error screens.' };
  }
  if (params.isLoading) {
    return { allowed: false, reason: 'Google AdSense policy: No ads on loading screens.' };
  }
  if (params.isEmptyState) {
    return { allowed: false, reason: 'Google AdSense policy: No ads on screens without publisher content or empty states.' };
  }

  const policy = getPagePolicy(params.route);
  if (!policy.isAdSenseAllowed) {
    return { allowed: false, reason: policy.reason };
  }

  if (params.hasSubstantialContent === false) {
    return { allowed: false, reason: 'Content page does not meet minimum word count/substance threshold.' };
  }

  return { allowed: true, reason: 'Compliant content screen with meaningful publisher content.' };
}
