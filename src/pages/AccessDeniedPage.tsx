import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedPageProps {
  onNavigate: (route: string) => void;
  requiredRole?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ onNavigate, requiredRole = 'Administrator' }) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl my-8">
      <div className="p-4 rounded-full bg-red-950/60 text-red-400 border border-red-800 mb-4">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-extrabold text-white font-mono uppercase tracking-wide">
        403 - Security Clearance Restricted
      </h2>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        Your current session role (<strong>{currentUser?.role || 'Guest'}</strong>) lacks statutory clearance for this module. This operation requires <strong>{requiredRole}</strong> authorization.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold uppercase tracking-wider rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
