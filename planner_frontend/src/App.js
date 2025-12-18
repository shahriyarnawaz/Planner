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
      {currentPage === 'signup' && <Signup />}
      {currentPage === 'login' && <Login />}
    </div>
  );
}

export default App;
