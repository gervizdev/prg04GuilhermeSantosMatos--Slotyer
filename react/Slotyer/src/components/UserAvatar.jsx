import React, { useState } from 'react';
import '../styles/user-avatar.css';

const UserAvatar = ({ user, onProfileClick, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    if (onProfileClick) onProfileClick();
  };

  const handleLogout = () => {
    setShowDropdown(false);
    if (onLogout) onLogout();
  };

  return (
    <div className="user-avatar-container">
      <button
        className="user-avatar-btn"
        onClick={toggleDropdown}
        aria-label="Menu do usuário"
      >
        <img
          src={user.avatar}
          alt={`Avatar de ${user.nome}`}
          className="user-avatar-img"
        />
      </button>

      {showDropdown && (
        <>
          <div
            className="dropdown-backdrop"
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="user-dropdown">
            <div className="dropdown-header">
              <img
                src={user.avatar}
                alt={`Avatar de ${user.nome}`}
                className="dropdown-avatar"
              />
              <div className="dropdown-user-info">
                <div className="dropdown-name">{user.nome}</div>
                <div className="dropdown-email">{user.email}</div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item"
              onClick={handleProfileClick}
            >
              <span className="dropdown-icon">👤</span>
              Meu Perfil
            </button>

            <button
              className="dropdown-item"
              onClick={handleProfileClick}
            >
              <span className="dropdown-icon">⚙️</span>
              Configurações
            </button>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <span className="dropdown-icon">🚪</span>
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAvatar;