import { doc, setDoc, getDoc, updateDoc, increment, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  StudentOnboardingData,
  RecruiterOnboardingData,
} from "@/types/onboarding";
import { generateUniqueUserId } from "@/lib/userIdGenerator";

class OnboardingService {
  static async completeStudentOnboarding(
    userId: string,
    data: StudentOnboardingData,
    existingProfile?: any
  ): Promise<void> {
    if (!userId || !data) {
      throw new Error("Invalid user ID or data");
    }

    try {
      const userReferralCode =
        existingProfile?.referralCode || this.generateReferralCode();

      // Handle referral code if provided (non-blocking)
      if (data.referralCode?.trim()) {
        try {
          await this.processReferralCode(
            data.referralCode.trim(),
            data.username,
            userId
          );
        } catch (error) {
          console.warn("Referral processing failed, continuing:", error);
        }
      }

      const profileData = {
        uniqueUserId: existingProfile?.uniqueUserId || generateUniqueUserId(),
        username: data.username || this.generateUsername(userId),
        email: existingProfile?.email || "",
        location: data.location || { city: "", state: "", country: "India" },
        desiredLocation: data.desiredLocation || {
          city: "",
          state: "",
          country: "India",
        },
        minStipend: parseInt(data.minStipend) || 0,
        sectors: data.sectors || [],
        skills: data.skills || [],
        education: data.education || { level: "", field: "", year: "" },
        experience: data.experience || { hasExperience: false, projects: [] },
        onboardingCompleted: true,
        referralCode: userReferralCode,
        points: (existingProfile?.points || 0) + 50,
        badges: [...(existingProfile?.badges || []), "Welcome"],
        userType: "student",
        // Theme preferences (read from localStorage or use defaults)
        theme:
          existingProfile?.theme || localStorage.getItem("theme") || "dark",
        colorTheme:
          existingProfile?.colorTheme ||
          localStorage.getItem("colorTheme") ||
          "blue",
        // Preference fields
        language:
          existingProfile?.language || localStorage.getItem("language") || "en",
        fontSize:
          existingProfile?.fontSize ||
          parseInt(localStorage.getItem("fontSize") || "16"),
        // Collections
        searchHistory: existingProfile?.searchHistory || [],
        recentlyViewed: existingProfile?.recentlyViewed || [],
        wishlist: existingProfile?.wishlist || [],
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firebase with retry logic using writeBatch for better performance
      const docRef = doc(db, "profiles", userId);
      const referralRef = doc(db, "referrals", userReferralCode);
      
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const batch = writeBatch(db);
          
          // Batch profile update
          batch.set(docRef, profileData, { merge: true });
          
          // Batch referral mapping (only if new)
          if (!existingProfile?.referralCode) {
            batch.set(referralRef, {
              userId: userId,
              createdAt: new Date().toISOString(),
            });
          }
          
          // Commit all writes in single operation
          await batch.commit();
          break;
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }

      // Save to localStorage for immediate use
      try {
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            ...profileData,
            searchRadius: 50,
          })
        );
        localStorage.setItem("onboardingCompleted", "true");
      } catch (error) {
        console.warn("localStorage save failed:", error);
      }
    } catch (error) {
      console.error("Failed to complete student onboarding:", error);
      throw new Error(
        `Onboarding failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async completeRecruiterOnboarding(
    userId: string,
    data: RecruiterOnboardingData,
    existingProfile?: any
  ): Promise<void> {
    try {
      const profileData = {
        uniqueUserId: existingProfile?.uniqueUserId || generateUniqueUserId(),
        email: existingProfile?.email,
        displayName: existingProfile?.displayName,
        company: data.company,
        position: data.position,
        companySize: data.companySize,
        industry: data.industry,
        location: data.location,
        website: data.website,
        phone: data.phone,
        description: data.description,
        hiringNeeds: data.hiringNeeds,
        companyLogo: data.companyLogo,
        socialLinks: data.socialLinks,
        verificationStatus: "pending",
        onboardingCompleted: true,
        userType: "recruiter",
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firebase
      const docRef = doc(db, "recruiters", userId);
      await setDoc(docRef, profileData, { merge: true });

      // Save to localStorage
      localStorage.setItem("recruiterProfile", JSON.stringify(profileData));
      localStorage.setItem("onboardingCompleted", "true");
    } catch (error) {
      console.error("Failed to complete recruiter onboarding:", error);
      throw error;
    }
  }

  static async getExistingProfile(
    userId: string,
    userType: "student" | "recruiter"
  ) {
    try {
      const collection = userType === "recruiter" ? "recruiters" : "profiles";
      const docRef = doc(db, collection, userId);
      const docSnap = await getDoc(docRef);

      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error getting existing profile:", error);
      return null;
    }
  }

  private static async processReferralCode(
    referralCode: string,
    username: string,
    userId: string
  ) {
    try {
      const code = referralCode.toUpperCase();
      const referrerQuery = await getDoc(doc(db, "referrals", code));

      if (referrerQuery.exists()) {
        const referrerUid = referrerQuery.data().userId;

        // Update referrer points
        await updateDoc(doc(db, "profiles", referrerUid), {
          points: increment(100),
          referralEarnings: increment(100),
          lastReferralAt: new Date().toISOString(),
        });

        // Create notification for referrer
        await setDoc(doc(db, "notifications", `${referrerUid}_${Date.now()}`), {
          userId: referrerUid,
          type: "referral_reward",
          title: "Referral Reward Earned!",
          message: `You earned 100 points for referring ${username}!`,
          points: 100,
          createdAt: new Date().toISOString(),
          read: false,
        });

        return { success: true, code };
      } else {
        return { success: false, error: "Invalid referral code" };
      }
    } catch (error) {
      console.error("Referral processing failed:", error);
      return { success: false, error: "Failed to process referral" };
    }
  }

  private static generateUsername(userId: string): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "User_";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static generateReferralCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static validateStudentStep(
    step: number,
    data: Partial<StudentOnboardingData>
  ): boolean {
    switch (step) {
      case 1:
        return true; // Username is optional
      case 2:
        return !!(data.location?.city && data.desiredLocation?.city);
      case 3:
        return !!(data.sectors && data.sectors.length > 0);
      case 4:
        return true; // Skills are optional
      case 5:
        return true; // Education is optional
      case 6:
        return true; // Referral code is optional
      default:
        return false;
    }
  }

  static validateRecruiterStep(
    step: number,
    data: Partial<RecruiterOnboardingData>
  ): boolean {
    switch (step) {
      case 1:
        return !!(data.company && data.position);
      case 2:
        return !!(data.industry && data.location);
      case 3:
        return true; // Additional info is optional
      default:
        return false;
    }
  }
}

export default OnboardingService;
