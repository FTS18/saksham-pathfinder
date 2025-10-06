
import { z } from 'zod';

const LocationDataSchema = z.object({
  states: z.array(z.object({
    state: z.string(),
    districts: z.array(z.string()),
  })),
});

type LocationData = z.infer<typeof LocationDataSchema>;

let cachedLocations: LocationData | null = null;

const API_URL = 'https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json';

export const getLocations = async (): Promise<LocationData> => {
  if (cachedLocations) {
    return cachedLocations;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    const data = await response.json();
    const parsedData = LocationDataSchema.parse(data);
    cachedLocations = parsedData;
    return parsedData;
  } catch (error) {
    console.error('Error fetching or parsing location data:', error);
    // Return a fallback or empty structure in case of an error
    return { states: [] };
  }
};

export const getStates = async (): Promise<string[]> => {
  const locations = await getLocations();
  return locations.states.map(s => s.state);
};

export const getCities = async (state: string): Promise<string[]> => {
  const locations = await getLocations();
  const stateData = locations.states.find(s => s.state === state);
  return stateData ? stateData.districts : [];
};
