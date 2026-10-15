import React, { useState } from 'react';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Check,
  X,
  History,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';

interface ChangePasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ onNavigate }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { text: 'None', color: 'text-slate-500', bar: 'bg-slate-700 w-0' };
    if (strengthScore === 1) return { text: 'Weak', color: 'text-red-400', bar: 'bg-red-500 w-1/4' };
    if (strengthScore === 2) return { text: 'Fair', color: 'text-amber-400', bar: 'bg-amber-500 w-2/4' };
    if (strengthScore === 3) return { text: 'Good', color: 'text-blue-400', bar: 'bg-blue-500 w-3/4' };
    return { text: 'Strong (Security Compliant)', color: 'text-emerald-400', bar: 'bg-emerald-500 w-full' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verify current password
    const expectedCurrent = currentUser.password || 'password123';
    if (currentPassword !== expectedCurrent) {
      setErrorMsg('Current password does not match your active account password.');
      return;
    }

    if (!hasMinLength) {
      setErrorMsg('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('New password cannot be identical to your current password.');
      return;
    }

    setIsSubmitting(true);

    try {
      updateCurrentUserProfile({ password: newPassword });

      storage.logAudit({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userBadge: currentUser.badgeNumber,
        action: 'PASSWORD_CHANGE',
        resourceType: 'User',
        resourceId: currentUser.id,
        resourceTitle: currentUser.name,
        status: 'Success',
        ipAddress: '10.240.10.2',
        details: `Officer password credential successfully rotated and re-hashed.`
      });

      setSuccessMsg('Your security password has been changed successfully! Your next login will require this new passcode.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide flex items-center gap-2.5">
              <Key className="w-6 h-6 text-amber-400" />
              Change Security Password
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rotate officer account passcode according to departmental security protocols.
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* User identification badge */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt=""
              className="w-11 h-11 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <div className="text-sm font-bold text-white">{currentUser.name}</div>
              <div className="text-xs text-slate-400 font-mono">
                {currentUser.rank} • Badge #{currentUser.badgeNumber}
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-right font-mono text-[11px] text-slate-400">
            <div>Role: <span className="text-blue-400 font-semibold">{currentUser.role}</span></div>
            <div className="text-slate-400">{currentUser.email}</div>
          </div>
        </div>

        {/* Success / Error notification */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold">Password Updated Successfully</div>
              <div className="text-xs text-emerald-300/90">{successMsg}</div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold font-mono"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold">Credential Verification Failed</div>
              <div className="text-xs text-red-300/90">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Current Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white pr-10 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              New Password <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 8 characters"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white pr-10 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.bar}`}></div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">Security Strength:</span>
                  <span className={`font-semibold ${strength.color}`}>{strength.text}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Confirm New Password <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your new password"
                className={`w-full bg-slate-950 border ${
                  confirmPassword && !isMatch
                    ? 'border-red-500'
                    : confirmPassword && isMatch
                    ? 'border-emerald-500'
                    : 'border-slate-700'
                } focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white pr-10 outline-none transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-[11px] font-mono mt-1 ${isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                {isMatch ? '✓ Passwords match perfectly' : '✕ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Security Policy Requirements Checklist */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Password Compliance Requirements
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className={hasMinLength ? 'text-slate-200 font-mono' : 'text-slate-500 font-mono'}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasUppercase ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className={hasUppercase ? 'text-slate-200 font-mono' : 'text-slate-500 font-mono'}>
                  At least 1 uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasNumber ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className={hasNumber ? 'text-slate-200 font-mono' : 'text-slate-500 font-mono'}>
                  At least 1 digit (0-9)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasSpecial ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className={hasSpecial ? 'text-slate-200 font-mono' : 'text-slate-500 font-mono'}>
                  Special character (!@#$%...)
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentPassword || !newPassword || !isMatch}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-mono text-xs font-bold shadow-lg shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              {isSubmitting ? 'Rotating Credentials...' : 'Save & Rotate Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
