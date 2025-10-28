import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';


const Navbar = ({ currentPage = 'Catalogo' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const Navigate = useNavigate();

  const menuItems = [
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Lectura Reseñas', path: '/lecturaResenas' },
    { name: 'Perfil', path: '/perfil' },
    { name: 'Reconocimiento Imagen', path: '/posterRecognition' },
    { name: 'Recomendación por Ánimo', path: '/recomendacionEmocional' },
    { name: 'Reseña Película', path: '/resenasMovie' },
    { name: 'Traducción de Reseñas', path: '/traductorResenas' }
  ];

  const handleLogout = () => {
    // Limpiar tokens de autenticación
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Redirigir al login
    Navigate('/');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
           
            <span className="logo-text">MovieApp</span>
          </div>

          {/* Menú Desktop */}
          <ul className="navbar-menu">
            {menuItems.map((item) => (
              <li key={item.name} className="navbar-item">
                <a
                  href={item.path}
                  className={`navbar-link ${currentPage === item.name ? 'active' : ''}`}
                >
                 
                  <span className="nav-text">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Botón Cerrar Sesión Desktop */}
          <button className="logout-btn" onClick={confirmLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Cerrar Sesión</span>
          </button>

          {/* Botón Hamburguesa Mobile */}
          <button className="hamburger-btn" onClick={toggleMenu}>
            <span className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Menú Mobile */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-menu-list">
            {menuItems.map((item) => (
              <li key={item.name} className="mobile-menu-item">
                <a
                  href={item.path}
                  className={`mobile-menu-link ${currentPage === item.name ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
              
                  <span className="mobile-nav-text">{item.name}</span>
                </a>
              </li>
            ))}
            <li className="mobile-menu-item">
              <button className="mobile-logout-btn" onClick={confirmLogout}>
               
                <span className="mobile-logout-text">Cerrar Sesión</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Modal de Confirmación de Logout */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
         
            <h3 className="logout-modal-title">¿Cerrar Sesión?</h3>
            <p className="logout-modal-text">
              ¿Estás seguro que deseas cerrar tu sesión?
            </p>
            <div className="logout-modal-actions">
              <button className="logout-cancel-btn" onClick={cancelLogout}>
                Cancelar
              </button>
              <button className="logout-confirm-btn" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;