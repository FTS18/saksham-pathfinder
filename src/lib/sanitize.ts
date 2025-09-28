export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  const allowedProtocols = /^(https?:|mailto:)/i;
  
  if (!allowedProtocols.test(url)) {
    return '';
  }
  
  return url.replace(/[<>"']/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateInternship = (data: any): boolean => {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.company === 'string' &&
    Array.isArray(data.required_skills)
  );
};

export const sanitizeInternshipData = (internships: any[]): any[] => {
  return internships
    .filter(validateInternship)
    .map(internship => ({
      ...internship,
      title: sanitizeText(internship.title?.slice(0, 200) || ''),
      company: sanitizeText(internship.company?.slice(0, 100) || ''),
      description: sanitizeText(internship.description?.slice(0, 1000) || ''),
      required_skills: (internship.required_skills || []).slice(0, 20),
    }));
};