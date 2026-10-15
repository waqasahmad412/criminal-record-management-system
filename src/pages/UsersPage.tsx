import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface UsersPageProps {
  openCreateModal?: boolean;
}

export const UsersPage: React.FC<UsersPageProps> = ({ openCreateModal }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  React.useEffect(() => {
    if (openCreateModal) {
      handleOpenCreate();
    }
  }, [openCreateModal]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    badgeNumber: '',
    role: 'Police Officer' as UserRole,
    department: '4th Precinct - Patrol Division',
    rank: 'Patrol Officer',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isActive: true
  });

  const refreshUsers = () => {
    setUsers(storage.getUsers());
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      badgeNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'Police Officer',
      department: 'Metropolitan Police Dept',
      rank: 'Officer',
      phone: '+1 (555) 000-0000',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      badgeNumber: u.badgeNumber,
      role: u.role,
      department: u.department,
      rank: u.rank,
      phone: u.phone,
      avatarUrl: u.avatarUrl,
      isActive: u.isActive
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (u: User) => {
    if (!currentUser) return;
    if (u.id === currentUser.id) {
      alert('You cannot deactivate your own active administrative session.');
      return;
    }
    const updated = { ...u, isActive: !u.isActive };
    storage.saveUser(updated, currentUser);
    refreshUsers();
  };

  const handleDeleteClick = (u: User) => {
    if (!currentUser) return;
    if (u.id === currentUser.id) {
      alert('Security restriction: You cannot delete your own active administrator account.');
      return;
    }
    setDeletingUser(u);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser || !currentUser) return;
    if (deletingUser.id === currentUser.id) {
      alert('Security restriction: You cannot delete your own active administrator account.');
      setDeletingUser(null);
      return;
    }
    storage.deleteUser(deletingUser.id, currentUser);
    refreshUsers();
    setDeletingUser(null);
    if (editingUser?.id === deletingUser.id) {
      setIsModalOpen(false);
      setEditingUser(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    let permissions: string[] = [];
    if (formData.role === 'Administrator') {
      permissions = ['ALL_PERMISSIONS', 'USER_MANAGE', 'SETTINGS_MANAGE', 'AUDIT_VIEW', 'RECORDS_DELETE'];
    } else if (formData.role === 'Police Officer') {
      permissions = ['RECORD_CREATE', 'RECORD_EDIT', 'ARREST_MANAGE', 'COMPLAINT_MANAGE', 'CASE_VIEW'];
    } else if (formData.role === 'Investigator') {
      permissions = ['CASE_MANAGE', 'NOTE_ADD', 'EVIDENCE_LINK', 'CASE_STATUS_UPDATE', 'RECORD_VIEW'];
    } else if (formData.role === 'Supervisor') {
      permissions = ['CASE_APPROVE', 'WORKFLOW_MONITOR', 'RECORD_VIEW', 'AUDIT_VIEW', 'TASK_ASSIGN'];
    } else if (formData.role === 'Court Official') {
      permissions = ['RECORD_READ_ONLY', 'CASE_READ_ONLY', 'EVIDENCE_READ_ONLY', 'COURT_EXPORT'];
    }

    const savedUser: User = {
      id: editingUser ? editingUser.id : `usr-${Date.now().toString().slice(-5)}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      badgeNumber: formData.badgeNumber.trim(),
      role: formData.role,
      department: formData.department.trim(),
      rank: formData.rank.trim(),
      phone: formData.phone.trim(),
      avatarUrl: formData.avatarUrl.trim(),
      isActive: formData.isActive,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
      permissions
    };

    storage.saveUser(savedUser, currentUser);
    refreshUsers();
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.badgeNumber.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchQ && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Personnel &amp; Access Control
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 text-xs font-mono font-semibold border border-red-500/20">
              ADMINISTRATIVE OVERSIGHT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Role-based authorization (RBAC), credential management, and badge directory.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Provision User Account
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search personnel by name, badge number, email..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden font-mono"
        >
          <option value="ALL">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Police Officer">Police Officer</option>
          <option value="Investigator">Investigator</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Court Official">Court Official</option>
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(u => (
          <div
            key={u.id}
            className={`p-5 rounded-2xl border transition-all ${
              u.isActive
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-slate-950/60 border-slate-800/60 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={u.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{u.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">{u.rank}</div>
                  <div className="text-[10px] text-blue-400 font-mono font-semibold">
                    Badge: {u.badgeNumber}
                  </div>
                </div>
              </div>
              <Badge type="role" value={u.role} size="sm" />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2 text-slate-400 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 truncate">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{u.department}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${
                  u.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {u.isActive ? 'ACTIVE CREDENTIALS' : 'SUSPENDED / INACTIVE'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleActive(u)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    u.isActive
                      ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-950/30'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30'
                  }`}
                  title={u.isActive ? 'Suspend Account' : 'Reactivate Account'}
                >
                  {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDeleteClick(u)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  title="Delete User Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  {editingUser ? `Update Account ${editingUser.badgeNumber}` : 'Provision Personnel Account'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Officer Full Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@crms.gov"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="PO-XXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Police Officer">Police Officer</option>
                    <option value="Investigator">Investigator</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Court Official">Court Official</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Rank / Title</label>
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    placeholder="E.g. Detective First Grade"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Department / Division</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="E.g. CID - Major Crimes Division"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded-sm bg-slate-800 text-blue-600"
                  />
                  <span>
                    <strong>Account Enabled:</strong> Personnel credentials valid for active system authentication.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                {editingUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      const uToDelete = editingUser;
                      setIsModalOpen(false);
                      handleDeleteClick(uToDelete);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Account
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase shadow-sm"
                  >
                    {editingUser ? 'Save Changes' : 'Create Credentials'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <ConfirmModal
          isOpen={!!deletingUser}
          title={`Delete Account: ${deletingUser.name}`}
          message={`Are you sure you want to permanently delete the personnel account for ${deletingUser.name} (${deletingUser.badgeNumber} - ${deletingUser.role})? This user will no longer be able to log in, and this action is recorded in the permanent audit logs.`}
          confirmText="Permanently Delete Account"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};
