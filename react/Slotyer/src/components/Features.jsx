import React from 'react';
import '../styles/features.css';

const Features = () => {
  const features = [
    {
      icon: '📅',
      title: 'Agenda Inteligente',
      description: 'Gerencie seus horários disponíveis e evite conflitos de agendamento automaticamente.'
    },
    {
      icon: '👥',
      title: 'Encontre Clientes',
      description: 'Seja encontrado por clientes que procuram seus serviços na nossa plataforma.'
    },
    {
      icon: '💰',
      title: 'Gerencie Pagamentos',
      description: 'Receba por seus serviços de forma segura e acompanhe todos os pagamentos em um lugar.'
    },
    {
      icon: '⭐',
      title: 'Construa Reputação',
      description: 'Receba avaliações de clientes e construa credibilidade no seu perfil profissional.'
    },
    {
      icon: '📊',
      title: 'Relatórios & Insights',
      description: 'Acompanhe seu desempenho com dados de agendamentos, receita e clientes.'
    },
    {
      icon: '📱',
      title: 'Acesso em Qualquer Lugar',
      description: 'Acesse sua agenda e gerencie tudo do celular, tablet ou computador.'
    },
  ];

  return (
    <section className="features">
      <div className="features-container">
        <h2>Por que escolher Slotyer?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
