import { useState, useEffect } from 'react';
import './resenasMovie.css';
import Navbar from './Navbar.jsx';

const resenasMovie = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, highest, lowest
  const [filterRating, setFilterRating] = useState('all');
  
  // Estado para traducciones
  const [translatingReviews, setTranslatingReviews] = useState({});
  const [translatedReviews, setTranslatedReviews] = useState({});

  // Idiomas soportados
  const supportedLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  useEffect(() => {
    fetchReviews();
  }, [movieId, sortBy, filterRating]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `TU_API_URL/movies/${movieId}/reviews?sort=${sortBy}&rating=${filterRating}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error:', error);
      loadMockReviews();
    } finally {
      setIsLoading(false);
    }
  };

  // Datos de ejemplo para desarrollo
  const loadMockReviews = () => {
    const mockReviews = [
      {
        id: '1',
        userId: { id: 'u1', username: 'cinephile123', profilePhoto: 'https://i.pravatar.cc/150?img=1' },
        rating: 5,
        title: 'Una obra maestra del cine',
        content: 'Esta película es simplemente extraordinaria. La dirección es impecable, las actuaciones son memorables y la historia te mantiene al borde de tu asiento. Cada escena está cuidadosamente elaborada y el resultado final es una experiencia cinematográfica inolvidable.',
        language: 'es',
        detectedLanguage: 'Spanish',
        createdAt: new Date('2024-01-15'),
        helpful: 245,
        notHelpful: 12
      },
      {
        id: '2',
        userId: { id: 'u2', username: 'moviebuff', profilePhoto: 'https://i.pravatar.cc/150?img=2' },
        rating: 4,
        title: 'Great visuals but slow pacing',
        content: 'The cinematography is absolutely stunning and the visual effects are top-notch. However, I found the pacing to be quite slow in the middle section. Overall, it\'s a good film that could have been great with some tighter editing.',
        language: 'en',
        detectedLanguage: 'English',
        createdAt: new Date('2024-01-10'),
        helpful: 189,
        notHelpful: 45
      },
      {
        id: '3',
        userId: { id: 'u3', username: 'filmcritic_fr', profilePhoto: 'https://i.pravatar.cc/150?img=3' },
        rating: 5,
        title: 'Un chef-d\'œuvre du septième art',
        content: 'C\'est sans aucun doute l\'un des meilleurs films que j\'ai vus ces dernières années. La mise en scène est brillante, les acteurs sont exceptionnels et l\'histoire est captivante du début à la fin. Une expérience cinématographique inoubliable.',
        language: 'fr',
        detectedLanguage: 'French',
        createdAt: new Date('2024-01-08'),
        helpful: 156,
        notHelpful: 8
      },
      {
        id: '4',
        userId: { id: 'u4', username: 'deutscher_fan', profilePhoto: 'https://i.pravatar.cc/150?img=4' },
        rating: 3,
        title: 'Gut, aber nicht großartig',
        content: 'Der Film hat seine Momente, aber insgesamt hat er mich nicht vollständig überzeugt. Die Handlung ist interessant, aber manchmal etwas verwirrend. Die Schauspieler sind gut, aber die Geschichte hätte mehr Tiefe haben können.',
        language: 'de',
        detectedLanguage: 'German',
        createdAt: new Date('2024-01-05'),
        helpful: 98,
        notHelpful: 34
      },
      {
        id: '5',
        userId: { id: 'u5', username: 'italiano_cinema', profilePhoto: 'https://i.pravatar.cc/150?img=5' },
        rating: 4,
        title: 'Un film straordinario',
        content: 'Questo film è davvero impressionante. La regia è eccellente e gli attori danno il meglio di sé. La storia è coinvolgente e ti tiene incollato allo schermo. Consiglio vivamente di vederlo al cinema per apprezzare appieno la qualità della produzione.',
        language: 'it',
        detectedLanguage: 'Italian',
        createdAt: new Date('2024-01-03'),
        helpful: 134,
        notHelpful: 19
      }
    ];
    setReviews(mockReviews);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: value
    });
  };

  const handleRatingChange = (rating) => {
    setNewReview({
      ...newReview,
      rating
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!newReview.title.trim() || !newReview.content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`TU_API_URL/movies/${movieId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        setNewReview({ rating: 5, title: '', content: '' });
        fetchReviews();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const translateReview = async (reviewId, targetLanguage) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Verificar si ya está traducida
    const translationKey = `${reviewId}_${targetLanguage}`;
    if (translatedReviews[translationKey]) {
      return; // Ya traducida
    }

    // Marcar como traduciendo
    setTranslatingReviews(prev => ({ ...prev, [reviewId]: true }));

    try {
      const response = await fetch('TU_API_URL/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          reviewId: reviewId,
          title: review.title,
          content: review.content,
          sourceLanguage: review.language,
          targetLanguage: targetLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setTranslatedReviews(prev => ({
          ...prev,
          [translationKey]: {
            title: data.translatedTitle,
            content: data.translatedContent,
            targetLanguage: targetLanguage
          }
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      // Simulación para desarrollo
      simulateTranslation(reviewId, targetLanguage, review);
    } finally {
      setTranslatingReviews(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const simulateTranslation = (reviewId, targetLanguage, review) => {
    setTimeout(() => {
      const translationKey = `${reviewId}_${targetLanguage}`;
      
      // Traducciones simuladas
      const mockTranslations = {
        'es': {
          title: 'Traducción al español',
          content: 'Este es un contenido traducido automáticamente al español desde el idioma original.'
        },
        'en': {
          title: 'English Translation',
          content: 'This is automatically translated content to English from the original language.'
        },
        'fr': {
          title: 'Traduction française',
          content: 'Ceci est un contenu traduit automatiquement en français depuis la langue d\'origine.'
        },
        'de': {
          title: 'Deutsche Übersetzung',
          content: 'Dies ist automatisch übersetzter Inhalt auf Deutsch aus der Originalsprache.'
        },
        'it': {
          title: 'Traduzione italiana',
          content: 'Questo è un contenuto tradotto automaticamente in italiano dalla lingua originale.'
        }
      };

      setTranslatedReviews(prev => ({
        ...prev,
        [translationKey]: mockTranslations[targetLanguage] || mockTranslations['en']
      }));
      
      setTranslatingReviews(prev => ({ ...prev, [reviewId]: false }));
    }, 1500);
  };

  const showOriginalReview = (reviewId, targetLanguage) => {
    const translationKey = `${reviewId}_${targetLanguage}`;
    setTranslatedReviews(prev => {
      const newState = { ...prev };
      delete newState[translationKey];
      return newState;
    });
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(i)}
        >
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    
    return d.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getLanguageInfo = (langCode) => {
    return supportedLanguages.find(l => l.code === langCode) || 
           { code: langCode, name: langCode.toUpperCase(), flag: '🌐' };
  };

  return (
    <>
    <Navbar currentPage="Reseñas Película" />
    <div className="movie-reviews-container">
      <div className="reviews-header">
        <h2>Reseñas de Usuarios</h2>
        <div className="reviews-stats">
          <div className="total-reviews">
            {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="reviews-controls">
        <div className="sort-controls">
          <label>Ordenar por:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="highest">Mejor valoradas</option>
            <option value="lowest">Menor valoradas</option>
            <option value="helpful">Más útiles</option>
          </select>
        </div>

        <div className="filter-controls">
          <label>Filtrar por estrellas:</label>
          <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
            <option value="all">Todas</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </div>
      </div>

      {/* Formulario de nueva reseña */}
      <div className="new-review-section">
        <h3>Escribe tu reseña</h3>
        <form onSubmit={handleSubmitReview} className="review-form">
          <div className="form-group">
            <label>Tu calificación:</label>
            <div className="rating-input">
              {renderStars(newReview.rating, true, handleRatingChange)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="review-title">Título de tu reseña</label>
            <input
              type="text"
              id="review-title"
              name="title"
              value={newReview.title}
              onChange={handleInputChange}
              placeholder="Resumen de tu opinión"
              maxLength="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="review-content">Tu reseña</label>
            <textarea
              id="review-content"
              name="content"
              value={newReview.content}
              onChange={handleInputChange}
              placeholder="Comparte tu experiencia con esta película..."
              rows="6"
              maxLength="2000"
              required
            />
            <div className="char-count">
              {newReview.content.length}/2000 caracteres
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-review-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
          </button>
        </form>
      </div>

      {/* Lista de reseñas */}
      <div className="reviews-list">
        {isLoading ? (
          <div className="loading-reviews">
            <div className="spinner-large"></div>
            <p>Cargando reseñas...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <span className="no-reviews-icon">📝</span>
            <h3>No hay reseñas todavía</h3>
            <p>Sé el primero en compartir tu opinión sobre esta película</p>
          </div>
        ) : (
          reviews.map((review) => {
            const translationKey = `${review.id}_`;
            const currentTranslation = Object.keys(translatedReviews)
              .find(key => key.startsWith(`${review.id}_`));
            
            const isTranslated = !!currentTranslation;
            const translatedData = isTranslated ? translatedReviews[currentTranslation] : null;
            const targetLang = isTranslated ? currentTranslation.split('_')[1] : null;

            return (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img 
                      src={review.userId.profilePhoto} 
                      alt={review.userId.username}
                      className="reviewer-avatar"
                    />
                    <div className="reviewer-details">
                      <span className="reviewer-name">{review.userId.username}</span>
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <div className="review-content-section">
                  {/* Indicador de idioma original */}
                  <div className="language-indicator">
                    <span className="language-flag">
                      {getLanguageInfo(review.language).flag}
                    </span>
                    <span className="language-name">
                      {getLanguageInfo(review.language).name}
                    </span>
                    {isTranslated && (
                      <span className="translated-badge">
                        Traducido automáticamente
                      </span>
                    )}
                  </div>

                  <h4 className="review-title">
                    {isTranslated ? translatedData.title : review.title}
                  </h4>
                  
                  <p className="review-text">
                    {isTranslated ? translatedData.content : review.content}
                  </p>

                  {/* Botones de traducción */}
                  <div className="translation-controls">
                    {!isTranslated ? (
                      <>
                        <span className="translate-label">Traducir a:</span>
                        <div className="language-buttons">
                          {supportedLanguages
                            .filter(lang => lang.code !== review.language)
                            .map(lang => (
                              <button
                                key={lang.code}
                                className="translate-btn"
                                onClick={() => translateReview(review.id, lang.code)}
                                disabled={translatingReviews[review.id]}
                              >
                                {translatingReviews[review.id] ? (
                                  <span className="spinner-small"></span>
                                ) : (
                                  <>
                                    <span className="lang-flag">{lang.flag}</span>
                                    <span className="lang-name">{lang.name}</span>
                                  </>
                                )}
                              </button>
                            ))}
                        </div>
                      </>
                    ) : (
                      <button
                        className="show-original-btn"
                        onClick={() => showOriginalReview(review.id, targetLang)}
                      >
                        <span>↩️</span>
                        Ver original en {getLanguageInfo(review.language).name}
                      </button>
                    )}
                  </div>
                </div>

                <div className="review-footer">
                  <div className="review-helpful">
                    <button className="helpful-btn">
                      <span>👍</span>
                      <span>Útil ({review.helpful})</span>
                    </button>
                    <button className="not-helpful-btn">
                      <span>👎</span>
                      <span>({review.notHelpful})</span>
                    </button>
                  </div>

                  <button className="report-btn">
                    <span>⚠️</span>
                    <span>Reportar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
};

export default resenasMovie;