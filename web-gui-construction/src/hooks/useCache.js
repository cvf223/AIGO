/**
 * 💾 CACHE HOOK - Client-Side Caching
 * ===================================
 * 
 * Client-side caching for API responses to reduce backend load
 */

import { useState, useEffect, useCallback } from 'react';

const cache = new Map();

export const useCache = (key, fetcher, ttl = 5000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (force = false) => {
    try {
      // Check cache
      if (!force && cache.has(key)) {
        const cached = cache.get(key);
        const age = Date.now() - cached.timestamp;
        
        if (age < ttl) {
          setData(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      // Fetch fresh data
      setLoading(true);
      const freshData = await fetcher();
      
      // Update cache
      cache.set(key, {
        data: freshData,
        timestamp: Date.now()
      });

      setData(freshData);
      setError(null);
      setLoading(false);
      
      return freshData;
      
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate
  };
};

export default useCache;

