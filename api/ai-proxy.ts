// Keeps GEMINI_API_KEY server-side. Frontend calls /api/ai-proxy instead of Gemini directly.
import { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_utils/firebase";

// Simple in-memory rate limiter (resets on cold-start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let userId: string;
  try {
    const token = authHeader.substring(7);
    const decoded = await admin.auth().verifyIdToken(token);
    userId = decoded.uid;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (!checkRateLimit(userId)) {
    res.setHeader("Retry-After", "60");
    return res
      .status(429)
      .json({ error: "Too many requests. Please wait a minute." });
  }

  const body = req.body || {};
  if (!body.message || typeof body.message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }
  const message = body.message.slice(0, 2000);

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error("[AI Proxy] Gemini error:", await geminiResponse.text());
      return res.status(502).json({ error: "AI service error" });
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("[AI Proxy] Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
