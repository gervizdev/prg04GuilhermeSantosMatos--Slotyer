import React, { useState, useEffect } from 'react';
import { Calendar } from './ui/Calendar';
import { addDays, isBefore, startOfDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../api';
import '../styles/perfil-publico.css';

const PerfilPublicoPage = ({ profissionalId, onVerTodosProfissionais, isLoggedIn, onOpenLogin }) => {
  const [profissional, setProfissional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showMaisInfo, setShowMaisInfo] = useState(false);
  const [searchService, setSearchService] = useState('');

  useEffect(() => {
    const fetchProfissional = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProfissional(profissionalId);
        setProfissional(data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar profissional');
        setProfissional(null);
      } finally {
        setLoading(false);
      }
    };

    if (profissionalId) {
      fetchProfissional();
    }
  }, [profissionalId]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= Math.floor(rating) ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleCompartilhar = async () => {
    const url = `${window.location.origin}${window.location.pathname}#publico/profissional/${profissionalId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profissional.nome} - ${profissional.profissao} | Slotyer`,
          text: `Confira o perfil de ${profissional.nome} no Slotyer!`,
          url: url,
        });
        return;
      } catch (err) {}
    }
    
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência! 📋');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copiado para a área de transferência! 📋');
    }
  };

  const handleAgendar = async () => {
    // Verificar se usuário está logado
    if (!isLoggedIn) {
      onOpenLogin();
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Por favor, selecione um serviço, data e horário.');
      return;
    }
    
    try {
      const agendamentoData = {
        servicoId: selectedService.id,
        profissionalId: profissionalId,
        data: format(selectedDate, 'yyyy-MM-dd'),
        horario: selectedTime,
      };

      await api.createAgendamento(agendamentoData);
      
      alert(`Agendamento realizado com sucesso!\n\nServiço: ${selectedService.nome}\nData: ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}\nHorário: ${selectedTime}`);
      
      // Limpar seleções após sucesso
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert(`Erro ao realizar agendamento: ${error.message || 'Tente novamente mais tarde'}`);
    }
  };

  if (loading) {
    return (
      <div className="perfil-publico-page">
        <div className="perfil-publico-loading">
          <div className="loading-spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profissional) {
    return (
      <div className="perfil-publico-page">
        <div className="perfil-publico-error">
          <span className="error-icon">😕</span>
          <h2>{error ? 'Erro ao carregar' : 'Profissional não encontrado'}</h2>
          <p>{error || 'O perfil que você procura não existe ou foi removido.'}</p>
          <button onClick={onVerTodosProfissionais} className="btn-ver-todos">
            Ver todos os profissionais
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-publico-page">
      {/* Header Compacto */}
      <header className="header-publico">
        <div className="header-publico-content">
          <img src={profissional.avatar} alt={profissional.nome} className="header-avatar" />
          <div className="header-info">
            <h1>{profissional.nome}</h1>
            <p className="header-profissao">{profissional.profissao}</p>
            <div className="header-rating">
              <div className="stars-row">{renderStars(profissional.avaliacao)}</div>
              <span>{profissional.avaliacao} ({profissional.avaliacoes})</span>
            </div>
          </div>
          <div className="header-actions">
            <a href={`https://wa.me/55${profissional.telefone.replace(/\D/g, '')}`} className="btn-icon whatsapp" target="_blank" rel="noopener noreferrer" title="WhatsApp">
              💬
            </a>
            <button className="btn-icon share" onClick={handleCompartilhar} title="Compartilhar">
              🔗
            </button>
          </div>
        </div>
        <div className="slotyer-branding-mini">
          <span>📅 Slotyer</span>
        </div>
      </header>

      <div className="perfil-publico-content agendamento-focus">
        {/* CTA Principal - Agendamento */}
        <section className="section-agendamento-principal">
          <div className="agendamento-titulo">
            <h2>📅 Agende seu horário</h2>
            <p>Escolha o serviço, data e horário para agendar</p>
          </div>

          {/* Passo 1: Serviços */}
          <div className="agendamento-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h3>Escolha o serviço</h3>
            </div>
            {profissional.servicos.length > 4 && (
              <div className="servico-search">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar serviço..."
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                />
              </div>
            )}
            <div className="servicos-lista-agendamento">
              {profissional.servicos
                .filter(servico => 
                  servico.nome.toLowerCase().includes(searchService.toLowerCase()) ||
                  servico.descricao.toLowerCase().includes(searchService.toLowerCase())
                )
                .map(servico => (
                  <button
                    key={servico.id}
                    className={`servico-option ${selectedService?.id === servico.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(servico)}
                  >
                    <div className="servico-option-info">
                      <span className="servico-nome">{servico.nome}</span>
                      <span className="servico-duracao">⏱️ {servico.duracao}</span>
                    </div>
                    <span className="servico-preco">{servico.preco}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Passo 2: Data */}
          <div className={`agendamento-step ${!selectedService ? 'disabled' : ''}`}>
            <div className="step-header">
              <span className="step-number">2</span>
              <h3>Escolha a data</h3>
            </div>
            {selectedService ? (
              <div className="calendario-wrapper">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = startOfDay(new Date());
                    if (isBefore(date, today)) return true;
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return !profissional.diasDisponiveis.includes(dateStr);
                  }}
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 30)}
                />
              </div>
            ) : (
              <p className="step-placeholder">Selecione um serviço primeiro</p>
            )}
          </div>

          {/* Passo 3: Horário */}
          <div className={`agendamento-step ${!selectedDate ? 'disabled' : ''}`}>
            <div className="step-header">
              <span className="step-number">3</span>
              <h3>Escolha o horário</h3>
            </div>
            {selectedDate ? (
              <div className="horarios-grid">
                {profissional.horarios.map(hora => (
                  <button
                    key={hora}
                    className={`horario-btn ${selectedTime === hora ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(hora)}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            ) : (
              <p className="step-placeholder">Selecione uma data primeiro</p>
            )}
          </div>

          {/* Resumo e Confirmação */}
          {selectedService && selectedDate && selectedTime && (
            <div className="agendamento-resumo-final">
              <div className="resumo-card">
                <h3>📋 Resumo do Agendamento</h3>
                <div className="resumo-detalhes">
                  <div className="resumo-item">
                    <span className="resumo-label">Serviço</span>
                    <span className="resumo-value">{selectedService.nome}</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Data</span>
                    <span className="resumo-value">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Horário</span>
                    <span className="resumo-value">{selectedTime}</span>
                  </div>
                  <div className="resumo-item">
                    <span className="resumo-label">Duração</span>
                    <span className="resumo-value">{selectedService.duracao}</span>
                  </div>
                  <div className="resumo-item total">
                    <span className="resumo-label">Total</span>
                    <span className="resumo-value">{selectedService.preco}</span>
                  </div>
                </div>
                <button className="btn-confirmar-grande" onClick={handleAgendar}>
                  ✅ Confirmar Agendamento
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Seção colapsável - Mais informações */}
        <section className="section-mais-info">
          <button 
            className="btn-mais-info"
            onClick={() => setShowMaisInfo(!showMaisInfo)}
          >
            <span>{showMaisInfo ? '▼' : '▶'} Mais informações sobre {profissional.nome}</span>
          </button>

          {showMaisInfo && (
            <div className="mais-info-content">
              {/* Sobre */}
              <div className="info-section">
                <h3>📝 Sobre</h3>
                <p>{profissional.bio}</p>
              </div>

              {/* Info Cards */}
              <div className="info-cards-compact">
                <div className="info-card-mini">
                  <span className="info-icon">📍</span>
                  <div>
                    <strong>Local</strong>
                    <p>{profissional.endereco}</p>
                  </div>
                </div>
                <div className="info-card-mini">
                  <span className="info-icon">🕐</span>
                  <div>
                    <strong>Horário</strong>
                    <p>{profissional.horarioFuncionamento}</p>
                  </div>
                </div>
                <div className="info-card-mini">
                  <span className="info-icon">📞</span>
                  <div>
                    <strong>Contato</strong>
                    <p>{profissional.telefone}</p>
                  </div>
                </div>
              </div>

              {/* Avaliações compactas */}
              <div className="info-section">
                <h3>⭐ Avaliações ({profissional.avaliacoes})</h3>
                <div className="avaliacoes-compact">
                  {profissional.avaliacoesDetalhadas.slice(0, 2).map(av => (
                    <div key={av.id} className="avaliacao-mini">
                      <div className="avaliacao-mini-header">
                        <span>{av.autor}</span>
                        <div className="stars-row mini">{renderStars(av.nota)}</div>
                      </div>
                      <p>"{av.texto}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="info-links">
                <a href={`https://wa.me/55${profissional.telefone.replace(/\D/g, '')}`} className="link-btn whatsapp" target="_blank" rel="noopener noreferrer">
                  💬 WhatsApp
                </a>
                <a href={`https://instagram.com/${profissional.instagram.replace('@', '')}`} className="link-btn instagram" target="_blank" rel="noopener noreferrer">
                  📸 {profissional.instagram}
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Footer Compacto */}
        <footer className="footer-publico-compact">
          <span className="footer-brand-mini">📅 Slotyer</span>
          <span className="footer-divider">•</span>
          <button onClick={onVerTodosProfissionais} className="btn-ver-outros">
            Ver outros profissionais
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PerfilPublicoPage;
