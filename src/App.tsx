import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { RecordDetailPage } from './pages/RecordDetailPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ArrestsPage } from './pages/ArrestsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { EvidencePage } from './pages/EvidencePage';
import { EvidenceDetailPage } from './pages/EvidenceDetailPage';
import { SearchPage } from './pages/SearchPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { TasksNotificationsPage } from './pages/TasksNotificationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RolesPermissionsPage } from './pages/RolesPermissionsPage';
import { BackupRestorePage } from './pages/BackupRestorePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { NotFoundPage } from './pages/NotFoundPage';

function MainRouter() {
  const { isAuthenticated, currentUser, canManageUsers, canViewAudit } = useAuth();

  // Navigation state using hash-based routing with popstate support
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  const [modalTriggers, setModalTriggers] = useState<{
    newRecord?: boolean;
    newCase?: boolean;
    newArrest?: boolean;
    newComplaint?: boolean;
  }>({});

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentRoute(hash || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  // If not authenticated, only allow login and reset-password
  if (!isAuthenticated) {
    if (currentRoute === '/reset-password') {
      return <ResetPasswordPage onNavigate={navigate} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  // Handle Detail Routes
  const recordDetailMatch = currentRoute.match(/^\/records\/([^/?]+)/);
  if (recordDetailMatch && recordDetailMatch[1] !== 'new') {
    return (
      <AppLayout currentRoute="/records" onNavigate={navigate}>
        <RecordDetailPage
          recordId={recordDetailMatch[1]}
          onBack={() => navigate('/records')}
          onNavigate={navigate}
        />
      </AppLayout>
    );
  }

  const caseDetailMatch = currentRoute.match(/^\/cases\/([^/?]+)/);
  if (caseDetailMatch && caseDetailMatch[1] !== 'new') {
    return (
      <AppLayout currentRoute="/cases" onNavigate={navigate}>
        <CaseDetailPage
          caseId={caseDetailMatch[1]}
          onBack={() => navigate('/cases')}
          onNavigate={navigate}
        />
      </AppLayout>
    );
  }

  const evidenceDetailMatch = currentRoute.match(/^\/evidence\/([^/?]+)/);
  if (evidenceDetailMatch && evidenceDetailMatch[1] !== 'new') {
    return (
      <AppLayout currentRoute="/evidence" onNavigate={navigate}>
        <EvidenceDetailPage
          evidenceId={evidenceDetailMatch[1]}
          onBack={() => navigate('/evidence')}
          onNavigate={navigate}
        />
      </AppLayout>
    );
  }

  // Parse search query parameter if any
  const isSearchRoute = currentRoute.startsWith('/search');
  let initialSearchQuery = '';
  if (isSearchRoute && currentRoute.includes('?q=')) {
    const parts = currentRoute.split('?q=');
    if (parts.length > 1) {
      initialSearchQuery = decodeURIComponent(parts[1]);
    }
  }

  // Render Page Content inside layout
  const renderContent = () => {
    switch (currentRoute) {
      case '/':
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenNewRecord={() => {
              setModalTriggers({ newRecord: true });
              navigate('/records');
            }}
            onOpenNewCase={() => {
              setModalTriggers({ newCase: true });
              navigate('/cases');
            }}
            onOpenNewArrest={() => {
              setModalTriggers({ newArrest: true });
              navigate('/arrests');
            }}
            onOpenNewComplaint={() => {
              setModalTriggers({ newComplaint: true });
              navigate('/complaints');
            }}
          />
        );

      case '/records':
      case '/records/new':
        return (
          <RecordsPage
            onNavigate={navigate}
            openCreateModal={currentRoute === '/records/new' || !!modalTriggers.newRecord}
          />
        );

      case '/cases':
      case '/cases/new':
      case '/assigned-cases':
        return (
          <CasesPage
            onNavigate={navigate}
            openCreateModal={currentRoute === '/cases/new' || !!modalTriggers.newCase}
            assignedOnly={currentRoute === '/assigned-cases'}
          />
        );

      case '/arrests':
      case '/arrests/new':
        return (
          <ArrestsPage
            onNavigate={navigate}
            openCreateModal={currentRoute === '/arrests/new' || !!modalTriggers.newArrest}
          />
        );

      case '/complaints':
      case '/complaints/new':
        return (
          <ComplaintsPage
            onNavigate={navigate}
            openCreateModal={currentRoute === '/complaints/new' || !!modalTriggers.newComplaint}
          />
        );

      case '/evidence':
      case '/evidence/new':
        return (
          <EvidencePage
            onNavigate={navigate}
            openCreateModal={currentRoute === '/evidence/new'}
          />
        );

      case '/search':
        return <SearchPage onNavigate={navigate} initialQuery={initialSearchQuery} />;

      case '/reports':
        return <ReportsPage />;

      case '/notifications':
        return <TasksNotificationsPage initialTab="notifications" />;

      case '/tasks':
        return <TasksNotificationsPage initialTab="tasks" />;

      case '/profile':
        return <ProfilePage />;

      case '/change-password':
        return <ChangePasswordPage onNavigate={navigate} />;

      case '/users':
      case '/users/new':
        if (!canManageUsers()) {
          return <AccessDeniedPage onNavigate={navigate} requiredRole="Administrator" />;
        }
        return <UsersPage openCreateModal={currentRoute === '/users/new'} />;

      case '/roles':
        if (currentUser?.role !== 'Administrator') {
          return <AccessDeniedPage onNavigate={navigate} requiredRole="Administrator" />;
        }
        return <RolesPermissionsPage />;

      case '/backup':
        if (currentUser?.role !== 'Administrator') {
          return <AccessDeniedPage onNavigate={navigate} requiredRole="Administrator" />;
        }
        return <BackupRestorePage />;

      case '/audit-logs':
        if (!canViewAudit()) {
          return <AccessDeniedPage onNavigate={navigate} requiredRole="Supervisor or Administrator" />;
        }
        return <AuditLogsPage />;

      case '/settings':
        if (currentUser?.role !== 'Administrator') {
          return <AccessDeniedPage onNavigate={navigate} requiredRole="Administrator" />;
        }
        return <SettingsPage />;

      default:
        if (currentRoute.startsWith('/search')) {
          return <SearchPage onNavigate={navigate} initialQuery={initialSearchQuery} />;
        }
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout currentRoute={currentRoute} onNavigate={navigate}>
      {renderContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
