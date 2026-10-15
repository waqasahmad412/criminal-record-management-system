import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  Building2,
  BadgeAlert,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Clock,
  FileText,
  Fingerprint,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../services/storage';
import policeStationImg from '../assets/images/police_station_hq_1791928546928.jpg';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

type AuthMode = 'login' | 'register';
type SelectedRole = 'Admin' | 'User';

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mode: Sign In or Register
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Role dropdown: Admin vs User
  const [selectedRole, setSelectedRole] = useState<SelectedRole>('Admin');

  // Login form fields
  const [email, setEmail] = useState('admin@crms.gov');
  const [password, setPassword] = useState('password123');

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regBadge, setRegBadge] = useState('ADM-101');
  const [regDepartment, setRegDepartment] = useState('Metropolitan Police HQ - Administration');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-login if opened with ?direct=1 or #direct or ?demo=1 for zero-loading instant access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      if (search.includes('direct=1') || search.includes('guest=1') || search.includes('demo=1') || hash.includes('direct')) {
        login('admin@crms.gov', 'password123').then(() => {
          onNavigate('/');
        }).catch(() => {});
      }
    }
  }, []);

  // Handle switching the role dropdown in Login mode
  const handleRoleChange = (role: SelectedRole) => {
    setSelectedRole(role);
    setError('');
    // Only pre-fill demo credentials if the email is empty or is currently one of the default emails
    if (authMode === 'login') {
      if (!email.trim() || email === 'admin@crms.gov' || email === 'officer@crms.gov') {
        if (role === 'Admin') {
          setEmail('admin@crms.gov');
          setPassword('password123');
        } else {
          setEmail('officer@crms.gov');
          setPassword('password123');
        }
      }
    } else {
      if (role === 'Admin') {
        setRegBadge(`ADM-${Math.floor(100 + Math.random() * 900)}`);
        setRegDepartment('Metropolitan Police HQ - Administration');
      } else {
        setRegBadge(`PO-${Math.floor(1000 + Math.random() * 9000)}`);
        setRegDepartment('Central Precinct - Patrol Division');
      }
    }
  };

  const handleModeSwitch = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    if (mode === 'register') {
      setRegEmail('');
      setRegName('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegBadge(selectedRole === 'Admin' ? `ADM-${Math.floor(100 + Math.random() * 900)}` : `PO-${Math.floor(1000 + Math.random() * 9000)}`);
      setRegDepartment(selectedRole === 'Admin' ? 'Metropolitan Police HQ - Administration' : 'Central Precinct - Patrol Division');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Invalid email: Please enter your registered email address.');
      return;
    }
    if (!password) {
      setError('Invalid password: Password cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        onNavigate('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setError('Please provide your full legal officer name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Invalid email: Please provide an official departmental email address.');
      return;
    }
    if (!regPassword) {
      setError('Invalid password: Password cannot be empty.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Invalid password: Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    try {
      const roleMapped = selectedRole === 'Admin' ? 'Administrator' : 'Police Officer';
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: roleMapped,
        badgeNumber: regBadge.trim(),
        department: regDepartment.trim()
      });

      const savedEmail = regEmail.trim();
      const savedPassword = regPassword.trim();

      // Automatically populate sign in credentials with the registered email & password
      setEmail(savedEmail);
      setPassword(savedPassword);
      setAuthMode('login');
      setSuccessMsg(`Registration successful! Account registered for ${savedEmail}. You can now sign in with your registered email and password, or click 'Enter Portal'.`);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get active system counts for hero presentation
  const state = storage.getState();
  const totalRecords = state.records?.length || 0;
  const activeCases = state.cases?.filter((c: any) => c.status === 'Open' || c.status === 'Under Investigation')?.length || 0;
  const totalEvidence = state.evidence?.length || 0;

  return (
    <div className="relative min-h-screen w-screen flex flex-col lg:flex-row overflow-x-hidden text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 
        ========================================================================
        FULL SCREEN POLICE STATION HQ BACKGROUND IMAGE
        Covers the entire screen and is visible everywhere, including behind the
        right-side translucent glassmorphic login page container!
        ========================================================================
      */}
      <div className="fixed inset-0 z-0">
        <img
          src={policeStationImg}
          alt="Metropolitan Police Department Central Headquarters"
          className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.12]"
        />
        {/* Dark cinematic ambient overlays for crisp contrast & atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/45 pointer-events-none" />
        <div className="absolute inset-0 bg-blue-950/25 mix-blend-multiply pointer-events-none" />
      </div>

      {/* 
        ========================================================================
        LEFT SIDE: POLICE HEADQUARTERS BADGES, STATS & OPERATIONAL OVERVIEW
        Rests beautifully directly over the police station background
        ========================================================================
      */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-[380px] lg:min-h-screen">
        {/* Top Badges & Agency Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 backdrop-blur-md border border-blue-400/30 shadow-lg text-blue-300">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider font-mono text-white drop-shadow-md">
                  METROPOLITAN POLICE <span className="text-blue-400">CRMS</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-blue-900/60 backdrop-blur-sm text-blue-300 border border-blue-500/40 rounded-sm">
                  DISTRICT 04 HQ
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono tracking-tight uppercase drop-shadow">
                Criminal Record &amp; Custody Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Central Command Active 24/7
            </span>
          </div>
        </div>

        {/* Center Hero Messaging over Police Station */}
        <div className="my-auto py-8 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/40 text-blue-200 text-xs font-mono uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Official Law Enforcement Terminal
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono tracking-tight leading-tight drop-shadow-lg">
            Metropolitan Police Department Headquarters
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow font-normal max-w-xl">
            Unified departmental repository for biometric criminal records, forensic chain-of-custody tracking,
            formal arrest booking slips, and inter-precinct investigative dossiers with strict role-based access control.
          </p>

          {/* Real-time Precinct Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-lg">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-blue-400 mb-1">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Records</span>
              </div>
              <div className="text-lg font-mono font-black text-white">{totalRecords}</div>
              <div className="text-[10px] text-slate-300">Biometrics &amp; Dossiers</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-lg">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-400 mb-1">
                <Radio className="w-3.5 h-3.5" />
                <span>Active Cases</span>
              </div>
              <div className="text-lg font-mono font-black text-white">{activeCases}</div>
              <div className="text-[10px] text-slate-300">Under Investigation</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-lg">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-purple-400 mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Evidence</span>
              </div>
              <div className="text-lg font-mono font-black text-white">{totalEvidence}</div>
              <div className="text-[10px] text-slate-300">Logged in Custody</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-lg">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400 mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Security</span>
              </div>
              <div className="text-lg font-mono font-black text-emerald-400">RBAC 100%</div>
              <div className="text-[10px] text-slate-300">Encrypted Logs</div>
            </div>
          </div>
        </div>

        {/* Bottom Station Details */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Central Precinct Command &bull; 400 Grand Ave Station</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Emergency Dispatch: 911 &bull; Records Line: Ext. 4082</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        RIGHT SIDE: AUTHENTICATION FORM CARD
        Positioned on the RIGHT SIDE as requested!
        Uses translucent glassmorphism (backdrop-blur-xl bg-slate-950/75)
        so the Police Station HQ background image is VISIBLE BEHIND IT!
        ========================================================================
      */}
      <div className="relative z-20 w-full lg:w-[490px] xl:w-[530px] 2xl:w-[560px] shrink-0 min-h-screen flex flex-col justify-between p-5 sm:p-8 lg:p-10 backdrop-blur-2xl bg-slate-950/75 border-l border-white/10 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Brand with Dark/Light Toggle */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-lg shadow-blue-900/40 border border-blue-500/40">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-wider font-mono text-white">
                    CRMS <span className="text-blue-400 font-medium">TERMINAL</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-blue-950/80 text-blue-300 border border-blue-700/50 rounded-sm">
                    RIGHT PANEL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                  Authorized Personnel Portal
                </p>
              </div>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700/80 hover:border-slate-500 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors shadow-xs backdrop-blur-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-mono">Dark</span>
                </>
              )}
            </button>
          </div>

          {/* Mode Switcher Tabs: Sign In vs Register */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Center Form Section */}
        <div className="relative z-10 py-4 space-y-4">
          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-700/70 rounded-xl text-xs text-red-300 flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700/70 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 
            ROLE SELECTOR DROPDOWN (Admin vs User)
            With clear indicator of portal & permissions
          */}
          <div className="space-y-1.5 p-3.5 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Select System Role / Portal:
              </label>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-700/40">
                {selectedRole === 'Admin' ? 'Executive Access' : 'Officer Access'}
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value as SelectedRole)}
                className="w-full appearance-none bg-slate-950/80 border border-slate-700 hover:border-blue-500 rounded-lg pl-3 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-white cursor-pointer focus:outline-hidden focus:border-blue-500 transition-colors font-mono shadow-inner"
              >
                <option value="Admin" className="bg-slate-950 text-white py-1">
                  👑 Admin (Administrator Portal - Full System Authority)
                </option>
                <option value="User" className="bg-slate-950 text-white py-1">
                  👮 User (Police Officer / Standard User Portal - Records &amp; Intake)
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            <p className="text-[10px] text-slate-400">
              {selectedRole === 'Admin' ? (
                <span className="text-amber-400">
                  &bull; <strong>Admin Portal:</strong> User accounts management, audit trails, delete permissions, settings &amp; global system controls.
                </span>
              ) : (
                <span className="text-blue-400">
                  &bull; <strong>User Portal:</strong> Criminal intake, arrest bookings, citizen complaints, evidence custody records &amp; case reports.
                </span>
              )}
            </p>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'login' ? (
            <div className="space-y-3">
              <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Official Department Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={selectedRole === 'Admin' ? 'admin@crms.gov' : 'officer@crms.gov'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Terminal Passcode
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">Default: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter security passcode"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons for Selected Role */}
              <div className="p-2.5 bg-slate-900/70 backdrop-blur-md rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px]">
                  <KeyRound className="w-3 h-3 text-blue-400" />
                  Preset for {selectedRole}:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRole === 'Admin') {
                      setEmail('admin@crms.gov');
                      setPassword('password123');
                    } else {
                      setEmail('officer@crms.gov');
                      setPassword('password123');
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 border border-blue-700/50 font-mono text-[10px] transition-colors"
                >
                  Auto-Fill {selectedRole} Credentials
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : `Enter ${selectedRole} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
          ) : (
            /* REGISTER NEW USER/ADMIN FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Legal Name / Officer Title
                </label>
                <div className="relative">
                  <UserPlus className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g., Officer Alex Mercer"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Official Departmental Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="e.g., amercer@crms.gov"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Badge / Station ID
                  </label>
                  <input
                    type="text"
                    value={regBadge}
                    onChange={(e) => setRegBadge(e.target.value)}
                    placeholder="Badge ID"
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Assigned Unit / Division
                  </label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Precinct Unit"
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Passcode
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 chars"
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Confirm Passcode
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter"
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-2 bg-blue-950/50 backdrop-blur-md rounded-lg border border-blue-900/50 text-[11px] text-blue-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Registering as <strong>{selectedRole === 'Admin' ? 'Administrator' : 'Police Officer'}</strong> with designated rights.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Registering Account...' : `Register & Enter as ${selectedRole}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick toggle prompt */}
          <div className="text-center text-xs text-slate-400 pt-1">
            {authMode === 'login' ? (
              <span>
                New personnel joining precinct?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                >
                  Register new account
                </button>
              </span>
            ) : (
              <span>
                Already registered in registry?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            CRMS SECURE LAW ENFORCEMENT RECORD SYSTEM &bull; INTERNAL USE ONLY
          </p>
        </div>
      </div>
    </div>
  );
};
