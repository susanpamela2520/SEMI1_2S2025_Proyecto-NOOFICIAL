import { useState } from 'react';
import './recomendacionEmocional.css';

const recomendacionEmocional = () => {
  const [emotionalText, setEmotionalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Estados emocionales con sus iconos
  const emotionIcons = {
    POSITIVE: '😊',
    NEGATIVE: '😢',
    NEUTRAL: '😐',
    MIXED: '🤔'
  };

  const emotionLabels = {
    POSITIVE: 'Positivo',
    NEGATIVE: 'Negativo',
    NEUTRAL: 'Neutral',
    MIXED: 'Mixto'
  };

  // Ejemplos de frases
  const examplePhrases = [
    'Me hizo llorar de emoción',
    'Me dio mucha risa todo el tiempo',
    'Me mantuvo en suspenso hasta el final',
    'Me sentí muy feliz y motivado',
    'Me asustó mucho pero me encantó',
    'Me hizo reflexionar sobre la vida'
  ];

  const handleTextChange = (e) => {
    setEmotionalText(e.target.value);
    if (error) setError('');
  };

  const handleExampleClick = (phrase) => {
    setEmotionalText(phrase);
    if (error) setError('');
  };

  const analyzeEmotion = async () => {
    if (!emotionalText.trim()) {
      setError('Por favor, describe cómo te hizo sentir la película');
      return;
    }

    if (emotionalText.trim().length < 10) {
      setError('Por favor, escribe una descripción más detallada (mínimo 10 caracteres)');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);
    setRecommendations([]);

    try {
      // Llamada al backend que usa Amazon Comprehend
      const response = await fetch('TU_API_URL/recommendations/emotional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          emotionalText: emotionalText,
          movieId: selectedMovie?.id || null
        })
      });

      if (!response.ok) {
        throw new Error('Error al analizar el sentimiento');
      }

      const data = await response.json();
      
      setAnalysisResult(data.analysis);
      setRecommendations(data.recommendations);

    } catch (error) {
      console.error('Error:', error);
      // Datos de ejemplo para desarrollo
      simulateAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulación de análisis para desarrollo
  const simulateAnalysis = () => {
    setTimeout(() => {
      const mockAnalysis = {
        sentiment: ['llorar', 'triste', 'melanc'].some(word => 
          emotionalText.toLowerCase().includes(word)
        ) ? 'NEGATIVE' : ['risa', 'feliz', 'alegre'].some(word => 
          emotionalText.toLowerCase().includes(word)
        ) ? 'POSITIVE' : ['suspenso', 'miedo', 'tensión'].some(word => 
          emotionalText.toLowerCase().includes(word)
        ) ? 'MIXED' : 'NEUTRAL',
        sentimentScore: {
          Positive: 0.7,
          Negative: 0.1,
          Neutral: 0.15,
          Mixed: 0.05
        },
        detectedEmotions: [
          { emotion: 'JOY', score: 0.75 },
          { emotion: 'SADNESS', score: 0.15 },
          { emotion: 'SURPRISE', score: 0.10 }
        ],
        keyPhrases: [
          'llorar de emoción',
          'muy emotiva',
          'me conmovió'
        ]
      };

      const mockRecommendations = [
        {
          id: 1,
          title: 'En Busca de la Felicidad',
          posterUrl: 'https://picsum.photos/300/450?random=1',
          year: 2006,
          genres: ['Drama', 'Biografía'],
          averageRating: 4.7,
          reviewCount: 3456,
          emotionalMatch: 95,
          reason: 'Historia inspiradora que genera emociones similares de superación y lágrimas de felicidad',
          similarEmotions: ['JOY', 'SADNESS', 'INSPIRATION']
        },
        {
          id: 2,
          title: 'La Vida es Bella',
          posterUrl: 'https://picsum.photos/300/450?random=2',
          year: 1997,
          genres: ['Drama', 'Comedia'],
          averageRating: 4.8,
          reviewCount: 5234,
          emotionalMatch: 92,
          reason: 'Mezcla perfecta de tristeza y alegría que toca el corazón profundamente',
          similarEmotions: ['JOY', 'SADNESS', 'HOPE']
        },
        {
          id: 3,
          title: 'Up: Una Aventura de Altura',
          posterUrl: 'https://picsum.photos/300/450?random=3',
          year: 2009,
          genres: ['Animación', 'Aventura'],
          averageRating: 4.6,
          reviewCount: 4123,
          emotionalMatch: 90,
          reason: 'Película animada con momentos profundamente emotivos que generan lágrimas y sonrisas',
          similarEmotions: ['JOY', 'SADNESS', 'NOSTALGIA']
        },
        {
          id: 4,
          title: 'Intocable',
          posterUrl: 'https://picsum.photos/300/450?random=4',
          year: 2011,
          genres: ['Drama', 'Comedia'],
          averageRating: 4.7,
          reviewCount: 3890,
          emotionalMatch: 88,
          reason: 'Historia conmovedora de amistad que equilibra momentos de risa y emoción',
          similarEmotions: ['JOY', 'EMPATHY', 'WARMTH']
        },
        {
          id: 5,
          title: 'Coco',
          posterUrl: 'https://picsum.photos/300/450?random=5',
          year: 2017,
          genres: ['Animación', 'Familiar'],
          averageRating: 4.8,
          reviewCount: 5678,
          emotionalMatch: 87,
          reason: 'Celebración de la familia con momentos profundamente emotivos y alegres',
          similarEmotions: ['JOY', 'SADNESS', 'LOVE']
        }
      ];

      setAnalysisResult(mockAnalysis);
      setRecommendations(mockRecommendations);
      setIsAnalyzing(false);
    }, 2000);
  };

  const renderSentimentBar = () => {
    if (!analysisResult) return null;

    const scores = analysisResult.sentimentScore;
    return (
      <div className="sentiment-bars">
        <div className="sentiment-bar-item">
          <div className="sentiment-label">
            <span className="sentiment-icon">😊</span>
            <span>Positivo</span>
          </div>
          <div className="sentiment-bar">
            <div 
              className="sentiment-fill positive"
              style={{ width: `${scores.Positive * 100}%` }}
            />
          </div>
          <span className="sentiment-value">{(scores.Positive * 100).toFixed(0)}%</span>
        </div>

        <div className="sentiment-bar-item">
          <div className="sentiment-label">
            <span className="sentiment-icon">😢</span>
            <span>Negativo</span>
          </div>
          <div className="sentiment-bar">
            <div 
              className="sentiment-fill negative"
              style={{ width: `${scores.Negative * 100}%` }}
            />
          </div>
          <span className="sentiment-value">{(scores.Negative * 100).toFixed(0)}%</span>
        </div>

        <div className="sentiment-bar-item">
          <div className="sentiment-label">
            <span className="sentiment-icon">😐</span>
            <span>Neutral</span>
          </div>
          <div className="sentiment-bar">
            <div 
              className="sentiment-fill neutral"
              style={{ width: `${scores.Neutral * 100}%` }}
            />
          </div>
          <span className="sentiment-value">{(scores.Neutral * 100).toFixed(0)}%</span>
        </div>

        <div className="sentiment-bar-item">
          <div className="sentiment-label">
            <span className="sentiment-icon">🤔</span>
            <span>Mixto</span>
          </div>
          <div className="sentiment-bar">
            <div 
              className="sentiment-fill mixed"
              style={{ width: `${scores.Mixed * 100}%` }}
            />
          </div>
          <span className="sentiment-value">{(scores.Mixed * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  };

  const renderEmotions = () => {
    if (!analysisResult?.detectedEmotions) return null;

    const emotionEmojis = {
      JOY: '😄',
      SADNESS: '😢',
      ANGER: '😠',
      FEAR: '😨',
      SURPRISE: '😮',
      DISGUST: '🤢',
      LOVE: '❤️',
      EXCITEMENT: '🤩'
    };

    return (
      <div className="detected-emotions">
        <h4>Emociones detectadas:</h4>
        <div className="emotions-list">
          {analysisResult.detectedEmotions.map((emotion, index) => (
            <div key={index} className="emotion-tag">
              <span className="emotion-emoji">{emotionEmojis[emotion.emotion] || '💫'}</span>
              <span className="emotion-name">{emotion.emotion}</span>
              <span className="emotion-score">{(emotion.score * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKeyPhrases = () => {
    if (!analysisResult?.keyPhrases || analysisResult.keyPhrases.length === 0) return null;

    return (
      <div className="key-phrases">
        <h4>Frases clave identificadas:</h4>
        <div className="phrases-list">
          {analysisResult.keyPhrases.map((phrase, index) => (
            <span key={index} className="phrase-tag">
              "{phrase}"
            </span>
          ))}
        </div>
      </div>
    );
  };

  const handleReset = () => {
    setEmotionalText('');
    setAnalysisResult(null);
    setRecommendations([]);
    setError('');
  };

  return (
    <div className="emotional-recommendations-container">
      <div className="emotional-header">
        <h1>🎭 Recomendaciones por Estado Emocional</h1>
        <p>Cuéntanos cómo te hizo sentir una película y te recomendaremos películas similares</p>
      </div>

      <div className="emotional-input-section">
        <div className="input-card">
          <label htmlFor="emotional-text">
            ¿Cómo te hizo sentir esta película?
          </label>
          <textarea
            id="emotional-text"
            value={emotionalText}
            onChange={handleTextChange}
            placeholder="Ejemplo: Me hizo llorar de emoción, fue muy inspiradora y me dejó con una sonrisa..."
            rows="4"
            maxLength="500"
            disabled={isAnalyzing}
          />
          <div className="textarea-footer">
            <span className="char-count">
              {emotionalText.length}/500 caracteres
            </span>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="examples-section">
            <p className="examples-title">O prueba con estos ejemplos:</p>
            <div className="examples-grid">
              {examplePhrases.map((phrase, index) => (
                <button
                  key={index}
                  className="example-btn"
                  onClick={() => handleExampleClick(phrase)}
                  disabled={isAnalyzing}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="analyze-btn"
              onClick={analyzeEmotion}
              disabled={isAnalyzing || !emotionalText.trim()}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner"></span>
                  Analizando emociones...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Analizar y Recomendar
                </>
              )}
            </button>

            {(analysisResult || error) && (
              <button
                className="reset-btn"
                onClick={handleReset}
                disabled={isAnalyzing}
              >
                Nuevo análisis
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados del análisis */}
      {analysisResult && (
        <div className="analysis-results">
          <div className="analysis-card">
            <div className="analysis-header">
              <h3>📊 Análisis de Sentimiento</h3>
              <div className="primary-sentiment">
                <span className="sentiment-icon-large">
                  {emotionIcons[analysisResult.sentiment]}
                </span>
                <span className="sentiment-label-large">
                  {emotionLabels[analysisResult.sentiment]}
                </span>
              </div>
            </div>

            {renderSentimentBar()}
            {renderEmotions()}
            {renderKeyPhrases()}

            <div className="analysis-footer">
              <span className="powered-by">
                Powered by Amazon Comprehend
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <div className="recommendations-header">
            <h2>🎬 Películas Recomendadas para Ti</h2>
            <p>
              Basado en tu estado emocional, encontramos {recommendations.length} películas 
              que generan emociones similares
            </p>
          </div>

          <div className="recommendations-grid">
            {recommendations.map((movie) => (
              <div key={movie.id} className="recommendation-card">
                <div className="match-badge">
                  {movie.emotionalMatch}% Match
                </div>
                
                <div className="movie-poster">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    loading="lazy"
                  />
                </div>

                <div className="recommendation-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  
                  <div className="movie-meta">
                    <span className="movie-year">{movie.year}</span>
                    <span className="separator">•</span>
                    <span className="movie-genre">
                      {movie.genres.join(', ')}
                    </span>
                  </div>

                  <div className="movie-rating">
                    <span className="star-icon">⭐</span>
                    <span className="rating-value">{movie.averageRating}</span>
                    <span className="review-count">
                      ({movie.reviewCount} reseñas)
                    </span>
                  </div>

                  <div className="emotional-reason">
                    <span className="reason-icon">💡</span>
                    <p>{movie.reason}</p>
                  </div>

                  <div className="similar-emotions">
                    <span className="emotions-label">Emociones similares:</span>
                    <div className="emotions-tags">
                      {movie.similarEmotions.map((emotion, index) => (
                        <span key={index} className="emotion-chip">
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="view-movie-btn">
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="info-section">
        <div className="info-card">
          <h3>ℹ️ ¿Cómo funciona?</h3>
          <div className="info-steps">
            <div className="info-step">
              <span className="step-number">1</span>
              <p>Describes cómo te hizo sentir una película</p>
            </div>
            <div className="info-step">
              <span className="step-number">2</span>
              <p>Amazon Comprehend analiza tus emociones y sentimientos</p>
            </div>
            <div className="info-step">
              <span className="step-number">3</span>
              <p>Nuestro algoritmo busca películas que generan emociones similares</p>
            </div>
            <div className="info-step">
              <span className="step-number">4</span>
              <p>Recibes recomendaciones personalizadas con justificación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default recomendacionEmocional;