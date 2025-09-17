const fs = require('fs');

// Read the internships file
const internships = JSON.parse(fs.readFileSync('./public/internships.json', 'utf8'));

console.log('Verifying skills in internships...');

let missingSkills = 0;
let emptySkills = 0;

internships.forEach((internship, index) => {
  if (!internship.required_skills) {
    console.log(`Missing required_skills for internship ${index + 1}: ${internship.role} at ${internship.company}`);
    missingSkills++;
  } else if (internship.required_skills.length === 0) {
    console.log(`Empty required_skills for internship ${index + 1}: ${internship.role} at ${internship.company}`);
    emptySkills++;
  }
});

console.log(`\nSummary:`);
console.log(`Total internships: ${internships.length}`);
console.log(`Missing required_skills: ${missingSkills}`);
console.log(`Empty required_skills: ${emptySkills}`);
console.log(`Valid internships with skills: ${internships.length - missingSkills - emptySkills}`);

// Get all unique skills
const allSkills = new Set();
internships.forEach(internship => {
  if (internship.required_skills) {
    internship.required_skills.forEach(skill => allSkills.add(skill));
  }
});

console.log(`\nUnique skills found: ${allSkills.size}`);
console.log('Skills:', Array.from(allSkills).sort().join(', '));