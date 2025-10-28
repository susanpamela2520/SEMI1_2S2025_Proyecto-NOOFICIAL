import { useState, useEffect } from 'react';
import './traductorResenas.css';

const TraductorResenas = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  
  // Estados para traducción
  const [translationStates, setTranslationStates] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({});

  // URL base de la API desde variables de entorno
  const API_BASE_URL = import.meta.env.VITE_AWS_API_BASE_URL || 
                       'https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE';
  
  // URL de tu backend para obtener reseñas
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'TU_API_URL';

  // Idiomas disponibles para traducción
  const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'Inglés', flag: '🇬🇧' },
    { code: 'fr', name: 'Francés', flag: '🇫🇷' },
    { code: 'de', name: 'Alemán', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  useEffect(() => {
    fetchReviews();
  }, [movieId, sortBy]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/movies/${movieId}/reviews?sort=${sortBy}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        
        // Inicializar estados de traducción
        const initialStates = {};
        const initialLanguages = {};
        data.reviews.forEach(review => {
          initialStates[review.id] = {
            isTranslating: false,
            translatedText: null,
            translatedTitle: null,
            error: null,
            currentLanguage: review.language // idioma actual/original
          };
          // Seleccionar un idioma diferente al original por defecto
          const defaultTargetLang = review.language === 'es' ? 'en' : 'es';
          initialLanguages[review.id] = defaultTargetLang;
        });
        setTranslationStates(initialStates);
        setSelectedLanguages(initialLanguages);
      }
    } catch (error) {
      console.error('Error:', error);
      loadMockReviews();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockReviews = () => {
    const mockReviews = [
      {
        id: '1',
        userId: { id: 'u1', username: 'cinephile123', profilePhoto: 'https://i.pravatar.cc/150?img=1' },
        rating: 5,
        title: 'Una obra maestra del cine',
        content: 'Esta película es simplemente extraordinaria. La dirección es impecable, las actuaciones son memorables y la historia te mantiene al borde de tu asiento. Cada escena está cuidadosamente elaborada y el resultado final es una experiencia cinematográfica inolvidable que recomiendo a todos los amantes del buen cine.',
        language: 'es',
        detectedLanguage: 'Spanish',
        createdAt: new Date('2024-01-15'),
        helpful: 245,
        wordCount: 52
      },
      {
        id: '2',
        userId: { id: 'u2', username: 'moviebuff', profilePhoto: 'https://i.pravatar.cc/150?img=2' },
        rating: 4,
        title: 'Great visuals but slow pacing',
        content: 'The cinematography is absolutely stunning and the visual effects are top-notch. The performances from the cast are excellent, particularly the lead actor who brings depth to the character. However, I found the pacing to be quite slow in the middle section, which might test the patience of some viewers. Overall, it\'s a good film that could have been great with some tighter editing and a more focused narrative structure.',
        language: 'en',
        detectedLanguage: 'English',
        createdAt: new Date('2024-01-10'),
        helpful: 189,
        wordCount: 78
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
        wordCount: 45
      }
    ];

    setReviews(mockReviews);
    
    const initialStates = {};
    const initialLanguages = {};
    mockReviews.forEach(review => {
      initialStates[review.id] = {
        isTranslating: false,
        translatedText: null,
        translatedTitle: null,
        error: null,
        currentLanguage: review.language
      };
      const defaultTargetLang = review.language === 'es' ? 'en' : 'es';
      initialLanguages[review.id] = defaultTargetLang;
    });
    setTranslationStates(initialStates);
    setSelectedLanguages(initialLanguages);
  };

  // Función para traducir una reseña usando AWS Translate
  const translateReview = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const targetLanguage = selectedLanguages[reviewId];
    const currentState = translationStates[reviewId];
    
    // Si ya está en el idioma objetivo, no traducir
    if (currentState.currentLanguage === targetLanguage) {
      setTranslationStates(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          error: 'La reseña ya está en el idioma seleccionado'
        }
      }));
      return;
    }

    setTranslationStates(prev => ({
      ...prev,
      [reviewId]: { 
        ...prev[reviewId], 
        isTranslating: true, 
        error: null 
      }
    }));

    try {
      // Traducir título
      const titleResponse = await fetch(`${API_BASE_URL}/traducir-resena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texto: review.title,
          origen: currentState.currentLanguage,
          destino: targetLanguage
        })
      });

      if (!titleResponse.ok) {
        throw new Error('Error al traducir el título');
      }

      const titleData = await titleResponse.json();

      // Traducir contenido
      const contentResponse = await fetch(`${API_BASE_URL}/traducir-resena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texto: review.content,
          origen: currentState.currentLanguage,
          destino: targetLanguage
        })
      });

      if (!contentResponse.ok) {
        throw new Error('Error al traducir el contenido');
      }

      const contentData = await contentResponse.json();

      // Actualizar estado con traducción
      setTranslationStates(prev => ({
        ...prev,
        [reviewId]: {
          isTranslating: false,
          translatedTitle: titleData.traduccion,
          translatedText: contentData.traduccion,
          error: null,
          currentLanguage: targetLanguage
        }
      }));

    } catch (error) {
      console.error('Error traduciendo reseña:', error);
      setTranslationStates(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          error: 'No se pudo traducir la reseña. Intenta de nuevo.',
          isTranslating: false
        }
      }));
    }
  };

  // Función para volver al idioma original
  const resetTranslation = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    setTranslationStates(prev => ({
      ...prev,
      [reviewId]: {
        isTranslating: false,
        translatedText: null,
        translatedTitle: null,
        error: null,
        currentLanguage: review.language
      }
    }));
  };

  const handleLanguageChange = (reviewId, languageCode) => {
    setSelectedLanguages(prev => ({
      ...prev,
      [reviewId]: languageCode
    }));
  };

  const getLanguageFlag = (language) => {
    const flags = {
      'es': '🇪🇸',
      'en': '🇬🇧',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹'
    };
    return flags[language] || '🌐';
  };

  const getLanguageName = (language) => {
    const names = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano'
    };
    return names[language] || language;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="reviews-with-translation-container">
      {/* Header */}
      <div className="reviews-header">
        <h2>🌍 Reseñas con Traducción</h2>
        <p className="header-subtitle">
          Traduce las reseñas a tu idioma preferido con AWS Translate
        </p>
      </div>

      {/* Controles y filtros */}
      <div className="reviews-controls">
        <div className="sort-controls">
          <label htmlFor="sort-select">Ordenar por:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Más recientes</option>
            <option value="rating">Mejor valoradas</option>
            <option value="helpful">Más útiles</option>
          </select>
        </div>

        <div className="translation-info">
          <div className="info-badge">
            <span className="badge-icon">🌐</span>
            <span>AWS Translate</span>
          </div>
          <div className="info-badge">
            <span className="badge-icon">📝</span>
            <span>{reviews.length} reseñas</span>
          </div>
        </div>
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
            <span className="no-reviews-icon">📭</span>
            <h3>No hay reseñas disponibles</h3>
            <p>Sé el primero en dejar una reseña para esta película</p>
          </div>
        ) : (
          reviews.map(review => {
            const translationState = translationStates[review.id] || {};
            const selectedLanguage = selectedLanguages[review.id];
            const isTranslated = translationState.translatedText !== null;
            
            // Determinar qué texto mostrar
            const displayTitle = isTranslated 
              ? translationState.translatedTitle 
              : review.title;
            const displayContent = isTranslated 
              ? translationState.translatedText 
              : review.content;
            const displayLanguage = translationState.currentLanguage || review.language;

            return (
              <div key={review.id} className="review-card-translation">
                {/* Header de la reseña */}
                <div className="review-header">
                  <div className="reviewer-info">
                    <img
                      src={review.userId.profilePhoto}
                      alt={review.userId.username}
                      className="reviewer-avatar"
                    />
                    <div className="reviewer-details">
                      <span className="reviewer-name">{review.userId.username}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* Contenido de la reseña */}
                <div className="review-content">
                  <div className="language-badge">
                    <span className="flag">{getLanguageFlag(displayLanguage)}</span>
                    <span className="lang-name">{getLanguageName(displayLanguage)}</span>
                    {isTranslated && (
                      <span className="translated-badge">
                        <span className="badge-icon">✓</span>
                        <span>Traducido</span>
                      </span>
                    )}
                    <span className="word-count">• {review.wordCount} palabras</span>
                  </div>
                  <h4 className="review-title">{displayTitle}</h4>
                  <p className="review-text">{displayContent}</p>
                </div>

                {/* Controles de traducción */}
                <div className="translation-controls-section">
                  <div className="translation-controls">
                    <div className="language-selector">
                      <label htmlFor={`lang-select-${review.id}`}>
                        <span className="control-icon">🌐</span>
                        <span>Traducir a:</span>
                      </label>
                      <select
                        id={`lang-select-${review.id}`}
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(review.id, e.target.value)}
                        disabled={translationState.isTranslating}
                        className="language-select"
                      >
                        {availableLanguages.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="translate-btn"
                      onClick={() => translateReview(review.id)}
                      disabled={translationState.isTranslating}
                      title="Traducir reseña"
                    >
                      {translationState.isTranslating ? (
                        <>
                          <div className="spinner-small"></div>
                          <span>Traduciendo...</span>
                        </>
                      ) : (
                        <>
                          <span className="icon">🔄</span>
                          <span>Traducir</span>
                        </>
                      )}
                    </button>

                    {isTranslated && (
                      <button
                        className="reset-btn"
                        onClick={() => resetTranslation(review.id)}
                        title="Ver original"
                      >
                        <span className="icon">↩️</span>
                        <span>Ver original</span>
                      </button>
                    )}
                  </div>

                  {/* Error message */}
                  {translationState.error && (
                    <div className="translation-error">
                      <span className="error-icon">⚠️</span>
                      <span>{translationState.error}</span>
                    </div>
                  )}
                </div>

                {/* Footer de la reseña */}
                <div className="review-footer">
                  <div className="review-helpful">
                    <button className="helpful-btn">
                      <span>👍</span>
                      <span>Útil ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Información sobre la funcionalidad */}
      <div className="info-section">
        <div className="info-card">
          <h3>🌍 Acerca de la traducción de reseñas</h3>
          <div className="info-content">
            <p>
              Utilizamos <strong>AWS Translate</strong> para traducir las reseñas 
              a tu idioma preferido. Este servicio utiliza inteligencia artificial 
              para proporcionar traducciones precisas y naturales.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🌍</span>
                <span>5 idiomas disponibles</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Traducción instantánea</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Alta precisión</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">♿</span>
                <span>Accesible para todos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraductorResenas;