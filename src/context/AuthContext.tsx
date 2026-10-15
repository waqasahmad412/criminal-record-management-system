import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    role: 'Administrator' | 'Police Officer';
    badgeNumber?: string;
    department?: string;
  }) => Promise<User>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (profile: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  canEditRecord: () => boolean;
  canDeleteRecord: () => boolean;
  canManageCases: () => boolean;
  canManageUsers: () => boolean;
  canViewAudit: () => boolean;
  canManageEvidence: () => boolean;
  isReadOnly: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'CRMS_ACTIVE_USER_ID';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const users = storage.getUsers();
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      const found = users.find(u => u.id === savedUserId);
      if (found && found.isActive) {
        setCurrentUser(found);
        return;
      }
    }
    // Default to Administrator for demo convenience, or Officer
    if (users.length > 0) {
      setCurrentUser(users[0]);
      localStorage.setItem(CURRENT_USER_KEY, users[0].id);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password ? password.trim() : '';

    if (!cleanEmail) {
      throw new Error('Invalid email: Email address cannot be empty.');
    }

    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase().trim() === cleanEmail);

    // 1. Check if email exists
    if (!user) {
      throw new Error('Invalid email: No registered account found with this email. Please check your email or register.');
    }

    // 2. Check if account is active
    if (!user.isActive) {
      throw new Error('Account inactive: This account has been deactivated by the system administrator.');
    }

    // 3. Check if password matches
    const expectedPassword = user.password || 'password123';
    if (!cleanPass || cleanPass !== expectedPassword) {
      throw new Error('Invalid password: The password you entered is incorrect.');
    }

    // Both email & password match! Authenticate user
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    
    storage.logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userBadge: user.badgeNumber,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      resourceTitle: user.name,
      status: 'Success',
      ipAddress: '10.240.10.2',
      details: `User successfully signed in with verified credentials for ${user.email}.`
    });

    return true;
  };

  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    role: 'Administrator' | 'Police Officer';
    badgeNumber?: string;
    department?: string;
  }): Promise<User> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.password ? data.password.trim() : 'password123';

    if (!cleanEmail) {
      throw new Error('Invalid email: Please provide a valid email address.');
    }

    const existing = storage.getUsers().find(u => u.email.toLowerCase().trim() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const badge = data.badgeNumber?.trim() || (data.role === 'Administrator'
      ? `ADM-${Math.floor(100 + Math.random() * 900)}`
      : `PO-${Math.floor(1000 + Math.random() * 9000)}`);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: cleanPassword,
      badgeNumber: badge,
      role: data.role,
      department: data.department?.trim() || (data.role === 'Administrator'
        ? 'Metropolitan Police HQ - Internal Affairs & Admin'
        : 'Central Precinct - Patrol Division'),
      rank: data.role === 'Administrator' ? 'System Administrator' : 'Senior Patrol Officer',
      avatarUrl: data.role === 'Administrator'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 019-4400',
      isActive: true,
      createdAt: new Date().toISOString(),
      permissions: data.role === 'Administrator'
        ? ['ALL_PERMISSIONS', 'USER_MANAGE', 'SETTINGS_MANAGE', 'AUDIT_VIEW', 'RECORDS_DELETE', 'ARCHIVE_OVERRIDE']
        : ['RECORD_CREATE', 'RECORD_EDIT', 'ARREST_MANAGE', 'COMPLAINT_MANAGE', 'CASE_VIEW']
    };

    storage.saveUser(newUser);

    storage.logAudit({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      userBadge: newUser.badgeNumber,
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: newUser.id,
      resourceTitle: newUser.name,
      status: 'Success',
      ipAddress: '10.240.10.2',
      details: `Self-registered new account as ${newUser.role} (${newUser.badgeNumber}) with password protection.`
    });

    return newUser;
  };

  const logout = () => {
    if (currentUser) {
      storage.logAudit({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userBadge: currentUser.badgeNumber,
        action: 'USER_LOGOUT',
        resourceType: 'User',
        resourceId: currentUser.id,
        resourceTitle: currentUser.name,
        status: 'Success',
        ipAddress: '10.240.10.2',
        details: 'User explicitly logged out.'
      });
    }
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const switchUser = (userId: string) => {
    const users = storage.getUsers();
    const found = users.find(u => u.id === userId);
    if (found && found.isActive) {
      setCurrentUser(found);
      localStorage.setItem(CURRENT_USER_KEY, found.id);
      
      storage.logAudit({
        userId: found.id,
        userName: found.name,
        userRole: found.role,
        userBadge: found.badgeNumber,
        action: 'ROLE_SWITCH',
        resourceType: 'User',
        resourceId: found.id,
        resourceTitle: found.name,
        status: 'Success',
        ipAddress: '10.240.10.2',
        details: `Switched active role session to ${found.name} [${found.role}].`
      });
    }
  };

  const updateCurrentUserProfile = (profile: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    storage.saveUser(updated, currentUser);
    setCurrentUser(updated);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Administrator') return true;
    if (currentUser.permissions.includes('ALL_PERMISSIONS')) return true;
    return currentUser.permissions.includes(permission);
  };

  const isReadOnly = () => {
    return currentUser?.role === 'Court Official';
  };

  const canEditRecord = () => {
    if (!currentUser) return false;
    return ['Administrator', 'Police Officer', 'Supervisor'].includes(currentUser.role);
  };

  const canDeleteRecord = () => {
    if (!currentUser) return false;
    return currentUser.role === 'Administrator';
  };

  const canManageCases = () => {
    if (!currentUser) return false;
    return ['Administrator', 'Investigator', 'Supervisor'].includes(currentUser.role);
  };

  const canManageUsers = () => {
    if (!currentUser) return false;
    return currentUser.role === 'Administrator';
  };

  const canViewAudit = () => {
    if (!currentUser) return false;
    return ['Administrator', 'Supervisor'].includes(currentUser.role);
  };

  const canManageEvidence = () => {
    if (!currentUser) return false;
    return ['Administrator', 'Investigator', 'Police Officer', 'Supervisor'].includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        switchUser,
        updateCurrentUserProfile,
        hasPermission,
        canEditRecord,
        canDeleteRecord,
        canManageCases,
        canManageUsers,
        canViewAudit,
        canManageEvidence,
        isReadOnly
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
