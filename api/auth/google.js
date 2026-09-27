// server/auth.ts
import crypto from "crypto";

// server/db.ts
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ override: true });
function isDbConfigured() {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes("username:password"));
}

// server/auth.ts
function getSafeHost(req) {
  if (!req) return "";
  if (req.headers) {
    const forwardedHost = req.headers["x-forwarded-host"];
    if (typeof forwardedHost === "string" && forwardedHost.length > 0) {
      return forwardedHost.split(",")[0].trim();
    }
    const hostHeader = req.headers["host"];
    if (typeof hostHeader === "string" && hostHeader.length > 0) {
      return hostHeader.split(",")[0].trim();
    }
  }
  if (typeof req.get === "function") {
    try {
      const h = req.get("host");
      if (h) return h.split(",")[0].trim();
    } catch {
    }
  }
  if (typeof req.hostname === "string" && req.hostname.length > 0) {
    return req.hostname;
  }
  return "";
}
function getSafeProto(req) {
  if (req?.headers) {
    const protoHeader = req.headers["x-forwarded-proto"];
    if (typeof protoHeader === "string" && protoHeader.length > 0) {
      return protoHeader.split(",")[0].trim();
    }
  }
  if (req?.secure) return "https";
  return "https";
}
function getBaseUrl(req) {
  if (process.env.APP_URL && process.env.APP_URL.trim().length > 0) {
    let appUrl = process.env.APP_URL.trim().replace(/\/+$/, "");
    if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
      appUrl = `https://${appUrl}`;
    }
    return appUrl;
  }
  const host = getSafeHost(req);
  const proto = getSafeProto(req);
  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }
  const vercelEnvUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelEnvUrl && vercelEnvUrl.trim().length > 0) {
    const clean = vercelEnvUrl.trim().replace(/\/+$/, "");
    return clean.startsWith("http") ? clean : `https://${clean}`;
  }
  if (host) {
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
function getGoogleRedirectUri(req) {
  return `${getBaseUrl(req)}/api/auth/google/callback`;
}
function getGoogleAuthorizationUrl(req, state) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in environment variables.");
  }
  const redirectUri = getGoogleRedirectUri(req);
  const csrfState = state || crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state: csrfState
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// api/auth/google.ts
async function handler(req, res) {
  if (req.method !== "GET") {
    if (typeof res.setHeader === "function") res.setHeader("Allow", "GET");
    return res.status?.(405).json?.({ success: false, error: "Method Not Allowed" }) || res.end("Method Not Allowed");
  }
  try {
    const missing = [];
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.trim().length === 0) {
      missing.push("GOOGLE_CLIENT_ID");
    }
    if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET.trim().length === 0) {
      missing.push("GOOGLE_CLIENT_SECRET");
    }
    if (!isDbConfigured()) {
      missing.push("DATABASE_URL");
    }
    if (missing.length > 0) {
      const errorMsg = `Google OAuth is not configured. Missing required environment variable(s): ${missing.join(", ")} in Vercel project settings.`;
      console.warn("[Google OAuth Error]:", errorMsg);
      const wantsJson = req.headers?.accept?.includes("application/json");
      if (wantsJson) {
        return res.status(503).json({ success: false, error: errorMsg });
      }
      res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(errorMsg)}` });
      return res.end();
    }
    const state = typeof req.query?.state === "string" ? req.query.state : void 0;
    const authUrl = getGoogleAuthorizationUrl(req, state);
    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (err) {
    console.error("Failed to initiate Google OAuth:", err);
    const message = err?.message || "Failed to initiate Google OAuth authorization flow.";
    res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(message)}` });
    res.end();
  }
}
export {
  handler as default
};
