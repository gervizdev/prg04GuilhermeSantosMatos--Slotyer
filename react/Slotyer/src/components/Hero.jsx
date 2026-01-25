import React from 'react';
import '../styles/hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Cresça seu negócio com Slotyer</h1>
        <p>Conecte-se com clientes, organize sua agenda e gerencie seus serviços em um único lugar. Simples, eficiente e pronto para escalar.</p>
        <a className="btn btn-primary" href="#cadastro" role="button">Cadastre-se como profissional</a>
      </div>
    </section>
  );
};

export default Hero;