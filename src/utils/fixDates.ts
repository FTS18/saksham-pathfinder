// Fix unrealistic dates in internship data
export const fixInternshipDates = () => {
  const today = new Date('2025-09-21'); // Current date
  
  // Generate realistic dates
  const getRandomPastDate = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo) - 1);
    return date.toISOString().split('T')[0];
  };
  
  const getRandomFutureDate = (daysFromNow: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + Math.floor(Math.random() * daysFromNow) + 15);
    return date.toISOString().split('T')[0];
  };
  
  return {
    getRealisticPostedDate: () => getRandomPastDate(30), // 1-30 days ago
    getRealisticDeadline: () => getRandomFutureDate(45), // 15-60 days from now
  };
};