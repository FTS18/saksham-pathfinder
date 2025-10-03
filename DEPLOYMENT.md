# Deployment Guide

## Environment Variables Setup

Before deploying, you need to set up the following environment variables in your deployment platform (Netlify, Vercel, etc.):

### Required Variables:
```
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
```

### Optional Variables:
```
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_ADZUNA_APP_ID=your_adzuna_app_id
VITE_ADZUNA_APP_KEY=your_adzuna_app_key
LINKEDIN_TOKEN=your_linkedin_token
```

## Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

The `netlify.toml` file is already configured with:
- Secrets scanning disabled (safe for frontend env vars)
- Proper caching headers
- SPA routing support

## Security Notes

- All `VITE_*` environment variables are exposed in the frontend build (this is normal for Vite)
- Firebase API keys are safe to expose in frontend applications
- Never commit actual API keys to the repository
- Use `.env.local` for local development (already in .gitignore)

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Type check
npm run type-check
```