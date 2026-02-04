  // Função para migrar para profissional
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState({ profissao: '', telefone: '' });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  const handleUpgradeChange = (e) => {
    const { name, value } = e.target;
    setUpgradeData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    setUpgradeError('');
    if (!upgradeData.profissao || upgradeData.profissao.length < 3) {
      setUpgradeError('Informe sua profissão (mínimo 3 caracteres)');
      return;
    }
    if (!upgradeData.telefone || upgradeData.telefone.length < 8) {
      setUpgradeError('Informe um telefone válido');
      return;
    }
    setUpgradeLoading(true);
    try {
      // Atualizar tipo para profissional, enviando apenas os campos necessários
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: upgradeData.telefone,
        tipo: 'PROFISSIONAL',
        especialidade: upgradeData.profissao
      };
      const updated = await api.updateMe(payload);
      setUser(updated);
      setShowUpgradeModal(false);
      setMessage({ type: 'success', text: 'Conta migrada para profissional com sucesso!' });
      if (onUserUpdate) onUserUpdate(updated);
    } catch (err) {
      setUpgradeError(err.message || 'Erro ao migrar conta.');
    } finally {
      setUpgradeLoading(false);
    }
  };
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import '../styles/profile-page.css';

const ProfilePage = ({ user: initialUser, onUserUpdate, onBack }) => {
  const [user, setUser] = useState(initialUser || null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    bio: '',
    profissao: '',
    endereco: '',
    cidade: '',
    estado: '',
  });

  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  // Carregar dados do usuário da API se não foi passado
  useEffect(() => {
    const carregarUsuario = async () => {
      if (initialUser) {
        setUser(initialUser);
        setFormData({
          nome: initialUser.nome || initialUser.name || '',
          email: initialUser.email || '',
          telefone: initialUser.telefone || initialUser.phone || '',
          bio: initialUser.bio || initialUser.description || '',
          profissao: initialUser.profissao || initialUser.specialty || '',
          endereco: initialUser.endereco || initialUser.address || '',
          cidade: initialUser.cidade || initialUser.city || '',
          estado: initialUser.estado || initialUser.state || '',
        });
        setIsLoading(false);
        return;
      }

      // Tentar carregar da API
      try {
        setIsLoading(true);
        const userData = await api.getMe();
        setUser(userData);
        setFormData({
          nome: userData.nome || userData.name || '',
          email: userData.email || '',
          telefone: userData.telefone || userData.phone || '',
          bio: userData.bio || userData.description || '',
          profissao: userData.profissao || userData.specialty || '',
          endereco: userData.endereco || userData.address || '',
          cidade: userData.cidade || userData.city || '',
          estado: userData.estado || userData.state || '',
        });
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setMessage({ type: 'error', text: 'Erro ao carregar dados do perfil' });
      } finally {
        setIsLoading(false);
      }
    };

    carregarUsuario();
  }, [initialUser]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'telefone' ? formatPhone(value) : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUser(prev => ({
          ...prev,
          avatar: event.target.result,
        }));
        setMessage({ type: 'success', text: 'Foto atualizada! Salve para confirmar.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Verificar se é profissional para usar a API correta
      const userTipo = user.tipo || user.type || user.role || '';
      const isProfissional = userTipo.toUpperCase() === 'PROFISSIONAL' || userTipo.toUpperCase() === 'PROFESSIONAL';

      const payload = {
        nome: formData.nome,
        name: formData.nome,
        telefone: formData.telefone,
        phone: formData.telefone,
        bio: formData.bio,
        description: formData.bio,
        endereco: formData.endereco,
        address: formData.endereco,
        cidade: formData.cidade,
        city: formData.cidade,
        estado: formData.estado,
        state: formData.estado,
      };

      let updatedUser;
      if (isProfissional) {
        // Atualizar perfil profissional via API
        payload.profissao = formData.profissao;
        payload.specialty = formData.profissao;
        await api.updateMyProfessionalProfile(payload);
      } else {
        // Atualizar perfil do cliente via API
        await api.updateMe(payload);
      }
      updatedUser = { ...user, ...formData };

      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    if (passwordData.novaSenha.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Implementar endpoint de alteração de senha no backend
      // Por enquanto, a funcionalidade de alteração de senha não está disponível
      // Quando o backend tiver o endpoint, usar:
      // await api.changePassword({ senhaAtual: passwordData.senhaAtual, novaSenha: passwordData.novaSenha });
      
      setMessage({ type: 'info', text: 'Funcionalidade de alteração de senha será disponibilizada em breve.' });
      setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao alterar senha. Verifique a senha atual.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: user.nome || user.name || '',
      email: user.email || '',
      telefone: user.telefone || user.phone || '',
      bio: user.bio || user.description || '',
      profissao: user.profissao || user.specialty || '',
      endereco: user.endereco || user.address || '',
      cidade: user.cidade || user.city || '',
      estado: user.estado || user.state || '',
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (isLoading || !user) {
    return (
      <div className="profile-page">
        <div className="profile-page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>🔄 Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Verificar tipo do usuário (suportar diferentes formatos da API)
  const userTipo = user.tipo || user.type || user.role || '';
  const isProfissional = userTipo.toUpperCase() === 'PROFISSIONAL' || userTipo.toUpperCase() === 'PROFESSIONAL';

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        {/* Modal de upgrade para profissional */}
        {(!isProfissional && showUpgradeModal) && (
          <div className="modal-upgrade-overlay" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.3)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div className="modal-upgrade" style={{ background:'#fff', borderRadius:8, padding:32, minWidth:320, boxShadow:'0 2px 16px rgba(0,0,0,0.15)' }}>
              <h2 style={{ marginBottom:16 }}>Migrar para conta profissional</h2>
              <form onSubmit={handleUpgradeSubmit}>
                <div style={{ marginBottom:12 }}>
                  <label>Profissão <span style={{color:'#d32f2f'}}>*</span>:</label><br/>
                  <input type="text" name="profissao" value={upgradeData.profissao} onChange={handleUpgradeChange} style={{ width:'100%', padding:8, borderRadius:4, border:'1px solid #ddd' }} required minLength={3} />
                </div>
                <div style={{ marginBottom:12 }}>
                  <label>Telefone <span style={{color:'#d32f2f'}}>*</span>:</label><br/>
                  <input type="text" name="telefone" value={upgradeData.telefone} onChange={handleUpgradeChange} style={{ width:'100%', padding:8, borderRadius:4, border:'1px solid #ddd' }} required minLength={8} />
                </div>
                {upgradeError && <div style={{ color:'#b71c1c', marginBottom:8 }}>{upgradeError}</div>}
                <button type="submit" disabled={upgradeLoading} style={{ background:'#667eea', color:'#fff', border:'none', borderRadius:4, padding:'10px 20px', fontWeight:600, cursor:'pointer' }}>
                  {upgradeLoading ? 'Migrando...' : 'Migrar para profissional'}
                </button>
                <button type="button" onClick={()=>setShowUpgradeModal(false)} style={{ marginLeft:12, background:'#eee', color:'#333', border:'none', borderRadius:4, padding:'10px 20px', fontWeight:600, cursor:'pointer' }}>Cancelar</button>
              </form>
            </div>
          </div>
        )}
                {/* Botão para migrar para profissional */}
                {(!isProfissional) && (
                  <div style={{ margin:'24px 0', textAlign:'center' }}>
                    <button onClick={()=>setShowUpgradeModal(true)} style={{ background:'#fffbe6', color:'#b8860b', border:'1px solid #ffe58f', borderRadius:6, padding:'10px 24px', fontWeight:600, cursor:'pointer', fontSize:'1rem' }}>
                      Quero ser profissional
                    </button>
                  </div>
                )}
        {/* Header */}
        <div className="profile-page-header">
          <button className="btn-back" onClick={onBack}>
            ← Voltar
          </button>
          <h1>Configurações da Conta</h1>
        </div>

        {/* Mensagem de feedback */}
        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Layout principal */}
        <div className="profile-page-layout">
          {/* Sidebar com tabs */}
          <aside className="profile-sidebar">
            <button
              className={`sidebar-tab ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              👤 Perfil
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'seguranca' ? 'active' : ''}`}
              onClick={() => setActiveTab('seguranca')}
            >
              🔒 Segurança
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'preferencias' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferencias')}
            >
              ⚙️ Preferências
            </button>
            
            {isProfissional && (
              <button
                className="sidebar-tab profissional-btn"
                onClick={() => window.location.hash = 'perfil/editar'}
              >
                🛠️ Editar Perfil Profissional
              </button>
            )}
          </aside>

          {/* Conteúdo principal */}
          <main className="profile-main">
            {/* Tab: Perfil */}
            {activeTab === 'perfil' && (
              <div className="profile-tab-content">
                <div className="profile-section">
                  <h2>Foto de Perfil</h2>
                  <div className="avatar-section">
                    <div className="avatar-wrapper">
                      <img
                        src={user.avatar}
                        alt={`Avatar de ${user.nome}`}
                        className="profile-avatar-large"
                      />
                      <button 
                        className="avatar-edit-btn"
                        onClick={handleAvatarClick}
                        title="Alterar foto"
                      >
                        📷
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                    <div className="avatar-info">
                      <p>Clique no ícone para alterar sua foto</p>
                      <span>JPG, PNG ou GIF. Máximo 5MB.</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <div className="section-header">
                    <h2>Informações Pessoais</h2>
                    {!isEditing && (
                      <button 
                        className="btn-edit"
                        onClick={() => setIsEditing(true)}
                      >
                        ✏️ Editar
                      </button>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      ) : (
                        <p className="form-value">{user.nome}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      ) : (
                        <p className="form-value">{user.email}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Telefone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="(11) 99999-9999"
                        />
                      ) : (
                        <p className="form-value">{user.telefone || 'Não informado'}</p>
                      )}
                    </div>

                    {user.tipo === 'PROFISSIONAL' && (
                      <div className="form-group">
                        <label>Profissão/Serviço</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="profissao"
                            value={formData.profissao}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        ) : (
                          <p className="form-value">{user.profissao || 'Não informado'}</p>
                        )}
                      </div>
                    )}

                    <div className="form-group full-width">
                      <label>Sobre mim</label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="form-input form-textarea"
                          rows="3"
                          placeholder="Conte um pouco sobre você..."
                        />
                      ) : (
                        <p className="form-value">{user.bio || 'Nenhuma descrição adicionada.'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h2>Endereço</h2>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Endereço</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="endereco"
                          value={formData.endereco}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Rua, número, complemento"
                        />
                      ) : (
                        <p className="form-value">{user.endereco || 'Não informado'}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Cidade</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="cidade"
                          value={formData.cidade}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      ) : (
                        <p className="form-value">{user.cidade || 'Não informado'}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Estado</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          className="form-input"
                          maxLength="2"
                          placeholder="UF"
                        />
                      ) : (
                        <p className="form-value">{user.estado || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                )}

                <div className="profile-section profile-info-section">
                  <h2>Informações da Conta</h2>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Tipo de conta</span>
                      <span className="info-value badge">
                        {user.tipo === 'PROFISSIONAL' ? '👨‍💼 Profissional' : '👤 Cliente'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Membro desde</span>
                      <span className="info-value">
                        {user.criadoEm ? new Date(user.criadoEm).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Segurança */}
            {activeTab === 'seguranca' && (
              <div className="profile-tab-content">
                <div className="profile-section">
                  <h2>Alterar Senha</h2>
                  <form onSubmit={handleChangePassword} className="password-form">
                    <div className="form-group">
                      <label>Senha Atual</label>
                      <input
                        type="password"
                        name="senhaAtual"
                        value={passwordData.senhaAtual}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Nova Senha</label>
                      <input
                        type="password"
                        name="novaSenha"
                        value={passwordData.novaSenha}
                        onChange={handlePasswordChange}
                        className="form-input"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirmar Nova Senha</label>
                      <input
                        type="password"
                        name="confirmarSenha"
                        value={passwordData.confirmarSenha}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </form>
                </div>

                <div className="profile-section danger-zone">
                  <h2>Zona de Perigo</h2>
                  <p>Ações irreversíveis para sua conta.</p>
                  <button 
                    className="btn btn-danger"
                    onClick={async () => {
                      if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
                        try {
                          await api.deleteMe();
                          api.setToken(null);
                          setMessage({ type: 'success', text: 'Conta excluída com sucesso.' });
                          // Redirecionar para home após exclusão
                          setTimeout(() => {
                            window.location.hash = '';
                            window.location.reload();
                          }, 1500);
                        } catch (err) {
                          setMessage({ type: 'error', text: err.message || 'Erro ao excluir conta. Tente novamente.' });
                        }
                      }
                    }}
                  >
                    🗑️ Excluir minha conta
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Preferências */}
            {activeTab === 'preferencias' && (
              <div className="profile-tab-content">
                <div className="profile-section">
                  <h2>Notificações</h2>
                  <div className="preference-list">
                    <label className="preference-item">
                      <input type="checkbox" defaultChecked />
                      <span>Receber emails sobre novos agendamentos</span>
                    </label>
                    <label className="preference-item">
                      <input type="checkbox" defaultChecked />
                      <span>Receber lembretes de compromissos</span>
                    </label>
                    <label className="preference-item">
                      <input type="checkbox" />
                      <span>Receber novidades e promoções</span>
                    </label>
                  </div>
                </div>

                <div className="profile-section">
                  <h2>Privacidade</h2>
                  <div className="preference-list">
                    <label className="preference-item">
                      <input type="checkbox" defaultChecked />
                      <span>Mostrar meu perfil para outros usuários</span>
                    </label>
                    <label className="preference-item">
                      <input type="checkbox" />
                      <span>Permitir que me encontrem pelo telefone</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
