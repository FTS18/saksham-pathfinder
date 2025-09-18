// Extract cities and skills from internships.json

export const extractTopCities = async () => {
  try {
    const response = await fetch('/internships.json');
    const internships = await response.json();
    
    const cityCount: Record<string, number> = {};
    
    internships.forEach((internship: any) => {
      const location = internship.location;
      if (location && location !== 'Multiple Cities' && location !== 'Remote') {
        cityCount[location] = (cityCount[location] || 0) + 1;
      }
    });
    
    const sortedCities = Object.entries(cityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 9)
      .map(([city]) => city);
    
    return [...sortedCities, 'Home'];
  } catch (error) {
    console.error('Error extracting cities:', error);
    return ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida', 'Kolkata', 'Home'];
  }
};

export const extractAllSkills = async () => {
  try {
    const response = await fetch('/internships.json');
    const internships = await response.json();
    
    const skillsSet = new Set<string>();
    
    internships.forEach((internship: any) => {
      if (internship.required_skills && Array.isArray(internship.required_skills)) {
        internship.required_skills.forEach((skill: string) => {
          skillsSet.add(skill);
        });
      }
    });
    
    return Array.from(skillsSet).sort();
  } catch (error) {
    console.error('Error extracting skills:', error);
    return [];
  }
};

export const extractAllSectors = async () => {
  try {
    const response = await fetch('/internships.json');
    const internships = await response.json();
    
    const sectorsSet = new Set<string>();
    
    internships.forEach((internship: any) => {
      if (internship.sector_tags && Array.isArray(internship.sector_tags)) {
        internship.sector_tags.forEach((sector: string) => {
          sectorsSet.add(sector);
        });
      }
    });
    
    return Array.from(sectorsSet).sort();
  } catch (error) {
    console.error('Error extracting sectors:', error);
    return ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Consulting'];
  }
};