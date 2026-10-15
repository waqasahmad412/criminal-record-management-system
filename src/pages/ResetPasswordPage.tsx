import React, { useState } from 'react';
import {
  Shield,
  Mail,
  KeyRound,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('officer@crms.gov');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid department email address.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      setError('Please provide the 6-digit authorization token.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    alert('Security credentials rotated successfully! Please sign in with your new passcode.');
    onNavigate('/login');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-white font-mono tracking-tight">
            Security Passcode Recovery
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Identity verification for CRMS authorized personnel
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Department Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                Send Recovery Token
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-800 rounded-lg text-xs text-blue-300">
                A 6-digit cryptographic verification code has been dispatched to <strong>{email}</strong>. (Demo token: <strong>884210</strong>)
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  6-Digit Recovery Token
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="884210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg text-white font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                Verify Token
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  New Security Passcode (Min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Confirm New Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                Save New Passcode
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
