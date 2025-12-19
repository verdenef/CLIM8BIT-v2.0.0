import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface FavoriteCity {
  id: string;
  name: string;
  country: string;
  addedAt: number;
}

const MAX_FAVORITES = 3;

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  // Load favorites from backend
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error('Failed to load favorites');
        const data = await response.json();
        setFavorites(
          data.favorites.map((fav: any) => ({
            id: String(fav.id),
            name: fav.city,
            country: fav.country,
            addedAt: new Date(fav.created_at).getTime(),
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (name: string, country: string) => {
    if (!user) return false;

    // Check if already at max capacity
    if (favorites.length >= MAX_FAVORITES) {
      return false;
    }

    // Check if already exists locally
    if (favorites.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      return false;
    }

    try {
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ city: name, country }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to add favorite';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFavorites(
        data.favorites.map((fav: any) => ({
          id: String(fav.id),
          name: fav.city,
          country: fav.country,
          addedAt: new Date(fav.created_at).getTime(),
        }))
      );
      return true;
    } catch (e: any) {
      console.error('Add favorite error:', e);
      return false;
    }
  };

  const removeFavorite = async (id: string) => {
    if (!user) return;

    try {
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const removeFavoriteByName = async (name: string) => {
    if (!user) return;

    const fav = favorites.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (!fav) return;

    await removeFavorite(fav.id);
  };

  const isFavorite = (name: string) => {
    return favorites.some(f => f.name.toLowerCase() === name.toLowerCase());
  };

  const canAddMore = () => {
    return favorites.length < MAX_FAVORITES;
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    removeFavoriteByName,
    isFavorite,
    canAddMore,
    maxFavorites: MAX_FAVORITES,
  };
}