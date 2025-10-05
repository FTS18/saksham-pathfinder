# 🚀 Saksham AI - Intelligent Internship Platform

> **AI-Powered Internship Discovery & Career Guidance Platform**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)

## ✨ Features

### 🤖 AI-Powered Matching
- **Smart Algorithm**: Multi-dimensional compatibility analysis with 50% skills weighting
- **Company Tier System**: Tier 1 (Google, Microsoft) get 12% bonus, Tier 2 get 8%, Tier 3 get 5%
- **Semantic Matching**: Advanced skill-to-internship correlation
- **Real-time Scoring**: Dynamic AI scores based on profile compatibility

### 🎯 Personalized Experience
- **Simplified Onboarding**: 4-step guided setup with real location API
- **Profile Photo Upload**: Professional profile pictures with Firebase Storage
- **Smart Filters**: Location, stipend, sector, and skill-based filtering
- **Wishlist System**: Save and track favorite internships
- **Application Tracking**: Complete lifecycle management with status updates
- **Progress Tracking**: Application status and career milestone tracking

### 🌐 Multi-Language Support
- **Google Translate Integration**: English ⇄ Hindi translation
- **Responsive UI**: Mobile-first design with language toggle buttons
- **Cultural Adaptation**: India-focused content and opportunities

### 🔐 Authentication & Security
- **Firebase Auth**: Google OAuth integration
- **Secure Data**: XSS protection, input sanitization, SSRF prevention
- **Profile Management**: Comprehensive user data handling

### 🎨 Modern UI/UX
- **Theme System**: 5 color themes (blue, grey, red, yellow, green) + light/dark mode
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Smooth Animations**: Framer Motion powered transitions
- **Glass Morphism**: Modern glassmorphism design elements

### 📊 Analytics & Insights
- **Skill Gap Analysis**: AI-powered career guidance
- **Market Trends**: Real-time internship market insights
- **Success Stories**: Animated testimonials and achievements
- **Performance Metrics**: Application success tracking

### 🎁 Gamification
- **Points System**: Earn points for profile completion, applications, referrals
- **Referral Program**: 100 points for successful referrals
- **Badges & Achievements**: Milestone-based reward system
- **Leaderboards**: Community engagement features

### 📱 PWA Support
- **Installable App**: Progressive Web App with offline capabilities
- **Push Notifications**: Real-time updates and alerts
- **Native Feel**: App-like experience on mobile devices
- **Offline Mode**: Service worker caching for offline access
- **App Shortcuts**: Quick access to key features

### 🚀 New Features (v2.0)
- **4-Step Onboarding**: Reduced from 6 to 4 steps (2-3 min completion)
- **Real Location API**: All Indian cities via countrystatecity.in
- **Profile Photos**: Upload with drag-and-drop, preview, and Firebase Storage
- **Application System**: Apply, track, and manage internship applications
- **AI Rate Limiting**: Queue system with exponential backoff and caching
- **Layout Optimization**: Common elements don't re-render on navigation
- **Auto-save**: Onboarding progress saved to localStorage

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality component library
- **Framer Motion** - Smooth animations and transitions

### Backend & Services
- **Firebase** - Authentication, Firestore database, hosting
- **Google Gemini AI** - Advanced AI processing and recommendations
- **RapidAPI** - Job data aggregation (JSearch API)
- **Adzuna API** - Additional job listings

### State Management
- **React Context** - Global state management
- **React Query** - Server state management
- **Local Storage** - Client-side data persistence

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project setup
- API keys for Gemini AI and job APIs

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/saksham-pathfinder.git

# Navigate to project directory
cd saksham-pathfinder

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Add your API keys to .env file

# Start development server
npm run dev
```

### Environment Variables

```env
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Job APIs
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_ADZUNA_APP_ID=your_adzuna_app_id
VITE_ADZUNA_APP_KEY=your_adzuna_app_key
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui base components
│   └── Layout.tsx      # Common layout wrapper
├── pages/              # Main application pages
│   ├── SimplifiedOnboarding.tsx  # New 4-step onboarding
│   └── Applications.tsx          # Application tracking
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── services/           # API services and integrations
│   ├── applicationService.ts     # Application management
│   ├── aiQueueService.ts         # AI rate limiting
│   └── locationService.ts        # Real location API
└── data/              # Static data and configurations
```

## 🎯 Key Components

- **AI Matching Engine** - Multi-factor internship recommendation system
- **Profile System** - Comprehensive user profile with skills and preferences
- **Filter System** - Advanced filtering with sector-skill dependencies
- **Notification System** - Real-time updates and alerts
- **Theme Engine** - Dynamic theming with color and mode controls

## 🔧 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase (if configured)
firebase deploy
```

## 📚 Documentation

- [Contributing Guidelines](docs/CONTRIBUTING.md) - How to contribute to the project

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Team HexaForces** - Development team
- **Google Gemini AI** - AI processing capabilities
- **Firebase** - Backend infrastructure
- **Shadcn/ui** - Component library
- **Lucide React** - Icon library

---

**Made with ❤️ by Team HexaForces**

*Empowering students to find their perfect internship match through AI-driven recommendations.*