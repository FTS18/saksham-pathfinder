import { useState, useEffect } from 'react';

const names = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Rohan', 'Ananya', 'Vikram', 'Divya', 'Arjun', 'Kavya'];
const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh'];
const internships = [
  { company: 'Google', stipend: '₹1.2L/month' },
  { company: 'Microsoft', stipend: '₹1L/month' },
  { company: 'Amazon', stipend: '₹80,000/month' },
  { company: 'Flipkart', stipend: '₹50,000/month' },
  { company: 'Zomato', stipend: '₹40,000/month' },
  { company: 'Infosys', stipend: '₹25,000/month' },
  { company: 'TCS', stipend: '₹20,000/month' },
  { company: 'Wipro', stipend: '₹22,000/month' },
  { company: 'HDFC Bank', stipend: '₹30,000/month' },
  { company: 'ICICI Bank', stipend: '₹28,000/month' },
  { company: 'Reliance', stipend: '₹35,000/month' },
  { company: 'Mahindra', stipend: '₹32,000/month' },
  { company: 'Maruti Suzuki', stipend: '₹38,000/month' },
  { company: 'HUL', stipend: '₹45,000/month' },
  { company: 'ITC', stipend: '₹40,000/month' },
  { company: 'Larsen & Toubro', stipend: '₹42,000/month' },
  { company: 'Apollo Hospitals', stipend: '₹30,000/month' },
  { company: 'PwC', stipend: '₹50,000/month' },
  { company: 'Kotak Mahindra', stipend: '₹35,000/month' },
  { company: 'Godrej', stipend: '₹33,000/month' }
];

const shuffleArray = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const SuccessStoriesMarquee = () => {
  const [stories, setStories] = useState<string[]>([]);

  useEffect(() => {
    const shuffledNames = shuffleArray(names);
    const shuffledCities = shuffleArray(cities);
    const shuffledInternships = shuffleArray(internships);
    
    const generatedStories = shuffledInternships.slice(0, 12).map((internship, idx) => {
      const name = shuffledNames[idx % shuffledNames.length];
      const city = shuffledCities[idx % shuffledCities.length];
      const emoji = idx % 2 === 0 ? '🎉' : '🚀';
      return `${emoji} ${name.toUpperCase()} FROM ${city.toUpperCase()} SECURED ${internship.company.toUpperCase()} INTERNSHIP WITH ${internship.stipend} STIPEND!`;
    });
    
    setStories(generatedStories);
    
    const interval = setInterval(() => {
      const newShuffledNames = shuffleArray(names);
      const newShuffledCities = shuffleArray(cities);
      const newShuffledInternships = shuffleArray(internships);
      
      const newStories = newShuffledInternships.slice(0, 12).map((internship, idx) => {
        const name = newShuffledNames[idx % newShuffledNames.length];
        const city = newShuffledCities[idx % newShuffledCities.length];
        const emoji = idx % 2 === 0 ? '🎉' : '🚀';
        return `${emoji} ${name.toUpperCase()} FROM ${city.toUpperCase()} SECURED ${internship.company.toUpperCase()} INTERNSHIP WITH ${internship.stipend} STIPEND!`;
      });
      
      setStories(newStories);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-black py-4 overflow-hidden transition-colors duration-300">
      <div className="whitespace-nowrap animate-marquee-fast">
        {stories.map((story, index) => (
          <span key={index} className="text-sm md:text-base font-racing font-extrabold text-black dark:text-white px-16 transition-colors duration-300">
            {story}
          </span>
        ))}
      </div>
    </div>
  );
};