import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  UserX,
  MessageSquareWarning,
  Package,
  Search,
  BarChart3,
  History,
  BellRing,
  Database,
  Settings,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileBadge,
  FilePlus,
  CheckSquare,
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { ConfirmModal } from '../common/ConfirmModal';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse
}) => {
  const { currentUser, canManageUsers, canViewAudit, logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const db = storage.getFilteredState(currentUser);

  const totalRecords = db.records.length;
  const activeCases = db.cases.filter(c => c.status !== 'Closed' && c.status !== 'Archived').length;
  const pendingComplaints = db.complaints.filter(c => c.status === 'Received' || c.status === 'Under Review' || c.status === 'In Progress').length;
  const unreadAlerts = db.notifications.filter(n => !n.isRead && (n.userId === currentUser?.id || n.userId === 'ALL')).length;

  const isAdmin = currentUser?.role === 'Administrator';

  // Navigation Items according to specifications
  // When Admin, all 17 buttons are available and organized cleanly
  const adminNavList = [
    {
      label: 'Dashboard',
      route: '/',
      icon: LayoutDashboard,
      badge: null,
      category: 'Core'
    },
    {
      label: 'User Management',
      route: '/users',
      icon: Users,
      badge: db.users.length,
      category: 'Administration'
    },
    {
      label: 'Add User',
      route: '/users/new',
      icon: UserPlus,
      badge: '+',
      category: 'Administration'
    },
    {
      label: 'Roles & Permissions',
      route: '/roles',
      icon: ShieldCheck,
      badge: '5 Roles',
      category: 'Administration'
    },
    {
      label: 'Criminal Records',
      route: '/records',
      icon: ShieldAlert,
      badge: totalRecords,
      category: 'Law Enforcement'
    },
    {
      label: 'Case Management',
      route: '/cases',
      icon: Briefcase,
      badge: activeCases,
      category: 'Law Enforcement'
    },
    {
      label: 'Arrest Management',
      route: '/arrests',
      icon: UserX,
      badge: db.arrests.length,
      category: 'Law Enforcement'
    },
    {
      label: 'Complaints',
      route: '/complaints',
      icon: MessageSquareWarning,
      badge: pendingComplaints,
      badgeColor: 'bg-amber-500/20 text-amber-300',
      category: 'Law Enforcement'
    },
    {
      label: 'Evidence Management',
      route: '/evidence',
      icon: Package,
      badge: db.evidence.length,
      category: 'Law Enforcement'
    },
    {
      label: 'Advanced Search',
      route: '/search',
      icon: Search,
      badge: null,
      category: 'Operations'
    },
    {
      label: 'Reports & Analytics',
      route: '/reports',
      icon: BarChart3,
      badge: db.cases.length + db.records.length,
      category: 'Operations'
    },
    {
      label: 'Audit Logs',
      route: '/audit-logs',
      icon: History,
      badge: db.auditLogs.length,
      category: 'Security & Oversight'
    },
    {
      label: 'Notifications & Tasks',
      route: '/notifications',
      icon: BellRing,
      badge: unreadAlerts > 0 ? unreadAlerts : (db.tasks?.length ?? 0),
      badgeColor: unreadAlerts > 0 ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-300',
      category: 'Security & Oversight'
    },
    {
      label: 'Backup & Restore',
      route: '/backup',
      icon: Database,
      badge: 'JSON',
      category: 'Security & Oversight'
    },
    {
      label: 'System Settings',
      route: '/settings',
      icon: Settings,
      badge: null,
      category: 'Security & Oversight'
    },
    {
      label: 'My Profile',
      route: '/profile',
      icon: UserCheck,
      badge: null,
      category: 'Account'
    },
    {
      label: 'Logout',
      action: 'logout',
      icon: LogOut,
      badge: null,
      isLogout: true,
      category: 'Account'
    }
  ];

  // For non-admin personnel - strictly the 14 buttons requested
  const regularNavList = [
    {
      label: 'Dashboard',
      route: '/',
      icon: LayoutDashboard,
      badge: null,
      category: 'Overview'
    },
    {
      label: 'View Records',
      route: '/records',
      icon: ShieldAlert,
      badge: totalRecords,
      category: 'Records & Custody'
    },
    {
      label: 'Add Record*',
      route: '/records/new',
      icon: FilePlus,
      badge: '+ New',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      category: 'Records & Custody'
    },
    {
      label: 'Assigned Cases',
      route: '/cases',
      icon: Briefcase,
      badge: activeCases,
      category: 'Case Operations'
    },
    {
      label: 'Arrest Records*',
      route: '/arrests',
      icon: UserX,
      badge: db.arrests.length,
      category: 'Case Operations'
    },
    {
      label: 'Complaints',
      route: '/complaints',
      icon: MessageSquareWarning,
      badge: pendingComplaints,
      badgeColor: 'bg-amber-500/20 text-amber-300',
      category: 'Case Operations'
    },
    {
      label: 'Evidence*',
      route: '/evidence',
      icon: Package,
      badge: db.evidence.length,
      category: 'Case Operations'
    },
    {
      label: 'Search',
      route: '/search',
      icon: Search,
      badge: null,
      category: 'Search & Intelligence'
    },
    {
      label: 'Allowed Reports',
      route: '/reports',
      icon: BarChart3,
      badge: db.cases.length + db.records.length,
      category: 'Search & Intelligence'
    },
    {
      label: 'Notifications',
      route: '/notifications',
      icon: BellRing,
      badge: unreadAlerts > 0 ? unreadAlerts : null,
      badgeColor: unreadAlerts > 0 ? 'bg-red-500/20 text-red-300' : undefined,
      category: 'Tasks & Communication'
    },
    {
      label: 'My Tasks',
      route: '/tasks',
      icon: CheckSquare,
      badge: db.tasks?.filter(t => !t.isCompleted).length || null,
      badgeColor: 'bg-blue-500/20 text-blue-300',
      category: 'Tasks & Communication'
    },
    {
      label: 'My Profile',
      route: '/profile',
      icon: UserCheck,
      badge: null,
      category: 'Account & Security'
    },
    {
      label: 'Change Password',
      route: '/change-password',
      icon: Key,
      badge: 'Security',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      category: 'Account & Security'
    },
    {
      label: 'Logout',
      action: 'logout',
      icon: LogOut,
      badge: null,
      isLogout: true,
      category: 'Account & Security'
    }
  ];

  const currentNavItems = isAdmin ? adminNavList : regularNavList;

  const handleItemClick = (item: any) => {
    if (item.action === 'logout' || item.isLogout) {
      setIsLogoutConfirmOpen(true);
      return;
    }
    if (item.route) {
      onNavigate(item.route);
    }
  };

  return (
    <aside
      className={`relative z-40 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-200 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-md shadow-blue-900/30 shrink-0">
            <Shield className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-sm tracking-wider text-white font-mono">
                CRMS <span className="text-blue-400 font-medium">CORE</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                METROPOLITAN RECORDS
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Admin indicator banner if admin */}
      {!isCollapsed && isAdmin && (
        <div className="px-3 pt-2 pb-1 bg-red-950/30 border-b border-red-900/30 flex items-center justify-between text-[10px] font-mono text-red-300">
          <span className="flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            ADMIN COMMAND CONSOLE
          </span>
          <span className="bg-red-500/20 px-1.5 py-0.2 rounded-sm border border-red-500/30 font-semibold">
            17 MODULES
          </span>
        </div>
      )}

      {/* Officer indicator banner if not admin */}
      {!isCollapsed && !isAdmin && (
        <div className="px-3 pt-2 pb-1 bg-blue-950/30 border-b border-blue-900/30 flex items-center justify-between text-[10px] font-mono text-blue-300">
          <span className="flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            OFFICER WORKSPACE
          </span>
          <span className="bg-blue-500/20 px-1.5 py-0.2 rounded-sm border border-blue-500/30 font-semibold">
            14 MODULES
          </span>
        </div>
      )}

      {/* Navigation List - Scrollable */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {currentNavItems.map((item: any, idx: number) => {
          const isActive =
            item.route &&
            (currentRoute === item.route ||
              (item.route !== '/' &&
               item.route !== '/users/new' &&
               item.route !== '/records/new' &&
               item.route !== '/cases/new' &&
               item.route !== '/arrests/new' &&
               item.route !== '/complaints/new' &&
               item.route !== '/evidence/new' &&
               currentRoute.startsWith(item.route)));
          const Icon = item.icon;

          // Optional small divider or header when switching categories
          const prevItem = idx > 0 ? (currentNavItems[idx - 1] as any) : null;
          const showCategoryHeader =
            !isCollapsed &&
            (idx === 0 || item.category !== prevItem?.category);

          return (
            <React.Fragment key={item.label}>
              {showCategoryHeader && item.category && (
                <div className="pt-3 pb-1 px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-t border-slate-900 first:border-t-0 first:pt-1">
                  {item.category}
                </div>
              )}
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  item.isLogout
                    ? 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 mt-2'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-700/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      item.isLogout
                        ? 'text-rose-400'
                        : isActive
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm shrink-0 ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-blue-700 text-white'
                        : item.badge === '+'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Info / Badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 shrink-0">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 truncate">
                <FileBadge className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-mono text-slate-300 font-semibold truncate">
                  {currentUser?.badgeNumber}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
              {currentUser?.role}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="text-slate-400 font-mono text-[10px]" title={currentUser?.badgeNumber}>
              {currentUser?.badgeNumber.split('-')[0]}
            </div>
          </div>
        )}
      </div>

      {isLogoutConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          title="Sign Out of Session"
          message="Are you sure you wish to log out of the Metropolitan CRMS terminal session? Your active token will be cleared."
          confirmText="Confirm Sign Out"
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            logout();
          }}
          onCancel={() => setIsLogoutConfirmOpen(false)}
        />
      )}
    </aside>
  );
};
