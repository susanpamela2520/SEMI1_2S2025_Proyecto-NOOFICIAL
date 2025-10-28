import { useState } from 'react';
import './ModeracionResena.css';

function ReviewModeration() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      movieTitle: 'Inception',
      moviePoster: 'https://via.placeholder.com/80x120/667eea/ffffff?text=Inception',
      userName: 'Juan Pérez',
      userEmail: 'juan@example.com',
      rating: 5,
      comment: 'Increíble película, Christopher Nolan es un genio. La trama es compleja pero muy bien ejecutada. Los efectos visuales son espectaculares.',
      date: '2024-10-25',
      status: 'Pendiente',
      reports: 0
    },
    {
      id: 2,
      movieTitle: 'The Matrix',
      moviePoster: 'https://via.placeholder.com/80x120/764ba2/ffffff?text=Matrix',
      userName: 'María García',
      userEmail: 'maria@example.com',
      rating: 4,
      comment: 'Buena película pero un poco lenta en algunas partes. Los efectos especiales son buenos para su época.',
      date: '2024-10-24',
      status: 'Pendiente',
      reports: 0
    },
    {
      id: 3,
      movieTitle: 'Interstellar',
      moviePoster: 'https://via.placeholder.com/80x120/f093fb/ffffff?text=Interstellar',
      userName: 'Carlos López',
      userEmail: 'carlos@example.com',
      rating: 1,
      comment: 'Terrible película, no entendí nada. Muy aburrida y lenta. NO LA RECOMIENDO PARA NADA!!!',
      date: '2024-10-23',
      status: 'Reportada',
      reports: 3
    },
    {
      id: 4,
      movieTitle: 'The Dark Knight',
      moviePoster: 'https://via.placeholder.com/80x120/4facfe/ffffff?text=Batman',
      userName: 'Ana Martínez',
      userEmail: 'ana@example.com',
      rating: 5,
      comment: 'La mejor película de superhéroes que he visto. Heath Ledger está increíble como el Joker.',
      date: '2024-10-22',
      status: 'Aprobada',
      reports: 0
    },
    {
      id: 5,
      movieTitle: 'Pulp Fiction',
      moviePoster: 'https://via.placeholder.com/80x120/fa709a/ffffff?text=Pulp',
      userName: 'Luis Rodríguez',
      userEmail: 'luis@example.com',
      rating: 5,
      comment: 'Obra maestra de Tarantino. Diálogos brillantes y actuaciones memorables.',
      date: '2024-10-21',
      status: 'Aprobada',
      reports: 0
    },
    {
      id: 6,
      movieTitle: 'Avatar',
      moviePoster: 'https://via.placeholder.com/80x120/667eea/ffffff?text=Avatar',
      userName: 'Sofia Torres',
      userEmail: 'sofia@example.com',
      rating: 2,
      comment: 'Esta película es SPAM SPAM SPAM. Visita mi sitio web para más reseñas.',
      date: '2024-10-20',
      status: 'Reportada',
      reports: 5
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const handleOpenModal = (review) => {
    setCurrentReview(review);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentReview(null);
  };

  const handleApprove = (reviewId) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, status: 'Aprobada' } : review
    ));
    handleCloseModal();
  };

  const handleReject = (reviewId) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, status: 'Rechazada' } : review
    ));
    handleCloseModal();
  };

  const handleDelete = (reviewId) => {
    if (window.confirm('¿Estás seguro de eliminar esta reseña permanentemente?')) {
      setReviews(reviews.filter(review => review.id !== reviewId));
      handleCloseModal();
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'reports') {
      return b.reports - a.reports;
    }
    return 0;
  });

  const getStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const pendingCount = reviews.filter(r => r.status === 'Pendiente').length;
  const reportedCount = reviews.filter(r => r.status === 'Reportada').length;

  return (
    <div className="review-moderation">
      <div className="header">
        <div className="header-content">
          <h1>🎬 Moderación de Reseñas</h1>
          <div className="stats">
            <div className="stat-card pending">
              <span className="stat-number">{pendingCount}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card reported">
              <span className="stat-number">{reportedCount}</span>
              <span className="stat-label">Reportadas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por película, usuario o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Reportada">Reportada</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Ordenar por fecha</option>
            <option value="rating">Ordenar por calificación</option>
            <option value="reports">Ordenar por reportes</option>
          </select>
        </div>
      </div>

      <div className="reviews-grid">
        {sortedReviews.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron reseñas</p>
          </div>
        ) : (
          sortedReviews.map(review => (
            <div key={review.id} className={`review-card ${review.status.toLowerCase()}`}>
              <div className="review-header">
                <img src={review.moviePoster} alt={review.movieTitle} className="movie-poster" />
                <div className="review-info">
                  <h3 className="movie-title">{review.movieTitle}</h3>
                  <div className="rating">{getStars(review.rating)}</div>
                  <div className="user-info">
                    <span className="user-name">{review.userName}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
                <div className="review-status-container">
                  <span className={`badge badge-${review.status.toLowerCase()}`}>
                    {review.status}
                  </span>
                  {review.reports > 0 && (
                    <span className="reports-badge">⚠️ {review.reports} reportes</span>
                  )}
                </div>
              </div>
              
              <div className="review-content">
                <p className="comment">{review.comment}</p>
              </div>

              <div className="review-actions">
                <button 
                  className="btn btn-small btn-view"
                  onClick={() => handleOpenModal(review)}
                >
                  👁️ Ver Detalles
                </button>
                {review.status === 'Pendiente' && (
                  <>
                    <button 
                      className="btn btn-small btn-approve"
                      onClick={() => handleApprove(review.id)}
                    >
                      ✓ Aprobar
                    </button>
                    <button 
                      className="btn btn-small btn-reject"
                      onClick={() => handleReject(review.id)}
                    >
                      ✗ Rechazar
                    </button>
                  </>
                )}
                {review.status === 'Reportada' && (
                  <>
                    <button 
                      className="btn btn-small btn-approve"
                      onClick={() => handleApprove(review.id)}
                    >
                      ✓ Aprobar
                    </button>
                    <button 
                      className="btn btn-small btn-delete-main"
                      onClick={() => handleDelete(review.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && currentReview && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Detalles de la Reseña</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="review-detail">
                <div className="detail-section">
                  <img src={currentReview.moviePoster} alt={currentReview.movieTitle} className="movie-poster-large" />
                  <div className="movie-details">
                    <h3>{currentReview.movieTitle}</h3>
                    <div className="rating-large">{getStars(currentReview.rating)}</div>
                    <p className="rating-text">{currentReview.rating} de 5 estrellas</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>👤 Usuario</h4>
                  <p><strong>Nombre:</strong> {currentReview.userName}</p>
                  <p><strong>Email:</strong> {currentReview.userEmail}</p>
                  <p><strong>Fecha:</strong> {currentReview.date}</p>
                </div>

                <div className="detail-section">
                  <h4>💬 Comentario</h4>
                  <div className="comment-box">
                    {currentReview.comment}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>📊 Estado y Reportes</h4>
                  <p><strong>Estado:</strong> <span className={`badge badge-${currentReview.status.toLowerCase()}`}>{currentReview.status}</span></p>
                  <p><strong>Reportes:</strong> {currentReview.reports > 0 ? `⚠️ ${currentReview.reports} reportes` : '✓ Sin reportes'}</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {currentReview.status !== 'Aprobada' && (
                <button 
                  className="btn btn-approve"
                  onClick={() => handleApprove(currentReview.id)}
                >
                  ✓ Aprobar Reseña
                </button>
              )}
              {currentReview.status !== 'Rechazada' && (
                <button 
                  className="btn btn-reject"
                  onClick={() => handleReject(currentReview.id)}
                >
                  ✗ Rechazar Reseña
                </button>
              )}
              <button 
                className="btn btn-delete-main"
                onClick={() => handleDelete(currentReview.id)}
              >
                🗑️ Eliminar Permanentemente
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewModeration;