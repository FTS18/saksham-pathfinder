import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

const PROFILE_FIELDS = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "bio", label: "Bio" },
  { key: "skills", label: "Skills" },
  { key: "interests", label: "Interests" },
  { key: "education", label: "Education" },
  { key: "resumeURL", label: "Resume" },
];

const calcProfileCompletion = (profile: Record<string, any>) => {
  const done = PROFILE_FIELDS.filter(({ key }) => {
    const v = profile[key];
    if (!v) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim().length > 0;
  });
  return {
    pct: Math.round((done.length / PROFILE_FIELDS.length) * 100),
    missing: PROFILE_FIELDS.filter(({ key }) => {
      const v = profile[key];
      if (!v) return true;
      if (Array.isArray(v)) return v.length === 0;
      return String(v).trim().length === 0;
    }).map(f => f.label),
  };
};

/** Shared hook � caches Firestore profile for 5 min, used across all dashboard pages. */
export const useProfileData = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = {}, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return {};
      const local = (() => { try { return JSON.parse(localStorage.getItem("userProfile") || "{}"); } catch { return {}; } })();
      try {
        const snap = await getDoc(doc(db, "profiles", currentUser.uid));
        return snap.exists() ? { ...local, ...snap.data() } : local;
      } catch { return local; }
    },
    enabled: !!currentUser?.uid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { pct: profilePct, missing: profileMissing } = useMemo(
    () => calcProfileCompletion({ ...profile, email: currentUser?.email }),
    [profile, currentUser?.email]
  );

  return {
    profile: profile as Record<string, any>,
    profileLoading,
    profilePct,
    profileMissing,
    points: (profile as any).points ?? 0,
    badges: (profile as any).badges ?? [] as string[],
    skills: (profile as any).skills ?? [] as string[],
    sectors: (profile as any).sectors ?? [] as string[],
    refetchProfile,
    invalidateProfile: () => queryClient.invalidateQueries({ queryKey: ["profile", currentUser?.uid] }),
  };
};
