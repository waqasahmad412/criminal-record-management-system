import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  FileBadge,
  Clock,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ phone });
    alert('Contact details updated successfully.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPasswordMessage({ type: 'success', text: 'Password credentials securely rotated.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
            Officer Credentials &amp; Profile
          </h1>
          <Badge type="role" value={currentUser.role} size="sm" />
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Active law enforcement personnel record and security permissions matrix.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: ID Card & Demographics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col items-center text-center">
            <img
              src={currentUser.avatarUrl}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
            />
            <h2 className="text-base font-bold text-white mt-3">{currentUser.name}</h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.rank}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-md text-xs font-mono text-blue-400 border border-slate-700">
              <FileBadge className="w-3.5 h-3.5" />
              <span>BADGE #{currentUser.badgeNumber}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-4 border-t border-slate-800">
            <div>
              <span className="text-slate-400 font-mono block text-[10px]">Division / Department</span>
              <span className="text-white font-medium">{currentUser.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block text-[10px]">Official Email</span>
              <span className="text-white font-mono">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block text-[10px]">Account Commission Date</span>
              <span className="text-white font-mono">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Permissions Matrix & Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Permissions Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Authorized RBAC Permissions Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Role: <strong className="text-white">{currentUser.role}</strong>. Capabilities enforced on backend services:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentUser.permissions.map(perm => (
                <div
                  key={perm}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-200">{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Rotate Security Passcode
            </h3>

            {passwordMessage && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/50 text-red-300'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-700 cursor-pointer"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
