interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  location: string | { city: string; state?: string };
  desiredLocation?: string | { city: string; state?: string };
  education: string;
  skills: string[];
  interests: string[];
  minStipend?: number;
  maxStipend?: number;
  preferredWorkMode?: string;
  searchRadius?: number;
  bio?: string;
}

interface FilterState {
  search: string;
  sector: string;
  location: string;
  workMode: string;
  education: string;
  minStipend: string;
  sortBy: string;
  selectedSectors?: string[];
  selectedSkills?: string[];
}

export interface SmartFilterOptions {
  prioritizeHighStipend?: boolean;
  includeRemoteWork?: boolean;
  strictSkillMatching?: boolean;
  locationRadius?: "strict" | "nearby" | "regional" | "any";
}

export class SmartFilterService {
  /**
   * Generate smart filters based on user profile using AI algorithm logic
   */
  static generateSmartFilters(
    profile: ProfileData,
    options: SmartFilterOptions = {}
  ): FilterState {
    const {
      prioritizeHighStipend = true,
      includeRemoteWork = true,
      strictSkillMatching = false,
      locationRadius = "nearby",
    } = options;

    // Base filters
    const smartFilters: FilterState = {
      search: "",
      sector: "all",
      location: "all",
      workMode: "all",
      education: profile.education || "all",
      minStipend: "all",
      sortBy: "ai-recommended",
      selectedSectors: [],
      selectedSkills: [],
    };

    // Apply sector preferences (interests)
    if (profile.interests && profile.interests.length > 0) {
      smartFilters.selectedSectors = [...profile.interests];
    }

    // Apply skill preferences
    if (profile.skills && profile.skills.length > 0) {
      if (strictSkillMatching) {
        // Only show internships that match user's skills
        smartFilters.selectedSkills = [...profile.skills];
      } else {
        // Show top skills for broader matching
        smartFilters.selectedSkills = profile.skills.slice(0, 5);
      }
    }

    // Apply location preferences
    if (profile.desiredLocation || profile.location) {
      const userLocation = profile.desiredLocation || profile.location;
      const locationString =
        typeof userLocation === "string"
          ? userLocation
          : userLocation?.city || "";

      switch (locationRadius) {
        case "strict":
          smartFilters.location = locationString;
          break;
        case "nearby":
        case "regional":
          // Let the filtering algorithm handle proximity
          smartFilters.location = "all";
          break;
        case "any":
          smartFilters.location = "all";
          if (includeRemoteWork) {
            smartFilters.workMode = "all"; // Include remote options
          }
          break;
      }
    }

    // Apply stipend preferences
    if (profile.minStipend && profile.minStipend > 0) {
      smartFilters.minStipend = profile.minStipend.toString();
    } else if (prioritizeHighStipend) {
      // Default to 12k+ for better quality internships
      smartFilters.minStipend = "12000";
    }

    // Set appropriate sorting
    if (prioritizeHighStipend) {
      smartFilters.sortBy = "ai-recommended"; // AI considers stipend in scoring
    } else {
      smartFilters.sortBy = "ai-recommended";
    }

    return smartFilters;
  }

  /**
   * Generate preset filter configurations for different use cases
   */
  static getPresetFilters(
    preset:
      | "high-paying"
      | "remote-friendly"
      | "skill-focused"
      | "location-flexible"
  ): Partial<FilterState> {
    switch (preset) {
      case "high-paying":
        return {
          minStipend: "15000",
          sortBy: "stipend-high",
          workMode: "all",
        };

      case "remote-friendly":
        return {
          workMode: "Remote",
          location: "all",
          sortBy: "ai-recommended",
        };

      case "skill-focused":
        return {
          sortBy: "ai-recommended",
          minStipend: "10000",
        };

      case "location-flexible":
        return {
          location: "all",
          workMode: "all",
          sortBy: "ai-recommended",
        };

      default:
        return {};
    }
  }

  /**
   * Calculate filter match score for analytics
   */
  static calculateFilterMatchScore(
    profile: ProfileData,
    appliedFilters: FilterState
  ): number {
    let score = 0;
    let maxScore = 0;

    // Sector matching
    if (profile.interests && profile.interests.length > 0) {
      maxScore += 30;
      if (
        appliedFilters.selectedSectors &&
        appliedFilters.selectedSectors.length > 0
      ) {
        const matchedSectors = profile.interests.filter((interest) =>
          appliedFilters.selectedSectors!.includes(interest)
        );
        score += (matchedSectors.length / profile.interests.length) * 30;
      }
    }

    // Skill matching
    if (profile.skills && profile.skills.length > 0) {
      maxScore += 40;
      if (
        appliedFilters.selectedSkills &&
        appliedFilters.selectedSkills.length > 0
      ) {
        const matchedSkills = profile.skills.filter((skill) =>
          appliedFilters.selectedSkills!.includes(skill)
        );
        score += (matchedSkills.length / profile.skills.length) * 40;
      }
    }

    // Location matching
    if (profile.desiredLocation || profile.location) {
      maxScore += 20;
      const userLocation = profile.desiredLocation || profile.location;
      const locationString =
        typeof userLocation === "string"
          ? userLocation
          : userLocation?.city || "";

      if (appliedFilters.location === locationString) {
        score += 20;
      } else if (appliedFilters.location === "all") {
        score += 10; // Partial credit for flexibility
      }
    }

    // Stipend matching
    if (profile.minStipend && profile.minStipend > 0) {
      maxScore += 10;
      if (appliedFilters.minStipend !== "all") {
        const filterStipend = parseInt(appliedFilters.minStipend);
        if (filterStipend >= profile.minStipend) {
          score += 10;
        } else {
          score += 5; // Partial credit
        }
      }
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /**
   * Get smart filter suggestions based on current results
   */
  static getSuggestions(
    profile: ProfileData,
    currentFilters: FilterState,
    resultCount: number
  ): Array<{ label: string; filters: Partial<FilterState>; reason: string }> {
    const suggestions = [];

    // If too few results, suggest broadening
    if (resultCount < 5) {
      if (
        currentFilters.selectedSkills &&
        currentFilters.selectedSkills.length > 3
      ) {
        suggestions.push({
          label: "Broaden Skills",
          filters: {
            selectedSkills: currentFilters.selectedSkills.slice(0, 3),
          },
          reason: "Show more opportunities by reducing skill requirements",
        });
      }

      if (
        currentFilters.minStipend !== "all" &&
        parseInt(currentFilters.minStipend) > 10000
      ) {
        suggestions.push({
          label: "Lower Stipend Filter",
          filters: { minStipend: "8000" },
          reason: "Include more opportunities with lower stipend requirements",
        });
      }

      if (currentFilters.location !== "all") {
        suggestions.push({
          label: "Include All Locations",
          filters: { location: "all" },
          reason: "Expand search to all locations including remote work",
        });
      }
    }

    // If too many results, suggest narrowing
    if (resultCount > 50) {
      if (
        profile.skills &&
        profile.skills.length > 0 &&
        (!currentFilters.selectedSkills ||
          currentFilters.selectedSkills.length === 0)
      ) {
        suggestions.push({
          label: "Apply Your Skills",
          filters: { selectedSkills: profile.skills.slice(0, 5) },
          reason: "Focus on internships matching your skills",
        });
      }

      if (currentFilters.minStipend === "all") {
        suggestions.push({
          label: "High-Paying Only",
          filters: { minStipend: "15000" },
          reason: "Show only premium internships with ₹15,000+ stipend",
        });
      }
    }

    return suggestions;
  }
}
