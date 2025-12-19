import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        await signup(email, username, password);
      } else {
        await login(email, password);
      }
      onClose();
      // Reset form
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="pixel-panel max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          type="button"
        >
          <X size={20} className="pixel-icon" />
        </button>

        {/* Title */}
        <h2 className="pixel-title text-white text-center mb-6">
          {isSignup ? 'SIGN UP' : 'LOGIN'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block pixel-text-xs text-white/70 mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-black/30 border-2 border-white/20 px-4 py-3 text-white pixel-text-xs placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
              required
            />
          </div>

          {isSignup && (
            <div>
              <label className="block pixel-text-xs text-white/70 mb-2">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-black/30 border-2 border-white/20 px-4 py-3 text-white pixel-text-xs placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block pixel-text-xs text-white/70 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/30 border-2 border-white/20 px-4 py-3 text-white pixel-text-xs placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/50 px-4 py-3">
              <p className="pixel-text-xs text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full pixel-button px-6 py-3"
            disabled={loading}
          >
            <span className="pixel-text-xs">
              {loading ? 'LOADING...' : isSignup ? 'CREATE ACCOUNT' : 'LOGIN'}
            </span>
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={switchMode}
            className="pixel-text-xs text-white/60 hover:text-white transition-colors"
          >
            {isSignup ? 'Already have an account? LOGIN' : "Don't have an account? SIGN UP"}
          </button>
        </div>

        {/* Demo note */}
        <div className="mt-6 pt-4 border-t-2 border-white/10">
          <p className="pixel-text-xs text-white/40 text-center">
            NOTE: This is a demo. Data is stored locally.
            <br />
            Ready for Laravel + Inertia backend.
          </p>
        </div>
      </div>
    </div>
  );
}
