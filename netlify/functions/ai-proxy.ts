// FIX #15: AI proxy function -- keeps GEMINI_API_KEY on the server.
// The frontend calls /.netlify/functions/ai-proxy instead of Gemini directly.
// This prevents API key theft from browser DevTools.

import * as admin from 'firebase-admin';
import { Handler } from '@netlify/functions';

// Initialize Firebase Admin (shared instance)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

// Simple in-memory rate limiter (resets on cold-start, good enough for basic protection)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;    // max requests per window
const WINDOW_MS = 60_000; // 1 minute window

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

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Authenticate user
  const authHeader = event.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let userId: string;
  try {
    const token = authHeader.substring(7);
    const decoded = await admin.auth().verifyIdToken(token);
    userId = decoded.uid;
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
  }

  // Rate limit per user
  if (!checkRateLimit(userId)) {
    return {
      statusCode: 429,
      headers: { 'Retry-After': '60' },
      body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' }),
    };
  }

  // Parse request body
  let body: { message: string; language?: string };
  try {
    body = JSON.parse(event.body || '{}');
    if (!body.message || typeof body.message !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'message is required' }) };
    }
    body.message = body.message.slice(0, 2000); // prevent cost attacks
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'AI service not configured' }) };
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: body.message }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error('[AI Proxy] Gemini error:', await geminiResponse.text());
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error' }) };
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ response: text }),
    };
  } catch (error) {
    console.error('[AI Proxy] Unexpected error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
