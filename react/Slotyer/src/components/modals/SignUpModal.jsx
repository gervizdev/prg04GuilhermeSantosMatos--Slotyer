import React from 'react';
import { api } from '../../api';
import '../../styles/signup.css';

const SignUpModal = ({ onClose, onSignUpSuccess, onSwitchToClient }) => {
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    profissao: '',
    senha: '',
    confirmarSenha: '',
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
    if (!formData.profissao.trim()) return 'Informe a profissão/serviço.';
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
        tipo: 'PROFISSIONAL',
        telefone: formData.telefone.replace(/\D/g, ''),
        especialidade: formData.profissao.trim(),
      };

      await api.register(payload);

      setStatus({
        loading: false,
        error: '',
        success: 'Cadastro enviado com sucesso! Em breve entraremos em contato.',
      });
      
      // Chamar callback de sucesso com dados do usuário
      if (onSignUpSuccess) {
        const userData = {
          nome: payload.nome,
          email: payload.email,
          tipo: 'PROFISSIONAL',
          profissao: payload.especialidade,
          telefone: payload.telefone
        };
        onSignUpSuccess(userData);
      }
      
      setFormData({ nome: '', email: '', profissao: '', senha: '', confirmarSenha: '', telefone: '' });
    } catch (err) {
      const message = (err?.body && typeof err.body === 'object' && err.body.message)
        ? err.body.message
        : (typeof err?.body === 'string' ? err.body : err?.message);

      const finalMessage = message || 'Não foi possível enviar o cadastro. Tente novamente.';
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
        <button className="signup-modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        
        <div className="signup-modal-header">
          <h2>👨‍💼 Cadastro Profissional</h2>
          <p>Comece a receber agendamentos em minutos</p>
        </div>
        
        <form className="signup-modal-form" onSubmit={handleSubmit} aria-busy={status.loading}>
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
              <label htmlFor="profissao">Profissão/Serviço</label>
              <input
                type="text"
                id="profissao"
                name="profissao"
                value={formData.profissao}
                onChange={handleChange}
                placeholder="ex: Cabeleireiro, Instrutor de Yoga, Consultor"
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

            <button type="submit" className="btn-signup-submit" disabled={status.loading}>
              {status.loading ? 'Enviando...' : 'Cadastrar como Profissional'}
            </button>

            {status.error && (
              <p className="form-message error" aria-live="assertive">{status.error}</p>
            )}
            {status.success && (
              <p className="form-message success" aria-live="polite">{status.success}</p>
            )}
          </form>

          <div className="signup-modal-divider">
            <span>ou</span>
          </div>

          <button className="btn-professional-switch" onClick={onSwitchToClient}>
            👤 Quero me cadastrar como Cliente
          </button>
      </div>
    </div>
  );
};

export default SignUpModal;
