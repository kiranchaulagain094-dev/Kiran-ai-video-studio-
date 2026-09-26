/**
 * Kiran AI Video Studio - Centralized Application Version & Changelog
 * 
 * TO RELEASE A NEW UPDATE:
 * 1. Change CURRENT_APP_VERSION (e.g. "1.2.0")
 * 2. Add the corresponding entry to APP_CHANGELOGS below
 * 3. Commit and push to Vercel/GitHub
 */

export const CURRENT_APP_VERSION = "1.1.0";
export const APP_VERSION_STORAGE_KEY = "kiran_ai_video_last_acknowledged_version";

export interface VersionHighlight {
  icon: string;
  text: string;
  badge?: string;
}

export interface VersionChangelog {
  version: string;
  releaseDate: string;
  title: string;
  type: 'major' | 'minor' | 'patch';
  description: string;
  highlights: VersionHighlight[];
  details?: string[];
}

export const APP_CHANGELOGS: Record<string, VersionChangelog> = {
  "1.1.0": {
    version: "1.1.0",
    releaseDate: "September 2026",
    title: "AI Video Timeline Planner & Google Flow Workflow",
    type: "minor",
    description: "We've added new features and improvements to make your creator workflow better.",
    highlights: [
      { icon: "✨", text: "New AI Video Timeline Planner", badge: "New Tool" },
      { icon: "🎬", text: "15 SEC – 5 MIN video timelines", badge: "Exact Math" },
      { icon: "📸", text: "Screenshot Mode for phone reference capture", badge: "Workflow" },
      { icon: "🤖", text: "Google Flow prompt generator & upload guides", badge: "Flow Ready" },
      { icon: "🖼️", text: "Improved visual descriptions & subject continuity", badge: "Directing" },
      { icon: "⚡", text: "Performance improvements & live update system", badge: "Core" }
    ],
    details: [
      "Scene-by-scene video timeline planner supporting 15s, 30s, 1m, 2m, 3m, 4m, and 5m durations with exact math guarantee.",
      "Dedicated Google Flow prompts generated with camera movements, angles, lighting, aspect ratios, and continuity cues.",
      "Reference / Screenshot guides on every scene card explaining what visual reference to upload into Google Flow.",
      "Focused 📸 SCREENSHOT MODE with clean centered layout for hassle-free mobile screenshotting.",
      "Real one-click clipboard copying for Flow prompts, spoken voiceover scripts, and visual directions.",
      "Full multilingual support for English, Nepali, Romanized Nepali, Hindi, and mixed-language inputs."
    ]
  },
  "1.0.0": {
    version: "1.0.0",
    releaseDate: "September 2026",
    title: "Kiran AI Video Studio Initial Release",
    type: "major",
    description: "Initial production release of the creative video studio for creators.",
    highlights: [
      { icon: "🎥", text: "AI Video Planner with Screenplay Breakdown" },
      { icon: "📱", text: "9:16 Shorts & Reels Creator" },
      { icon: "✂️", text: "In-Browser Multi-Track Timeline Video Editor" },
      { icon: "🚀", text: "YouTube Content & SEO Assistant" },
      { icon: "🖼️", text: "Thumbnail Concept Designer & Vision Analysis" },
      { icon: "🎵", text: "Music Video Storyboarder" }
    ],
    details: [
      "Complete browser workspace created and maintained by Kiran Chaulagain.",
      "Full educational Creator Guides section covering YouTube SEO, scriptwriting, and production best practices."
    ]
  }
};

/**
 * Compare two semver strings (e.g., "1.1.0" vs "1.0.0").
 * Returns:
 *   1 if v1 > v2 (v1 is newer)
 *   0 if v1 === v2
 *  -1 if v1 < v2 (v1 is older)
 */
export function compareSemVer(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/i, '').split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = v2.replace(/^v/i, '').split('.').map(p => parseInt(p, 10) || 0);

  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Check if the loaded or target version is strictly newer than the user's acknowledged version.
 */
export function isUpdateAvailable(currentVersion: string, acknowledgedVersion: string | null): boolean {
  if (!acknowledgedVersion) return false;
  return compareSemVer(currentVersion, acknowledgedVersion) > 0;
}

/**
 * Get changelog info for a given version, falling back to CURRENT_APP_VERSION if not found.
 */
export function getVersionChangelog(version: string = CURRENT_APP_VERSION): VersionChangelog {
  return APP_CHANGELOGS[version] || {
    version,
    releaseDate: "Recent",
    title: `Kiran AI Video Studio Update v${version}`,
    type: "minor",
    description: "We've added new features and performance improvements to make your creator workflow better.",
    highlights: [
      { icon: "✨", text: "New creative features & tools" },
      { icon: "⚡", text: "Performance and reliability improvements" },
      { icon: "🛡️", text: "Bug fixes and interface enhancements" }
    ],
    details: [
      "Latest improvements for faster video planning and workflow optimization."
    ]
  };
}
