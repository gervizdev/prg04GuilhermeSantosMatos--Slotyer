import React from 'react';
import { api } from '../../api';
import '../../styles/signup.css';

const SignUpClienteModal = ({ onClose, onSignUpSuccess, onGoToProfessional, onSwitchToLogin }) => {
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'CLIENTE',
    telefone: '',
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const [passwordError, setPasswordError] = React.useState('');

  const [status, setStatus] = React.useState({
    loading: false,
    error: '',
    success: '',
  });

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const validateForm = () => {
    if (formData.nome.trim().length < 3) return 'Informe um nome válido.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Informe um email válido.';
    if (!formData.senha || formData.senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    const phoneDigits = formData.telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10) return 'Informe um telefone com DDD.';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'telefone' ? formatPhone(value) : value,
    }));

    // Verificar senhas em tempo real
    if (name === 'confirmarSenha' || name === 'senha') {
      const updatedFormData = {
        ...formData,
        [name]: name === 'telefone' ? formatPhone(value) : value,
      };

      if (updatedFormData.confirmarSenha && updatedFormData.senha !== updatedFormData.confirmarSenha) {
        setPasswordError('As senhas não coincidem.');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus({ loading: false, error: validationError, success: '' });
      return;
    }

    // Verificar senhas antes de enviar
    if (formData.senha !== formData.confirmarSenha) {
      setStatus({ loading: false, error: 'As senhas não coincidem.', success: '' });
      return;
    }

    setStatus({ loading: true, error: '', success: '' });

    try {
      const payload = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        tipo: formData.tipo,
        telefone: formData.telefone.replace(/\D/g, ''),
      };

      await api.register(payload);

      // Fazer login automático após registro
      try {
        const loginResponse = await api.login({ login: payload.email, senha: payload.senha });
        
        if (!loginResponse || !loginResponse.token) {
          throw new Error('Erro ao fazer login após cadastro');
        }

        api.setToken(loginResponse.token);

        // Buscar dados do usuário
        const userData = await api.getMe();
        
        if (!userData || !userData.id) {
          throw new Error('Dados do usuário inválidos');
        }

        const normalizedUser = {
          id: userData.id,
          nome: userData.nome || userData.name,
          email: userData.email,
          avatar: userData.avatar || userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nome || userData.name || 'User')}&background=667eea&color=fff&size=150`,
          tipo: userData.tipo || userData.type,
          telefone: userData.telefone || userData.phone || '',
        };

        if (onSignUpSuccess) {
          onSignUpSuccess(normalizedUser);
        }
      } catch (loginErr) {
        api.setToken(null);
        let message = 'Erro ao fazer login após cadastro';
        
        // Erro de conexão / backend indisponível
        if (loginErr.message === 'Failed to fetch' || loginErr.message?.includes('ERR_NAME_NOT_RESOLVED') || !loginErr.status) {
          message = '❌ Servidor indisponível. Verifique se o backend está rodando.';
        }
        // Erro de autenticação (401)
        else if (loginErr.status === 401 || loginErr.status === 404) {
          message = '❌ Email ou senha inválidos';
        }
        // Outro erro com status HTTP
        else if (loginErr.status) {
          message = loginErr?.body?.message || `Erro ${loginErr.status}: Tente novamente`;
        }
        
        setStatus({ loading: false, error: message, success: '' });
        setFormData({ nome: '', email: '', senha: '', confirmarSenha: '', tipo: 'CLIENTE', telefone: '' });
      }
    } catch (err) {
      let message = 'Não foi possível enviar o cadastro';
      
      // Erro de conexão / backend indisponível
      if (err.message === 'Failed to fetch' || err.message?.includes('ERR_NAME_NOT_RESOLVED') || !err.status) {
        message = '❌ Servidor indisponível. Verifique se o backend está rodando.';
      }
      // Erro de validação (400)
      else if (err.status === 400) {
        message = err?.body?.message || 'Dados inválidos. Verifique os campos.';
      }
      // Email já cadastrado (409)
      else if (err.status === 409) {
        message = 'Email já cadastrado. Tente outro ou faça login.';
      }
      // Outro erro com status HTTP
      else if (err.status) {
        message = err?.body?.message || `Erro ${err.status}: Tente novamente`;
      }
      // Erro customizado
      else if (err.message) {
        message = `❌ ${err.message}`;
      }
      
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="signup-modal-overlay" onClick={handleOverlayClick}>
      <div className="signup-modal">
        <button className="signup-modal-close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>
        
        <div className="signup-modal-header">
          <h2>Criar conta</h2>
          <p>Cadastre-se para encontrar e agendar com profissionais</p>
        </div>

        <form className="signup-modal-form" onSubmit={handleSubmit} aria-busy={status.loading}>
          {status.error && (
            <div className="signup-modal-error">{status.error}</div>
          )}

          <div className="form-group">
            <label htmlFor="modal-nome">Nome Completo</label>
            <input
              type="text"
              id="modal-nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-email">Email</label>
            <input
              type="email"
              id="modal-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="modal-senha">Senha</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="modal-senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-confirmar">Confirmar</label>
              <input
                type={showPassword ? "text" : "password"}
                id="modal-confirmar"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {passwordError && (
            <p className="field-error">{passwordError}</p>
          )}

          <div className="form-group">
            <label htmlFor="modal-telefone">Telefone/WhatsApp</label>
            <input
              type="tel"
              id="modal-telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <button type="submit" className="btn-signup-submit" disabled={status.loading}>
            {status.loading ? 'Cadastrando...' : 'Criar conta'}
          </button>

          <div className="login-divider" style={{ margin: '20px 0' }}>
            <span>ou</span>
          </div>

          <a 
            href={api.getGoogleLoginUrl()}
            className="btn-google-login"
            style={{ marginBottom: '20px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Criar conta com Google
          </a>
        </form>

        <div className="signup-modal-divider">
          <span>ou</span>
        </div>

        <button className="btn-professional" onClick={onGoToProfessional}>
          👨‍💼 Quero me cadastrar como Profissional
        </button>

        <div className="signup-modal-footer">
          <p>Já tem uma conta? <button type="button" onClick={onSwitchToLogin}>Entrar</button></p>
        </div>
      </div>
    </div>
  );
};

export default SignUpClienteModal;
