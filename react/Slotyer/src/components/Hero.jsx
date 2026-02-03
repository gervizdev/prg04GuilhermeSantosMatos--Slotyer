import React from 'react';
import '../styles/hero.css';

const Hero = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Cresça seu negócio com Slotyer</h1>
        <p>Conecte-se com clientes, organize sua agenda e gerencie seus serviços em um único lugar. Simples, eficiente e pronto para escalar.</p>
        <button 
          className="btn btn-primary" 
          onClick={scrollToFeatures}
        >
          Por que escolher Slotyer?
        </button>
      </div>
    </section>
  );
};

export default Hero;