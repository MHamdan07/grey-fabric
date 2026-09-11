import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, UserCheck, Check, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { userService } from '../services/mastersService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PERMISSION_SECTIONS = [
  {
    category: 'Costing Engine & Ledger',
    permissions: [
      { id: 'COSTING_VIEW', label: 'View Costing Records' },
      { id: 'COSTING_CREATE', label: 'Create New Costings' },
      { id: 'COSTING_EDIT', label: 'Edit Existing Costings' },
      { id: 'COSTING_DELETE', label: 'Delete Costing Records' },
      { id: 'COSTING_EXPORT', label: 'Export Costings (Excel / CSV)', isExport: true }
    ]
  },
  {
    category: 'Production Planning',
    permissions: [
      { id: 'PRODUCTION_VIEW', label: 'View Production Plans' },
      { id: 'PRODUCTION_CREATE', label: 'Create Production Batches' },
      { id: 'PRODUCTION_EDIT', label: 'Edit Production Plans' },
      { id: 'PRODUCTION_EXPORT', label: 'Export Production Plans (Excel)', isExport: true }
    ]
  },
  {
    category: 'Master Data & Process Tariffs',
    permissions: [
      { id: 'YARN_VIEW', label: 'View Yarn Master' },
      { id: 'YARN_EXPORT', label: 'Export Yarn Master (Excel)', isExport: true },
      { id: 'FABRIC_VIEW', label: 'View Fabric Master' },
      { id: 'FABRIC_EXPORT', label: 'Export Fabric Master (Excel)', isExport: true },
      { id: 'CHARGES_VIEW', label: 'View Process Charges' },
      { id: 'CHARGES_EXPORT', label: 'Export Process Tariffs (Excel)', isExport: true }
    ]
  },
  {
    category: 'Reports & Compliance Audit',
    permissions: [
      { id: 'REPORT_VIEW', label: 'View Costing & Yield Reports' },
      { id: 'REPORT_EXPORT', label: 'Export Comprehensive Reports', isExport: true },
      { id: 'ACTIVITY_LOG_VIEW', label: 'View System Audit Trail' },
      { id: 'USER_EXPORT', label: 'Export User Registry (Admin)', isExport: true }
    ]
  }
];

const DEFAULT_STAFF_PERMS = [
  'COSTING_VIEW', 'COSTING_CREATE', 'COSTING_EDIT', 'COSTING_EXPORT',
  'PRODUCTION_VIEW', 'PRODUCTION_CREATE', 'PRODUCTION_EDIT', 'PRODUCTION_EXPORT',
  'REPORT_VIEW', 'REPORT_EXPORT'
];

export const Users = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    status: 'active',
    permissions: [...DEFAULT_STAFF_PERMS]
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      if (res?.data) setUsers(res.data);
    } catch (e) {
      console.error(e);
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      status: 'active',
      permissions: [...DEFAULT_STAFF_PERMS]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      status: u.status,
      permissions: Array.isArray(u.permissions) ? [...u.permissions] : [...DEFAULT_STAFF_PERMS]
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permId) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      const updated = current.includes(permId)
        ? current.filter((p) => p !== permId)
        : [...current, permId];
      return { ...prev, permissions: updated };
    });
  };

  const handleSelectAll = () => {
    const all = PERMISSION_SECTIONS.flatMap((s) => s.permissions.map((p) => p.id));
    setFormData((prev) => ({ ...prev, permissions: all }));
  };

  const handleResetDefaults = () => {
    setFormData((prev) => ({ ...prev, permissions: [...DEFAULT_STAFF_PERMS] }));
  };

  const handleClearAll = () => {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await userService.update(editingId, {
          name: formData.name,
          role: formData.role,
          status: formData.status,
          permissions: formData.permissions
        });
        addToast(`User ${formData.name} updated successfully`, 'success');
      } else {
        await userService.create(formData);
        addToast(`New user ${formData.name} created successfully`, 'success');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      addToast('Operation failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await userService.delete(id);
      addToast('User deleted successfully', 'success');
      loadUsers();
    } catch (err) {
      addToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-orange-brand" />
            User Access & Permissions
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage costing system operators, administrators, and granular export privileges.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Create New User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>User Name</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>System Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active Permissions</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                Loading users...
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => {
              const isAdminUser = u.role === 'admin';
              const perms = Array.isArray(u.permissions) ? u.permissions : [];
              const hasCostingExport = perms.includes('COSTING_EXPORT');
              const hasProdExport = perms.includes('PRODUCTION_EXPORT');

              return (
                <TableRow key={u.id}>
                  <TableCell className="font-semibold text-white">
                    {u.name}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-[10px] text-orange-brand font-mono font-bold bg-orange-pill px-1.5 py-0.5 rounded">
                        (You)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={isAdminUser ? 'orange' : 'neutral'} size="sm">
                      {u.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'active' ? 'success' : 'danger'} size="sm">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAdminUser ? (
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Full Admin Access
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-mono text-gray-300 bg-[#181920] px-2 py-0.5 rounded border border-dark-border">
                          {perms.length} granted
                        </span>
                        {hasCostingExport && (
                          <span className="text-[10px] font-mono text-orange-brand bg-orange-pill px-1.5 py-0.5 rounded">
                            Costing Export
                          </span>
                        )}
                        {hasProdExport && (
                          <span className="text-[10px] font-mono text-orange-brand bg-orange-pill px-1.5 py-0.5 rounded">
                            Prod Export
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-400 font-mono text-xs">
                    {u.created_at?.slice(0, 10)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User & Permissions"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          title="Delete User"
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#222530] rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* User Edit & Permissions Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit User & Permissions' : 'Create New System User'}
        subtitle="Manage user credentials, system role, and individual data export permissions"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Taylor Morgan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="user@greycost.com"
              disabled={!!editingId}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {!editingId && (
            <Input
              label="Temporary Password"
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="System Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'staff', label: 'Staff (Configurable Granular Permissions)' },
                { value: 'admin', label: 'Administrator (Unrestricted Access)' }
              ]}
            />
            <Select
              label="Account Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>

          {/* Granular Permissions Section */}
          <div className="p-4 bg-[#14151B] border border-dark-border rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-border pb-3">
              <div>
                <span className="text-xs font-bold text-white block uppercase tracking-wider">
                  Granular Permissions & Export Access
                </span>
                <span className="text-[10px] text-gray-400">
                  {formData.role === 'admin'
                    ? 'Administrators automatically have all permissions enabled'
                    : 'Control which modules and export features this staff user can access'}
                </span>
              </div>

              {formData.role === 'staff' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[10px] text-orange-brand hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-[10px] text-gray-400 hover:text-white"
                  >
                    Staff Defaults
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {formData.role === 'admin' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Full administrative privileges active. All exports, master edits, and audits are unlocked.</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {PERMISSION_SECTIONS.map((sec) => (
                  <div key={sec.category} className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-brand block">
                      {sec.category}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sec.permissions.map((p) => {
                        const isChecked = (formData.permissions || []).includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-[#1E2028] border-orange-brand/40 text-white'
                                : 'bg-[#181920] border-dark-border text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.id)}
                              className="rounded border-gray-600 text-orange-brand focus:ring-orange-brand bg-dark-bg h-3.5 w-3.5"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-medium block truncate">
                                {p.label}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono block">
                                {p.id}
                              </span>
                            </div>
                            {p.isExport && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-pill text-orange-brand font-mono font-bold shrink-0">
                                EXPORT
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-dark-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
