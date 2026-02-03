import React, { useState } from 'react';
import { api } from '../../api';
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

    try {
      // Chamar API de login (backend espera 'email' no payload)
      const response = await api.login({ email, senha: password });
      
      // Validar resposta da API - SEM FALLBACK
      if (!response || !response.token) {
        throw new Error('Credenciais inválidas');
      }
      
      // Guardar token
      api.setToken(response.token);
      
      // Buscar dados do usuário logado
      const userData = await api.getMe();
      
      // Validar dados do usuário - SEM FALLBACK
      if (!userData || !userData.id) {
        api.setToken(null);
        throw new Error('Erro ao carregar dados do usuário');
      }
      
      // Validar campos obrigatórios
      if (!userData.nome && !userData.name) {
        api.setToken(null);
        throw new Error('Dados do usuário incompletos');
      }
      
      // Normalizar dados do usuário
      const normalizedUser = {
        id: userData.id,
        nome: userData.nome || userData.name,
        email: userData.email,
        avatar: userData.avatar || userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nome || userData.name || 'User')}&background=667eea&color=fff&size=150`,
        tipo: userData.tipo || userData.type || userData.role,
        telefone: userData.telefone || userData.phone || '',
        profissao: userData.profissao || userData.specialty || '',
      };
      
      if (onLoginSuccess) {
        onLoginSuccess(normalizedUser);
      }
      
    } catch (err) {
      // Sempre priorizar mensagem do backend se existir
      let message =
        (err?.body?.message && typeof err.body.message === 'string')
          ? err.body.message
          : null;

      if (!message) {
        // Erro de conexão / backend indisponível
        if (err.message === 'Failed to fetch' || err.message?.includes('ERR_NAME_NOT_RESOLVED') || !err.status) {
          message = '❌ Servidor indisponível. Verifique se o backend está rodando.';
        }
        // Erro 401 ou 404 - credenciais inválidas
        else if (err.status === 401 || err.status === 404) {
          message = '❌ Email ou senha inválidos';
        }
        // Outro erro com status HTTP
        else if (err.status) {
          message = `Erro ${err.status}: Tente novamente`;
        }
        // Erro customizado
        else if (err.message) {
          message = `❌ ${err.message}`;
        } else {
          message = 'Erro ao fazer login';
        }
      }

      setError(message);
      // SEMPRE limpar token em caso de erro
      api.setToken(null);
    } finally {
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

            <div className="login-divider">
              <span>ou</span>
            </div>

            <a 
              href={api.getGoogleLoginUrl()}
              className="btn-google-login"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login com Google
            </a>
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
