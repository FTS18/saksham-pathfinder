// Location Service - Fetch real cities and states from API
class LocationService {
  private static readonly INDIAN_STATES_API = 'https://api.countrystatecity.in/v1/countries/IN/states';
  private static readonly API_KEY = 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='; // Free API key
  
  // Cache for states and cities
  private static statesCache: any[] | null = null;
  private static citiesCache: Map<string, any[]> = new Map();

  static async getIndianStates(): Promise<any[]> {
    if (this.statesCache) {
      return this.statesCache;
    }

    try {
      const response = await fetch(this.INDIAN_STATES_API, {
        headers: {
          'X-CAPI-KEY': this.API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }

      const states = await response.json();
      this.statesCache = states;
      return states;
    } catch (error) {
      console.error('Error fetching states:', error);
      // Fallback to major states
      return this.getFallbackStates();
    }
  }

  static async getCitiesByState(stateCode: string): Promise<any[]> {
    if (this.citiesCache.has(stateCode)) {
      return this.citiesCache.get(stateCode)!;
    }

    try {
      const response = await fetch(
        `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
        {
          headers: {
            'X-CAPI-KEY': this.API_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      const cities = await response.json();
      this.citiesCache.set(stateCode, cities);
      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return this.getFallbackCities(stateCode);
    }
  }

  private static getFallbackStates() {
    return [
      { name: 'Delhi', iso2: 'DL' },
      { name: 'Maharashtra', iso2: 'MH' },
      { name: 'Karnataka', iso2: 'KA' },
      { name: 'Tamil Nadu', iso2: 'TN' },
      { name: 'Telangana', iso2: 'TG' },
      { name: 'Uttar Pradesh', iso2: 'UP' },
      { name: 'Gujarat', iso2: 'GJ' },
      { name: 'West Bengal', iso2: 'WB' },
      { name: 'Rajasthan', iso2: 'RJ' },
      { name: 'Punjab', iso2: 'PB' }
    ];
  }

  private static getFallbackCities(stateCode: string) {
    const cityMap: { [key: string]: string[] } = {
      'DL': ['New Delhi', 'Delhi'],
      'MH': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
      'KA': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli'],
      'TN': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
      'TG': ['Hyderabad', 'Warangal', 'Nizamabad'],
      'UP': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'],
      'GJ': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
      'WB': ['Kolkata', 'Howrah', 'Durgapur'],
      'RJ': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
      'PB': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar']
    };

    const cities = cityMap[stateCode] || [];
    return cities.map(name => ({ name }));
  }

  static async searchCities(query: string): Promise<any[]> {
    const states = await this.getIndianStates();
    const allCities: any[] = [];

    for (const state of states.slice(0, 10)) {
      const cities = await this.getCitiesByState(state.iso2);
      allCities.push(...cities.map(city => ({ ...city, state: state.name })));
    }

    return allCities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20);
  }
}

export default LocationService;
