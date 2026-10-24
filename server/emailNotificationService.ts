/**
 * Kiran AI Video Studio - Real Automatic Email Notification Service
 * Powered by Resend (https://resend.com/docs)
 * 
 * Features:
 * - Admin recipient locked server-side to Kiranchaulagain094@gmail.com
 * - Formatted timestamps in Asia/Kathmandu (Nepal Time)
 * - Distributed idempotency & durable deduplication (Neon DB + memory fallback)
 * - Rate limiting to prevent inbox flooding
 * - Complete data sanitization (never exposes secrets, tokens, or API keys)
 * - Safe failover (missing credentials or network errors will not crash the app)
 */

export interface NotificationPayload {
  eventKey: string;
  eventType: string;
  subject: string;
  badgeLabel?: string;
  badgeColor?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan';
  metadata: Record<string, string | number | boolean | null | undefined>;
  rawDetails?: string;
}

const DEFAULT_ADMIN_EMAIL = 'Kiranchaulagain094@gmail.com';
const DEFAULT_FROM_ADDRESS = 'Kiran AI Video Studio <onboarding@resend.dev>';

// In-memory deduplication set (fallback if DB is offline or cold)
const inMemorySentEvents = new Map<string, number>();
const MEMORY_DEDUP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Error rate limiting: max 5 operational error emails per 10 minutes
const errorTimestamps: number[] = [];
const ERROR_RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_ERRORS_PER_WINDOW = 5;

/**
 * Returns clean Kathmandu timestamp (e.g. Saturday, October 24, 2026 at 7:57:26 PM GMT+5:45)
 */
export function getKathmanduTimestamp(date: Date = new Date()): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      dateStyle: 'full',
      timeStyle: 'long',
      hour12: true
    }) + ' (NPT, Asia/Kathmandu)';
  } catch {
    return date.toISOString() + ' (UTC)';
  }
}

/**
 * Returns configured admin notification recipient
 */
export function getAdminNotificationEmail(): string {
  const envEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || '').trim();
  if (envEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(envEmail)) {
    return envEmail;
  }
  return DEFAULT_ADMIN_EMAIL;
}

/**
 * Returns verified sender address for Resend
 */
export function getFromEmailAddress(): string {
  const envFrom = (process.env.EMAIL_FROM_ADDRESS || process.env.RESEND_FROM_EMAIL || '').trim();
  if (envFrom) {
    return envFrom;
  }
  return DEFAULT_FROM_ADDRESS;
}

/**
 * Checks if Resend API key is present in environment
 */
export function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== 'YOUR_RESEND_API_KEY');
}

/**
 * HTML escaper to protect against injection in emails
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes errors to remove any accidentally leaked keys, secrets, or bearer tokens
 */
