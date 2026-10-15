import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl my-8">
      <div className="p-4 rounded-full bg-slate-800 text-slate-400 border border-slate-700 mb-4">
        <HelpCircle className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-extrabold text-white font-mono uppercase tracking-wide">
        404 - Docket Not Found
      </h2>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        The requested system path does not match any operational module or registered case dossier.
      </p>
      <div className="mt-6">
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Command Center
        </button>
      </div>
    </div>
  );
};
