// Fix unrealistic dates in internship data
export const fixInternshipDates = (internships: any[]) => {
  const today = new Date();
  
  return internships.map(internship => {
    const postedDate = new Date(internship.posted_date);
    const deadline = new Date(internship.application_deadline);
    
    // If posted date is in future, set to recent past
    if (postedDate > today) {
      const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
      internship.posted_date = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    }
    
    // If deadline is in past or too far future, set realistic deadline
    if (deadline < today || deadline.getFullYear() > 2025) {
      const daysFromNow = Math.floor(Math.random() * 45) + 15; // 15-60 days from now
      internship.application_deadline = new Date(today.getTime() + (daysFromNow * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    }
    
    return internship;
  });
};