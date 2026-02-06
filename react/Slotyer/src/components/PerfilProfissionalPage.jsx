import React, { useState, useEffect } from 'react';
import { Calendar } from './ui/Calendar';
import { addDays, isBefore, startOfDay, format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../api';
import '../styles/perfil-profissional.css';

const PerfilProfissionalPage = ({ profissionalId, onBack }) => {
  const [profissional, setProfissional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sobre');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('pt-BR', options);
  };

  const formatSelectedDate = (date) => {
    if (!date) return '';
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const [agendamentoLoading, setAgendamentoLoading] = useState(false);

  const handleAgendar = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Por favor, selecione um serviço, data e horário.');
      return;
    }

    // Verificar se o usuário está logado
    const token = localStorage.getItem('slotyer_token');
    if (!token) {
      alert('Você precisa fazer login para agendar. Por favor, faça login e tente novamente.');
      return;
    }

    setAgendamentoLoading(true);
    
    try {
      // Primeiro, buscar o horário disponível para obter o horarioId
      const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
      const horariosDisponiveis = await api.listHorariosPorData(profissionalId, dataFormatada);
      
      // Encontrar o horário correspondente
      const horarioEncontrado = horariosDisponiveis.find(h => 
        (h.horaInicio === selectedTime || h.horario === selectedTime) && h.disponivel !== false
      );
      
      if (!horarioEncontrado) {
        alert('Horário não disponível. Por favor, selecione outro horário.');
        setAgendamentoLoading(false);
        return;
      }

      const agendamentoData = {
        horarioId: horarioEncontrado.id,
        servicoId: selectedService.id,
        observacoes: ''
      };

      await api.createAgendamento(agendamentoData);
      
      const dataExibicao = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      alert(`Agendamento realizado com sucesso!\n\nServiço: ${selectedService.nome}\nData: ${dataExibicao}\nHorário: ${selectedTime}\n\nEm breve você receberá a confirmação.`);
      
      // Limpar seleções após sucesso
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert(`Erro ao realizar agendamento: ${error.message || 'Tente novamente mais tarde'}`);
    } finally {
      setAgendamentoLoading(false);
    }
  };

  const handleCompartilhar = async () => {
    const url = `${window.location.origin}${window.location.pathname}#publico/profissional/${profissionalId}`;
    
    // Tentar usar a API de compartilhamento nativa (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profissional.nome} - ${profissional.profissao}`,
          text: `Confira o perfil de ${profissional.nome} no Slotyer!`,
          url: url,
        });
        return;
      } catch (err) {
        // Usuário cancelou ou erro - tentar copiar
      }
    }
    
    // Fallback: copiar para área de transferência
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência! 📋');
    } catch (err) {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copiado para a área de transferência! 📋');
    }
  };

  if (loading) {
    return (
      <div className="perfil-profissional-page">
        <div className="perfil-loading">
          <div className="loading-spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profissional || error) {
    return (
      <div className="perfil-profissional-page">
        <div className="perfil-error">
          <span>😕</span>
          <h2>{error ? 'Erro ao carregar' : 'Profissional não encontrado'}</h2>
          <p>{error}</p>
          <button onClick={onBack} className="btn-voltar">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-profissional-page">
      {/* Banner e Avatar */}
      <div className="perfil-banner" style={{ backgroundImage: `url(${profissional.banner})` }}>
        <div className="banner-overlay"></div>
        <button className="btn-back-perfil" onClick={onBack}>
          ← Voltar
        </button>
      </div>

      <div className="perfil-container">
        {/* Header do Perfil */}
        <div className="perfil-header">
          <img src={profissional.avatar} alt={profissional.nome} className="perfil-avatar" />
          <div className="perfil-info-header">
            <h1>{profissional.nome}</h1>
            <p className="perfil-profissao">{profissional.profissao}</p>
            <div className="perfil-rating">
              {renderStars(profissional.avaliacao)}
              <span className="rating-value">{profissional.avaliacao}</span>
              <span className="rating-count">({profissional.avaliacoes} avaliações)</span>
            </div>
            <p className="perfil-location">📍 {profissional.cidade}</p>
          </div>
          <div className="perfil-actions-header">
            <a href={`https://wa.me/${profissional.telefone.replace(/\D/g, '')}`} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
              💬 WhatsApp
            </a>
            <a href={`https://instagram.com/${profissional.instagram.replace('@', '')}`} className="btn-instagram" target="_blank" rel="noopener noreferrer">
              📸 Instagram
            </a>
            <button className="btn-compartilhar" onClick={handleCompartilhar}>
              🔗 Compartilhar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="perfil-tabs">
          <button 
            className={`tab-btn ${activeTab === 'sobre' ? 'active' : ''}`}
            onClick={() => setActiveTab('sobre')}
          >
            Sobre
          </button>
          <button 
            className={`tab-btn ${activeTab === 'servicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('servicos')}
          >
            Serviços
          </button>
          <button 
            className={`tab-btn ${activeTab === 'agendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('agendar')}
          >
            Agendar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'avaliacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('avaliacoes')}
          >
            Avaliações
          </button>
        </div>

        {/* Tab Content */}
        <div className="perfil-content">
          {/* Sobre */}
          {activeTab === 'sobre' && (
            <div className="tab-sobre">
              <div className="sobre-section">
                <h3>📝 Sobre</h3>
                <p>{profissional.bio}</p>
              </div>
              
              <div className="sobre-section">
                <h3>📍 Localização</h3>
                <p>{profissional.endereco}</p>
              </div>

              <div className="sobre-section">
                <h3>🕐 Horário de Funcionamento</h3>
                <p>{profissional.horarioFuncionamento}</p>
              </div>

              <div className="sobre-section">
                <h3>📞 Contato</h3>
                <p>Telefone: {profissional.telefone}</p>
                <p>Instagram: {profissional.instagram}</p>
              </div>
            </div>
          )}

          {/* Serviços */}
          {activeTab === 'servicos' && (
            <div className="tab-servicos">
              <h3>🛠️ Serviços Oferecidos</h3>
              <div className="servicos-lista">
                {(profissional.servicos || []).map(servico => (
                  <div key={servico.id} className="servico-item">
                    <div className="servico-info">
                      <h4>{servico.nome}</h4>
                      <p>{servico.descricao}</p>
                      <span className="servico-duracao">⏱️ {servico.duracao}</span>
                    </div>
                    <div className="servico-preco">
                      <span>{servico.preco}</span>
                      <button 
                        className="btn-agendar-servico"
                        onClick={() => {
                          setSelectedService(servico);
                          setActiveTab('agendar');
                        }}
                      >
                        Agendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agendar */}
          {activeTab === 'agendar' && (
            <div className="tab-agendar">
              <h3>📅 Agendar Horário</h3>
              
              {/* Seleção de Serviço */}
              <div className="agendar-section">
                <h4>1. Escolha o serviço</h4>
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
                <div className="servicos-select">
                  {(profissional.servicos || [])
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
                        <span className="servico-nome">{servico.nome}</span>
                        <span className="servico-preco-small">{servico.preco}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Seleção de Data */}
              <div className="agendar-section">
                <h4>2. Escolha a data</h4>
                <div className="calendario-container">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      // Desabilita datas passadas
                      const today = startOfDay(new Date());
                      if (isBefore(date, today)) return true;
                      
                      // Desabilita dias que não estão disponíveis
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return !profissional.diasDisponiveis.includes(dateStr);
                    }}
                    fromDate={new Date()}
                    toDate={addDays(new Date(), 30)}
                  />
                </div>
                {selectedDate && (
                  <p className="data-selecionada">
                    📅 Data selecionada: <strong>{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</strong>
                  </p>
                )}
              </div>

              {/* Seleção de Horário */}
              <div className="agendar-section">
                <h4>3. Escolha o horário</h4>
                <div className="horarios-disponiveis">
                  {(profissional.horarios || []).map(hora => (
                    <button
                      key={hora}
                      className={`horario-option ${selectedTime === hora ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(hora)}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo e Confirmar */}
              {selectedService && selectedDate && selectedTime && (
                <div className="agendar-resumo">
                  <h4>📋 Resumo do Agendamento</h4>
                  <div className="resumo-details">
                    <p><strong>Serviço:</strong> {selectedService.nome}</p>
                    <p><strong>Data:</strong> {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Duração:</strong> {selectedService.duracao}</p>
                    <p className="resumo-preco"><strong>Valor:</strong> {selectedService.preco}</p>
                  </div>
                  <button 
                    className="btn-confirmar-agendamento" 
                    onClick={handleAgendar}
                    disabled={agendamentoLoading}
                  >
                    {agendamentoLoading ? '⏳ Agendando...' : '✅ Confirmar Agendamento'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Avaliações */}
          {activeTab === 'avaliacoes' && (
            <div className="tab-avaliacoes">
              <div className="avaliacoes-header">
                <h3>⭐ Avaliações</h3>
                <div className="avaliacoes-resumo">
                  <span className="nota-grande">{profissional.avaliacao}</span>
                  <div className="avaliacoes-stars">
                    <div className="stars-row">{renderStars(profissional.avaliacao)}</div>
                    <span>({profissional.avaliacoes} avaliações)</span>
                  </div>
                </div>
              </div>
              
              <div className="avaliacoes-lista">
                {(profissional.avaliacoesDetalhadas || []).map(av => (
                  <div key={av.id} className="avaliacao-item">
                    <div className="avaliacao-header">
                      <span className="avaliacao-autor">{av.autor}</span>
                      <div className="avaliacao-stars">{renderStars(av.nota)}</div>
                    </div>
                    <p className="avaliacao-texto">"{av.texto}"</p>
                    <span className="avaliacao-data">{new Date(av.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilProfissionalPage;
