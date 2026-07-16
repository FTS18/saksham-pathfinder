# Saksham AI - Intelligent Internship Platform

**AI-Powered Internship Discovery & Career Guidance Platform**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)

## Features

### AI-Powered Matching
- **Smart Algorithm**: Multi-dimensional compatibility analysis with 50% skills weighting.
- **Company Tier System**: Tier 1 (Google, Microsoft) receives a 12% bonus, Tier 2 receives 8%, Tier 3 receives 5%.
- **Semantic Matching**: Advanced skill-to-internship correlation.
- **Real-time Scoring**: Dynamic AI scores based on profile compatibility.

### Personalized Experience
- **Simplified Onboarding**: 4-step guided setup integrating location APIs.
- **Profile Management**: Profile picture upload support via Firebase Storage.
- **Smart Filters**: Advanced filtering by location, stipend, sector, and specific skills.
- **Wishlist System**: Save and track favorite internships with cross-session persistence.
- **Application Tracking**: Complete lifecycle management with real-time status updates.

### Multi-Language Support
- **Translation Integration**: Support for English and Hindi.
- **Responsive UI**: Mobile-first design with accessible language toggles.
- **Cultural Adaptation**: India-focused content and localized opportunities.

### Authentication & Security
- **Firebase Auth**: Secure Google OAuth integration.
- **Secure Data Handling**: Implemented protections against XSS and SSRF.
- **Profile Data Protection**: Comprehensive user data management with strict access control.

### Modern UI/UX
- **Theme System**: Dynamic theming with light/dark modes and multiple accent colors (blue, grey, red, yellow, green).
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop environments.
- **Smooth Animations**: Integrated Framer Motion for hardware-accelerated transitions.
- **Advanced Styling**: Persistent layout components preventing unnecessary unmounting across route transitions.

### Analytics & Insights
- **Skill Gap Analysis**: AI-powered career progression guidance.
- **Market Trends**: Real-time insights into the current internship market.
- **Performance Metrics**: Application success rate and engagement tracking.

### Gamification
- **Points System**: Users earn points for profile completion, applications, and referrals.
- **Referral Program**: Reward system for successful network referrals.
- **Badges & Achievements**: Milestone-based engagement rewards.

### PWA Support
- **Installable App**: Progressive Web App capabilities for offline and native-like usage.
- **Caching**: Service worker implementation for optimal performance and offline access.

### Recent Structural Updates (v2.1)
- **Persistent Routing Architecture**: Refactored the core routing in `App.tsx` to utilize nested routes, preventing UI state loss (e.g., sidebar collapse state) during navigation.
- **Layout Stability Enhancements**: Resolved critical CSS flexbox overflow issues causing layout squishing and horizontal scrollbars on desktop viewports.
- **Sidebar UX Improvements**: Implemented persistent pin functionality with transparent state management to align with the core glassmorphic design philosophy.

## Tech Stack

### Frontend
- **React 18.3.1** - Modern React utilizing hooks and concurrent features
- **TypeScript** - Strict type-safe development
- **Vite** - High-performance build tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Accessible component library
- **Framer Motion** - Animation library

### Backend & Services
- **Firebase** - Authentication, Firestore database, storage, and hosting
- **Google Gemini AI** - Advanced AI processing and recommendations
- **RapidAPI** - Job data aggregation (JSearch API)
- **Adzuna API** - Supplemental job listings

### State Management
- **React Context** - Global state management for Theme, Auth, and Application contexts
- **React Query** - Server state synchronization
- **Local Storage** - Client-side persistence fallbacks

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project configuration
- Active API keys for Gemini AI and job aggregators

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
# Populate your API keys in the .env file

# Start development server
npm run dev
```

### Detailed Environment Configuration

The application requires several third-party services to function correctly. Create a `.env` file in the root directory and populate it according to this table:

| Variable Name | Required | Provider | Description |
|---|---|---|---|
| `VITE_GEMINI_API_KEY` | **Yes** | Google AI Studio | Generative AI key for matching algorithms and profile scoring. [Get it here](https://aistudio.google.com/). |
| `VITE_FIREBASE_API_KEY` | **Yes** | Firebase Console | Firebase project Web API Key. Used for Auth & Firestore. |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Yes** | Firebase Console | e.g., `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | **Yes** | Firebase Console | Your unique Firebase project identifier. |
| `VITE_FIREBASE_STORAGE_BUCKET` | **Yes** | Firebase Console | e.g., `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | **Yes** | Firebase Console | Cloud Messaging Sender ID. |
| `VITE_FIREBASE_APP_ID` | **Yes** | Firebase Console | Firebase Web App ID. |
| `VITE_RAPIDAPI_KEY` | *Optional* | RapidAPI (JSearch) | Used to fetch live internship data from Google Jobs. Subscribe to the [JSearch API](https://rapidapi.com/letscrape-6bRBa3Q3O/api/jsearch) to obtain this. |
| `VITE_ADZUNA_APP_ID` | *Optional* | Adzuna Developer | App ID for the Adzuna Job Search API. [Register here](https://developer.adzuna.com/). |
| `VITE_ADZUNA_APP_KEY` | *Optional* | Adzuna Developer | App Key for the Adzuna Job Search API. |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui base components
│   └── Layout.tsx      # Main application shell wrapper
├── pages/              # Primary route components
├── contexts/           # Global state providers
├── hooks/              # Custom React hooks
├── lib/                # Utility modules and configurations
├── services/           # Backend API integration layers
└── data/              # Static configurations
```

## Build & Deploy (Netlify)

This project is configured for automated deployments via **Netlify**, not Firebase Hosting. The `netlify.toml` file at the root handles the build configuration and redirect rules for React Router.

```bash
# 1. Build for production locally
npm run build

# 2. Preview the production build locally
npm run preview
```

### Deployment Strategy
- **Automated CI/CD**: Pushing code to the `main` branch automatically triggers a Netlify production build.
- **Manual CLI Deployment**: You can also use the included shell script for manual deployment:
  ```bash
  # Ensure the Netlify CLI is installed (npm i -g netlify-cli)
  ./deploy-netlify.sh
  ```
- **Routing Note**: Netlify handles Single Page Application (SPA) routing automatically via the `[[redirects]]` rule in `netlify.toml`.

## Contributing

We welcome contributions to Saksham AI. Please refer to our [Contributing Guidelines](docs/CONTRIBUTING.md) for detailed workflows.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add: Detailed description of feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Developed by Team HexaForces*