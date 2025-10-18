#!/bin/bash

# Auto-commit script for approving all changes made during development

echo "🔄 Staging all changes..."
git add -A

echo "📝 Creating commit for theme fixes and improvements..."
git commit -m "fix: comprehensive theme corruption and whitespace sanitization

- Added aggressive whitespace removal using regex /[\s\n\r\t]/g
- Fixed theme initialization on page load
- Added validation to prevent corrupted theme values in Firestore
- Implemented auto-cleanup of corrupted data on user login
- Fixed DOMTokenList InvalidCharacterError with newline characters
- Enhanced dataSyncService.ts with sanitization
- Updated themeInitializer.ts with regex-based cleaning
- Enhanced ThemeContext.tsx with trimmed Firestore values
- Replaced photo upload with InitialsAvatar component in onboarding
- Added validation layers at localStorage, Firestore, and DOM levels

Fixes:
- Theme no longer persists as corrupted stringified functions
- Whitespace/newlines automatically removed from all theme values
- New users get clean theme initialization
- Existing users' corrupted data is auto-fixed on login
- Production build now succeeds without esbuild errors"

if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully!"
    echo "📊 Current git status:"
    git status
else
    echo "❌ Failed to commit changes"
    exit 1
fi
