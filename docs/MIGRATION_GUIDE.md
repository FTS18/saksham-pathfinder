# Migration Guide: JSON to Firestore & AI Scoring

## 1. JSON Data to Firestore Migration

### Migration Script
```javascript
// scripts/migrate-to-firestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateInternships() {
  const data = JSON.parse(fs.readFileSync('./src/data/internships.json', 'utf8'));
  const batch = writeBatch(db);
  
  data.forEach((item) => {
    const docRef = doc(collection(db, 'internships'));
    batch.set(docRef, { ...item, id: docRef.id, createdAt: new Date() });
  });
  
  await batch.commit();
}
```

### Firestore Service
```typescript
// src/services/firestoreService.ts
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class FirestoreService {
  static async getInternships(filters = {}) {
    let q = query(collection(db, 'internships'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
```

## 2. AI Scoring Migration to Firebase Functions

### Firebase Function
```javascript
// functions/src/aiScoring.js
exports.calculateAIScore = functions.firestore
  .document('applications/{applicationId}')
  .onCreate(async (snap) => {
    const score = await calculateCompatibilityScore(candidate, internship);
    await snap.ref.update({ aiScore: score });
  });

function calculateCompatibilityScore(candidate, internship) {
  let score = 0;
  // Skills matching (50% weight)
  score += calculateSkillsMatch(candidate.skills, internship.skills) * 0.5;
  // Company tier bonus
  score += getCompanyTierBonus(internship.companyTier);
  return Math.min(score, 100);
}
```

### Client Service
```typescript
// src/services/aiScoringService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export class AIScoringService {
  static async getRecommendations(userId: string) {
    const getRecommendations = httpsCallable(functions, 'getPersonalizedRecommendations');
    const result = await getRecommendations({ userId });
    return result.data;
  }
}
```

## 3. Deployment
```bash
firebase init functions
firebase deploy --only functions
firebase deploy --only firestore:rules
```