import React, { useEffect, useState, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import LoginModal from './components/modals/LoginModal';
import SignUpClienteModal from './components/modals/SignUpClienteModal';
import SignUpModal from './components/modals/SignUpModal';
import ProfilePage from './components/ProfilePage';
import ServicosPage from './components/ServicosPage';
import ProfissionaisPage from './components/ProfissionaisPage';
import PerfilProfissionalPage from './components/PerfilProfissionalPage';
import PerfilPublicoPage from './components/PerfilPublicoPage';
import EditarPerfilProfissional from './components/EditarPerfilProfissional';
import OAuth2Callback from './components/OAuth2Callback';
import { api } from './api';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { user, isLoggedIn, handleLogin, handleLogout, handleUserUpdate } = useAuth();
  const [depoimentos, setDepoimentos] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProfissionalId, setSelectedProfissionalId] = useState(null);
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpClienteModal, setShowSignUpClienteModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [loginReason, setLoginReason] = useState(null); // 'agendamento' ou null
  
  // Ref para controlar navegação interna vs hash change
  const isInternalNavigation = useRef(false);

  useEffect(() => {
    // Depoimentos e FAQs não implementados no backend ainda
    setDepoimentos([]);
    setFaqs([]);
    setLoading(false);
  }, []);

  // Ouvir mudanças na hash da URL
  useEffect(() => {
    const handleHashChange = () => {
      // Se foi navegação interna, não processar novamente
      if (isInternalNavigation.current) {
        isInternalNavigation.current = false;
        return;
      }
      
      const hash = window.location.hash;

      // Verificar se é o callback OAuth2
      if (hash && hash.includes('auth/callback')) {
        setCurrentPage('oauth2-callback');
        return;
      }
      
      // Verificar se é um link direto para página pública (#publico/profissional/ID)
      const publicMatch = hash.match(/^#publico\/profissional\/(\d+)$/);
      if (publicMatch) {
        const profId = parseInt(publicMatch[1]);
        setSelectedProfissionalId(profId);
        setIsPublicProfile(true);
        setCurrentPage('perfil-publico');
        return;
      }
      
      // Verificar se é um link interno para profissional (#profissional/ID)
      const profMatch = hash.match(/^#profissional\/(\d+)$/);
      if (profMatch) {
        const profId = parseInt(profMatch[1]);
        setSelectedProfissionalId(profId);
        setIsPublicProfile(false);
        setCurrentPage('perfil-profissional');
        return;
      }

      // Verificar se o usuário é profissional (suportar diferentes formatos da API)
      const userTipo = user?.tipo || user?.type || user?.role || '';
      const isProfissional = userTipo.toUpperCase() === 'PROFISSIONAL' || userTipo.toUpperCase() === 'PROFESSIONAL';
      
      if (hash === '#perfil' && isLoggedIn) {
        setCurrentPage('profile');
      } else if (hash === '#perfil/editar' && isLoggedIn && isProfissional) {
        // Apenas profissionais logados podem acessar
        setCurrentPage('editar-perfil-profissional');
      } else if (hash === '#perfil/editar') {
        // Redirecionar para home se não for profissional logado
        window.location.hash = '';
        setCurrentPage('home');
      } else if (hash === '#perfil' && !isLoggedIn) {
        // Redirecionar para home se não estiver logado
        window.location.hash = '';
        setCurrentPage('home');
      } else if (hash === '#servicos') {
        setCurrentPage('servicos');
      } else if (hash === '#profissionais') {
        setCurrentPage('profissionais');
      } else if (hash === '' || hash === '#') {
        setCurrentPage('home');
      }
      // Se não reconhecer a hash, manter a página atual (não ir para home)
    };

    handleHashChange(); // Verificar ao carregar
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoggedIn]);

  const handleLogout = () => {
    handleLogout(); 
    setCurrentPage('home');
    window.location.hash = '';
  };

  const handleBackToHome = () => {
    isInternalNavigation.current = true;
    setCurrentPage('home');
    window.location.hash = '';
  };

  const handleVerPerfil = (profissionalId) => {
    isInternalNavigation.current = true;
    setSelectedProfissionalId(profissionalId);
    setIsPublicProfile(false); 
    setCurrentPage('perfil-profissional');
    window.location.hash = `profissional/${profissionalId}`;
  };

  const handleBackToProfissionais = () => {
    isInternalNavigation.current = true;
    setCurrentPage('profissionais');
    setSelectedProfissionalId(null);
    setIsPublicProfile(false);
    window.location.hash = 'profissionais';
  };

  const handleVerTodosProfissionais = () => {
    isInternalNavigation.current = true;
    setCurrentPage('profissionais');
    setSelectedProfissionalId(null);
    setIsPublicProfile(false);
    window.location.hash = 'profissionais';
  };

  const renderDepoimentos = () => {
    if (loading) return <p className="muted">Carregando depoimentos...</p>;
    if (error) return <p className="muted">{error}</p>;
    if (!depoimentos.length) return <p className="muted">Nenhum depoimento disponível no momento.</p>;

    return (
      <div className="grid two">
        {depoimentos.map((item, idx) => (
          <div key={idx} className="testimonial-card">
            <p className="quote">“{item.texto}”</p>
            <div className="persona">
              <div className="avatar" aria-hidden="true">{(item.nome || '?').charAt(0)}</div>
              <div>
                <strong>{item.nome}</strong>
                <p className="muted small">{item.titulo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFaqs = () => {
    if (loading) return <p className="muted">Carregando FAQ...</p>;
    if (error) return <p className="muted">{error}</p>;
    if (!faqs.length) return <p className="muted">Nenhuma pergunta frequente cadastrada ainda.</p>;

    return (
      <div className="section-body">
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <h3>{faq.pergunta}</h3>
            <p className="muted">{faq.resposta}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-shell">
      <Header 
        onOpenSignUpProfissional={() => setShowSignUpModal(true)}
      />
      
      {currentPage === 'home' && (
        <>
          <Hero />
          <Features />
          <Footer />
        </>
      )}

      {currentPage === 'profile' && (
        <ProfilePage 
          user={user}
          onUserUpdate={handleUserUpdate}
          onBack={handleBackToHome}
        />
      )}

      {currentPage === 'editar-perfil-profissional' && (
        <EditarPerfilProfissional 
          user={user}
          onUserUpdate={handleUserUpdate}
          onBack={() => {
            isInternalNavigation.current = true;
            setCurrentPage('profile');
            window.location.hash = 'perfil';
          }}
        />
      )}

      {currentPage === 'servicos' && (
        <ServicosPage onBack={handleBackToHome} />
      )}

      {currentPage === 'profissionais' && (
        <ProfissionaisPage onBack={handleBackToHome} onVerPerfil={handleVerPerfil} />
      )}

      {currentPage === 'oauth2-callback' && (
        <OAuth2Callback />
      )}

      {currentPage === 'perfil-profissional' && !isPublicProfile && (
        <PerfilProfissionalPage 
          profissionalId={selectedProfissionalId} 
          onBack={handleBackToProfissionais} 
        />
      )}

      {currentPage === 'perfil-publico' && isPublicProfile && (
        <PerfilPublicoPage 
          profissionalId={selectedProfissionalId} 
          onVerTodosProfissionais={handleVerTodosProfissionais}
          isLoggedIn={isLoggedIn}
          onOpenLogin={() => {
            setLoginReason('agendamento');
            setShowLoginModal(true);
          }}
        />
      )}

      {showLoginModal && (
        <LoginModal 
          onClose={() => {
            setShowLoginModal(false);
            setLoginReason(null);
          }}
          onLoginSuccess={(userData) => {
            handleLogin(userData);
            setShowLoginModal(false);
            setLoginReason(null);
          }}
          onSwitchToSignUp={() => {
            setShowLoginModal(false);
            setShowSignUpClienteModal(true);
          }}
          reason={loginReason}
        />
      )}

      {showSignUpClienteModal && (
        <SignUpClienteModal
          onClose={() => {
            setShowSignUpClienteModal(false);
          }}
          onSignUpSuccess={(userData) => {
            handleLogin(userData);
            setShowSignUpClienteModal(false);
            // Se veio de agendamento, volta para a página pública
            if (loginReason === 'agendamento' && selectedProfissionalId && isPublicProfile) {
              // Já está na página correta
            }
          }}
          onGoToProfessional={() => {
            setShowSignUpClienteModal(false);
            setShowSignUpModal(true);
          }}
          onSwitchToLogin={() => {
            setShowSignUpClienteModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showSignUpModal && (
        <SignUpModal
          onClose={() => {
            setShowSignUpModal(false);
          }}
          onSignUpSuccess={(userData) => {
            handleLogin(userData);
            setShowSignUpModal(false);
            setCurrentPage('editar-perfil-profissional');
          }}
          onSwitchToClient={() => {
            setShowSignUpModal(false);
            setShowSignUpClienteModal(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
