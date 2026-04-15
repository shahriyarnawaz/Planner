import React from 'react';

const AdminHeader = ({ onLogout }) => {
  const today = new Date().toLocaleDateString();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

  const fetchNotifications = React.useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;
      const res = await fetch(`${API_BASE_URL}/notifications/list/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error('Fetch notifications error', err);
    }
  }, [API_BASE_URL]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/notifications/mark-all-read/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Mark all read error', err);
    }
  };

  const storedUser = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const fullName = React.useMemo(() => {
    const first = storedUser?.first_name || storedUser?.firstName || '';
    const last = storedUser?.last_name || storedUser?.lastName || '';
    const combined = `${first} ${last}`.trim();
    return combined || storedUser?.email || 'User';
  }, [storedUser]);

  const initials = React.useMemo(() => {
    const first = storedUser?.first_name || storedUser?.firstName || '';
    const last = storedUser?.last_name || storedUser?.lastName || '';
    const a = (first || '').trim().slice(0, 1).toUpperCase();
    const b = (last || '').trim().slice(0, 1).toUpperCase();
    const result = `${a}${b}`.trim();
    return result || (storedUser?.email || 'U').slice(0, 1).toUpperCase();
  }, [storedUser]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }

    setMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="h-16 border-b border-background-dark bg-white/80 backdrop-blur flex items-center justify-between px-6 lg:px-10">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search tasks, templates..."
            className="w-full rounded-full border border-background-dark bg-background-soft pl-9 pr-3 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
      </div>

      {/* Right side: Date, Bell, Profile */}
      <div className="ml-4 flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end text-xs text-text-secondary">
          <span className="font-medium text-text-primary">Today</span>
          <span>{today}</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-background-dark bg-white text-text-secondary hover:text-primary hover:border-primary transition-colors"
          >
            <span className="text-lg" aria-hidden="true">
              🔔
            </span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-gold text-[9px] text-text-primary font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-background-dark bg-white shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-background-dark flex items-center justify-between bg-background-soft/50">
                <h3 className="text-sm font-bold text-heading">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] font-semibold text-primary hover:underline uppercase tracking-wider">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-background-dark/50 hover:bg-background-soft transition-colors cursor-default ${!n.is_read ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${!n.is_read ? 'text-heading' : 'text-text-primary'}`}>{n.title}</p>
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-muted mt-1.5 uppercase tracking-tight">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <div className="h-9 w-9 rounded-full bg-olive-light text-white flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-xs leading-tight text-left">
              <span className="font-medium text-text-primary">{fullName}</span>
              <span className="text-text-muted">Personal Workspace</span>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-background-dark bg-white shadow-lg overflow-hidden z-30">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-background-soft hover:text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
