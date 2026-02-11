import React from 'react';
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
  const [currentPage, setCurrentPage] = React.useState('home');

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

  const handleAdminNavigate = (section) => {
    if (
      section === 'dashboard' ||
      section === 'tasks' ||
      section === 'calendar' ||
      section === 'templates' ||
      section === 'insights' ||
      section === 'settings' ||
      section === 'sys_dashboard' ||
      section === 'sys_users' ||
      section === 'sys_templates' ||
      section === 'sys_ml' ||
      section === 'sys_logs'
    ) {
      setCurrentPage(section);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage !== 'dashboard' && currentPage !== 'tasks' && currentPage !== 'calendar' && currentPage !== 'templates' && currentPage !== 'insights' && currentPage !== 'settings' && currentPage !== 'sys_dashboard' && currentPage !== 'sys_users' && currentPage !== 'sys_templates' && currentPage !== 'sys_ml' && currentPage !== 'sys_logs' && (
        <Header
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onLogoClick={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'home' && <Home />}

      {currentPage === 'signup' && (
        <>
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="inline-flex items-center text-sm text-body hover:text-primary transition-colors"
            >
              <span className="mr-1">←</span>
              Back
            </button>
          </div>
          <Signup onSignupSuccess={() => setCurrentPage('login')} />
        </>
      )}

      {currentPage === 'login' && (
        <>
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="inline-flex items-center text-sm text-body hover:text-primary transition-colors"
            >
              <span className="mr-1">←</span>
              Back
            </button>
          </div>
          <Login
            onLoginSuccess={() => {
              const role = getStoredUserRole();
              if (role === 'super_admin') {
                setCurrentPage('sys_dashboard');
              } else {
                setCurrentPage('dashboard');
              }
            }}
          />
        </>
      )}

      {currentPage === 'dashboard' && (
        <AdminUserDashboardPage
          onNavigate={handleAdminNavigate}
        />
      )}

      {currentPage === 'tasks' && (
        <AdminUserTasksPage
          onNavigate={handleAdminNavigate}
        />
      )}

      {currentPage === 'calendar' && (
        <AdminUserCalendarPage
          onNavigate={handleAdminNavigate}
        />
      )}

      {currentPage === 'templates' && (
        <AdminUserTemplatesPage
          onNavigate={handleAdminNavigate}
        />
      )}

      {currentPage === 'insights' && (
        <AdminUserInsightsPage
          onNavigate={handleAdminNavigate}
        />
      )}

      {currentPage === 'settings' && (
        <AdminUserSettingsPage
          onNavigate={handleAdminNavigate}
        />
      )}

      {currentPage === 'sys_dashboard' && (
        <SystemAdminDashboardPage onNavigate={handleAdminNavigate} />
      )}

      {currentPage === 'sys_users' && (
        <SystemAdminUsersPage onNavigate={handleAdminNavigate} />
      )}

      {currentPage === 'sys_templates' && (
        <SystemAdminTemplatesPage onNavigate={handleAdminNavigate} />
      )}

      {currentPage === 'sys_ml' && (
        <SystemAdminMLPage onNavigate={handleAdminNavigate} />
      )}

      {currentPage === 'sys_logs' && (
        <SystemAdminLogsPage onNavigate={handleAdminNavigate} />
      )}
    </div>
  );
}

export default App;
