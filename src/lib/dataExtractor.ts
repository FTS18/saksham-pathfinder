// Helper function to fetch internships from Firebase or JSON fallback
export const fetchInternships = async (): Promise<any[]> => {
  try {
    // Try Firebase first
    let firebaseError: any = null;
    try {
      const { getAllInternships } = await import(
        "@/services/internshipService"
      );
      const data = await getAllInternships();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      firebaseError = err;
      console.warn("Firebase unavailable or returned empty data:", err);
    }

    // Fallback to JSON file
    try {
      const response = await fetch("/internships.json");
      if (!response.ok) throw new Error("Failed to fetch internships.json");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (jsonError) {
      console.warn("JSON fallback failed:", jsonError);
    }

    // If we get here, data loading failed - but don't return empty, let caller know
    if (firebaseError) {
      // Firebase quota or error - this is expected during optimization
      console.warn("Data unavailable (Firebase quota likely exceeded)");
    }
    return [];
  } catch (error) {
    console.error("Critical error fetching internships:", error);
    return [];
  }
};

// Extract skills, sectors, and cities from internships.json
export const extractAllSkills = async (): Promise<string[]> => {
  try {
    const internships = await fetchInternships();

    const skillsSet = new Set<string>();

    const maxInternships = Math.min(internships.length, 10000);
    for (let i = 0; i < maxInternships; i++) {
      const internship = internships[i];
      if (
        internship?.required_skills &&
        Array.isArray(internship.required_skills)
      ) {
        const maxSkills = Math.min(internship.required_skills.length, 50);
        for (let j = 0; j < maxSkills; j++) {
          const skill = internship.required_skills[j];
          if (typeof skill === "string") {
            skillsSet.add(skill.trim());
          }
        }
      }
    }

    return Array.from(skillsSet).sort();
  } catch (error) {
    console.warn("Failed to extract skills data");
    // Fallback to default skills
    return [
      "Python",
      "JavaScript",
      "React",
      "HTML",
      "CSS",
      "Java",
      "C++",
      "SQL",
      "AWS",
      "Node.js",
    ];
  }
};

export const extractAllSectors = async (): Promise<string[]> => {
  try {
    const internships = await fetchInternships();

    const sectorsSet = new Set<string>();

    const maxInternships = Math.min(internships.length, 10000);
    for (let i = 0; i < maxInternships; i++) {
      const internship = internships[i];
      if (internship?.sector_tags && Array.isArray(internship.sector_tags)) {
        const maxSectors = Math.min(internship.sector_tags.length, 20);
        for (let j = 0; j < maxSectors; j++) {
          const sector = internship.sector_tags[j];
          if (typeof sector === "string") {
            sectorsSet.add(sector.trim());
          }
        }
      }
    }

    return Array.from(sectorsSet).sort();
  } catch (error) {
    console.warn("Failed to extract sectors data");
    // Fallback to default sectors
    return ["Technology", "Finance", "Healthcare", "Education", "Marketing"];
  }
};

export const extractSkillsBySector = async (): Promise<
  Record<string, string[]>
> => {
  try {
    const internships = await fetchInternships();

    const skillsBySector: Record<string, Set<string>> = {};

    const maxInternships = Math.min(internships.length, 10000);
    for (let i = 0; i < maxInternships; i++) {
      const internship = internships[i];
      const sectors = internship?.sector_tags || [];
      const skills = internship?.required_skills || [];

      if (Array.isArray(sectors) && Array.isArray(skills)) {
        const maxSectors = Math.min(sectors.length, 20);
        for (let j = 0; j < maxSectors; j++) {
          const sector = sectors[j];
          if (typeof sector === "string") {
            if (!skillsBySector[sector]) {
              skillsBySector[sector] = new Set();
            }
            const maxSkills = Math.min(skills.length, 50);
            for (let k = 0; k < maxSkills; k++) {
              const skill = skills[k];
              if (typeof skill === "string") {
                skillsBySector[sector].add(skill.trim());
              }
            }
          }
        }
      }
    }

    // Convert Sets to Arrays
    const result: Record<string, string[]> = {};
    const sectorKeys = Object.keys(skillsBySector);
    const maxSectors = Math.min(sectorKeys.length, 100);
    for (let i = 0; i < maxSectors; i++) {
      const sector = sectorKeys[i];
      result[sector] = Array.from(skillsBySector[sector]).sort();
    }

    return result;
  } catch (error) {
    console.warn("Failed to extract skills by sector data");
    return {};
  }
};

export const extractTopCities = async (): Promise<string[]> => {
  try {
    const internships = await fetchInternships();

    const citiesCount: Record<string, number> = {};

    const maxInternships = Math.min(internships.length, 10000);
    for (let i = 0; i < maxInternships; i++) {
      const internship = internships[i];
      const location = internship?.location || "";
      if (typeof location === "string" && location.trim()) {
        citiesCount[location] = (citiesCount[location] || 0) + 1;
      }
    }

    // Sort by count and return top cities
    const sortedCities = Object.entries(citiesCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([city]) => city);

    return ["Home", ...sortedCities];
  } catch (error) {
    console.warn("Failed to extract cities data");
    return [
      "Home",
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Chennai",
      "Pune",
      "Kolkata",
    ];
  }
};
