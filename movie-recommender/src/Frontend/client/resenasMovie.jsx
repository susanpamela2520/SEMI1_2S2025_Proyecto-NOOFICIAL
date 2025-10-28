import { useState, useEffect } from 'react';
import './resenasMovie.css';
import Navbar from './Navbar.jsx';
import { useLocation } from 'react-router-dom';

const resenasMovie = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');
  const location = useLocation();
  const {movieId} = location.state || {};
  
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
    loadMockReviews();
  }, [sortBy, filterRating]);

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
    
    // Aplicar filtros localmente
    let filteredReviews = [...mockReviews];
    
    // Filtrar por rating
    if (filterRating !== 'all') {
      filteredReviews = filteredReviews.filter(r => r.rating === parseInt(filterRating));
    }
    
    // Ordenar
    switch (sortBy) {
      case 'highest':
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filteredReviews.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'recent':
      default:
        filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    setReviews(filteredReviews);
    setIsLoading(false);
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
      alert('Por favor, completa todos los campos de la reseña');
      return;
    }

    if (!movieId) {
      alert('Error: No se encontró el ID de la película');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener el user_id desde localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        alert('Error: No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
        setIsSubmitting(false);
        return;
      }

      // Combinar título y contenido para el review_text
      const fullReviewText = `${newReview.title}. ${newReview.content}`;

      // Preparar el body según tu endpoint en users.js
      const requestBody = {
        user_id: parseInt(userId),
        movie_id: parseInt(movieId),
        rating: newReview.rating,
        review_text: fullReviewText,
        sentiment: null,
        emotion_ids: []
      };

      console.log('📤 Enviando reseña a /users/reviews:', requestBody);

      // LA RUTA CORRECTA ES /users/reviews
      const response = await fetch('http://localhost:7000/users/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('📥 Respuesta recibida:', data);

      if (response.ok && data.success) {
        alert('✅ Reseña publicada exitosamente');
        
        // Agregar la nueva reseña a la lista local
        const newReviewItem = {
          id: Date.now().toString(),
          userId: {
            id: userId,
            username: 'Tu usuario',
            profilePhoto: 'https://i.pravatar.cc/150?img=10'
          },
          rating: newReview.rating,
          title: newReview.title,
          content: newReview.content,
          language: 'es',
          detectedLanguage: 'Spanish',
          createdAt: new Date(),
          helpful: 0,
          notHelpful: 0
        };
        
        setReviews([newReviewItem, ...reviews]);
        
        // Limpiar el formulario
        setNewReview({ rating: 5, title: '', content: '' });
      } else {
        console.error('❌ Error en la respuesta:', data);
        alert(`Error al publicar reseña: ${data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error al enviar reseña:', error);
      alert('Error al conectar con el servidor. Verifica que el backend esté corriendo en el puerto 7000.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const translateReview = async (reviewId, targetLanguage) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const translationKey = `${reviewId}_${targetLanguage}`;
    if (translatedReviews[translationKey]) {
      return;
    }

    setTranslatingReviews(prev => ({ ...prev, [reviewId]: true }));

    setTimeout(() => {
      const mockTranslations = {
        en: {
          title: 'Translated Title',
          content: 'This is a simulated translation. In production, this would call your translation API endpoint.'
        },
        fr: {
          title: 'Titre Traduit',
          content: 'Ceci est une traduction simulée. En production, cela appellerait votre point de terminaison API de traduction.'
        },
        de: {
          title: 'Übersetzter Titel',
          content: 'Dies ist eine simulierte Übersetzung. In der Produktion würde dies Ihren Übersetzungs-API-Endpunkt aufrufen.'
        },
        it: {
          title: 'Titolo Tradotto',
          content: 'Questa è una traduzione simulata. In produzione, questo chiamerebbe il tuo endpoint API di traduzione.'
        },
        es: {
          title: review.title,
          content: review.content
        }
      };

      setTranslatedReviews(prev => ({
        ...prev,
        [translationKey]: mockTranslations[targetLanguage] || mockTranslations['en']
      }));

      setTranslatingReviews(prev => ({ ...prev, [reviewId]: false }));
    }, 1500);
  };

  const showOriginalReview = (reviewId, targetLang) => {
    const translationKey = `${reviewId}_${targetLang}`;
    setTranslatedReviews(prev => {
      const newTranslations = { ...prev };
      delete newTranslations[translationKey];
      return newTranslations;
    });
  };

  const getLanguageInfo = (code) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang || { code: 'unknown', name: 'Desconocido', flag: '🏳️' };
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
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return d.toLocaleDateString('es-ES');
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

  return (
    <>
    <Navbar />
    <div className="reviews-container">
      <div className="reviews-header">
        <h1 className="page-title">Reseñas de la Película</h1>
        <div className="movie-rating-summary">
          <div className="average-rating">
            <span className="rating-number">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : 'N/A'
              }
            </span>
            <div className="rating-stars">
              {reviews.length > 0 && renderStars(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
            </div>
            <span className="rating-count">{reviews.length} reseñas</span>
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