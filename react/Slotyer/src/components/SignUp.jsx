import React from 'react';
import { api } from '../api';
import '../styles/signup.css';

const SignUp = () => {
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    profissao: '',
    telefone: '',
  });

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus({ loading: false, error: validationError, success: '' });
      return;
    }

    setStatus({ loading: true, error: '', success: '' });

    try {
      const payload = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        profissao: formData.profissao.trim(),
        telefone: formData.telefone.replace(/\D/g, ''),
      };

      await api.signupProfissional(payload);

      setStatus({
        loading: false,
        error: '',
        success: 'Cadastro enviado com sucesso! Em breve entraremos em contato.',
      });
      setFormData({ nome: '', email: '', profissao: '', telefone: '' });
    } catch (err) {
      const message = err?.body?.message || err?.message || 'Não foi possível enviar o cadastro. Tente novamente.';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  return (
    <section id="cadastro" className="signup">
      <div className="signup-container">
        <div className="signup-content">
          <h2>Comece Agora</h2>
          <p>Cadastre-se e comece a receber agendamentos em minutos</p>
          
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
              <label htmlFor="profissao">Profissão/Serviço</label>
              <input
                type="text"
                id="profissao"
                name="profissao"
                value={formData.profissao}
                onChange={handleChange}
                placeholder="ex: Cabeleireiro, Instrutor de Yoga, Consultor"
                required
              />
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
              {status.loading ? 'Enviando...' : 'Cadastrar Gratuitamente'}
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

export default SignUp;
