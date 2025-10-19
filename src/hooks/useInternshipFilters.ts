import { useState, useMemo } from "react";
import { Internship, FilterState } from "@/types";

export const useInternshipFilters = (internships: Internship[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sector: "all",
    location: "all",
    workMode: "all",
    education: "all",
    minStipend: "all",
    minAiScore: "all",
    sortBy: "ai-recommended",
    selectedSectors: [],
    selectedSkills: [],
  });

  const filteredAndSortedInternships = useMemo(() => {
    let filtered = [...internships];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (internship) =>
          internship.title.toLowerCase().includes(searchLower) ||
          internship.company.toLowerCase().includes(searchLower) ||
          (internship.required_skills || []).some((skill) =>
            skill.toLowerCase().includes(searchLower)
          ) ||
          (internship.sector_tags || []).some((sector) =>
            sector.toLowerCase().includes(searchLower)
          ) ||
          (typeof internship.location === "string"
            ? internship.location
            : internship.location?.city || ""
          )
            .toLowerCase()
            .includes(searchLower)
      );
    }

    // Multi-sector filter
    if (filters.selectedSectors && filters.selectedSectors.length > 0) {
      filtered = filtered.filter((internship) =>
        (internship.sector_tags || []).some((tag) =>
          filters.selectedSectors!.includes(tag)
        )
      );
    } else if (filters.sector && filters.sector !== "all") {
      filtered = filtered.filter((internship) =>
        (internship.sector_tags || []).includes(filters.sector)
      );
    }

    // Multi-skills filter
    if (filters.selectedSkills && filters.selectedSkills.length > 0) {
      filtered = filtered.filter((internship) =>
        (internship.required_skills || []).some((skill) =>
          filters.selectedSkills!.includes(skill)
        )
      );
    }

    // Location filter
    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter((internship) => {
        const internshipLocation =
          typeof internship.location === "string"
            ? internship.location
            : internship.location?.city || "";
        return internshipLocation
          .toLowerCase()
          .includes(filters.location.toLowerCase());
      });
    }

    // Work mode filter
    if (filters.workMode && filters.workMode !== "all") {
      filtered = filtered.filter(
        (internship) => internship.work_mode === filters.workMode
      );
    }

    // Education filter
    if (filters.education && filters.education !== "all") {
      filtered = filtered.filter((internship) =>
        (internship.preferred_education_levels || []).includes(
          filters.education
        )
      );
    }

    // Min stipend filter
    if (filters.minStipend && filters.minStipend !== "all") {
      const minAmount = parseInt(filters.minStipend);
      filtered = filtered.filter((internship) => {
        const stipendAmount = parseInt(
          internship.stipend.replace(/[^\d]/g, "")
        );
        return stipendAmount >= minAmount;
      });
    }

    // Note: AI Score filter not applicable for regular internships without scores

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "ai-recommended":
        case "recent":
          return (
            new Date(b.posted_date || "").getTime() -
            new Date(a.posted_date || "").getTime()
          );
        case "stipend-high":
          const aStipend = parseInt(a.stipend.replace(/[^\d]/g, ""));
          const bStipend = parseInt(b.stipend.replace(/[^\d]/g, ""));
          return bStipend - aStipend;
        case "stipend-low":
          const aStipendLow = parseInt(a.stipend.replace(/[^\d]/g, ""));
          const bStipendLow = parseInt(b.stipend.replace(/[^\d]/g, ""));
          return aStipendLow - bStipendLow;
        case "company":
          return a.company.localeCompare(b.company);
        case "deadline":
          if (!a.application_deadline && !b.application_deadline) return 0;
          if (!a.application_deadline) return 1;
          if (!b.application_deadline) return -1;
          return (
            new Date(a.application_deadline).getTime() -
            new Date(b.application_deadline).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [internships, filters]);

  // Function to filter recommendations (items with internship property)
  const filterRecommendations = (recommendations: any[]) => {
    let filtered = [...recommendations];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((item) => {
        const internship = item.internship;
        return (
          internship.title.toLowerCase().includes(searchLower) ||
          internship.company.toLowerCase().includes(searchLower) ||
          (internship.required_skills || []).some((skill) =>
            skill.toLowerCase().includes(searchLower)
          ) ||
          (internship.sector_tags || []).some((sector) =>
            sector.toLowerCase().includes(searchLower)
          ) ||
          (typeof internship.location === "string"
            ? internship.location
            : internship.location?.city || ""
          )
            .toLowerCase()
            .includes(searchLower)
        );
      });
    }

    // Multi-sector filter
    if (filters.selectedSectors && filters.selectedSectors.length > 0) {
      filtered = filtered.filter((item) =>
        (item.internship.sector_tags || []).some((tag) =>
          filters.selectedSectors!.includes(tag)
        )
      );
    } else if (filters.sector && filters.sector !== "all") {
      filtered = filtered.filter((item) =>
        (item.internship.sector_tags || []).includes(filters.sector)
      );
    }

    // Multi-skills filter
    if (filters.selectedSkills && filters.selectedSkills.length > 0) {
      filtered = filtered.filter((item) =>
        (item.internship.required_skills || []).some((skill) =>
          filters.selectedSkills!.includes(skill)
        )
      );
    }

    // Location filter
    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter((item) => {
        const internshipLocation =
          typeof item.internship.location === "string"
            ? item.internship.location
            : item.internship.location?.city || "";
        return internshipLocation
          .toLowerCase()
          .includes(filters.location.toLowerCase());
      });
    }

    // Work mode filter
    if (filters.workMode && filters.workMode !== "all") {
      filtered = filtered.filter(
        (item) => item.internship.work_mode === filters.workMode
      );
    }

    // Education filter
    if (filters.education && filters.education !== "all") {
      filtered = filtered.filter((item) =>
        (item.internship.preferred_education_levels || []).includes(
          filters.education
        )
      );
    }

    // Min stipend filter
    if (filters.minStipend && filters.minStipend !== "all") {
      const minAmount = parseInt(filters.minStipend);
      filtered = filtered.filter((item) => {
        const stipendAmount = parseInt(
          item.internship.stipend.replace(/[^\d]/g, "")
        );
        return stipendAmount >= minAmount;
      });
    }

    // AI Score filter
    if (filters.minAiScore && filters.minAiScore !== "all") {
      const minScore = parseInt(filters.minAiScore);
      filtered = filtered.filter((item) => item.score >= minScore);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "ai-recommended":
          // Always sort by AI score first for recommendations
          if (b.score !== a.score) return b.score - a.score;
          // Secondary sort by stipend if scores are equal
          const aStipendAI = parseInt(
            a.internship.stipend.replace(/[^\d]/g, "")
          );
          const bStipendAI = parseInt(
            b.internship.stipend.replace(/[^\d]/g, "")
          );
          return bStipendAI - aStipendAI;
        case "recent":
          return (
            new Date(b.internship.posted_date || "").getTime() -
            new Date(a.internship.posted_date || "").getTime()
          );
        case "stipend-high":
          const aStipend = parseInt(a.internship.stipend.replace(/[^\d]/g, ""));
          const bStipend = parseInt(b.internship.stipend.replace(/[^\d]/g, ""));
          return bStipend - aStipend;
        case "stipend-low":
          const aStipendLow = parseInt(
            a.internship.stipend.replace(/[^\d]/g, "")
          );
          const bStipendLow = parseInt(
            b.internship.stipend.replace(/[^\d]/g, "")
          );
          return aStipendLow - bStipendLow;
        case "company":
          return a.internship.company.localeCompare(b.internship.company);
        case "deadline":
          if (
            !a.internship.application_deadline &&
            !b.internship.application_deadline
          )
            return 0;
          if (!a.internship.application_deadline) return 1;
          if (!b.internship.application_deadline) return -1;
          return (
            new Date(a.internship.application_deadline).getTime() -
            new Date(b.internship.application_deadline).getTime()
          );
        default:
          // Always prioritize AI score for recommendations
          return b.score - a.score;
      }
    });

    return filtered;
  };

  // Extract unique values for filter options
  const sectors = useMemo(() => {
    const allSectors = new Set<string>();
    internships.forEach((internship) => {
      internship.sector_tags.forEach((sector) => allSectors.add(sector));
    });
    return Array.from(allSectors).sort();
  }, [internships]);

  const locations = useMemo(() => {
    const allLocations = new Set<string>();
    internships.forEach((internship) => {
      const location =
        typeof internship.location === "string"
          ? internship.location
          : internship.location?.city || "Multiple Cities";
      if (location !== "Multiple Cities") {
        allLocations.add(location);
      }
    });
    return Array.from(allLocations).sort();
  }, [internships]);

  return {
    filters,
    setFilters,
    filteredInternships: filteredAndSortedInternships,
    filterRecommendations,
    sectors,
    locations,
  };
};
