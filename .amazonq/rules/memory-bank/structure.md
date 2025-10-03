# Project Structure & Architecture

## Directory Organization

### Root Level Structure
```
saksham-pathfinder/
├── .amazonq/rules/memory-bank/    # AI assistant memory bank
├── .idx/                          # IDX development environment
├── api/                          # Backend API endpoints
├── docs/                         # Documentation files
├── public/                       # Static assets and PWA files
├── scripts/                      # Build and utility scripts
├── src/                          # Main application source code
└── Configuration files           # Package.json, configs, etc.
```

### Source Code Architecture (`src/`)

#### Core Application Structure
```
src/
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (Shadcn/ui)
│   ├── recruiter/               # Recruiter-specific components
│   └── [Feature Components]     # Feature-specific components
├── pages/                       # Main application pages/routes
├── contexts/                    # React Context providers
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries and configurations
├── services/                    # API services and integrations
├── data/                        # Static data and configurations
├── types/                       # TypeScript type definitions
├── utils/                       # Utility functions
└── styles/                      # CSS and styling files
```

## Component Architecture

### UI Component Hierarchy
- **Base Components** (`components/ui/`): Foundational UI elements from Shadcn/ui
- **Feature Components**: Business logic components for specific features
- **Layout Components**: Navigation, sidebars, headers, and layout wrappers
- **Page Components**: Top-level route components in `pages/`

### Key Component Categories

#### Navigation & Layout
- `TopNavigation.tsx` - Main navigation bar
- `CollapsibleSidebar.tsx` - Expandable sidebar navigation
- `MobileSidebar.tsx` - Mobile-optimized navigation
- `Footer.tsx` - Application footer

#### Core Features
- `InternshipCard.tsx` - Individual internship display
- `InternshipFilters.tsx` - Advanced filtering system
- `ProfileForm.tsx` - User profile creation/editing
- `Hero.tsx` - Landing page hero section

#### AI & Recommendations
- `MagicBento.tsx` - Interactive card components
- `SearchSuggestions.tsx` - AI-powered search suggestions
- `SkillGapAnalysis.tsx` - Career development insights

#### User Experience
- `LoadingStates.tsx` - Loading and skeleton components
- `ErrorBoundary.tsx` - Error handling wrapper
- `LazyComponent.tsx` - Performance optimization wrapper

## State Management Architecture

### Context Providers
```
contexts/
├── AuthContext.tsx              # User authentication state
├── ThemeContext.tsx             # Theme and appearance settings
├── WishlistContext.tsx          # User wishlist management
├── ComparisonContext.tsx        # Internship comparison feature
└── ToastContext.tsx             # Notification system
```

### Custom Hooks
```
hooks/
├── useInternshipFilters.ts      # Filter state management
├── useAuth.ts                   # Authentication utilities
├── useTheme.ts                  # Theme management
├── useDebounce.ts               # Performance optimization
└── [Feature-specific hooks]     # Specialized functionality
```

## Service Layer Architecture

### API Services
```
services/
├── authService.ts               # Authentication operations
├── firestoreService.ts          # Database operations
├── internshipService.ts         # Internship data management
├── smartFilterService.ts        # AI filtering logic
└── resumeScanner.ts             # Resume processing
```

### Utility Libraries
```
lib/
├── firebase.ts                  # Firebase configuration
├── gemini.ts                    # Google Gemini AI integration
├── cache.ts                     # Caching mechanisms
├── security.ts                  # Security utilities
└── utils.ts                     # General utilities
```

## Data Architecture

### Static Data Sources
```
data/
├── countries.ts                 # Country/location data
├── sectors-skills.json          # Industry sector mappings
├── states-cities.json           # Indian geography data
└── internships.json             # Sample internship data
```

### Public Assets
```
public/
├── favicon/                     # App icons and favicons
├── internships.json             # Live internship data
├── manifest.json                # PWA manifest
├── sw.js                        # Service worker
└── [Static assets]              # Images, logos, etc.
```

## Routing Architecture

### Page Structure
```
pages/
├── Index.tsx                    # Landing page with AI recommendations
├── Profile.tsx                  # User profile management
├── Dashboard.tsx                # User dashboard
├── Login.tsx / Register.tsx     # Authentication pages
├── Wishlist.tsx                 # Saved internships
├── [Feature Pages]              # Specialized functionality pages
└── NotFound.tsx                 # 404 error page
```

### Navigation Flow
1. **Landing Page** (`Index.tsx`) - Hero section and internship browsing
2. **Authentication** - Login/Register flow with Firebase
3. **Profile Setup** - Guided onboarding process
4. **Dashboard** - Personalized user experience
5. **Feature Pages** - Specialized functionality (wishlist, settings, etc.)

## Build & Configuration Architecture

### Build System
- **Vite** - Primary build tool for fast development and production builds
- **TypeScript** - Type checking and compilation
- **ESLint** - Code quality and linting
- **Tailwind CSS** - Utility-first styling system

### Configuration Files
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules and settings

## Integration Architecture

### External Services
- **Firebase** - Authentication, database, and hosting
- **Google Gemini AI** - AI processing and recommendations
- **Google Translate** - Multi-language support
- **RapidAPI/JSearch** - Job data aggregation
- **Adzuna API** - Additional internship listings

### PWA Architecture
- **Service Worker** (`sw.js`) - Offline functionality and caching
- **Web App Manifest** - PWA configuration and installation
- **Push Notifications** - Real-time user engagement

## Performance Architecture

### Optimization Strategies
- **Lazy Loading** - Component-level code splitting
- **Caching** - Multi-layer caching system (memory, localStorage, service worker)
- **Debouncing** - Input optimization for search and filters
- **Virtual Scrolling** - Large list performance optimization
- **Image Optimization** - WebP format and responsive images

### Monitoring & Analytics
- **Performance Hooks** - Custom performance monitoring
- **Error Boundaries** - Graceful error handling
- **Loading States** - User experience optimization
- **Bundle Analysis** - Build size optimization tools