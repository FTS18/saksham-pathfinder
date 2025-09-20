// Extract skills, sectors, and cities from internships.json
export const extractAllSkills = async (): Promise<string[]> => {
  try {
    const response = await fetch('/internships.json');
    const internships = await response.json();
    
    const skillsSet = new Set<string>();
    
    internships.forEach((internship: any) => {
      if (internship.required_skills) {
        internship.required_skills.forEach((skill: string) => {
          skillsSet.add(skill.trim());
        });
      }
    });
    
    return Array.from(skillsSet).sort();
  } catch (error) {
    console.error('Error extracting skills:', error);
    // Fallback to default skills
    return ['Python', 'JavaScript', 'React', 'HTML', 'CSS', 'Java', 'C++', 'SQL', 'AWS', 'Node.js'];
  }
};

export const extractAllSectors = async (): Promise<string[]> => {
  try {
    const response = await fetch('/internships.json');
    const internships = await response.json();
    
    const sectorsSet = new Set<string>();
    
    internships.forEach((internship: any) => {
      if (internship.sector_tags) {
        internship.sector_tags.forEach((sector: string) => {
          sectorsSet.add(sector.trim());
        });
      }
    });
    
    return Array.from(sectorsSet).sort();
  } catch (error) {
    console.error('Error extracting sectors:', error);
    // Fallback to default sectors
    return ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing'];
  }
};

export const extractSkillsBySector = async (): Promise<Record<string, string[]>> => {
  try {
    const response = await fetch('/internships.json');
    const internships = await response.json();
    
    const skillsBySector: Record<string, Set<string>> = {};
    
    internships.forEach((internship: any) => {
      const sectors = internship.sector_tags || [];
      const skills = internship.required_skills || [];
      
      sectors.forEach((sector: string) => {
        if (!skillsBySector[sector]) {
          skillsBySector[sector] = new Set();
        }
        skills.forEach((skill: string) => {
          skillsBySector[sector].add(skill.trim());
        });
      });
    });
    
    // Convert Sets to Arrays
    const result: Record<string, string[]> = {};
    Object.keys(skillsBySector).forEach(sector => {
      result[sector] = Array.from(skillsBySector[sector]).sort();
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting skills by sector:', error);
    return {};
  }
};

export const extractTopCities = async (): Promise<string[]> => {
  try {
    const response = await fetch('/internships.json');
    const internships = await response.json();
    
    const citiesCount: Record<string, number> = {};
    
    internships.forEach((internship: any) => {
      const location = internship.location || '';
      if (location) {
        citiesCount[location] = (citiesCount[location] || 0) + 1;
      }
    });
    
    // Sort by count and return top cities
    const sortedCities = Object.entries(citiesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([city]) => city);
    
    return ['Home', ...sortedCities];
  } catch (error) {
    console.error('Error extracting cities:', error);
    return ['Home', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];
  }
};