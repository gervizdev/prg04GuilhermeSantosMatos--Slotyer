import React, { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/editar-perfil-profissional.css';

const EditarPerfilProfissional = ({ user, onBack, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    nome: '',
    profissao: '',
    bio: '',
    telefone: '',
    instagram: '',
    endereco: '',
    cidade: '',
    horarioFuncionamento: '',
    avatar: '',
    banner: ''
  });

  const [servicos, setServicos] = useState([]);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    descricao: '',
    preco: '',
    duracao: ''
  });

  const [diasDisponiveis, setDiasDisponiveis] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [novoHorario, setNovoHorario] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Carregar dados do profissional da API
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        // Carregar perfil do profissional
        const profissional = await api.getMyProfessionalProfile();
        
        setFormData({
          nome: profissional.nome || user?.nome || '',
          profissao: profissional.profissao || profissional.specialty || '',
          bio: profissional.bio || profissional.description || '',
          telefone: profissional.telefone || profissional.phone || '',
          instagram: profissional.instagram || '',
          endereco: profissional.endereco || profissional.address || '',
          cidade: profissional.cidade || profissional.city || '',
          horarioFuncionamento: profissional.horarioFuncionamento || profissional.workingHours || '',
          avatar: profissional.avatar || profissional.avatarUrl || '',
          banner: profissional.banner || profissional.bannerUrl || ''
        });
        
        // Carregar serviços do profissional
        if (profissional.id) {
          try {
            const servicosData = await api.listServicosDoProfissional(profissional.id);
            setServicos(servicosData || []);
          } catch (e) {
            console.log('Erro ao carregar serviços:', e);
            setServicos([]);
          }
        }
        
        // Carregar horários disponíveis
        if (profissional.id) {
          try {
            const horariosData = await api.listHorarios(profissional.id);
            // Extrair os horários únicos
            const horariosUnicos = [...new Set(horariosData.map(h => h.horario || h.time))].sort();
            setHorarios(horariosUnicos);
            
            // Extrair os dias disponíveis
            const diasUnicos = [...new Set(horariosData.filter(h => h.disponivel !== false).map(h => h.data || h.date))].filter(Boolean);
            setDiasDisponiveis(diasUnicos);
          } catch (e) {
            console.error('Erro ao carregar horários:', e);
            setMessage({ type: 'error', text: 'Erro ao carregar horários. Verifique sua conexão.' });
            setHorarios([]);
            setDiasDisponiveis([]);
          }
        }
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setMessage({ type: 'error', text: 'Erro ao carregar dados do perfil. Verifique sua conexão com o servidor.' });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServicoChange = (e) => {
    const { name, value } = e.target;
    setNovoServico(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const adicionarServico = async () => {
    if (!novoServico.nome || !novoServico.preco || !novoServico.duracao) {
      setMessage({ type: 'error', text: 'Preencha todos os campos do serviço' });
      return;
    }

    try {
      // Criar serviço via API
      const servicoCriado = await api.createServico({
        nome: novoServico.nome,
        name: novoServico.nome,
        descricao: novoServico.descricao,
        description: novoServico.descricao,
        preco: parseFloat(novoServico.preco.replace(/[^\d,]/g, '').replace(',', '.')),
        price: parseFloat(novoServico.preco.replace(/[^\d,]/g, '').replace(',', '.')),
        duracao: novoServico.duracao,
        duration: parseInt(novoServico.duracao) || 60
      });

      setServicos(prev => [...prev, servicoCriado]);
      setNovoServico({ nome: '', descricao: '', preco: '', duracao: '' });
      setMessage({ type: 'success', text: 'Serviço criado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao criar serviço' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const removerServico = async (id) => {
    try {
      await api.deleteServico(id);
      setServicos(prev => prev.filter(s => s.id !== id));
      setMessage({ type: 'success', text: 'Serviço removido!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao remover serviço' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const adicionarDia = (dias) => {
    const hoje = new Date();
    const novosDs = [];
    
    for (let i = 0; i < dias; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];
      if (!diasDisponiveis.includes(dataStr)) {
        novosDs.push(dataStr);
      }
    }
    
    setDiasDisponiveis(prev => [...prev, ...novosDs]);
  };

  const removerDia = (dia) => {
    setDiasDisponiveis(prev => prev.filter(d => d !== dia));
  };

  const adicionarHorario = () => {
    if (!novoHorario) return;
    if (!horarios.includes(novoHorario)) {
      setHorarios(prev => [...prev, novoHorario].sort());
    }
    setNovoHorario('');
  };

  const removerHorario = (horario) => {
    setHorarios(prev => prev.filter(h => h !== horario));
  };

  const handleSalvar = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const dadosAtualizados = {
        nome: formData.nome,
        name: formData.nome,
        profissao: formData.profissao,
        specialty: formData.profissao,
        bio: formData.bio,
        description: formData.bio,
        telefone: formData.telefone,
        phone: formData.telefone,
        instagram: formData.instagram,
        endereco: formData.endereco,
        address: formData.endereco,
        cidade: formData.cidade,
        city: formData.cidade,
        horarioFuncionamento: formData.horarioFuncionamento,
        workingHours: formData.horarioFuncionamento,
        avatar: formData.avatar,
        avatarUrl: formData.avatar,
        banner: formData.banner,
        bannerUrl: formData.banner
      };

      // Atualizar perfil via API
      const perfilAtualizado = await api.updateMyProfessionalProfile(dadosAtualizados);
      
      // Atualizar estado do usuário no App
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          ...dadosAtualizados
        });
      }
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar perfil. Verifique sua conexão.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editar-perfil-page">
        <div className="editar-perfil-header">
          <button onClick={onBack} className="btn-back">← Voltar</button>
          <h1>⚙️ Editar Perfil Profissional</h1>
        </div>
        <div className="editar-perfil-container">
          <div className="edit-section" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '1.2rem', color: '#718096' }}>🔄 Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-perfil-page">
      <div className="editar-perfil-header">
        <button onClick={onBack} className="btn-back">← Voltar</button>
        <h1>⚙️ Editar Perfil Profissional</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="editar-perfil-container">
        {/* Informações Básicas */}
        <section className="edit-section">
          <h2>📝 Informações Básicas</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label>Profissão</label>
              <input
                type="text"
                name="profissao"
                value={formData.profissao}
                onChange={handleInputChange}
                placeholder="Ex: Barbeiro, Manicure, etc"
              />
            </div>

            <div className="form-group full">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Conte um pouco sobre você e seu trabalho"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label>Instagram</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="@seuinstagram"
              />
            </div>

            <div className="form-group full">
              <label>Endereço</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                placeholder="Sua cidade"
              />
            </div>

            <div className="form-group">
              <label>Horário de Funcionamento</label>
              <input
                type="text"
                name="horarioFuncionamento"
                value={formData.horarioFuncionamento}
                onChange={handleInputChange}
                placeholder="Ex: Seg-Sex: 9h-18h"
              />
            </div>
          </div>
        </section>

        {/* Imagens */}
        <section className="edit-section">
          <h2>🖼️ Imagens do Perfil</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Avatar (URL)</label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/avatar.jpg"
              />
              {formData.avatar && (
                <div className="image-preview">
                  <img src={formData.avatar} alt="Avatar preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Banner (URL)</label>
              <input
                type="url"
                name="banner"
                value={formData.banner}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/banner.jpg"
              />
              {formData.banner && (
                <div className="image-preview banner-preview">
                  <img src={formData.banner} alt="Banner preview" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section className="edit-section">
          <h2>🛠️ Serviços Oferecidos</h2>
          
          <div className="servicos-lista-edit">
            {servicos.map(servico => (
              <div key={servico.id} className="servico-card-edit">
                <div className="servico-info-edit">
                  <h4>{servico.nome}</h4>
                  <p>{servico.descricao}</p>
                  <div className="servico-detalhes">
                    <span>💰 {servico.preco}</span>
                    <span>⏱️ {servico.duracao}</span>
                  </div>
                </div>
                <button
                  onClick={() => removerServico(servico.id)}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="adicionar-servico">
            <h3>Adicionar Novo Serviço</h3>
            <div className="form-grid">
              <div className="form-group">
                <input
                  type="text"
                  name="nome"
                  value={novoServico.nome}
                  onChange={handleServicoChange}
                  placeholder="Nome do serviço"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="preco"
                  value={novoServico.preco}
                  onChange={handleServicoChange}
                  placeholder="Preço (ex: R$ 50,00)"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="duracao"
                  value={novoServico.duracao}
                  onChange={handleServicoChange}
                  placeholder="Duração (ex: 1h)"
                />
              </div>
              <div className="form-group full">
                <textarea
                  name="descricao"
                  value={novoServico.descricao}
                  onChange={handleServicoChange}
                  placeholder="Descrição do serviço"
                  rows="2"
                />
              </div>
            </div>
            <button onClick={adicionarServico} className="btn-add">
              ➕ Adicionar Serviço
            </button>
          </div>
        </section>

        {/* Dias Disponíveis */}
        <section className="edit-section">
          <h2>📅 Dias Disponíveis</h2>
          
          <div className="quick-actions">
            <button onClick={() => adicionarDia(7)} className="btn-quick">
              +7 dias
            </button>
            <button onClick={() => adicionarDia(14)} className="btn-quick">
              +14 dias
            </button>
            <button onClick={() => adicionarDia(30)} className="btn-quick">
              +30 dias
            </button>
          </div>

          <div className="dias-lista">
            {diasDisponiveis.sort().map(dia => (
              <div key={dia} className="dia-chip">
                <span>{new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <button onClick={() => removerDia(dia)}>✕</button>
              </div>
            ))}
          </div>
        </section>

        {/* Horários */}
        <section className="edit-section">
          <h2>🕐 Horários Disponíveis</h2>
          
          <div className="adicionar-horario">
            <input
              type="time"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
            />
            <button onClick={adicionarHorario} className="btn-add">
              ➕ Adicionar
            </button>
          </div>

          <div className="horarios-lista">
            {horarios.map(horario => (
              <div key={horario} className="horario-chip">
                <span>{horario}</span>
                <button onClick={() => removerHorario(horario)}>✕</button>
              </div>
            ))}
          </div>
        </section>

        {/* Botões de Ação */}
        <div className="edit-actions">
          <button onClick={onBack} className="btn-cancelar">
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="btn-salvar"
            disabled={saving}
          >
            {saving ? 'Salvando...' : '💾 Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilProfissional;
