# React Native Migration Guide - Saksham AI

Complete guide to convert the Saksham AI web app to React Native (using Expo).

---

## 📋 Overview

### Current Stack (Web)
- React 18 + TypeScript
- Vite (bundler)
- React Router (navigation)
- Tailwind CSS (styling)
- Firebase (auth, Firestore, storage)
- Lucide React (icons)

### Target Stack (React Native)
- React Native (iOS/Android)
- Expo (managed app development)
- React Navigation (navigation)
- NativeWind (Tailwind CSS for React Native)
- Firebase JS SDK (same backend)
- Lucide React Native (icons)

---

## 🚀 Phase 1: Project Setup

### Step 1: Create New Expo Project

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Create new Expo project
expo init saksham-mobile --template
# Choose: "tabs" template (has navigation structure)

cd saksham-mobile
```

### Step 2: Install Essential Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Firebase
npm install firebase

# Styling (Tailwind for React Native)
npm install nativewind tailwindcss

# Icons
npm install lucide-react-native

# HTTP client (if using external APIs)
npm install axios

# State management (if needed)
npm install zustand
# or
npm install @tanstack/react-query

# Authentication & Storage
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated

# UI Components
npm install react-native-ui-lib

# TypeScript
npm install --save-dev typescript @types/react-native
```

### Step 3: Project Structure

```
saksham-mobile/
├── app/                          # Main app structure
│   ├── (auth)/                   # Auth stack
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verify-email.tsx
│   ├── (tabs)/                   # Tab navigation
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── wishlist.tsx
│   │   ├── profile.tsx
│   │   └── _layout.tsx
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/               # Reusable components
│   │   ├── InternshipCard.tsx
│   │   ├── FilterSheet.tsx
│   │   ├── SearchBar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── contexts/                 # Auth & app context
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useInternships.ts
│   │   └── useWishlist.ts
│   ├── lib/                      # Firebase & utilities
│   │   ├── firebase.ts
│   │   ├── storage.ts            # AsyncStorage wrapper
│   │   └── utils.ts
│   ├── services/                 # API services
│   │   ├── internshipService.ts
│   │   └── userService.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   └── styles/                   # Global styles
│       └── tailwind.css
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── firebase.config.ts            # Firebase init
└── tailwind.config.ts            # Tailwind config
```

---

## 🔧 Phase 2: Core Setup

### Step 1: Configure Firebase

**File: `src/lib/firebase.ts`**

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
```

### Step 2: Create AsyncStorage Wrapper

**File: `src/lib/storage.ts`**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
};
```

### Step 3: Setup Auth Context

**File: `src/contexts/AuthContext.tsx`**

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Step 4: Configure NativeWind (Tailwind)

**File: `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        accent: '#ec4899',
        background: '#ffffff',
        foreground: '#000000',
        muted: '#6b7280',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**File: `app.json`** - Add NativeWind:

```json
{
  "expo": {
    "plugins": ["nativewind/babel"]
  }
}
```

---

## 📱 Phase 3: Core Components

### Component 1: InternshipCard (Mobile)

**File: `src/components/InternshipCard.tsx`**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, DollarSign, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  stipend: number;
  description: string;
}

export const InternshipCard = ({ internship }: { internship: Internship }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { id: internship.id })}
      className="bg-white rounded-lg p-4 mb-3 shadow-md"
    >
      <Text className="text-lg font-bold text-gray-900">{internship.title}</Text>
      <Text className="text-sm text-gray-600 mt-1">{internship.company}</Text>

      <View className="flex-row items-center mt-3 gap-2">
        <MapPin size={16} color="#666" />
        <Text className="text-sm text-gray-600">{internship.location}</Text>
      </View>

      <View className="flex-row items-center mt-2 gap-2">
        <DollarSign size={16} color="#10b981" />
        <Text className="text-sm font-semibold text-green-600">
          ₹{internship.stipend}/month
        </Text>
      </View>

      <Text className="text-xs text-gray-500 mt-3 line-clamp-2">
        {internship.description}
      </Text>
    </TouchableOpacity>
  );
};
```

### Component 2: AuthScreen (Login)

**File: `app/(auth)/login.tsx`**

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold mb-2">Welcome to Saksham AI</Text>
        <Text className="text-gray-600 mb-8">Find your perfect internship</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded-lg p-4 mb-4"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 rounded-lg p-4 mb-6"
        />

        {error && <Text className="text-red-600 mb-4">{error}</Text>}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-blue-600 rounded-lg p-4"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

### Component 3: Home Screen (Tab)

**File: `app/(tabs)/home.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InternshipCard } from '@/components/InternshipCard';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  stipend: number;
  description: string;
}

export default function HomeScreen() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const q = query(
          collection(db, 'internships'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Internship[];
        setInternships(data);
      } catch (error) {
        console.error('Error fetching internships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-4">
      <FlatList
        data={internships}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <InternshipCard internship={item} />}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      />
    </View>
  );
}
```

