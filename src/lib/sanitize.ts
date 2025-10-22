export const sanitizeText = (text: string): string => {
  if (!text) return "";

  return text
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return "";

  const allowedProtocols = /^(https?:|mailto:)/i;

  if (!allowedProtocols.test(url)) {
    return "";
  }

  return url.replace(/[<>"']/g, "");
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateInternship = (data: any): boolean => {
  return (
    typeof data === "object" &&
    typeof data.id === "string" &&
    typeof data.title === "string" &&
    typeof data.company === "string" &&
    Array.isArray(data.required_skills)
  );
};

export const sanitizeInternshipData = (internships: any[]): any[] => {
  return internships
    .map((internship, index) => {
      // Ensure every internship has a unique string ID
      let id = internship.id;

      // If id is numeric, convert to string
      if (typeof id === "number") {
        id = String(id);
      }
      // If no id, use pmis_id if available
      else if (!id || typeof id !== "string") {
        id = internship.pmis_id || `internship-${index}`;
      }

      return {
        ...internship,
        id, // Ensure id is always a string
        title: sanitizeText(internship.title?.slice(0, 200) || ""),
        company: sanitizeText(internship.company?.slice(0, 100) || ""),
        description: sanitizeText(internship.description?.slice(0, 1000) || ""),
        required_skills: (internship.required_skills || []).slice(0, 20),
      };
    })
    .filter((internship) => {
      // Only filter for required fields
      return (
        typeof internship.title === "string" &&
        internship.title.length > 0 &&
        typeof internship.company === "string" &&
        internship.company.length > 0 &&
        Array.isArray(internship.required_skills)
      );
    });
};
