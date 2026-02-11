import React from 'react';
import SystemAdminLayout from './SystemAdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const badgeClass = (status) => {
  if (status === 'active') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if (status === 'pending') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  return 'bg-gray-50 border-gray-200 text-gray-700';
};

const SystemAdminUsersLayout = ({ onNavigate, onLogout }) => {
  const [query, setQuery] = React.useState('');
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [disableModalOpen, setDisableModalOpen] = React.useState(false);
  const [disableUserId, setDisableUserId] = React.useState(null);
  const [disableReasonOption, setDisableReasonOption] = React.useState('Policy violation');
  const [disableCustomReason, setDisableCustomReason] = React.useState('');

  const getAccessToken = () => {
    try {
      return localStorage.getItem('accessToken');
    } catch (e) {
      return null;
    }
  };

  const sendToggleRequest = async (id, payload) => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/toggle-status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data?.detail || data?.error || 'Failed to update user status.');
      return null;
    }

    return data;
  };

  const openDisableModal = (id) => {
    setDisableUserId(id);
    setDisableReasonOption('Policy violation');
    setDisableCustomReason('');
    setDisableModalOpen(true);
  };

  const closeDisableModal = () => {
    setDisableModalOpen(false);
    setDisableUserId(null);
    setDisableReasonOption('Policy violation');
    setDisableCustomReason('');
  };

  const confirmDisable = async () => {
    if (!disableUserId) return;

    const option = disableReasonOption;
    const custom = (disableCustomReason || '').trim();
    const reason = option === 'Other' ? custom : option;

    if (option === 'Other' && !reason) {
      setError('Please enter a disable reason.');
      return;
    }

    setError('');
    updateUser(disableUserId, { _actionLoading: true });

    try {
      const data = await sendToggleRequest(disableUserId, { reason });
      if (!data) {
        updateUser(disableUserId, { _actionLoading: false });
        return;
      }

      const isActive = !!data?.user?.is_active;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== disableUserId) return u;
          const nextStatus = !u.is_approved ? 'pending' : isActive ? 'active' : 'disabled';
          return { ...u, is_active: isActive, status: nextStatus, _actionLoading: false };
        })
      );

      closeDisableModal();
    } catch (e) {
      setError('Failed to disable user. Please try again.');
      updateUser(disableUserId, { _actionLoading: false });
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toISOString().slice(0, 10);
    } catch (e) {
      return String(value);
    }
  };

  const mapApiUser = (u) => {
    const fullName = `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.email || 'User';
    const status = !u?.is_approved ? 'pending' : u?.is_active ? 'active' : 'disabled';
    return {
      id: u.id,
      name: fullName,
      email: u.email,
      role: u.role,
      status,
      joined: formatDate(u.date_joined || u.created_at),
      is_active: u.is_active,
      is_approved: u.is_approved,
    };
  };

  const loadUsers = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.detail || data?.error || 'Failed to load users.');
        setLoading(false);
        return;
      }

      const results = Array.isArray(data) ? data : data?.results;
      setUsers((results || []).map(mapApiUser));
      setLoading(false);
    } catch (e) {
      setError('Failed to load users. Please check your connection and try again.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.status.toLowerCase().includes(q)
    );
  });

  const updateUser = (id, patch) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const approveUser = async (id) => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    setError('');
    updateUser(id, { _actionLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/approve/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.detail || data?.error || 'Failed to approve user.');
        updateUser(id, { _actionLoading: false });
        return;
      }

      const updated = data?.user ? mapApiUser(data.user) : null;
      if (updated) {
        updateUser(id, { ...updated, _actionLoading: false });
      } else {
        updateUser(id, { status: 'active', is_active: true, is_approved: true, _actionLoading: false });
      }
    } catch (e) {
      setError('Failed to approve user. Please try again.');
      updateUser(id, { _actionLoading: false });
    }
  };

  const toggleUserStatus = async (id) => {
    setError('');
    updateUser(id, { _actionLoading: true });
    try {
      const current = users.find((u) => u.id === id);
      const isDisabling = !!current?.is_active;
      if (isDisabling) {
        updateUser(id, { _actionLoading: false });
        openDisableModal(id);
        return;
      }

      const data = await sendToggleRequest(id, null);
      if (!data) {
        updateUser(id, { _actionLoading: false });
        return;
      }

      const isActive = !!data?.user?.is_active;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          const nextStatus = !u.is_approved ? 'pending' : isActive ? 'active' : 'disabled';
          return { ...u, is_active: isActive, status: nextStatus, _actionLoading: false };
        })
      );
    } catch (e) {
      setError('Failed to update user status. Please try again.');
      updateUser(id, { _actionLoading: false });
    }
  };

  return (
    <SystemAdminLayout currentSection="sys_users" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-heading">User Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            View users, approve pending accounts, or disable access.
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, role, status"
                className="w-full rounded-full border border-background-dark bg-background-soft px-4 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
            </div>

            <div className="text-xs text-text-muted">
              Showing <span className="font-semibold text-text-primary">{filtered.length}</span> users
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-4 text-sm text-text-secondary">
              Loading users...
            </div>
          )}

          <div className="border-t border-background-dark/60 my-4" />

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-dark/60">
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-heading">{u.name}</div>
                      <div className="text-xs text-text-secondary">{u.email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{u.role}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClass(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-text-secondary">{u.joined}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => approveUser(u.id)}
                          disabled={u.status !== 'pending' || u._actionLoading}
                          className="rounded-full border border-background-dark px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(u.id)}
                          disabled={u.role === 'super_admin' || u._actionLoading}
                          className="rounded-full border border-background-dark px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                        >
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {disableModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-background-dark">
              <div className="p-5 border-b border-background-dark/60">
                <h2 className="text-lg font-bold text-heading">Disable user</h2>
                <p className="mt-1 text-sm text-text-secondary">Select a reason. This reason will be emailed to the user.</p>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">Reason</label>
                  <select
                    value={disableReasonOption}
                    onChange={(e) => setDisableReasonOption(e.target.value)}
                    className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  >
                    <option value="Policy violation">Policy violation</option>
                    <option value="Suspicious activity">Suspicious activity</option>
                    <option value="Spam / abuse">Spam / abuse</option>
                    <option value="User request">User request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {disableReasonOption === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-heading mb-1">Custom reason</label>
                    <textarea
                      value={disableCustomReason}
                      onChange={(e) => setDisableCustomReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      placeholder="Write the reason..."
                    />
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDisableModal}
                  className="rounded-xl border border-background-dark bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDisable}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                >
                  Disable user
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </SystemAdminLayout>
  );
};

export default SystemAdminUsersLayout;
