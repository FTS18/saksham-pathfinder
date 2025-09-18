export interface Country {
  name: string;
  code: string;
  phone: string;
  currency: string;
  states: State[];
}

export interface State {
  name: string;
  cities: string[];
}

export const countries: Country[] = [
  { name: 'India', code: 'IN', phone: '+91', currency: '₹', states: [
    { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kadapa', 'Kakinada', 'Anantapur', 'Eluru', 'Ongole', 'Chittoor', 'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal'] },
    { name: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Bomdila', 'Ziro', 'Along', 'Basar', 'Khonsa', 'Namsai'] },
    { name: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Dhubri', 'North Lakhimpur', 'Goalpara', 'Barpeta', 'Mangaldoi', 'Diphu', 'Haflong', 'Kokrajhar', 'Morigaon', 'Sivasagar', 'Golaghat'] },
    { name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada'] },
    { name: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Mahasamund', 'Dhamtari', 'Chirmiri', 'Janjgir', 'Sakti', 'Tilda Newra', 'Mungeli', 'Manendragarh', 'Naila Janjgir'] },
    { name: 'Delhi', cities: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Janakpuri', 'Lajpat Nagar', 'Karol Bagh', 'Connaught Place', 'Vasant Kunj', 'Saket', 'Pitampura', 'Preet Vihar', 'Laxmi Nagar', 'Mayur Vihar', 'Kalkaji', 'Nehru Place', 'Rajouri Garden', 'Tilak Nagar', 'Paschim Vihar', 'Shalimar Bagh'] },
    { name: 'Goa', cities: ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 'Cuncolim', 'Quepem'] },
    { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Nadiad', 'Morbi', 'Surendranagar', 'Bharuch', 'Vapi', 'Navsari', 'Veraval', 'Porbandar', 'Godhra', 'Bhuj', 'Ankleshwar', 'Botad', 'Palanpur', 'Mehsana', 'Gandhidham', 'Dahod'] },
    { name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Narnaul', 'Pundri', 'Kosli'] },
    { name: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Chamba', 'Kangra', 'Kinnaur', 'Lahaul Spiti', 'Sirmaur', 'Nahan', 'Parwanoo', 'Sundernagar', 'Jogindernagar', 'Nurpur'] },
    { name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda', 'Chaibasa', 'Gumla', 'Dumka', 'Godda', 'Sahebganj', 'Pakur', 'Koderma', 'Chatra', 'Lohardaga'] },
    { name: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag', 'Udupi', 'Robertsonpet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Chikmagalur', 'Gangavati', 'Bagalkot'] },
    { name: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod', 'Kottayam', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Ernakulam', 'Thalassery', 'Kanhangad', 'Payyanur', 'Koyilandy', 'Parappanangadi'] },
    { name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur'] },
    { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambajogai', 'Bhusawal', 'Panvel', 'Badlapur', 'Beed', 'Gondia', 'Satara', 'Barshi', 'Yavatmal', 'Achalpur', 'Osmanabad', 'Nandurbar'] },
    { name: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati', 'Ukhrul', 'Chandel', 'Tamenglong', 'Jiribam', 'Kangpokpi'] },
    { name: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Baghmara', 'Williamnagar', 'Nongstoin', 'Mawkyrwat', 'Resubelpara', 'Ampati'] },
    { name: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Mamit', 'Lawngtlai', 'Saitual', 'Khawzawl'] },
    { name: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Kiphire', 'Longleng', 'Peren', 'Mon'] },
    { name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Balangir', 'Jharsuguda', 'Jeypore', 'Barbil', 'Khordha', 'Sunabeda', 'Rayagada', 'Kendujhar', 'Jagatsinghpur', 'Koraput', 'Paradip'] },
    { name: 'Punjab', cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Faridkot', 'Sunam', 'Jagraon', 'Dhuri', 'Nabha'] },
    { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Baran', 'Dhaulpur', 'Tonk', 'Beawar', 'Hanumangarh', 'Gangapur City', 'Banswara', 'Sawai Madhopur', 'Jhunjhunu', 'Churu', 'Barmer', 'Jaisalmer'] },
    { name: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Jorethang', 'Naya Bazar', 'Rangpo', 'Singtam', 'Pakyong', 'Ravangla'] },
    { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kumarakoil', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 'Vaniyambadi'] },
    { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Bodhan', 'Sangareddy', 'Metpally', 'Zahirabad', 'Medak', 'Siddipet', 'Jangaon', 'Manthani', 'Sadasivpet', 'Husnabad'] },
    { name: 'Tripura', cities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai', 'Pratapgarh', 'Ranir Bazar', 'Sonamura', 'Kumarghat'] },
    { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Mau', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit'] },
    { name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Kotdwar', 'Ramnagar', 'Pithoragarh', 'Jaspur', 'Kichha', 'Sitarganj', 'Manglaur', 'Nainital', 'Mussoorie', 'Tehri', 'Pauri', 'Srinagar', 'Bageshwar'] },
    { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Kharagpur', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bolpur', 'Bangaon', 'Cooch Behar'] },
    { name: 'Andaman and Nicobar Islands', cities: ['Port Blair', 'Bamboo Flat', 'Garacharma', 'Diglipur', 'Rangat', 'Mayabunder', 'Campbell Bay', 'Car Nicobar', 'Hut Bay', 'Little Andaman'] },
    { name: 'Chandigarh', cities: ['Chandigarh', 'Sector 17', 'Sector 22', 'Sector 35', 'Mani Majra', 'Panchkula'] },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Daman', 'Diu', 'Silvassa', 'Vapi', 'Dadra', 'Nagar Haveli'] },
    { name: 'Lakshadweep', cities: ['Kavaratti', 'Agatti', 'Minicoy', 'Amini', 'Andrott', 'Kalpeni'] },
    { name: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Villianur', 'Ariyankuppam'] },
    { name: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur', 'Punch', 'Rajouri', 'Kupwara', 'Budgam', 'Kulgam', 'Bandipora', 'Ganderbal', 'Pulwama', 'Shopian', 'Samba', 'Reasi', 'Ramban', 'Kishtwar', 'Doda', 'Poonch'] },
    { name: 'Ladakh', cities: ['Leh', 'Kargil', 'Nubra', 'Zanskar', 'Drass', 'Khaltse', 'Nyoma', 'Durbuk', 'Tangtse', 'Diskit'] }
  ]},
  { name: 'United States', code: 'US', phone: '+1', currency: '$', states: [
    { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland', 'Fresno', 'Long Beach'] },
    { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany', 'Yonkers', 'New Rochelle', 'Mount Vernon'] },
    { name: 'Texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'] },
    { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee', 'Fort Lauderdale', 'St. Petersburg', 'Hialeah'] },
    { name: 'Illinois', cities: ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin'] }
  ]},
  { name: 'United Kingdom', code: 'GB', phone: '+44', currency: '£', states: [
    { name: 'England', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Newcastle'] },
    { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Stirling', 'Perth', 'Inverness', 'Paisley'] },
    { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry', 'Caerphilly', 'Bridgend', 'Neath'] },
    { name: 'Northern Ireland', cities: ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey', 'Bangor', 'Craigavon', 'Castlereagh', 'Ballymena'] }
  ]},
  { name: 'Canada', code: 'CA', phone: '+1', currency: 'C$', states: [
    { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor', 'Kitchener', 'Mississauga', 'Brampton'] },
    { name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford', 'Coquitlam', 'Kelowna'] },
    { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Trois-Rivières'] },
    { name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove'] }
  ]},
  { name: 'Australia', code: 'AU', phone: '+61', currency: 'A$', states: [
    { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland', 'Albury', 'Wagga Wagga', 'Port Macquarie'] },
    { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Latrobe', 'Warrnambool', 'Wodonga'] },
    { name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Rockhampton', 'Mackay', 'Bundaberg'] },
    { name: 'Western Australia', cities: ['Perth', 'Fremantle', 'Rockingham', 'Mandurah', 'Bunbury', 'Kalgoorlie', 'Geraldton', 'Albany'] }
  ]},
  { name: 'Germany', code: 'DE', phone: '+49', currency: '€', states: [
    { name: 'Bavaria', cities: ['Munich', 'Nuremberg', 'Augsburg', 'Würzburg', 'Regensburg', 'Ingolstadt', 'Fürth', 'Erlangen'] },
    { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld'] },
    { name: 'Berlin', cities: ['Berlin'] },
    { name: 'Hamburg', cities: ['Hamburg'] }
  ]},
  { name: 'France', code: 'FR', phone: '+33', currency: '€', states: [
    { name: 'Île-de-France', cities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Versailles', 'Nanterre', 'Créteil', 'Colombes'] },
    { name: 'Provence-Alpes-Côte d\'Azur', cities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Antibes', 'Cannes', 'Avignon', 'Fréjus'] },
    { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon', 'Grenoble', 'Saint-Étienne', 'Villeurbanne', 'Clermont-Ferrand', 'Valence', 'Chambéry', 'Annecy'] }
  ]}
];

export const getCountryByName = (name: string) => countries.find(c => c.name === name);
export const getStatesByCountry = (countryName: string) => countries.find(c => c.name === countryName)?.states || [];
export const getCitiesByState = (countryName: string, stateName: string) => {
  const country = countries.find(c => c.name === countryName);
  const state = country?.states.find(s => s.name === stateName);
  return state?.cities || [];
};

// Helper function to get phone code by country
export const getPhoneCodeByCountry = (countryName: string) => {
  const country = getCountryByName(countryName);
  return country?.phone || '+1';
};

// Helper function to get currency by country
export const getCurrencyByCountry = (countryName: string) => {
  const country = getCountryByName(countryName);
  return country?.currency || '$';
};