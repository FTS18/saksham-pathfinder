# Gemini AI Chatbot Setup Guide

This guide will help you set up the Gemini AI chatbot integration in your Saksham Pathfinder application.

## Prerequisites

1. A Google account
2. Access to Google AI Studio

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Never commit your `.env` file to version control. Make sure it's listed in your `.gitignore` file.

## Step 3: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Look for the chat bubble icon in the bottom-right corner of your application
3. Click it to open the chatbot
4. Send a test message like "Hello" or "Help me find internships"

## Features

The AI chatbot can help users with:
- Internship search guidance
- Career advice
- Job application tips
- Resume suggestions
- Interview preparation
- Industry insights

## Customization

You can customize the chatbot by modifying:
- `src/lib/gemini.ts` - AI service configuration
- `src/components/Chatbot.tsx` - UI and behavior
- `src/hooks/useChatbot.ts` - State management

## Troubleshooting

### "Gemini API not configured" Error
- Ensure your API key is correctly set in the `.env` file
- Restart your development server after adding the API key
- Check that the environment variable name is exactly `VITE_GEMINI_API_KEY`

### API Rate Limits
- Gemini has usage quotas and rate limits
- For production use, consider implementing request throttling
- Monitor your API usage in Google AI Studio

### Network Issues
- Ensure your application can make HTTPS requests to Google's APIs
- Check for any firewall or proxy restrictions

## Production Deployment

When deploying to production:
1. Set the `VITE_GEMINI_API_KEY` environment variable in your hosting platform
2. Consider implementing additional security measures
3. Monitor API usage and costs
4. Implement proper error handling and fallbacks

## Security Notes

- Never expose your API key in client-side code
- Use environment variables for all sensitive configuration
- Consider implementing rate limiting to prevent abuse
- Monitor API usage regularly