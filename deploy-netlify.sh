#!/bin/bash
# Deploy to Netlify with Recruiter API Functions

# 1. Install Netlify CLI if not already installed
if ! command -v netlify &> /dev/null; then
    npm install -g netlify-cli
fi

# 2. Login to Netlify
netlify login

# 3. Connect to your site (if not already connected)
netlify sites:create --name saksham-pathfinder

# 4. Set environment variables
# Go to: https://app.netlify.com/sites/YOUR_SITE_NAME/settings/deploys#environment
# Add the following:
# - FIREBASE_PROJECT_ID=saksham-ai-81c3a
# - FIREBASE_STORAGE_BUCKET=saksham-ai-81c3a.appspot.com
# - FIREBASE_ADMIN_PRIVATE_KEY=[get from Firebase Console]
# - FIREBASE_ADMIN_CLIENT_EMAIL=[get from Firebase Console]
# - FIREBASE_ADMIN_CLIENT_ID=[get from Firebase Console]

# 5. Deploy
netlify deploy --prod

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://saksham-pathfinder.netlify.app"
echo "📚 API Functions available at: /.netlify/functions/recruiter-api"
