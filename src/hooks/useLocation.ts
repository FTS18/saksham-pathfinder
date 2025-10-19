import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // First try to get precise location with permission
        if ('geolocation' in navigator && !permissionRequested) {
          setPermissionRequested(true);
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Reverse geocode to get city name
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                );
                if (response.ok) {
                  const data = await response.json();
                  setLocation({
                    city: data.city || data.locality || 'Unknown',
                    country: data.countryName || 'Unknown',
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  });
                  setLoading(false);
                  return;
                }
              } catch (err) {
                console.error('Reverse geocoding failed:', err);
              }
              
              // Fallback with coordinates only
              setLocation({
                city: 'Current Location',
                country: 'India',
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
              setLoading(false);
            },
            () => {
              // Permission denied, fallback to IP location
              fallbackToIPLocation();
            },
            { timeout: 10000 }
          );
        } else {
          fallbackToIPLocation();
        }
      } catch (err) {
        fallbackToIPLocation();
      }
    };

    const fallbackToIPLocation = async () => {
      try {
        // Try ipapi.co first (with CORS handling)
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            const data = await response.json();
            setLocation({
              city: data.city || 'Delhi',
              country: data.country_name || 'India',
              lat: data.latitude,
              lng: data.longitude
            });
            return;
          }
        } catch (ipErr) {
          // ipapi.co failed, try fallback
          console.debug('ipapi.co geolocation failed, using default location');
        }

        // Fallback to default location if geolocation API fails
        setLocation({ city: 'Delhi', country: 'India' });
      } catch (err) {
        console.debug('Location detection error:', err);
        setLocation({ city: 'Delhi', country: 'India' });
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, [permissionRequested]);

  return { location, loading, error };
};