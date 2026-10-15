import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requiredConfirmationWord?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  isDestructive = true,
  requiredConfirmationWord,
  onConfirm,
  onCancel
}) => {
  const [typedWord, setTypedWord] = useState('');

  if (!isOpen) return null;

  const isConfirmed = requiredConfirmationWord
    ? typedWord.trim().toLowerCase() === requiredConfirmationWord.toLowerCase()
    : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 flex items-start gap-4 border-b border-slate-800">
          <div className={`p-2.5 rounded-lg shrink-0 ${isDestructive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white tracking-wide">{title}</h3>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {requiredConfirmationWord && (
          <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Type <strong className="text-red-400 font-bold">{requiredConfirmationWord}</strong> to authorize:
            </label>
            <input
              type="text"
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              placeholder={requiredConfirmationWord}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-hidden focus:border-red-500 font-mono"
            />
          </div>
        )}

        <div className="p-4 bg-slate-950 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={!isConfirmed}
            onClick={() => {
              if (isConfirmed) onConfirm();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-red-900/40'
                : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
