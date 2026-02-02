import React, { useState, useEffect } from 'react';
import '../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    profissao: '',
    telefone: '',
    bio: '',
  });

  useEffect(() => {
    // Simular carregamento de dados do usuário
    const mockUser = {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      profissao: 'Cabeleireiro',
      telefone: '(11) 99999-9999',
      bio: 'Profissional experiente em cortes e penteados.',
      avatar: 'https://via.placeholder.com/100x100/667eea/ffffff?text=JS',
      tipo: 'PROFISSIONAL'
    };

    setUser(mockUser);
    setFormData({
      nome: mockUser.nome,
      email: mockUser.email,
      profissao: mockUser.profissao,
      telefone: mockUser.telefone,
      bio: mockUser.bio,
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Simular salvamento
    setUser(prev => ({
      ...prev,
      ...formData,
    }));
    setIsEditing(false);
    alert('Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    setFormData({
      nome: user.nome,
      email: user.email,
      profissao: user.profissao,
      telefone: user.telefone,
      bio: user.bio,
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <section className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Meu Perfil</h1>
          {!isEditing && (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img
                src={user.avatar}
                alt={`Avatar de ${user.nome}`}
                className="profile-avatar"
              />
              {isEditing && (
                <button className="change-avatar-btn">
                  Alterar Foto
                </button>
              )}
            </div>
            <div className="profile-info">
              <h2>{user.nome}</h2>
              <p className="profile-type">
                {user.tipo === 'PROFISSIONAL' ? 'Profissional' : 'Cliente'}
              </p>
              {user.profissao && (
                <p className="profile-profession">{user.profissao}</p>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              {isEditing ? (
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="form-control"
                />
              ) : (
                <p className="form-value">{user.nome}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                />
              ) : (
                <p className="form-value">{user.email}</p>
              )}
            </div>

            {user.tipo === 'PROFISSIONAL' && (
              <div className="form-group">
                <label htmlFor="profissao">Profissão/Serviço</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="profissao"
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="form-value">{user.profissao}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              {isEditing ? (
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="form-control"
                />
              ) : (
                <p className="form-value">{user.telefone}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bio">Sobre mim</label>
              {isEditing ? (
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  placeholder="Conte um pouco sobre você..."
                />
              ) : (
                <p className="form-value">{user.bio || 'Nenhuma descrição adicionada.'}</p>
              )}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Salvar Alterações
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;