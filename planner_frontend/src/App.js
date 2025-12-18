import React from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Signup from './components/Auth/signup';
import Login from './components/Auth/login';

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSignupClick={() => setCurrentPage('signup')}
        onLoginClick={() => setCurrentPage('login')}
        onLogoClick={() => setCurrentPage('home')}
      />
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
          <Signup />
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
          <Login />
        </>
      )}
    </div>
  );
}

export default App;
