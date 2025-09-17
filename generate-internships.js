import fs from 'fs';

// Big tech companies (30% - high paying)
const bigTechCompanies = [
  { name: "Google", stipend: "₹80,000-₹1,20,000/month" },
  { name: "Microsoft", stipend: "₹75,000-₹1,10,000/month" },
  { name: "Amazon", stipend: "₹60,000-₹95,000/month" },
  { name: "Meta", stipend: "₹85,000-₹1,15,000/month" },
  { name: "Apple", stipend: "₹90,000-₹1,25,000/month" },
  { name: "Netflix", stipend: "₹95,000-₹1,30,000/month" },
  { name: "Adobe", stipend: "₹65,000-₹90,000/month" },
  { name: "Salesforce", stipend: "₹70,000-₹95,000/month" },
  { name: "Intel", stipend: "₹65,000-₹85,000/month" },
  { name: "Nvidia", stipend: "₹70,000-₹95,000/month" },
  { name: "Goldman Sachs", stipend: "₹90,000-₹1,50,000/month" },
  { name: "Morgan Stanley", stipend: "₹85,000-₹1,20,000/month" },
  { name: "J.P. Morgan", stipend: "₹80,000-₹1,15,000/month" },
  { name: "BlackRock", stipend: "₹75,000-₹1,10,000/month" },
  { name: "Citadel", stipend: "₹1,50,000-₹2,50,000/month" }
];

// Small companies (70% - low paying)
const smallCompanies = [
  "TechStart Solutions", "LocalTech Hub", "StartupXYZ", "CodeCraft Studios", 
  "FinanceFirst", "DesignHub", "TechNova", "SmallBiz Solutions", "ElectroTech",
  "DataMinds", "WebWorks", "FinTech Startup", "LocalDesign Co", "TechSupport Inc",
  "StartupHub", "CodeAcademy", "LocalTech Solutions", "SmallBiz Tech", "TechCorp",
  "DesignStudio", "LocalFinance", "TechStartup Inc", "DevCorp", "WebSolutions",
  "DataFlow", "CodeBase", "TechMind", "StartupLab", "DigitalCraft", "InnovateTech",
  "SmartSolutions", "TechVenture", "CodeFactory", "WebCraft", "DataTech",
  "SoftwareLab", "TechBridge", "CodeStudio", "WebTech", "DataCorp",
  "TechFlow", "CodeWorks", "WebLab", "DataStudio", "SoftwareCorp",
  "TechCraft", "CodeTech", "WebFlow", "DataWorks", "SoftwareStudio"
];

const roles = {
  "Tech": [
    "Software Developer Intern", "Frontend Developer Intern", "Backend Developer Intern",
    "Full Stack Developer Intern", "Mobile App Developer Intern", "Web Developer Intern",
    "Python Developer Intern", "Java Developer Intern", "React Developer Intern",
    "Node.js Developer Intern", "Database Developer Intern", "DevOps Intern",
    "QA Tester Intern", "Technical Support Intern", "IT Support Intern",
    "System Admin Intern", "Network Admin Intern", "Cybersecurity Intern"
  ],
  "AI/ML": [
    "Data Science Intern", "Machine Learning Intern", "AI Research Intern",
    "Data Analyst Intern", "Business Intelligence Intern", "Data Engineer Intern"
  ],
  "Finance": [
    "Financial Analyst Intern", "Investment Banking Intern", "Risk Management Intern",
    "Accounting Intern", "Finance Intern", "Credit Analyst Intern",
    "Portfolio Management Intern", "Trading Intern", "Wealth Management Intern"
  ],
  "Electronics": [
    "Circuit Design Intern", "Hardware Engineer Intern", "VLSI Design Intern",
    "Embedded Systems Intern", "Electronics Engineer Intern", "PCB Design Intern"
  ],
  "Designing": [
    "UI/UX Designer Intern", "Graphic Designer Intern", "Product Designer Intern",
    "Web Designer Intern", "Creative Designer Intern", "Visual Designer Intern"
  ]
};

const skills = {
  "Tech": ["Python", "Java", "JavaScript", "React", "Node.js", "HTML", "CSS", "SQL", "Git"],
  "AI/ML": ["Python", "Machine Learning", "PyTorch", "TensorFlow", "SQL", "Statistics", "R"],
  "Finance": ["Excel", "Financial Modeling", "Valuation", "Bloomberg", "SQL"],
  "Electronics": ["Circuit Design", "Verilog", "VHDL", "Embedded Systems", "C", "C++"],
  "Designing": ["UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator"]
};

const cities = [
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Gurgaon", lat: 28.4595, lng: 77.0266 },
  { name: "Noida", lat: 28.5355, lng: 77.3910 },
  { name: "Indore", lat: 22.7196, lng: 75.8577 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "Patna", lat: 25.5941, lng: 85.1376 },
  { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { name: "Surat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
  { name: "Kochi", lat: 9.9312, lng: 76.2673 },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "Remote", lat: 20.5937, lng: 78.9629 }
];

const educationLevels = ["Class 12th", "Diploma", "Undergraduate", "Postgraduate"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateStipend(isBigTech) {
  if (isBigTech) {
    const amounts = [60000, 70000, 80000, 90000, 100000, 110000, 120000, 150000];
    return `₹${getRandomElement(amounts).toLocaleString()}/month`;
  } else {
    const amounts = [6000, 8000, 10000, 12000, 15000, 18000, 20000, 22000, 24000];
    return `₹${getRandomElement(amounts).toLocaleString()}/month`;
  }
}

function generateInternship(id, isBigTech = false) {
  const sectors = Object.keys(roles);
  const sector = getRandomElement(sectors);
  const role = getRandomElement(roles[sector]);
  const company = isBigTech ? getRandomElement(bigTechCompanies).name : getRandomElement(smallCompanies);
  const location = getRandomElement(cities);
  const requiredSkills = getRandomElements(skills[sector] || skills["Tech"], Math.floor(Math.random() * 3) + 1);
  const educationLevel = getRandomElements(educationLevels, Math.floor(Math.random() * 2) + 1);
  
  return {
    id: id.toString(),
    company,
    role,
    required_skills: requiredSkills,
    preferred_education_levels: educationLevel,
    sector_tags: [sector],
    location: { city: location.name, lat: location.lat, lng: location.lng },
    stipend: generateStipend(isBigTech),
    eligibility_text: `Students pursuing ${educationLevel.join(' or ')} with relevant skills.`,
    apply_link: isBigTech ? `https://${company.toLowerCase().replace(/\s+/g, '')}.com/careers` : "#"
  };
}

// Read existing internships
const existingData = JSON.parse(fs.readFileSync('./public/extended-internships.json', 'utf8'));
let internships = [...existingData];

// Generate remaining internships (220 more to reach 250)
const remaining = 250 - internships.length;
const bigTechCount = Math.floor(remaining * 0.3); // 30% big tech
const smallCompanyCount = remaining - bigTechCount; // 70% small companies

// Add big tech internships
for (let i = 0; i < bigTechCount; i++) {
  internships.push(generateInternship(internships.length + 1, true));
}

// Add small company internships
for (let i = 0; i < smallCompanyCount; i++) {
  internships.push(generateInternship(internships.length + 1, false));
}

// Write to file
fs.writeFileSync('./public/internships.json', JSON.stringify(internships, null, 2));
console.log(`Generated ${internships.length} internships total`);
console.log(`Big tech: ${internships.filter(i => bigTechCompanies.some(b => b.name === i.company)).length}`);
console.log(`Small companies: ${internships.filter(i => !bigTechCompanies.some(b => b.name === i.company)).length}`);