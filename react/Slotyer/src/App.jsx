import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import SignUp from './components/SignUp';
import { api } from './api';
import './App.css';

function App() {
  const [depoimentos, setDepoimentos] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchContent = async () => {
      try {
        const [depRes, faqRes] = await Promise.all([
          api.listDepoimentos(),
          api.listFaqs(),
        ]);
        if (!active) return;
        setDepoimentos(Array.isArray(depRes) ? depRes : []);
        setFaqs(Array.isArray(faqRes) ? faqRes : []);
      } catch (err) {
        if (!active) return;
        console.error('Erro ao carregar conteúdo', err);
        setError('Não foi possível carregar o conteúdo agora.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchContent();
    return () => { active = false; };
  }, []);

  const renderDepoimentos = () => {
    if (loading) return <p className="muted">Carregando depoimentos...</p>;
    if (error) return <p className="muted">{error}</p>;
    if (!depoimentos.length) return <p className="muted">Nenhum depoimento disponível no momento.</p>;

    return (
      <div className="grid two">
        {depoimentos.map((item, idx) => (
          <div key={idx} className="testimonial-card">
            <p className="quote">“{item.texto}”</p>
            <div className="persona">
              <div className="avatar" aria-hidden="true">{(item.nome || '?').charAt(0)}</div>
              <div>
                <strong>{item.nome}</strong>
                <p className="muted small">{item.titulo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFaqs = () => {
    if (loading) return <p className="muted">Carregando FAQ...</p>;
    if (error) return <p className="muted">{error}</p>;
    if (!faqs.length) return <p className="muted">Nenhuma pergunta frequente cadastrada ainda.</p>;

    return (
      <div className="section-body">
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <h3>{faq.pergunta}</h3>
            <p className="muted">{faq.resposta}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-shell">
      <Header />
      <Hero />
      <Features />
      <SignUp />
      <main className="content">
        <section className="section-card">
          <div className="section-header">
            <h2>Depoimentos</h2>
            <p className="muted">Profissionais que já testaram o fluxo de agendamentos</p>
          </div>
          {renderDepoimentos()}
        </section>

        <section className="section-card">
          <div className="section-header">
            <h2>FAQ rápido</h2>
            <p className="muted">Principais dúvidas antes de começar</p>
          </div>
          {renderFaqs()}
        </section>

        <section className="section-card cta-card" id="cta-final">
          <div className="section-header">
            <h2>Pronto para receber mais agendamentos?</h2>
            <p className="muted">Cadastre-se e teste o fluxo completo sem custo.</p>
          </div>
          <div className="actions">
            <a className="btn" href="#cadastro">Começar agora</a>
            <a className="ghost" href="mailto:contato@slotyer.com">Falar com time</a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
