import { useState } from 'react';
import { X, User, Mail, Trash2, AlertTriangle, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user, updateEmail, updateUsername, changePassword, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');
  
  // Profile form state
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState(false);
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  
  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  
  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUsername.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    try {
      setIsUpdating(true);
      await updateUsername(newUsername.trim());
      toast.success('Username updated successfully!');
      setUsernameUpdateSuccess(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update username');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    if (!emailPassword) {
      toast.error('Password is required to update email');
      return;
    }

    try {
      setIsUpdating(true);
      await updateEmail(newEmail, emailPassword);
      toast.success('Email updated successfully!');
      setEmailPassword('');
      setEmailUpdateSuccess(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordChangeSuccess(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!deletePassword) {
      toast.error('Password is required');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/80 backdrop-blur-sm">
      <div className="pixel-panel w-full max-w-2xl max-h-[85vh] flex flex-col p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-white/20 flex-shrink-0">
          <h2 className="pixel-text-sm text-white">ACCOUNT SETTINGS</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={24} className="pixel-icon" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 flex-1 transition-all cursor-pointer rounded-2xl ${
              activeTab === 'profile'
                ? 'bg-white/30 border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.6)] backdrop-blur-lg'
                : 'pixel-panel border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/15 hover:scale-[1.02]'
            }`}
          >
            <User size={18} className="inline mr-2 text-white pixel-icon" />
            <span className="pixel-text-xs text-white">PROFILE</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 flex-1 transition-all cursor-pointer rounded-2xl ${
              activeTab === 'password'
                ? 'bg-blue-500/30 border-2 border-blue-400 shadow-[0_0_30px_rgba(66,153,225,0.8)] backdrop-blur-lg'
                : 'pixel-panel border-blue-400/30 bg-blue-500/5 hover:border-blue-400/60 hover:bg-blue-500/20 hover:scale-[1.02]'
            }`}
          >
            <Lock size={18} className="inline mr-2 text-white pixel-icon" />
            <span className="pixel-text-xs text-white">PASSWORD</span>
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`px-6 py-3 flex-1 transition-all cursor-pointer rounded-2xl ${
              activeTab === 'delete'
                ? 'bg-red-500/30 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)] backdrop-blur-lg'
                : 'pixel-panel border-red-400/30 bg-red-500/5 hover:border-red-400/60 hover:bg-red-500/20 hover:scale-[1.02]'
            }`}
          >
            <Trash2 size={18} className="inline mr-2 text-white pixel-icon" />
            <span className="pixel-text-xs text-white">DELETE</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div 
          className="overflow-y-auto flex-1 pb-6 [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 pr-1">
            {/* Update Username */}
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              {/* Success Banner */}
              {usernameUpdateSuccess && (
                <div className="pixel-panel border-green-400/40 bg-green-400/10 p-4 animate-[fadeIn_0.3s_ease-in-out]">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5 pixel-icon" />
                    <div>
                      <div className="pixel-text-xs text-green-400 mb-2">SUCCESS</div>
                      <p className="pixel-text-xs text-white text-[11px] leading-relaxed">
                        Your username has been updated successfully.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pixel-text-xs text-white flex items-center gap-2 mb-3">
                <User size={16} className="pixel-icon" />
                UPDATE USERNAME
              </div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setUsernameUpdateSuccess(false);
                }}
                placeholder={user?.username}
                className="pixel-input w-full py-3"
                disabled={isUpdating}
              />
              <button
                type="submit"
                disabled={isUpdating || newUsername === user?.username}
                className="pixel-button w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'UPDATING...' : 'UPDATE USERNAME'}
              </button>
            </form>

            {/* Divider */}
            <div className="border-t-2 border-white/10"></div>

            {/* Update Email */}
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              {/* Success Banner */}
              {emailUpdateSuccess && (
                <div className="pixel-panel border-green-400/40 bg-green-400/10 p-4 animate-[fadeIn_0.3s_ease-in-out]">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5 pixel-icon" />
                    <div>
                      <div className="pixel-text-xs text-green-400 mb-2">SUCCESS</div>
                      <p className="pixel-text-xs text-white text-[11px] leading-relaxed">
                        Your email has been updated successfully.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pixel-text-xs text-white flex items-center gap-2 mb-3">
                <Mail size={16} className="pixel-icon" />
                UPDATE EMAIL
              </div>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailUpdateSuccess(false);
                }}
                placeholder={user?.email}
                className="pixel-input w-full py-3"
                disabled={isUpdating}
              />
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => {
                  setEmailPassword(e.target.value);
                  setEmailUpdateSuccess(false);
                }}
                placeholder="Current password"
                className="pixel-input w-full py-3"
                disabled={isUpdating}
              />
              <button
                type="submit"
                disabled={isUpdating || newEmail === user?.email || !emailPassword}
                className="pixel-button w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'UPDATING...' : 'UPDATE EMAIL'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Success Banner */}
            {passwordChangeSuccess && (
              <div className="pixel-panel border-green-400/40 bg-green-400/10 p-6 animate-[fadeIn_0.3s_ease-in-out]">
                <div className="flex items-start gap-4">
                  <CheckCircle size={24} className="text-green-400 flex-shrink-0 mt-1 pixel-icon" />
                  <div>
                    <div className="pixel-text-xs text-green-400 mb-3">SUCCESS</div>
                    <p className="pixel-text-xs text-white text-[11px] leading-relaxed">
                      Your password has been changed successfully.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="pixel-text-xs text-white">
                Current Password
              </div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordChangeSuccess(false);
                }}
                placeholder="Current password"
                className="pixel-input w-full py-3"
                disabled={isChangingPassword}
              />
              <div className="pixel-text-xs text-white">
                New Password
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordChangeSuccess(false);
                }}
                placeholder="New password"
                className="pixel-input w-full py-3"
                disabled={isChangingPassword}
              />
              <div className="pixel-text-xs text-white">
                Confirm Password
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordChangeSuccess(false);
                }}
                placeholder="Confirm password"
                className="pixel-input w-full py-3"
                disabled={isChangingPassword}
              />
              <button
                type="submit"
                disabled={isChangingPassword || newPassword !== confirmPassword || !currentPassword}
                className="pixel-button w-full py-3 bg-blue-500/20 border-blue-400/40 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? 'CHANGING...' : 'CHANGE PASSWORD'}
              </button>
            </div>
          </form>
        )}

        {/* Delete Tab */}
        {activeTab === 'delete' && (
          <form onSubmit={handleDeleteAccount} className="space-y-6">
            <div className="pixel-panel border-red-400/40 bg-red-400/10 p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle size={24} className="text-red-400 flex-shrink-0 mt-1 pixel-icon" />
                <div>
                  <div className="pixel-text-xs text-red-400 mb-3">WARNING</div>
                  <p className="pixel-text-xs text-white text-[11px] leading-relaxed">
                    This action is permanent and cannot be undone. All your tracked cities and data will be deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="pixel-text-xs text-white">
                Type <span className="text-red-400">DELETE</span> to confirm
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="pixel-input w-full py-3"
                disabled={isDeleting}
              />
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                className="pixel-input w-full py-3"
                disabled={isDeleting}
              />
              <button
                type="submit"
                disabled={isDeleting || confirmText !== 'DELETE' || !deletePassword}
                className="pixel-button w-full py-3 bg-red-500/20 border-red-400/40 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'DELETING...' : 'DELETE ACCOUNT'}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}