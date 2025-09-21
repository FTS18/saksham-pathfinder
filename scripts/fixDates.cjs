const fs = require('fs');
const path = require('path');

const fixDates = () => {
  const filePath = path.join(__dirname, '../public/internships.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const today = new Date('2025-09-21');
  
  const getRandomPastDate = (daysAgo) => {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo) - 1);
    return date.toISOString().split('T')[0];
  };
  
  const getRandomFutureDate = (daysFromNow) => {
    const date = new Date(today);
    date.setDate(date.getDate() + Math.floor(Math.random() * daysFromNow) + 15);
    return date.toISOString().split('T')[0];
  };
  
  const updatedData = data.map(internship => ({
    ...internship,
    posted_date: getRandomPastDate(30),
    application_deadline: getRandomFutureDate(45)
  }));
  
  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
  console.log('Fixed all dates');
};

fixDates();