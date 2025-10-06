class LocationService {
  private static readonly API_KEY = 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==';
  private static statesCache: any[] | null = null;
  private static citiesCache: Map<string, any[]> = new Map();
  private static readonly TIMEOUT = 5000;

  static async getIndianStates(): Promise<any[]> {
    if (this.statesCache) return this.statesCache;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
      
      const response = await fetch('https://api.countrystatecity.in/v1/countries/IN/states', {
        headers: { 'X-CAPI-KEY': this.API_KEY },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('API failed');
      
      const states = await response.json();
      this.statesCache = states.sort((a: any, b: any) => a.name.localeCompare(b.name));
      return this.statesCache;
    } catch (error) {
      console.warn('Using fallback states:', error);
      this.statesCache = this.getFallbackStates();
      return this.statesCache;
    }
  }

  static async getCitiesByState(stateCode: string): Promise<any[]> {
    if (this.citiesCache.has(stateCode)) {
      return this.citiesCache.get(stateCode)!;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
      
      const response = await fetch(
        `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
        {
          headers: { 'X-CAPI-KEY': this.API_KEY },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('API failed');
      
      const cities = await response.json();
      const sortedCities = cities.sort((a: any, b: any) => a.name.localeCompare(b.name));
      this.citiesCache.set(stateCode, sortedCities);
      return sortedCities;
    } catch (error) {
      console.warn(`Using fallback cities for ${stateCode}:`, error);
      const fallbackCities = this.getFallbackCities(stateCode);
      this.citiesCache.set(stateCode, fallbackCities);
      return fallbackCities;
    }
  }

  private static getFallbackStates() {
    return [
      { name: 'Andhra Pradesh', iso2: 'AP' },
      { name: 'Assam', iso2: 'AS' },
      { name: 'Bihar', iso2: 'BR' },
      { name: 'Chhattisgarh', iso2: 'CG' },
      { name: 'Delhi', iso2: 'DL' },
      { name: 'Goa', iso2: 'GA' },
      { name: 'Gujarat', iso2: 'GJ' },
      { name: 'Haryana', iso2: 'HR' },
      { name: 'Himachal Pradesh', iso2: 'HP' },
      { name: 'Jharkhand', iso2: 'JH' },
      { name: 'Karnataka', iso2: 'KA' },
      { name: 'Kerala', iso2: 'KL' },
      { name: 'Madhya Pradesh', iso2: 'MP' },
      { name: 'Maharashtra', iso2: 'MH' },
      { name: 'Odisha', iso2: 'OR' },
      { name: 'Punjab', iso2: 'PB' },
      { name: 'Rajasthan', iso2: 'RJ' },
      { name: 'Tamil Nadu', iso2: 'TN' },
      { name: 'Telangana', iso2: 'TG' },
      { name: 'Uttar Pradesh', iso2: 'UP' },
      { name: 'West Bengal', iso2: 'WB' }
    ];
  }

  private static getFallbackCities(stateCode: string) {
    const cityMap: { [key: string]: string[] } = {
      'AP': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'],
      'AS': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
      'BR': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
      'CG': ['Raipur', 'Bhilai', 'Korba', 'Bilaspur'],
      'DL': ['New Delhi', 'Delhi', 'Gurgaon', 'Faridabad', 'Noida'],
      'GA': ['Panaji', 'Margao', 'Vasco da Gama'],
      'GJ': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
      'HR': ['Chandigarh', 'Faridabad', 'Gurgaon', 'Panipat'],
      'HP': ['Shimla', 'Dharamshala', 'Solan', 'Mandi'],
      'JH': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
      'KA': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belagavi'],
      'KL': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
      'MP': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
      'MH': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
      'OR': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur'],
      'PB': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
      'RJ': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
      'TN': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
      'TG': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
      'UP': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Ghaziabad'],
      'WB': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol']
    };

    return (cityMap[stateCode] || []).map(name => ({ name }));
  }
}

export default LocationService;
