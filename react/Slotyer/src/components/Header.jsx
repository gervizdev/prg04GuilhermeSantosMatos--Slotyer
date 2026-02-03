import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import '../styles/header.css';
import LoginModal from './modals/LoginModal';
import SignUpClienteModal from './modals/SignUpClienteModal';

const Header = ({ user: propUser, isLoggedIn: propIsLoggedIn, onLogin, onLogout, onOpenSignUpProfissional }) => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Usar props ou valores padrão
  const user = propUser || {
    id: 1,
    nome: 'Usuário',
    email: 'usuario@email.com',
    avatar: 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff&size=100',
    tipo: 'CLIENTE'
  };
  const isLoggedIn = propIsLoggedIn ?? false;

  // Itens do submenu Descobrir - facilmente escalável
  const discoverItems = [
    { name: 'Serviços', href: '#servicos', icon: '🛠️' },
    { name: 'Profissionais', href: '#profissionais', icon: '👥' },
  ];

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    // Se estiver fechando o menu principal, fechar também o submenu
    if (!newMenuState) {
      setIsDiscoverOpen(false);
    }
  };

  const toggleDiscover = () => {
    setIsDiscoverOpen(!isDiscoverOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDiscoverOpen(false);
  };

  const handleDiscoverItemClick = (href) => {
    setIsMenuOpen(false);
    // Aqui pode adicionar navegação para a página específica
    window.location.href = href;
  };

  const handleProfileClick = () => {
    // Navegar para página de perfil
    window.location.hash = 'perfil';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    closeMenu();
    setShowLogin(true);
  };

  const handleLoginClose = () => {
    setShowLogin(false);
  };

  const handleLoginSuccess = (userData) => {
    if (onLogin) {
      onLogin(userData);
    }
    setShowLogin(false);
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    closeMenu();
    setShowSignUp(true);
  };

  const handleSignUpClose = () => {
    setShowSignUp(false);
  };

  const handleSignUpSuccess = (userData) => {
    if (onLogin) {
      onLogin(userData);
    }
    setShowSignUp(false);
  };

  const handleGoToProfessional = () => {
    setShowSignUp(false);
    // Abrir modal de cadastro profissional
    if (onOpenSignUpProfissional) {
      onOpenSignUpProfissional();
    }
  };

  const handleSwitchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  return (
    <>
    <header className="header">
      <nav id="navbar" className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <div className="navbar-brand">
            <div className="logo">
              <Logo onClick={toggleMenu} isMenuOpen={isMenuOpen} />
            </div>
          </div>
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/" onClick={closeMenu}>Home</a>
              </li>
              {/* Submenu Descobrir */}
              <li className={`nav-item dropdown ${isMobile ? '' : 'hover-dropdown'}`}>
                <span
                  className={`nav-link dropdown-toggle ${isDiscoverOpen ? 'active' : ''}`}
                  onClick={() => setIsDiscoverOpen(prevState => !prevState)}
                  style={{ cursor: 'pointer' }}
                >
                  Descobrir
                  {isMobile && <span className="dropdown-arrow">{isDiscoverOpen ? '▲' : '▼'}</span>}
                </span>

                <ul className={`dropdown-menu ${isDiscoverOpen ? 'show' : ''}`}>
                  {discoverItems.map((item, index) => (
                    <li key={index}>
                      <a
                        className="dropdown-item"
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDiscoverItemClick(item.href);
                          if (isMobile) {
                            setIsDiscoverOpen(false);
                          }
                        }}
                      >
                        <span className="item-icon">{item.icon}</span>
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="nav-item theme-toggle-item">
                <label className="theme-switch" title={isDark ? 'Modo Claro' : 'Modo Escuro'}>
                  <input 
                    type="checkbox" 
                    checked={isDark} 
                    onChange={() => toggleTheme()}
                  />
                  <span className="theme-slider">
                    <span className="theme-icon sun">☀️</span>
                    <span className="theme-icon moon">🌙</span>
                  </span>
                </label>
              </li>
            </ul>
          </div>

          {/* Avatar do usuário (lado direito) */}
          {isLoggedIn && (
            <div className="navbar-user">
              <UserAvatar
                user={user}
                onProfileClick={handleProfileClick}
                onLogout={handleLogout}
              />
            </div>
          )}
          {!isLoggedIn && (
            <div className="navbar-auth">
              <a href="#login" className="btn-auth btn-login" onClick={handleLoginClick}>
                Entrar
              </a>
              <a href="#signup" className="btn-auth btn-signup" onClick={handleSignUpClick}>
                Criar conta
              </a>
            </div>
          )}
        </div>
      </nav>
    </header>

    {/* Modal de Login - fora do header */}
    {showLogin && (
      <LoginModal 
        onClose={handleLoginClose} 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignUp={() => {
          setShowLogin(false);
          setShowSignUp(true);
        }}
      />
    )}

    {/* Modal de Cadastro Cliente - fora do header */}
    {showSignUp && (
      <SignUpClienteModal
        onClose={handleSignUpClose}
        onSignUpSuccess={handleSignUpSuccess}
        onGoToProfessional={handleGoToProfessional}
        onSwitchToLogin={handleSwitchToLogin}
      />
    )}
  </>
  );
};

export default Header;