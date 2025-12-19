import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface RecentSearch {
  id: string;
  name: string;
  country: string;
  searchedAt: number;
}

export function useRecentSearches() {
  const { user } = useAuth();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (!user) {
      setRecentSearches([]);
      return;
    }

    const key = `clim8bit_recent_${user.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches');
      }
    }
  }, [user]);

  const addRecentSearch = (name: string, country: string) => {
    if (!user) return;

    // Remove duplicate if exists
    const filtered = recentSearches.filter(
      s => s.name.toLowerCase() !== name.toLowerCase()
    );

    const newSearch: RecentSearch = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      country,
      searchedAt: Date.now(),
    };

    // Keep only last 10 searches
    const updated = [newSearch, ...filtered].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem(`clim8bit_recent_${user.id}`, JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    if (!user) return;

    setRecentSearches([]);
    localStorage.removeItem(`clim8bit_recent_${user.id}`);
  };

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
