import React, { useState } from 'react';
import '../../styles/login.css';

const LoginModal = ({ onClose, onLoginSuccess, onSwitchToSignUp, reason }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha email e senha');
      return;
    }
    
    setIsLoading(true);

    // Simulação de login - substituir pela chamada real à API
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui você faria a chamada real:
      // const response = await api.login({ email, password });
      
      // Simulando dados do usuário logado
      const userData = {
        id: 1,
        nome: email.split('@')[0],
        email: email,
        avatar: `https://via.placeholder.com/100x100/667eea/ffffff?text=${email.charAt(0).toUpperCase()}`,
        tipo: 'CLIENTE'
      };
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      
    } catch (err) {
      setError('Email ou senha inválidos');
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="login-page" onClick={handleOverlayClick}>
      <div className="login-container">
        <div className="login-card">
          {onClose && (
            <button className="login-close" onClick={onClose} aria-label="Fechar">
              ✕
            </button>
          )}
          <div className="login-header">
            <h1>Bem-vindo de volta</h1>
            {reason === 'agendamento' ? (
              <p>📅 Faça login para agendar seu serviço</p>
            ) : (
              <p>Entre na sua conta para continuar</p>
            )}
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Lembrar de mim</span>
              </label>
              <a href="#forgot" className="forgot-link">Esqueceu a senha?</a>
            </div>

            <button 
              type="submit" 
              className="btn-login-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-footer">
            <p>Não tem uma conta? <button type="button" onClick={onSwitchToSignUp}>Criar conta</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
