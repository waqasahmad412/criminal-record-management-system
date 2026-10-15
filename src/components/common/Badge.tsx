import React from 'react';
import { RecordStatus, RiskLevel, CaseStatus, CasePriority, ArrestStatus, ComplaintStatus, EvidenceStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  type?: 'recordStatus' | 'riskLevel' | 'caseStatus' | 'casePriority' | 'arrestStatus' | 'complaintStatus' | 'evidenceStatus' | 'role' | 'custom';
  value?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  type = 'custom',
  value,
  size = 'md',
  className = ''
}) => {
  const text = children || value;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  let colorClasses = 'bg-slate-800 text-slate-300 border border-slate-700';

  if (type === 'recordStatus' || value) {
    switch (value) {
      case 'Suspect':
        colorClasses = 'bg-amber-950/60 text-amber-300 border border-amber-600/50';
        break;
      case 'Person of Interest':
        colorClasses = 'bg-blue-950/60 text-blue-300 border border-blue-600/50';
        break;
      case 'Arrested':
        colorClasses = 'bg-orange-950/60 text-orange-300 border border-orange-600/50';
        break;
      case 'Charged':
        colorClasses = 'bg-rose-950/60 text-rose-300 border border-rose-600/50';
        break;
      case 'Convicted':
        colorClasses = 'bg-red-950/70 text-red-300 border border-red-700';
        break;
      case 'Acquitted':
      case 'Cleared':
      case 'Resolved':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50';
        break;
      case 'Archived':
      case 'Expunged':
        colorClasses = 'bg-slate-800 text-slate-400 border border-slate-700';
        break;
    }
  }

  if (type === 'riskLevel') {
    switch (value) {
      case 'Low':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50';
        break;
      case 'Medium':
        colorClasses = 'bg-amber-950/60 text-amber-300 border border-amber-600/50';
        break;
      case 'High':
        colorClasses = 'bg-orange-950/60 text-orange-300 border border-orange-600/50';
        break;
      case 'Extreme':
        colorClasses = 'bg-rose-950/80 text-rose-300 border border-rose-600 animate-pulse';
        break;
    }
  }

  if (type === 'caseStatus') {
    switch (value) {
      case 'Registered':
        colorClasses = 'bg-slate-800 text-slate-300 border border-slate-600';
        break;
      case 'Under Review':
        colorClasses = 'bg-sky-950/60 text-sky-300 border border-sky-600/50';
        break;
      case 'Under Investigation':
        colorClasses = 'bg-indigo-950/60 text-indigo-300 border border-indigo-600/50';
        break;
      case 'Pending Court':
        colorClasses = 'bg-purple-950/60 text-purple-300 border border-purple-600/50';
        break;
      case 'Closed':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50';
        break;
      case 'Archived':
        colorClasses = 'bg-slate-800 text-slate-400 border border-slate-700';
        break;
    }
  }

  if (type === 'casePriority' || type === 'complaintStatus') {
    switch (value) {
      case 'Critical':
      case 'Urgent':
        colorClasses = 'bg-rose-950/70 text-rose-300 border border-rose-600';
        break;
      case 'High':
        colorClasses = 'bg-orange-950/60 text-orange-300 border border-orange-600/50';
        break;
      case 'Medium':
      case 'In Progress':
        colorClasses = 'bg-amber-950/60 text-amber-300 border border-amber-600/50';
        break;
      case 'Low':
      case 'Received':
        colorClasses = 'bg-blue-950/60 text-blue-300 border border-blue-600/50';
        break;
      case 'Converted to Case':
        colorClasses = 'bg-purple-950/60 text-purple-300 border border-purple-600/50';
        break;
      case 'Resolved':
      case 'Closed':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50';
        break;
    }
  }

  if (type === 'arrestStatus') {
    switch (value) {
      case 'In Custody':
      case 'Remanded':
        colorClasses = 'bg-rose-950/70 text-rose-300 border border-rose-600';
        break;
      case 'Released on Bail':
        colorClasses = 'bg-amber-950/60 text-amber-300 border border-amber-600/50';
        break;
      case 'Transferred':
        colorClasses = 'bg-blue-950/60 text-blue-300 border border-blue-600/50';
        break;
      case 'Released without Charge':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50';
        break;
    }
  }

  if (type === 'evidenceStatus') {
    switch (value) {
      case 'In Lab Analysis':
        colorClasses = 'bg-purple-950/60 text-purple-300 border border-purple-600/50';
        break;
      case 'In Storage Locker':
        colorClasses = 'bg-blue-950/60 text-blue-300 border border-blue-600/50';
        break;
      case 'Presented in Court':
        colorClasses = 'bg-indigo-950/60 text-indigo-300 border border-indigo-600/50';
        break;
      case 'Released':
      case 'Destroyed':
        colorClasses = 'bg-slate-800 text-slate-400 border border-slate-700';
        break;
      default:
        colorClasses = 'bg-cyan-950/60 text-cyan-300 border border-cyan-600/50';
    }
  }

  if (type === 'role') {
    switch (value) {
      case 'Administrator':
        colorClasses = 'bg-red-950/60 text-red-300 border border-red-600/50';
        break;
      case 'Police Officer':
        colorClasses = 'bg-blue-950/60 text-blue-300 border border-blue-600/50';
        break;
      case 'Investigator':
        colorClasses = 'bg-indigo-950/60 text-indigo-300 border border-indigo-600/50';
        break;
      case 'Supervisor':
        colorClasses = 'bg-amber-950/60 text-amber-300 border border-amber-600/50';
        break;
      case 'Court Official':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center tracking-wide rounded-md uppercase font-mono ${sizeClasses} ${colorClasses} ${className}`}
    >
      {text}
    </span>
  );
};
