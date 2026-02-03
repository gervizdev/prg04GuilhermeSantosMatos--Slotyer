import React from 'react';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo e descrição */}
          <div className="footer-brand">
            <div className="footer-logo">
              <svg
                width="40"
                height="40"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="28" cy="28" r="26" fill="none" stroke="url(#footerGradient)" strokeWidth="2" opacity="0.3" />
                <rect x="8" y="14" width="24" height="20" rx="2" fill="#667eea" opacity="0.15" stroke="#667eea" strokeWidth="1.2" />
                <rect x="8" y="14" width="24" height="5" rx="2" fill="#667eea" opacity="0.3" />
                <text x="36" y="34" fontSize="24" fontWeight="700" fill="url(#footerGradient)" fontFamily="Arial, sans-serif" textAnchor="middle">S</text>
                <defs>
                  <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="footer-brand-name">Slotyer</span>
            </div>
            <p className="footer-description">
              Plataforma de agendamento que conecta profissionais e clientes de forma simples e eficiente.
            </p>
          </div>

          {/* Links rápidos */}
          <div className="footer-links">
            <h4>Links Rápidos</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="#servicos">Serviços</a></li>
              <li><a href="#profissionais">Profissionais</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="footer-contact">
            <h4>Contato</h4>
            <ul>
              <li>📧 contato@slotyer.com</li>
              <li>📱 (11) 99999-9999</li>
              <li>📍 São Paulo, SP</li>
            </ul>
          </div>

          {/* Redes sociais */}
          <div className="footer-social">
            <h4>Redes Sociais</h4>
            <div className="social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                📸
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                📘
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                🐦
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                💼
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Slotyer. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
