'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Shield, User, Trash2, ShieldAlert, RefreshCw, Pencil } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import {
  Modal,
  Button,
  Input,
  DataTable,
  ConfirmDialog,
  SearchableSelect,
  InfoTooltip,
  type ColumnDef,
  type SelectOption,
} from '@gateway-experience/shared';
import { useToast } from '@/components/ui/toast';

export interface AdminUser {
  id: string;
  username: string;
  role: 'superadmin' | 'admin' | 'viewer';
  createdAt: string;
  updatedAt?: string;
}

const CREATE_ROLE_OPTIONS: SelectOption[] = [
  { value: 'superadmin', label: 'Superadmin (Full Access & User CRUD)' },
  { value: 'admin', label: 'Admin (Read/Write Configs & Routes)' },
  { value: 'viewer', label: 'Viewer (Read-Only Access)' },
];

const EDIT_ROLE_OPTIONS: SelectOption[] = [
  { value: 'superadmin', label: 'Superadmin (Full Access)' },
  { value: 'admin', label: 'Admin (Read/Write Configs)' },
  { value: 'viewer', label: 'Viewer (Read-Only)' },
];

export const ApiClientUsersView: React.FC = () => {
  const { toastError, toastSuccess } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'superadmin' | 'admin' | 'viewer'>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role Edit state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'admin' | 'viewer'>('admin');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiGet<{ success: boolean; users?: AdminUser[]; error?: string }>('/api/users');
    if (res.success && res.users) {
      setUsers(res.users);
    } else {
      setError(res.error || 'Failed to load user accounts');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    setIsSubmitting(true);
    const res = await apiPost<{ success: boolean; error?: string }>('/api/users', {
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole,
    });

    if (res.success) {
      toastSuccess('User Created', `User ${newUsername.trim()} has been created.`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('admin');
      setShowAddModal(false);
      fetchUsers();
    } else {
      toastError('Create Failed', res.error || 'Failed to create user');
    }
    setIsSubmitting(false);
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    const res = await apiPut<{ success: boolean; error?: string }>(`/api/users/${userId}/role`, { role });
    if (res.success) {
      toastSuccess('Role Updated', 'User role has been updated.');
      setEditingUser(null);
      fetchUsers();
    } else {
      toastError('Update Failed', res.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Deactivate User Account',
      message: `Are you sure you want to deactivate account "${username}"?`,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiDelete<{ success: boolean; error?: string }>(`/api/users/${userId}`);
        if (res.success) {
          toastSuccess('User Deactivated', `Account ${username} deactivated.`);
          fetchUsers();
        } else {
          toastError('Delete Failed', res.error || 'Failed to delete user');
        }
      },
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/50">
            <ShieldAlert className="w-3 h-3 text-purple-400" /> Superadmin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/50">
            <Shield className="w-3 h-3 text-blue-400" /> Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground border border-border">
            <User className="w-3 h-3 text-muted-foreground" /> Viewer
          </span>
        );
    }
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (u) => (
        <div className="font-medium text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>{u.username}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => getRoleBadge(u.role),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (u) => (
        <span className="text-muted-foreground font-mono text-xs">
          {new Date(u.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setEditingUser(u);
              setSelectedRole(u.role);
            }}
            leftIcon={<Pencil className="w-3 h-3 text-primary" />}
          >
            Edit Role
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => handleDeleteUser(u.id, u.username)}
            title="Deactivate account"
            className="hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Admin User Accounts
            <InfoTooltip
              content="Manage admin credentials and Role-Based Access Control (RBAC) permissions."
              label="About Admin User Accounts"
            />
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={fetchUsers}
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Admin User
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-destructive/10 border border-destructive/30 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        isLoading={loading}
        emptyMessage="No active admin accounts found."
      />

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="sm"
        title="Create Admin Account"
        icon={<UserPlus className="w-4 h-4 text-primary" />}
        isLoading={isSubmitting}
        loadingText="Creating Account..."
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Username</label>
            <Input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. john_doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Password</label>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter account password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Role Permission</label>
            <SearchableSelect
              value={newRole}
              onChange={(v) => setNewRole(v as AdminUser['role'])}
              options={CREATE_ROLE_OPTIONS}
              placeholder="Select role..."
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        size="sm"
        title={`Edit Role for "${editingUser?.username}"`}
        icon={<Shield className="w-4 h-4 text-primary" />}
        isLoading={isSubmitting}
        loadingText="Updating Role..."
      >
        <div className="space-y-3 text-xs">
          <label className="text-muted-foreground font-medium">Select Role</label>
          <SearchableSelect
            value={selectedRole}
            onChange={(v) => setSelectedRole(v as AdminUser['role'])}
            options={EDIT_ROLE_OPTIONS}
            placeholder="Select role..."
          />

          <div className="flex justify-end pt-3 border-t border-border">
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={() => editingUser && handleUpdateRole(editingUser.id, selectedRole)}
            >
              Save Role
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel="Deactivate"
        isDestructive={true}
      />
    </div>
  );
};