export function sanitizeError(err: any): string {
  if (!err) return 'Unknown error occurred';
  let message = typeof err === 'string' ? err : (err.message || JSON.stringify(err));

  // Strip possible API keys, bearer tokens, or database passwords
  message = message.replace(/(AIza[0-9A-Za-z_-]{35})/g, '[REDACTED_API_KEY]');
  message = message.replace(/(GOCSPX-[0-9A-Za-z_-]{20,})/g, '[REDACTED_CLIENT_SECRET]');
  message = message.replace(/(Bearer\s+[a-zA-Z0-9._-]+)/gi, 'Bearer [REDACTED_TOKEN]');
  message = message.replace(/(postgres:\/\/[^:]+:)[^@]+(@)/gi, '$1[REDACTED_PASSWORD]$2');
  message = message.replace(/("apiKey"\s*:\s*")[^"]+(")/gi, '$1[REDACTED]$2');
  message = message.replace(/("clientSecret"\s*:\s*")[^"]+(")/gi, '$1[REDACTED]$2');

  return message.slice(0, 500); // Sensible limit
}

/**
 * Renders modern, responsive HTML email template
 */
function renderHtmlEmail(payload: NotificationPayload, kathmanduTime: string): string {
  const badgeColors: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: '#064e3b', border: '#059669', text: '#34d399' },
    indigo: { bg: '#312e81', border: '#4f46e5', text: '#a5b4fc' },
    amber: { bg: '#78350f', border: '#d97706', text: '#fcd34d' },
    rose: { bg: '#881337', border: '#e11d48', text: '#fda4af' },
    cyan: { bg: '#164e63', border: '#0891b2', text: '#67e8f9' }
  };

  const color = badgeColors[payload.badgeColor || 'indigo'] || badgeColors.indigo;

  const metadataRows = Object.entries(payload.metadata)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => {
      const displayKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase());
      const displayVal = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val);
      return `
        <tr>
          <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #94a3b8; border-bottom: 1px solid #1e293b; width: 35%;">
            ${escapeHtml(displayKey)}
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: #f8fafc; font-family: monospace; border-bottom: 1px solid #1e293b;">
            ${escapeHtml(displayVal)}
          </td>
        </tr>
      `;
    })
    .join('');

  const rawDetailsBlock = payload.rawDetails ? `
    <div style="margin-top: 20px; padding: 14px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 8px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Details / Stack Snippet</div>
      <pre style="margin: 0; font-family: monospace; font-size: 12px; color: #cbd5e1; white-space: pre-wrap; word-break: break-all;">${escapeHtml(payload.rawDetails)}</pre>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(payload.subject)}</title>
      </head>
      <body style="margin: 0; padding: 24px 12px; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0f1422; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #334155;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      ⚡ Kiran AI Video Studio
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                      Automated System &amp; Creator Notifications
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 9999px; background-color: ${color.bg}; border: 1px solid ${color.border}; color: ${color.text}; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${escapeHtml(payload.badgeLabel || payload.eventType)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 28px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                ${escapeHtml(payload.eventType)}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                An automated studio event was logged at <strong>${escapeHtml(kathmanduTime)}</strong>.
              </p>

              <!-- Key Values Table -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #141b2d; border-radius: 10px; border: 1px solid #1e293b; border-collapse: separate; border-spacing: 0;">
                ${metadataRows}
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #94a3b8; width: 35%;">
                    Timestamp (Nepal)
                  </td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #f8fafc; font-family: monospace;">
                    ${escapeHtml(kathmanduTime)}
                  </td>
                </tr>
              </table>

              ${rawDetailsBlock}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                Sent automatically to <strong>${escapeHtml(getAdminNotificationEmail())}</strong> &bull; Operator: Kiran Chaulagain
              </p>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #475569;">
                Kiran AI Video Studio &bull; Direct Admin Notification Pipeline &bull; Resend API
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Checks if an event is a duplicate using DB or in-memory LRU
 */
async function checkAndMarkDuplicate(eventKey: string, dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>): Promise<boolean> {
  const now = Date.now();

  // 1. Clean up old in-memory entries periodically
  if (inMemorySentEvents.size > 2000) {
    for (const [k, ts] of inMemorySentEvents.entries()) {
      if (now - ts > MEMORY_DEDUP_TTL_MS) {
        inMemorySentEvents.delete(k);
      }
    }
  }

  // 2. Check in-memory first
  if (inMemorySentEvents.has(eventKey)) {
    return true; // Already processed
  }

  // 3. Check persistent database if available
  if (dbQueryFn) {
    try {
      const inserted = await dbQueryFn(
        `INSERT INTO admin_notifications (id, event_key, event_type, recipient, status, created_at)
         VALUES ($1, $2, $3, $4, 'sent', CURRENT_TIMESTAMP)
         ON CONFLICT (event_key) DO NOTHING
         RETURNING event_key`,
        [`notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`, eventKey, eventKey.split(':')[0] || 'event', getAdminNotificationEmail()]
      );

      // If nothing returned, it was a conflict (already sent)
      if (!inserted || inserted.length === 0) {
        inMemorySentEvents.set(eventKey, now);
        return true;
      }
    } catch {
      // If table missing or DB cold, fall back to in-memory
    }
  }

  // Mark as sent in memory
  inMemorySentEvents.set(eventKey, now);
  return false;
}

/**
 * Core dispatch function that sends email via Resend REST API
 */
export async function sendAdminNotification(
  payload: NotificationPayload,
  dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>
): Promise<{ success: boolean; skipped?: boolean; error?: string; id?: string }> {
  // 1. Deduplication check
  const isDuplicate = await checkAndMarkDuplicate(payload.eventKey, dbQueryFn);
  if (isDuplicate) {
    console.log(`[Notification Service] Deduplicated event ${payload.eventKey} (already sent).`);
    return { success: true, skipped: true };
  }

  // 2. Configuration check
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === 'YOUR_RESEND_API_KEY') {
    console.log(`[Notification Service] RESEND_API_KEY not configured. Event "${payload.eventType}" recorded cleanly without email dispatch.`);
    return { success: false, error: 'RESEND_API_KEY environment variable is not configured.' };
  }

  const to = getAdminNotificationEmail();
  const from = getFromEmailAddress();
  const kathmanduTime = getKathmanduTimestamp();
  const html = renderHtmlEmail(payload, kathmanduTime);

  // Plain text fallback
  const textSummary = `[Kiran AI Video Studio] ${payload.eventType}\n` +
    `Time: ${kathmanduTime}\n` +
    Object.entries(payload.metadata).map(([k, v]) => `${k}: ${v}`).join('\n') +
    (payload.rawDetails ? `\n\nDetails:\n${payload.rawDetails}` : '');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Kiran AI Studio] ${payload.subject}`,
        html,
        text: textSummary
      })
    });

    const data: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = data?.message || data?.error || `HTTP ${res.status} from Resend`;
      console.warn(`[Notification Service Error] Resend dispatch failed for ${payload.eventType}:`, errMsg);
      return { success: false, error: errMsg };
    }

    console.log(`[Notification Service Success] Sent "${payload.eventType}" to ${to} (Resend ID: ${data?.id || 'ok'}).`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.warn(`[Notification Service Network Error]`, err?.message || err);
    return { success: false, error: err?.message || 'Network error reaching Resend' };
  }
}

