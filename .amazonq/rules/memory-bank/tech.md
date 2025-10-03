# Technology Stack & Development Setup

## Core Technologies

### Frontend Framework
- **React 18.3.1** - Modern React with concurrent features, hooks, and Suspense
- **TypeScript 5.8.3** - Type-safe JavaScript with advanced type checking
- **Vite 5.4.19** - Lightning-fast build tool with HMR and optimized bundling

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework with custom design system
- **Shadcn/ui** - High-quality, accessible component library built on Radix UI
- **Radix UI Primitives** - Unstyled, accessible UI components
- **Lucide React 0.462.0** - Beautiful, customizable SVG icons
- **React Icons 5.5.0** - Popular icon library with multiple icon sets

### State Management & Data Fetching
- **React Context API** - Built-in state management for global application state
- **TanStack React Query 5.83.0** - Powerful data synchronization and server state management
- **React Hook Form 7.61.1** - Performant forms with easy validation
- **Zod 3.25.76** - TypeScript-first schema validation

### Backend & Services
- **Firebase 12.2.1** - Complete backend solution
  - Authentication (Google OAuth, email/password)
  - Firestore database for user data and applications
  - Cloud Storage for file uploads
  - Hosting for production deployment
- **Google Generative AI 0.24.1** - Gemini AI integration for intelligent recommendations
- **Node.js APIs** - Custom API endpoints for data processing

### Development Tools
- **ESLint 9.32.0** - Code linting with TypeScript support
- **TypeScript ESLint 8.38.0** - TypeScript-specific linting rules
- **Prettier** - Code formatting (configured via ESLint)
- **Husky** - Git hooks for code quality enforcement

## Build System & Configuration

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
})
```

### TypeScript Configuration
- **Strict Mode** - Enabled for maximum type safety
- **Path Mapping** - `@/` alias for clean imports
- **Module Resolution** - Node.js style with ES modules
- **Target** - ES2020 for modern browser support

### Tailwind CSS Setup
- **Custom Design System** - Extended color palette and spacing
- **Component Classes** - Reusable utility combinations
- **Responsive Design** - Mobile-first breakpoint system
- **Dark Mode** - Class-based theme switching

## Development Commands

### Primary Commands
```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Bundle analysis
npm run build:analyze

# Preview production build
npm run preview

# Type checking without compilation
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Specialized Scripts
```bash
# Database migration
node scripts/migrate-to-firestore.js

# Date format fixing
node scripts/fixDates.js

# Bundle size analysis
node scripts/analyze-bundle.js

# Skill verification
node verify-skills.js
```

## Environment Configuration

### Required Environment Variables
```env
# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# External APIs
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_ADZUNA_APP_ID=your_adzuna_app_id
VITE_ADZUNA_APP_KEY=your_adzuna_app_key
```

### Development Setup
1. **Node.js 18+** - Required for modern JavaScript features
2. **npm/yarn** - Package manager (npm recommended)
3. **Firebase CLI** - For deployment and local development
4. **Git** - Version control with conventional commits

## Key Dependencies

### UI & Animation
- **@react-three/fiber 9.3.0** - 3D graphics and animations
- **@react-three/drei 10.7.6** - 3D component helpers
- **Framer Motion** - Smooth animations and transitions
- **Embla Carousel 8.6.0** - Touch-friendly carousel component

### Form & Input Handling
- **React Dropzone 14.3.8** - File upload with drag & drop
- **React Day Picker 8.10.1** - Date selection component
- **Input OTP 1.4.2** - One-time password input
- **Tesseract.js 6.0.1** - OCR for resume scanning

### Utilities & Helpers
- **Class Variance Authority 0.7.1** - Component variant management
- **clsx 2.1.1** - Conditional className utility
- **Tailwind Merge 2.6.0** - Tailwind class merging
- **Date-fns 3.6.0** - Date manipulation library
- **cmdk 1.1.1** - Command palette component

### Charts & Visualization
- **Recharts 2.15.4** - React charting library for analytics
- **React Resizable Panels 2.1.9** - Resizable layout components

## Performance Optimizations

### Code Splitting
- **Lazy Loading** - Route-based and component-based code splitting
- **Dynamic Imports** - On-demand loading of heavy components
- **Bundle Analysis** - Regular monitoring of bundle size

### Caching Strategy
- **Service Worker** - Offline functionality and asset caching
- **Memory Caching** - In-memory data caching for API responses
- **LocalStorage** - Persistent user preferences and filter states

### Build Optimizations
- **Tree Shaking** - Unused code elimination
- **Minification** - Code compression for production
- **Asset Optimization** - Image compression and format optimization
- **Chunk Splitting** - Optimal bundle splitting for caching

## Deployment & Hosting

### Production Deployment
- **Firebase Hosting** - Primary hosting platform
- **Netlify** - Alternative hosting with continuous deployment
- **CDN Integration** - Global content delivery for performance

### CI/CD Pipeline
- **GitHub Actions** - Automated testing and deployment
- **ESLint Checks** - Code quality validation
- **TypeScript Compilation** - Type checking in CI
- **Build Verification** - Successful build confirmation

## Browser Support
- **Modern Browsers** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers** - iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement** - Graceful degradation for older browsers
- **PWA Support** - Installation and offline functionality

## Development Best Practices
- **TypeScript First** - All new code written in TypeScript
- **Component Composition** - Reusable, composable component architecture
- **Custom Hooks** - Logic extraction into reusable hooks
- **Error Boundaries** - Graceful error handling at component level
- **Accessibility** - WCAG 2.1 AA compliance with screen reader support
- **Performance Monitoring** - Regular performance audits and optimization