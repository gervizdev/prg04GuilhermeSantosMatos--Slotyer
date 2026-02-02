import React from 'react';
import { api } from '../api';
import '../styles/signup.css';

const SignUpCliente = ({ onClose, onSignUpSuccess, onGoToProfessional, onSwitchToLogin }) => {
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

      // Se tiver callback de sucesso, chama com os dados do usuário
      if (onSignUpSuccess) {
        const userData = {
          id: Date.now(),
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          avatar: `https://via.placeholder.com/100x100/667eea/ffffff?text=${formData.nome.charAt(0).toUpperCase()}`,
          tipo: 'CLIENTE'
        };
        onSignUpSuccess(userData);
      } else {
        setStatus({ loading: false, error: '', success: 'Cadastro enviado com sucesso! Em breve entraremos em contato.' });
        setFormData({ nome: '', email: '', senha: '', confirmarSenha: '', tipo: 'CLIENTE', telefone: '' });
      }
    } catch (err) {
      const message = (err?.body && typeof err.body === 'object' && err.body.message)
        ? err.body.message
        : (typeof err?.body === 'string' ? err.body : err?.message);

      setStatus({ loading: false, error: message || 'Não foi possível enviar o cadastro. Tente novamente.', success: '' });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Se tiver onClose, renderiza como modal
  if (onClose) {
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
  }

  // Renderização normal (seção na página)
  return (
    <section id="cadastro-cliente" className="signup">
      <div className="signup-container">
        <div className="signup-content">
          <h2>Cadastro de Cliente</h2>
          <p>Cadastre-se como cliente para agendar serviços.</p>

          <form className="signup-form" onSubmit={handleSubmit} aria-busy={status.loading}>
            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Digite a senha novamente"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {passwordError && (
                <p className="form-message error inline" aria-live="polite">{passwordError}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone/WhatsApp</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={status.loading}>
              {status.loading ? 'Enviando...' : 'Cadastrar como Cliente'}
            </button>

            {status.error && (
              <p className="form-message error" aria-live="assertive">{status.error}</p>
            )}
            {status.success && (
              <p className="form-message success" aria-live="polite">{status.success}</p>
            )}

            <p className="form-terms">
              Ao cadastrar, você concorda com nossos termos de serviço
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpCliente;
