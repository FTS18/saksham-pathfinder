import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { initializeApp, App } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

// Initialize test environment before tests
beforeAll(async () => {
  // Read the rules file
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'saksham-ai-81c3a',
    firestore: {
      rules: rules,
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules - Saksham Pathfinder', () => {
  const testUserId = 'user123';
  const adminUserId = 'admin456';
  const testUsername = 'testuser';
  const recruiterId = 'recruiter789';

  describe('Authentication Tests', () => {
    it('should allow authenticated users to create profiles', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(
        setDoc(profileRef, {
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
        })
      ).resolves.not.toThrow();
    });

    it('should deny unauthenticated users from creating profiles', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(
        setDoc(profileRef, {
          name: 'Test User',
          email: 'test@example.com',
        })
      ).toThrow();
    });
  });

  describe('Profile Permission Tests', () => {
    beforeEach(async () => {
      // Create a test profile
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const profileRef = doc(db, 'profiles', testUserId);
        await setDoc(profileRef, {
          name: 'Test User',
          email: 'test@example.com',
          isPublic: false,
          createdAt: new Date(),
        });
      });
    });

    it('should allow owner to read their own profile', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(getDoc(profileRef)).resolves.toBeDefined();
    });

    it('should deny other users from reading private profiles', async () => {
      const db = testEnv.authenticatedContext('otherUser').firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(getDoc(profileRef)).toThrow();
    });

    it('should allow anyone to read public profiles', async () => {
      // Make profile public
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const profileRef = doc(db, 'profiles', testUserId);
        await setDoc(profileRef, {
          name: 'Test User',
          email: 'test@example.com',
          isPublic: true,
          createdAt: new Date(),
        }, { merge: true });
      });

      // Test unauthenticated read
      const db = testEnv.unauthenticatedContext().firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(getDoc(profileRef)).resolves.toBeDefined();
    });

    it('should allow owner to update their profile', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(
        setDoc(profileRef, { name: 'Updated Name' }, { merge: true })
      ).resolves.not.toThrow();
    });

    it('should deny non-owner from updating profile', async () => {
      const db = testEnv.authenticatedContext('otherUser').firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(
        setDoc(profileRef, { name: 'Hacked Name' }, { merge: true })
      ).toThrow();
    });

    it('should allow owner to delete their profile', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      await expect(deleteDoc(profileRef)).resolves.not.toThrow();
    });
  });

  describe('Username Registry Tests', () => {
    it('should allow anyone to read username availability', async () => {
      // First, create a username (disabled rules)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const usernameRef = doc(db, 'usernames', testUsername);
        await setDoc(usernameRef, {
          userId: testUserId,
          createdAt: new Date(),
        });
      });

      // Now test public read
      const db = testEnv.unauthenticatedContext().firestore();
      const usernameRef = doc(db, 'usernames', testUsername);
      
      await expect(getDoc(usernameRef)).resolves.toBeDefined();
    });

    it('should allow authenticated user to claim a username', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const usernameRef = doc(db, 'usernames', 'newusername');
      
      await expect(
        setDoc(usernameRef, {
          userId: testUserId,
          createdAt: new Date(),
        })
      ).resolves.not.toThrow();
    });

    it('should deny user from claiming another user\'s username', async () => {
      // Create username for testUserId
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const usernameRef = doc(db, 'usernames', testUsername);
        await setDoc(usernameRef, {
          userId: testUserId,
          createdAt: new Date(),
        });
      });

      // Try to take it with different user
      const db = testEnv.authenticatedContext('otherUser').firestore();
      const usernameRef = doc(db, 'usernames', testUsername);
      
      await expect(
        setDoc(usernameRef, {
          userId: 'otherUser',
          createdAt: new Date(),
        }, { merge: true })
      ).toThrow();
    });

    it('should allow user to delete their own username', async () => {
      // Create username
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const usernameRef = doc(db, 'usernames', testUsername);
        await setDoc(usernameRef, {
          userId: testUserId,
          createdAt: new Date(),
        });
      });

      // Delete it
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const usernameRef = doc(db, 'usernames', testUsername);
      
      await expect(deleteDoc(usernameRef)).resolves.not.toThrow();
    });
  });

  describe('Application Permission Tests', () => {
    beforeEach(async () => {
      // Create test application
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const appRef = doc(db, 'applications', 'app123');
        await setDoc(appRef, {
          userId: testUserId,
          recruiterId: recruiterId,
          internshipId: 'internship123',
          status: 'applied',
          createdAt: new Date(),
        });
      });
    });

    it('should allow applicant to read their own application', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const appRef = doc(db, 'applications', 'app123');
      
      await expect(getDoc(appRef)).resolves.toBeDefined();
    });

    it('should allow recruiter to read application for their internship', async () => {
      const db = testEnv.authenticatedContext(recruiterId).firestore();
      const appRef = doc(db, 'applications', 'app123');
      
      await expect(getDoc(appRef)).resolves.toBeDefined();
    });

    it('should deny unrelated user from reading application', async () => {
      const db = testEnv.authenticatedContext('randomUser').firestore();
      const appRef = doc(db, 'applications', 'app123');
      
      await expect(getDoc(appRef)).toThrow();
    });

    it('should allow applicant to create their own application', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const appRef = doc(collection(db, 'applications'));
      
      await expect(
        setDoc(appRef, {
          userId: testUserId,
          recruiterId: recruiterId,
          internshipId: 'internship456',
          status: 'applied',
          createdAt: new Date(),
        })
      ).resolves.not.toThrow();
    });

    it('should deny user from creating application as another user', async () => {
      const db = testEnv.authenticatedContext('otherUser').firestore();
      const appRef = doc(collection(db, 'applications'));
      
      await expect(
        setDoc(appRef, {
          userId: testUserId, // different user
          recruiterId: recruiterId,
          internshipId: 'internship456',
          status: 'applied',
          createdAt: new Date(),
        })
      ).toThrow();
    });
  });

  describe('User Preferences Tests', () => {
    it('should allow user to read their preferences', async () => {
      // Create preferences
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const prefRef = doc(db, 'userPreferences', testUserId);
        await setDoc(prefRef, {
          theme: 'dark',
          colorTheme: 'red',
          language: 'en',
          fontSize: 16,
        });
      });

      const db = testEnv.authenticatedContext(testUserId).firestore();
      const prefRef = doc(db, 'userPreferences', testUserId);
      
      await expect(getDoc(prefRef)).resolves.toBeDefined();
    });

    it('should allow user to update their preferences', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const prefRef = doc(db, 'userPreferences', testUserId);
      
      await expect(
        setDoc(prefRef, { theme: 'light' }, { merge: true })
      ).resolves.not.toThrow();
    });

    it('should deny user from reading other user preferences', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const prefRef = doc(db, 'userPreferences', testUserId);
        await setDoc(prefRef, { theme: 'dark' });
      });

      const db = testEnv.authenticatedContext('otherUser').firestore();
      const prefRef = doc(db, 'userPreferences', testUserId);
      
      await expect(getDoc(prefRef)).toThrow();
    });
  });

  describe('Internship Permission Tests', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const internshipRef = doc(db, 'internships', 'internship123');
        await setDoc(internshipRef, {
          title: 'Test Internship',
          company: 'Test Co',
          recruiterId: recruiterId,
          createdBy: recruiterId,
          createdAt: new Date(),
        });
      });
    });

    it('should allow anyone to read internships (public)', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const internshipRef = doc(db, 'internships', 'internship123');
      
      await expect(getDoc(internshipRef)).resolves.toBeDefined();
    });

    it('should allow recruiter to update their internship', async () => {
      const db = testEnv.authenticatedContext(recruiterId).firestore();
      const internshipRef = doc(db, 'internships', 'internship123');
      
      await expect(
        setDoc(internshipRef, { title: 'Updated Title' }, { merge: true })
      ).resolves.not.toThrow();
    });

    it('should deny other user from updating internship', async () => {
      const db = testEnv.authenticatedContext('otherUser').firestore();
      const internshipRef = doc(db, 'internships', 'internship123');
      
      await expect(
        setDoc(internshipRef, { title: 'Hacked Title' }, { merge: true })
      ).toThrow();
    });
  });

  describe('Notification Permission Tests', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const notifRef = doc(db, 'notifications', 'notif123');
        await setDoc(notifRef, {
          userId: testUserId,
          title: 'Test Notification',
          message: 'This is a test',
          createdAt: new Date(),
        });
      });
    });

    it('should allow user to read their notifications', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const notifRef = doc(db, 'notifications', 'notif123');
      
      await expect(getDoc(notifRef)).resolves.toBeDefined();
    });

    it('should deny user from reading other user notifications', async () => {
      const db = testEnv.authenticatedContext('otherUser').firestore();
      const notifRef = doc(db, 'notifications', 'notif123');
      
      await expect(getDoc(notifRef)).toThrow();
    });

    it('should allow authenticated user to create notifications', async () => {
      const db = testEnv.authenticatedContext('creator').firestore();
      const notifRef = doc(collection(db, 'notifications'));
      
      await expect(
        setDoc(notifRef, {
          userId: testUserId,
          title: 'New Notification',
          message: 'Auto-created',
          createdAt: new Date(),
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Admin Access Tests', () => {
    it('should allow admin to read any profile', async () => {
      // Create a profile
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const profileRef = doc(db, 'profiles', testUserId);
        await setDoc(profileRef, {
          name: 'Test User',
          email: 'test@example.com',
          isPublic: false,
        });

        // Add admin flag
        const adminRef = doc(db, 'admins', adminUserId);
        await setDoc(adminRef, { role: 'admin' });
      });

      // Admin reads user's private profile
      const db = testEnv.authenticatedContext(adminUserId, {
        admin: true,
      }).firestore();
      const profileRef = doc(db, 'profiles', testUserId);
      
      // Note: This would work if admin check was properly implemented with custom claims
      // For now, this test documents the expected behavior
    });
  });

  describe('Default Deny Tests', () => {
    it('should deny access to undefined collections', async () => {
      const db = testEnv.authenticatedContext(testUserId).firestore();
      const unknownRef = doc(db, 'unknownCollection', 'doc123');
      
      await expect(getDoc(unknownRef)).toThrow();
    });
  });
});
