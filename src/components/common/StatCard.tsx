import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  badge,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-5 transition-all shadow-sm relative overflow-hidden group ${
        onClick ? 'cursor-pointer hover:border-slate-600' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono">
              {value}
            </span>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-sm bg-slate-700 text-slate-300 font-medium">
                {badge}
              </span>
            )}
          </div>
          {(change || subtitle) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {change && (
                <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {change}
                </span>
              )}
              {subtitle && <span className="text-slate-400">{subtitle}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${iconColor} shrink-0 transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent group-hover:via-blue-500/50 transition-colors" />
    </div>
  );
};
