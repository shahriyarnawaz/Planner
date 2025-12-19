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

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');

  return (
    <div className="min-h-screen bg-background">
      {currentPage !== 'dashboard' && currentPage !== 'tasks' && currentPage !== 'calendar' && currentPage !== 'templates' && currentPage !== 'insights' && currentPage !== 'settings' && (
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
          <Signup onSignupSuccess={() => setCurrentPage('dashboard')} />
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
          <Login onLoginSuccess={() => setCurrentPage('dashboard')} />
        </>
      )}

      {currentPage === 'dashboard' && (
        <AdminUserDashboardPage
          onNavigate={(section) => {
            if (
              section === 'dashboard' ||
              section === 'tasks' ||
              section === 'calendar' ||
              section === 'templates' ||
              section === 'insights' ||
              section === 'settings'
            ) {
              setCurrentPage(section);
            }
          }}
        />
      )}

      {currentPage === 'tasks' && (
        <AdminUserTasksPage
          onNavigate={(section) => {
            if (
              section === 'dashboard' ||
              section === 'tasks' ||
              section === 'calendar' ||
              section === 'templates' ||
              section === 'insights' ||
              section === 'settings'
            ) {
              setCurrentPage(section);
            }
          }}
        />
      )}

      {currentPage === 'calendar' && (
        <AdminUserCalendarPage
          onNavigate={(section) => {
            if (
              section === 'dashboard' ||
              section === 'tasks' ||
              section === 'calendar' ||
              section === 'templates' ||
              section === 'insights' ||
              section === 'settings'
            ) {
              setCurrentPage(section);
            }
          }}
        />
      )}

      {currentPage === 'templates' && (
        <AdminUserTemplatesPage
          onNavigate={(section) => {
            if (
              section === 'dashboard' ||
              section === 'tasks' ||
              section === 'calendar' ||
              section === 'templates' ||
              section === 'insights' ||
              section === 'settings'
            ) {
              setCurrentPage(section);
            }
          }}
        />
      )}

      {currentPage === 'insights' && (
        <AdminUserInsightsPage
          onNavigate={(section) => {
            if (
              section === 'dashboard' ||
              section === 'tasks' ||
              section === 'calendar' ||
              section === 'templates' ||
              section === 'insights' ||
              section === 'settings'
            ) {
              setCurrentPage(section);
            }
          }}
        />
      )}

      {currentPage === 'settings' && (
        <AdminUserSettingsPage
          onNavigate={(section) => {
            if (
              section === 'dashboard' ||
              section === 'tasks' ||
              section === 'calendar' ||
              section === 'templates' ||
              section === 'insights' ||
              section === 'settings'
            ) {
              setCurrentPage(section);
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
