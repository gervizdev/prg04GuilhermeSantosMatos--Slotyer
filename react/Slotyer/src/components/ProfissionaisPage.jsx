import React, { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/discover-pages.css';

const ProfissionaisPage = ({ onBack, onVerPerfil }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categorias de profissionais
  const categorias = [
    { id: 'todos', name: 'Todos', icon: '👥' },
    { id: 'beleza', name: 'Beleza', icon: '💇' },
    { id: 'saude', name: 'Saúde', icon: '🏥' },
    { id: 'tecnologia', name: 'Tecnologia', icon: '💻' },
    { id: 'educacao', name: 'Educação', icon: '📚' },
    { id: 'casa', name: 'Casa', icon: '🏠' },
    { id: 'outros', name: 'Outros', icon: '📦' },
  ];

  useEffect(() => {
    const fetchProfissionais = async () => {
      try {
        setLoading(true);
        const data = await api.listProfissionais();
        setProfissionais(data || []);
      } catch (err) {
        console.error('Erro ao carregar profissionais:', err);
        setProfissionais([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfissionais();
  }, []);

  const filteredProfissionais = profissionais.filter(prof => {
    const matchesSearch = prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prof.profissao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prof.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || prof.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="discover-page">
      <div className="discover-container">
        {/* Header */}
        <div className="discover-header">
          <button className="btn-back" onClick={onBack}>
            ← Voltar
          </button>
          <div className="header-content">
            <h1>👥 Profissionais</h1>
            <p>Encontre os melhores profissionais da sua região</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="discover-filters">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar profissionais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {categorias.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="discover-results">
          <p className="results-count">
            {filteredProfissionais.length} profissiona{filteredProfissionais.length !== 1 ? 'is' : 'l'} encontrado{filteredProfissionais.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="loading-grid professionals">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-skeleton professional"></div>
              ))}
            </div>
          ) : filteredProfissionais.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">😕</span>
              <h3>Nenhum profissional encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outro termo</p>
            </div>
          ) : (
            <div className="professionals-grid">
              {filteredProfissionais.map(prof => (
                <div key={prof.id} className="professional-card">
                  <div className="card-header-prof">
                    <img src={prof.avatar} alt={prof.nome} className="prof-avatar" />
                    <div className="prof-info">
                      <h3>{prof.nome}</h3>
                      <p className="prof-title">{prof.profissao}</p>
                      <p className="prof-location">📍 {prof.cidade}</p>
                    </div>
                  </div>
                  
                  <p className="prof-description">{prof.descricao}</p>
                  
                  <div className="prof-services">
                    {prof.servicos.map((servico, idx) => (
                      <span key={idx} className="service-tag">{servico}</span>
                    ))}
                  </div>

                  <div className="card-footer-prof">
                    <div className="prof-rating">
                      {renderStars(prof.avaliacao)}
                      <span className="rating-value">{prof.avaliacao}</span>
                      <span className="rating-count">({prof.avaliacoes})</span>
                    </div>
                    <span className="prof-price">A partir de {prof.precoMin}</span>
                  </div>

                  <button className="btn-ver-perfil" onClick={() => onVerPerfil(prof.id)}>Ver Perfil</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfissionaisPage;
