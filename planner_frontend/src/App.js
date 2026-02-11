import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Signup from './components/Auth/signup';
import Login from './components/Auth/login';
import AdminUserDashboardPage from './pages/Admin-User/Dashboard';
import AdminUserTasksPage from './pages/Admin-User/Tasks';
import AdminUserCalendarPage from './pages/Admin-User/Calendar';
import AdminUserTemplatesPage from './pages/Admin-User/Templates';
import AdminUserInsightsPage from './pages/Admin-User/Insights';
import AdminUserSettingsPage from './pages/Admin-User/Settings';

import SystemAdminDashboardPage from './pages/System-Admin/Dashboard';
import SystemAdminUsersPage from './pages/System-Admin/Users';
import SystemAdminTemplatesPage from './pages/System-Admin/Templates';
import SystemAdminMLPage from './pages/System-Admin/ML';
import SystemAdminLogsPage from './pages/System-Admin/Logs';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const decodeJwtPayload = (token) => {
    try {
      const parts = String(token || '').split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = atob(padded);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  const isAccessTokenExpired = (token) => {
    const payload = decodeJwtPayload(token);
    const exp = payload?.exp;
    if (!exp) return true;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds >= exp;
  };

  const clearAuthStorage = () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lastPage');
    } catch (e) {
      // ignore
    }
  };

  const getStoredUserRole = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.role || parsed?.profile?.role || null;
    } catch (e) {
      return null;
    }
  };

  const sectionToPath = (section) => {
    if (section === 'dashboard') return '/dashboard';
    if (section === 'tasks') return '/tasks';
    if (section === 'calendar') return '/calendar';
    if (section === 'templates') return '/templates';
    if (section === 'insights') return '/insights';
    if (section === 'settings') return '/settings';
    if (section === 'sys_dashboard') return '/admin-dashboard';
    if (section === 'sys_users') return '/user-management';
    if (section === 'sys_templates') return '/template-management';
    if (section === 'sys_ml') return '/ml';
    if (section === 'sys_logs') return '/logs';
    return null;
  };

  const pathToSection = (pathname) => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/tasks') return 'tasks';
    if (pathname === '/calendar') return 'calendar';
    if (pathname === '/templates') return 'templates';
    if (pathname === '/insights') return 'insights';
    if (pathname === '/settings') return 'settings';
    if (pathname === '/admin-dashboard') return 'sys_dashboard';
    if (pathname === '/user-management') return 'sys_users';
    if (pathname === '/template-management') return 'sys_templates';
    if (pathname === '/ml') return 'sys_ml';
    if (pathname === '/logs') return 'sys_logs';
    return null;
  };

  const isProtectedPath = (pathname) => {
    return !!pathToSection(pathname);
  };

  const handleAdminNavigate = (section) => {
    const path = sectionToPath(section);
    if (!path) return;

    try {
      localStorage.setItem('lastPage', path);
    } catch (e) {
      // ignore
    }

    navigate(path);
  };

  const logoutAndGoLogin = () => {
    clearAuthStorage();
    navigate('/login');
  };

  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || isAccessTokenExpired(token)) return false;
      return true;
    } catch (e) {
      return false;
    }
  };

  const ProtectedRoute = ({ allowRoles, children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    if (Array.isArray(allowRoles) && allowRoles.length > 0) {
      const role = getStoredUserRole();
      if (!role || !allowRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
      }
    }

    return children;
  };

  React.useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token && isAccessTokenExpired(token)) {
        clearAuthStorage();
        if (isProtectedPath(location.pathname)) {
          navigate('/login', { replace: true });
        }
      }
    } catch (e) {
      // ignore
    }
  }, [location.pathname, navigate]);

  React.useEffect(() => {
    const isAuthenticatedPage = isProtectedPath(location.pathname);

    if (!isAuthenticatedPage) return;

    let timerId = null;
    const idleMs = 15 * 60 * 1000;

    const logoutDueToIdle = () => {
      clearAuthStorage();
      navigate('/login');
    };

    const resetTimer = () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(logoutDueToIdle, idleMs);
    };

    const checkTokenNow = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token || isAccessTokenExpired(token)) {
          logoutDueToIdle();
          return;
        }
      } catch (e) {
        // ignore
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const onActivity = () => {
      checkTokenNow();
      resetTimer();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onActivity();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibilityChange);

    onActivity();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (timerId) clearTimeout(timerId);
    };
  }, [location.pathname, navigate]);

  React.useEffect(() => {
    const pathname = location.pathname;
    if (!isProtectedPath(pathname)) return;

    try {
      localStorage.setItem('lastPage', pathname);
    } catch (e) {
      // ignore
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      {!isProtectedPath(location.pathname) && (
        <Header
          onSignupClick={() => navigate('/signup')}
          onLoginClick={() => navigate('/login')}
          onLogoClick={() => navigate('/')}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/signup"
          element={
            <>
              <div className="max-w-7xl mx-auto px-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-sm text-body hover:text-primary transition-colors"
                >
                  <span className="mr-1">←</span>
                  Back
                </button>
              </div>
              <Signup onSignupSuccess={() => navigate('/login')} />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <div className="max-w-7xl mx-auto px-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-sm text-body hover:text-primary transition-colors"
                >
                  <span className="mr-1">←</span>
                  Back
                </button>
              </div>
              <Login
                onLoginSuccess={() => {
                  const role = getStoredUserRole();
                  let destination = null;
                  try {
                    destination = localStorage.getItem('lastPage');
                  } catch (e) {
                    destination = null;
                  }

                  if (destination && typeof destination === 'string') {
                    if (role === 'super_admin') {
                      const isSuperAdminDestination =
                        destination === '/admin-dashboard' ||
                        destination === '/user-management' ||
                        destination === '/template-management' ||
                        destination === '/ml' ||
                        destination === '/logs';
                      if (isSuperAdminDestination) {
                        navigate(destination);
                        return;
                      }
                    } else {
                      const isUserDestination =
                        destination === '/dashboard' ||
                        destination === '/tasks' ||
                        destination === '/calendar' ||
                        destination === '/templates' ||
                        destination === '/insights' ||
                        destination === '/settings';
                      if (isUserDestination) {
                        navigate(destination);
                        return;
                      }
                    }
                  }

                  if (role === 'super_admin') {
                    try {
                      localStorage.setItem('lastPage', '/admin-dashboard');
                    } catch (e) {
                      // ignore
                    }
                    navigate('/admin-dashboard');
                    return;
                  }

                  try {
                    localStorage.setItem('lastPage', '/dashboard');
                  } catch (e) {
                    // ignore
                  }
                  navigate('/dashboard');
                }}
              />
            </>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminUserDashboardPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AdminUserTasksPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <AdminUserCalendarPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <AdminUserTemplatesPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <AdminUserInsightsPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AdminUserSettingsPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowRoles={['super_admin']}>
              <SystemAdminDashboardPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowRoles={['super_admin']}>
              <SystemAdminUsersPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/template-management"
          element={
            <ProtectedRoute allowRoles={['super_admin']}>
              <SystemAdminTemplatesPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ml"
          element={
            <ProtectedRoute allowRoles={['super_admin']}>
              <SystemAdminMLPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute allowRoles={['super_admin']}>
              <SystemAdminLogsPage onNavigate={handleAdminNavigate} onLogout={logoutAndGoLogin} />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={(() => {
                try {
                  const token = localStorage.getItem('accessToken');
                  if (!token || isAccessTokenExpired(token)) return '/';
                  const last = localStorage.getItem('lastPage');
                  if (last && typeof last === 'string') return last;
                  const role = getStoredUserRole();
                  return role === 'super_admin' ? '/admin-dashboard' : '/dashboard';
                } catch (e) {
                  return '/';
                }
              })()}
              replace
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
