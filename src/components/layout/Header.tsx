import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  UserCheck,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../services/storage';
import { NotificationItem } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onNavigate }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const refreshNotifs = () => {
    if (currentUser) {
      setNotifications(storage.getNotifications(currentUser.id));
    }
  };

  useEffect(() => {
    refreshNotifs();
    const unsubscribe = storage.subscribe(() => {
      refreshNotifs();
    });
    return unsubscribe;
  }, [currentUser]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead(currentUser?.id);
    refreshNotifs();
  };

  const handleNotificationClick = (item: NotificationItem) => {
    storage.markNotificationAsRead(item.id);
    refreshNotifs();
    setIsNotifOpen(false);
    if (item.link) {
      onNavigate(item.link);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 rounded-lg text-sm transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
            <span className="text-xs sm:text-sm text-slate-400">Search records, cases, arrests, evidence...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded-sm">
              Ctrl+K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700/80 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition-all cursor-pointer shadow-xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark and Light Mode"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[11px] font-mono">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline text-[11px] font-mono text-slate-700">Dark</span>
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    System Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 text-[10px] font-mono rounded-sm">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active notifications for your badge.
                  </div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3 hover:bg-slate-800/80 transition-colors cursor-pointer flex gap-3 ${
                        !item.isRead ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === 'deadline' ? (
                          <Clock className="w-4 h-4 text-amber-400" />
                        ) : item.type === 'alert' ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white flex items-center justify-between">
                          <span>{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400 leading-normal">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigate('/notifications');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All Tasks &amp; Notifications &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 pl-2 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            <img
              src={currentUser?.avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-white truncate max-w-[130px]">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">
                {currentUser?.badgeNumber}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-800">
                <div className="text-xs font-bold text-white">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{currentUser?.rank}</div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">{currentUser?.department}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Officer Profile &amp; Credentials
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  System Configuration
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
