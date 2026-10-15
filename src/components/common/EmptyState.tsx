import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-xl my-4">
      <div className="p-4 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60 mb-4">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-white tracking-wide">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex items-center gap-3">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-lg border border-slate-700 transition-colors"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