---

## 🎨 Phase 4: Navigation Setup

**File: `app/_layout.tsx`**

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/contexts/AuthContext';

import LoginScreen from './(auth)/login';
import RegisterScreen from './(auth)/register';
import HomeScreen from './(tabs)/home';
import SearchScreen from './(tabs)/search';
import WishlistScreen from './(tabs)/wishlist';
import ProfileScreen from './(tabs)/profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#3b82f6',
      headerShown: true,
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Wishlist" component={WishlistScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={TabNavigator} />
        ) : (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 📦 Phase 5: Build & Deploy

### Step 1: Setup EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# This creates eas.json
```

### Step 2: Build for iOS/Android

```bash
# Build for both platforms
eas build --platform all

# Or specific platform
eas build --platform ios
eas build --platform android

# Build for local testing
eas build --platform android --local
```

### Step 3: Submit to App Stores

```bash
# Submit to App Store (iOS)
eas submit --platform ios

# Submit to Google Play (Android)
eas submit --platform android
```

---

## 🔄 Phase 6: Code Reusability

### Services (Can be 100% Reused)

```
✅ src/services/internshipService.ts
✅ src/services/userService.ts
✅ src/lib/firebase.ts (mostly same)
✅ src/utils/validators.ts
✅ src/types/index.ts
```

### Contexts (Mostly Reusable)

```
~80% src/contexts/AuthContext.tsx
~70% src/contexts/WishlistContext.tsx
~90% src/lib/storage.ts (AsyncStorage version)
```

### Components (Need Adaptation)

```
🔧 20% Code reuse - Need React Native components:
  - InternshipCard → React Native version
  - SearchBar → React Native SearchBox
  - Modal → React Native Modal
  - etc.
```

### Styling (Similar but Different)

```
❌ Tailwind CSS → ✅ NativeWind
❌ Custom CSS → ✅ StyleSheet
❌ Tailwind plugins → ✅ NativeWind plugins

Code structure similar (~85% compatible)
```

---

## 📊 Code Reuse Summary

| Layer | Reusability | Effort |
|-------|-------------|--------|
| Backend (Firebase) | 100% | Minimal |
| Services | 100% | None |
| Contexts | 80% | Low |
| Types | 100% | None |
| Utilities | 95% | Very Low |
| Components UI | 20% | High |
| Styling | 70% | Medium |
| **Overall** | **~65-75%** | **Moderate** |

---

## 🚀 Migration Steps

### Week 1: Setup
- [ ] Create Expo project
- [ ] Install dependencies
- [ ] Setup Firebase
- [ ] Configure styling (NativeWind)

### Week 2: Core Features
- [ ] Auth screens (login, register)
- [ ] Navigation setup
- [ ] InternshipCard component
- [ ] Home & Search screens

### Week 3: Features
- [ ] Wishlist functionality
- [ ] User profile
- [ ] Filters & search
- [ ] Detail views

### Week 4: Polish & Deploy
- [ ] Error handling
- [ ] Loading states
- [ ] Offline support
- [ ] Build & submit to stores

---

## 💡 Key Differences from Web

### 1. Navigation
```
Web: React Router
Mobile: React Navigation (Stack, Tab, Drawer)
```

### 2. Styling
```
Web: Tailwind CSS + custom CSS
Mobile: NativeWind + StyleSheet + Platform-specific
```

### 3. Storage
```
Web: localStorage/sessionStorage
Mobile: AsyncStorage
```

### 4. Permissions
```
Web: Browser permissions
Mobile: iOS/Android runtime permissions
```

### 5. Networking
```
Web: fetch/axios
Mobile: fetch/axios (same) + native modules for native features
```

### 6. UI Components
```
Web: HTML + Radix UI
Mobile: React Native components + react-native-ui-lib
```

---

## 📚 Recommended Packages

```json
{
  "dependencies": {
    "react-native": "latest",
    "expo": "~51.0.0",
    "@react-navigation/native": "^6.0",
    "@react-navigation/bottom-tabs": "^6.0",
    "@react-navigation/stack": "^6.0",
    "firebase": "^10.0",
    "nativewind": "^2.0",
    "lucide-react-native": "latest",
    "@react-native-async-storage/async-storage": "^1.21",
    "react-native-gesture-handler": "^2.14",
    "react-native-reanimated": "^3.5",
    "zustand": "^4.4",
    "@tanstack/react-query": "^5.0"
  },
  "devDependencies": {
    "typescript": "^5.0",
    "@types/react-native": "latest",
    "tailwindcss": "^3.0"
  }
}
```

---

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [NativeWind Docs](https://www.nativewind.dev)
- [Firebase React Native](https://rnfirebase.io)
- [React Native Docs](https://reactnative.dev)

