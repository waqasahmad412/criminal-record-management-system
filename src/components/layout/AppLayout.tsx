import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Responsive sidebar collapse on resize & navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-900">
        {/* Header Bar */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={onNavigate}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-900/70">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
