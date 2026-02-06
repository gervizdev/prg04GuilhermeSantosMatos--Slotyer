import React, { useState, useEffect } from 'react';
import '../styles/discover-pages.css';
import { api } from '../api';

const ServicosPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categorias de serviços
  const categorias = [
    { id: 'todos', name: 'Todos', icon: '📋' },
    { id: 'beleza', name: 'Beleza', icon: '💇' },
    { id: 'saude', name: 'Saúde', icon: '🏥' },
    { id: 'tecnologia', name: 'Tecnologia', icon: '💻' },
    { id: 'educacao', name: 'Educação', icon: '📚' },
    { id: 'casa', name: 'Casa', icon: '🏠' },
    { id: 'outros', name: 'Outros', icon: '📦' },
  ];

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        setLoading(true);
        const data = await api.listServicos();
        setServicos(data || []);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        setServicos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServicos();
  }, []);

  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || servico.categoria === selectedCategory;
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
            <h1>🛠️ Serviços</h1>
            <p>Encontre os melhores serviços para você</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="discover-filters">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar serviços..."
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
            {filteredServicos.length} serviço{filteredServicos.length !== 1 ? 's' : ''} encontrado{filteredServicos.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-skeleton"></div>
              ))}
            </div>
          ) : filteredServicos.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">😕</span>
              <h3>Nenhum serviço encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outro termo</p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServicos.map(servico => (
                <div key={servico.id} className="service-card">
                  <div className="card-image">
                    <img src={servico.imagem} alt={servico.nome} />
                    <span className="card-category">{categorias.find(c => c.id === servico.categoria)?.icon}</span>
                  </div>
                  <div className="card-content">
                    <h3>{servico.nome}</h3>
                    <p className="card-description">{servico.descricao}</p>
                    <div className="card-meta">
                      <span className="card-price">{servico.preco}</span>
                      <span className="card-duration">⏱️ {servico.duracao}</span>
                    </div>
                    <div className="card-footer">
                      <div className="card-rating">
                        {renderStars(servico.avaliacao)}
                        <span className="rating-value">{servico.avaliacao}</span>
                      </div>
                      <span className="card-professional">por {servico.profissional}</span>
                    </div>
                    <button className="btn-agendar">Agendar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicosPage;
