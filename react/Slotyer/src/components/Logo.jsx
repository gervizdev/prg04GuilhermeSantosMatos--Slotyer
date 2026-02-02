import React from 'react';

const Logo = ({ onClick, isMenuOpen = false }) => {
  return (
    <div 
      className={`logo-container ${isMenuOpen ? 'menu-open' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Toggle navigation menu"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Fundo circular */}
        <circle cx="28" cy="28" r="26" fill="none" stroke="url(#gradient)" strokeWidth="2" opacity="0.3" />
        
        {/* Calendário de fundo */}
        <rect x="8" y="14" width="24" height="20" rx="2" fill="#667eea" opacity="0.15" stroke="#667eea" strokeWidth="1.2" />
        
        {/* Cabeçalho do calendário */}
        <rect x="8" y="14" width="24" height="5" rx="2" fill="#667eea" opacity="0.3" />
        
        {/* Pontos do calendário (dias) */}
        <circle cx="12" cy="21" r="1" fill="#667eea" opacity="0.5" />
        <circle cx="16" cy="21" r="1" fill="#667eea" opacity="0.5" />
        <circle cx="20" cy="21" r="1" fill="#667eea" opacity="0.5" />
        <circle cx="28" cy="21" r="1" fill="#667eea" opacity="0.5" />
        
        <circle cx="12" cy="26" r="1" fill="#667eea" opacity="0.5" />
        <circle cx="16" cy="26" r="1.2" fill="#667eea" />
        <circle cx="20" cy="26" r="1" fill="#667eea" opacity="0.5" />
        <circle cx="28" cy="26" r="1" fill="#667eea" opacity="0.5" />
        
        {/* S - Slotyer em primeiro plano */}
        <text 
          x="36" 
          y="34" 
          fontSize="24" 
          fontWeight="700" 
          fill="url(#gradient)" 
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
        >
          S
        </text>
        
        {/* Gradiente */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