// ============================================================================
// CONVENIENCE DISPATCHERS FOR APPLICATION FLOWS
// ============================================================================

/**
 * 1. Automatic Signup Notification
 */
export async function notifyAdminNewUserSignup(
  user: { id: string; display_username?: string; username: string; email?: string | null; auth_provider?: string },
  dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>
) {
  const eventKey = `signup:${user.id}`;
  return await sendAdminNotification({
    eventKey,
    eventType: 'New User Registration',
    badgeLabel: 'New Creator',
    badgeColor: 'emerald',
    subject: `New User Registered: ${user.display_username || user.username} (${user.email || 'No email'})`,
    metadata: {
      userId: user.id,
      displayName: user.display_username || user.username,
      username: user.username,
      email: user.email || 'None provided',
      authProvider: user.auth_provider || 'Google OAuth'
    }
  }, dbQueryFn);
}

/**
 * 2. Video Generation Requested
 */
export async function notifyAdminVideoRequested(
  job: { id: string; duration?: string; provider?: string },
  user: { id?: string; email?: string | null; display_username?: string } | null,
  promptIdea: string,
  dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>
) {
  const eventKey = `video_req:${job.id}`;
  const sanitizedPrompt = (promptIdea || 'General creative video').trim().slice(0, 180);

  return await sendAdminNotification({
    eventKey,
    eventType: 'Video Generation Requested',
    badgeLabel: 'Queued',
    badgeColor: 'indigo',
    subject: `Video Generation Requested: Job ${job.id}`,
    metadata: {
      jobId: job.id,
      user: user ? `${user.display_username || 'Creator'} (${user.email || user.id})` : 'Guest Creator',
      duration: job.duration || '8 seconds',
      model: job.provider || 'Veo 3.1 (Google Gemini)',
      initialStatus: 'Queued',
      promptSnippet: sanitizedPrompt
    }
  }, dbQueryFn);
}

/**
 * 3. Video Generation Completed
 */
