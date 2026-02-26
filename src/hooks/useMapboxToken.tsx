import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get the Mapbox public token from the edge function.
 * Caches the token to avoid repeated API calls.
 */

let cachedToken: string | null = null;
let fetchPromise: Promise<string | null> | null = null;

export const useMapboxToken = () => {
  const [token, setToken] = useState<string | null>(cachedToken);
  const [isLoading, setIsLoading] = useState(!cachedToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      // Return cached token if available
      if (cachedToken) {
        setToken(cachedToken);
        setIsLoading(false);
        return;
      }

      // If already fetching, wait for that promise
      if (fetchPromise) {
        try {
          const result = await fetchPromise;
          setToken(result);
          setIsLoading(false);
        } catch (err) {
          setError('Failed to load map configuration');
          setIsLoading(false);
        }
        return;
      }

      // Start new fetch
      fetchPromise = (async () => {
        try {
          const { data, error: fnError } = await supabase.functions.invoke('get-mapbox-token');
          
          if (fnError) {
            throw fnError;
          }

          if (data?.token) {
            cachedToken = data.token;
            return data.token;
          }
          
          throw new Error('No token returned');
        } catch (err) {
          console.error('Error fetching Mapbox token:', err);
          throw err;
        }
      })();

      try {
        const result = await fetchPromise;
        setToken(result);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load map configuration');
        setIsLoading(false);
      } finally {
        fetchPromise = null;
      }
    };

    fetchToken();
  }, []);

  return {
    token,
    isLoading,
    error,
  };
};

export default useMapboxToken;
