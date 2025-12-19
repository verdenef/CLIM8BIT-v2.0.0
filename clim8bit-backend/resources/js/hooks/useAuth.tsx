import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  temperature_unit?: 'C' | 'F';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  setTemperatureUnit: (unit: 'C' | 'F') => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('clim8bit_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                          'Invalid credentials';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('clim8bit_user', JSON.stringify(data.user));
  };

  const signup = async (email: string, username: string, password: string) => {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, name: username, password, password_confirmation: password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                          'Failed to register';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('clim8bit_user', JSON.stringify(data.user));
  };

  const logout = async () => {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    await fetch('/logout', { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
    });
    setUser(null);
    localStorage.removeItem('clim8bit_user');
  };

  const updateEmail = async (newEmail: string, password: string) => {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const response = await fetch('/user/email', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email: newEmail, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                          'Failed to update email';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('clim8bit_user', JSON.stringify(data.user));
  };

  const updateUsername = async (newUsername: string) => {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const response = await fetch('/user/username', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ username: newUsername }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                          'Failed to update username';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('clim8bit_user', JSON.stringify(data.user));
  };

  const deleteAccount = async (password: string) => {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const response = await fetch('/user', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                          'Failed to delete account';
      throw new Error(errorMessage);
    }

    setUser(null);
    localStorage.removeItem('clim8bit_user');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const response = await fetch('/user/password', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ current_password: currentPassword, password: newPassword, password_confirmation: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                          'Failed to change password';
      throw new Error(errorMessage);
    }
  };

  const setTemperatureUnit = async (unit: 'C' | 'F') => {
    if (!user) return;

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const response = await fetch('/user/preferences', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ temperature_unit: unit }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                          'Failed to update preferences';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('clim8bit_user', JSON.stringify(data.user));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateEmail, updateUsername, changePassword, deleteAccount, setTemperatureUnit, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}