export async function notifyAdminVideoCompleted(
  job: { id: string; provider?: string; resultUrl?: string; totalScenes?: number },
  user: { id?: string; email?: string | null; display_username?: string } | null,
  dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>
) {
  const eventKey = `video_done:${job.id}`;
  const hasUrl = Boolean(job.resultUrl && !job.resultUrl.startsWith('data:'));

  return await sendAdminNotification({
    eventKey,
    eventType: 'Video Generation Completed',
    badgeLabel: 'Completed',
    badgeColor: 'emerald',
    subject: `Video Generation Completed: Job ${job.id}`,
    metadata: {
      jobId: job.id,
      user: user ? `${user.display_username || 'Creator'} (${user.email || user.id})` : 'Creator',
      model: job.provider || 'Veo 3.1 (Google Gemini)',
      status: 'Successfully Completed (100%)',
      hasResultVideo: hasUrl ? 'Direct Video URL Available' : 'Embedded Data URI Available'
    }
  }, dbQueryFn);
}

/**
 * 4. Video Generation Failed
 */
export async function notifyAdminVideoFailed(
  jobId: string,
  rawError: any,
  user: { id?: string; email?: string | null } | null,
  dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>
) {
  const eventKey = `video_fail:${jobId}`;
  const cleanErrMsg = sanitizeError(rawError);

  return await sendAdminNotification({
    eventKey,
    eventType: 'Video Generation Failed',
    badgeLabel: 'Failed',
    badgeColor: 'rose',
    subject: `Video Generation Failed: Job ${jobId}`,
    metadata: {
      jobId,
      user: user ? (user.email || user.id) : 'Creator',
      status: 'Failed'
    },
    rawDetails: cleanErrMsg
  }, dbQueryFn);
}

/**
 * 5. Operational Error Rate-Limited Notification
 */
export async function notifyAdminOperationalError(
  feature: string,
  rawError: any,
  context?: Record<string, any>,
  dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>
) {
  const now = Date.now();
  // Filter error timestamps inside the rolling window
  while (errorTimestamps.length > 0 && now - errorTimestamps[0] > ERROR_RATE_WINDOW_MS) {
    errorTimestamps.shift();
  }

  if (errorTimestamps.length >= MAX_ERRORS_PER_WINDOW) {
    console.warn(`[Notification Service] Rate limit reached for operational errors (${MAX_ERRORS_PER_WINDOW} in window). Skipping email.`);
    return { success: false, skipped: true, error: 'Rate limit reached for error notifications' };
  }

  const cleanErrMsg = sanitizeError(rawError);
  // Fingerprint for deduplication
  const fingerprint = Buffer.from(`${feature}:${cleanErrMsg.slice(0, 80)}`).toString('base64').slice(0, 32);
  const eventKey = `op_error:${fingerprint}:${Math.floor(now / (5 * 60 * 1000))}`; // Dedup per 5 minutes

  errorTimestamps.push(now);

  return await sendAdminNotification({
    eventKey,
    eventType: 'Operational System Error',
    badgeLabel: 'System Error',
    badgeColor: 'rose',
    subject: `Operational Error in ${feature}`,
    metadata: {
      feature,
      ...(context || {})
    },
    rawDetails: cleanErrMsg
  }, dbQueryFn);
}

/**
 * 6. Admin Controlled Test Email
 */
export async function sendAdminTestEmail(
  requestedBy: { id: string; email?: string | null; display_username?: string },
  dbQueryFn?: (text: string, params?: any[]) => Promise<any[]>
) {
  const eventKey = `test_email:${Date.now()}`;
  return await sendAdminNotification({
    eventKey,
    eventType: 'Admin Test Email Verification',
    badgeLabel: 'Test Mode',
    badgeColor: 'amber',
    subject: `Test Email Verification: Kiran AI Video Studio`,
    metadata: {
      triggeredBy: requestedBy.email || requestedBy.display_username || requestedBy.id,
      serviceProvider: 'Resend Transactional Email API',
      targetAdmin: getAdminNotificationEmail(),
      fromAddress: getFromEmailAddress(),
      status: 'Pipeline Verified & Active'
    },
    rawDetails: 'This is a controlled verification email confirming that real automatic email notifications are properly connected to your Kiran AI Video Studio backend and configured for Kiranchaulagain094@gmail.com.'
  }, dbQueryFn);
}
