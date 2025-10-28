import { useState, useEffect, useRef } from 'react';
import './lecturaResenas.css';
import Navbar from './Navbar.jsx';

const lecturaResenas = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  
  // Estados para Text-to-Speech
  const [playingReviewId, setPlayingReviewId] = useState(null);
  const [audioStates, setAudioStates] = useState({});
  const [speechSettings, setSpeechSettings] = useState({
    rate: 1.0, // Velocidad normal
    volume: 1.0
  });
  const [showSettingsFor, setShowSettingsFor] = useState(null);

  // Referencias de audio
  const audioRefs = useRef({});

  // URL base de la API desde variables de entorno
  const API_BASE_URL = import.meta.env.VITE_AWS_API_BASE_URL || 
                       'https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE';
  
  // URL de tu backend para obtener reseñas
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'TU_API_URL';

  // Voces disponibles usando AWS Polly (español)
  const voicesByLanguage = {
    'es': [
      { name: 'Mia', displayName: 'Mia (Neural)', gender: 'Female' },
      { name: 'Andres', displayName: 'Andrés (Neural)', gender: 'Male' },
      { name: 'Lupe', displayName: 'Lupe (Neural)', gender: 'Female' },
      { name: 'Pedro', displayName: 'Pedro (Neural)', gender: 'Male' }
    ],
    'en': [
      { name: 'Joanna', displayName: 'Joanna (Neural)', gender: 'Female' },
      { name: 'Matthew', displayName: 'Matthew (Neural)', gender: 'Male' },
      { name: 'Salli', displayName: 'Salli (Neural)', gender: 'Female' },
      { name: 'Joey', displayName: 'Joey (Neural)', gender: 'Male' }
    ],
    'fr': [
      { name: 'Lea', displayName: 'Léa (Neural)', gender: 'Female' },
      { name: 'Mathieu', displayName: 'Mathieu (Neural)', gender: 'Male' }
    ],
    'de': [
      { name: 'Vicki', displayName: 'Vicki (Neural)', gender: 'Female' },
      { name: 'Hans', displayName: 'Hans (Neural)', gender: 'Male' }
    ],
    'it': [
      { name: 'Bianca', displayName: 'Bianca (Neural)', gender: 'Female' },
      { name: 'Adriano', displayName: 'Adriano (Neural)', gender: 'Male' }
    ]
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId, sortBy]);

  useEffect(() => {
    // Cleanup de audios al desmontar
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

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
        
        // Inicializar estados de audio
        const initialStates = {};
        data.reviews.forEach(review => {
          initialStates[review.id] = {
            isPlaying: false,
            isPaused: false,
            currentTime: 0,
            duration: 0,
            isLoading: false,
            error: null,
            selectedVoice: voicesByLanguage[review.language]?.[0]?.name || 'Mia',
            audioUrl: null
          };
        });
        setAudioStates(initialStates);
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
    mockReviews.forEach(review => {
      initialStates[review.id] = {
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        duration: 0,
        isLoading: false,
        error: null,
        selectedVoice: voicesByLanguage[review.language]?.[0]?.name || 'Mia',
        audioUrl: null
      };
    });
    setAudioStates(initialStates);
  };

  // Función para generar audio usando AWS Polly
  const generateSpeech = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const currentState = audioStates[reviewId];
    
    // Si ya existe el audio y está cargado, no regenerar
    if (currentState.audioUrl && audioRefs.current[reviewId]) {
      return;
    }

    setAudioStates(prev => ({
      ...prev,
      [reviewId]: { ...prev[reviewId], isLoading: true, error: null }
    }));

    try {
      // Preparar el texto completo (título + contenido)
      const fullText = `${review.title}. ${review.content}`;

      // Llamar al servicio de AWS Polly según la documentación
      const response = await fetch(`${API_BASE_URL}/generar-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texto: fullText,
          voz: currentState.selectedVoice || 'Mia'
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar audio');
      }

      const data = await response.json();

      // Crear URL de audio desde Base64
      const audioSrc = `data:audio/${data.formato || 'mp3'};base64,${data.audioBase64}`;
      
      // Crear elemento de audio
      const audio = new Audio(audioSrc);
      
      // Aplicar configuraciones
      audio.playbackRate = speechSettings.rate;
      audio.volume = speechSettings.volume;

      // Event listeners
      audio.addEventListener('loadedmetadata', () => {
        setAudioStates(prev => ({
          ...prev,
          [reviewId]: {
            ...prev[reviewId],
            duration: audio.duration,
            audioUrl: audioSrc,
            isLoading: false
          }
        }));
      });

      audio.addEventListener('timeupdate', () => {
        setAudioStates(prev => ({
          ...prev,
          [reviewId]: {
            ...prev[reviewId],
            currentTime: audio.currentTime
          }
        }));
      });

      audio.addEventListener('ended', () => {
        setAudioStates(prev => ({
          ...prev,
          [reviewId]: {
            ...prev[reviewId],
            isPlaying: false,
            isPaused: false,
            currentTime: 0
          }
        }));
        setPlayingReviewId(null);
      });

      audio.addEventListener('error', (e) => {
        console.error('Error en audio:', e);
        setAudioStates(prev => ({
          ...prev,
          [reviewId]: {
            ...prev[reviewId],
            error: 'Error al cargar el audio',
            isLoading: false
          }
        }));
      });

      audioRefs.current[reviewId] = audio;

    } catch (error) {
      console.error('Error generando audio:', error);
      setAudioStates(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          error: 'No se pudo generar el audio. Intenta de nuevo.',
          isLoading: false
        }
      }));
    }
  };

  const handlePlayPause = async (reviewId) => {
    const currentState = audioStates[reviewId];
    const audio = audioRefs.current[reviewId];

    // Si no existe el audio, generarlo
    if (!audio || !currentState.audioUrl) {
      await generateSpeech(reviewId);
      // Después de generar, intentar reproducir
      setTimeout(() => {
        const newAudio = audioRefs.current[reviewId];
        if (newAudio) {
          newAudio.play();
          setAudioStates(prev => ({
            ...prev,
            [reviewId]: { ...prev[reviewId], isPlaying: true, isPaused: false }
          }));
          setPlayingReviewId(reviewId);
        }
      }, 100);
      return;
    }

    // Pausar cualquier otro audio que esté reproduciéndose
    if (playingReviewId && playingReviewId !== reviewId) {
      const otherAudio = audioRefs.current[playingReviewId];
      if (otherAudio) {
        otherAudio.pause();
        setAudioStates(prev => ({
          ...prev,
          [playingReviewId]: {
            ...prev[playingReviewId],
            isPlaying: false,
            isPaused: true
          }
        }));
      }
    }

    // Play o Pause
    if (currentState.isPlaying) {
      audio.pause();
      setAudioStates(prev => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], isPlaying: false, isPaused: true }
      }));
    } else {
      audio.play();
      setAudioStates(prev => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], isPlaying: true, isPaused: false }
      }));
      setPlayingReviewId(reviewId);
    }
  };

  const handleStop = (reviewId) => {
    const audio = audioRefs.current[reviewId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setAudioStates(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          isPlaying: false,
          isPaused: false,
          currentTime: 0
        }
      }));
      if (playingReviewId === reviewId) {
        setPlayingReviewId(null);
      }
    }
  };

  const handleSeek = (reviewId, time) => {
    const audio = audioRefs.current[reviewId];
    if (audio) {
      audio.currentTime = time;
      setAudioStates(prev => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], currentTime: time }
      }));
    }
  };

  const handleSpeedChange = (reviewId, rate) => {
    setSpeechSettings(prev => ({ ...prev, rate }));
    const audio = audioRefs.current[reviewId];
    if (audio) {
      audio.playbackRate = rate;
    }
  };

  const handleVoiceChange = async (reviewId, voiceName) => {
    setAudioStates(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        selectedVoice: voiceName,
        audioUrl: null // Resetear para regenerar con nueva voz
      }
    }));

    // Limpiar audio actual
    const audio = audioRefs.current[reviewId];
    if (audio) {
      audio.pause();
      audio.src = '';
      delete audioRefs.current[reviewId];
    }

    // Regenerar con nueva voz
    await generateSpeech(reviewId);
  };

  const handleDownloadAudio = (reviewId) => {
    const currentState = audioStates[reviewId];
    const review = reviews.find(r => r.id === reviewId);
    
    if (!currentState.audioUrl || !review) return;

    const link = document.createElement('a');
    link.href = currentState.audioUrl;
    link.download = `review-${review.userId.username}-${reviewId}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <>
      <Navbar currentPage="Lectura de Reseñas" />
    <div className="reviews-with-speech-container">
      {/* Header */}
      <div className="reviews-header">
        <h2>🎬 Reseñas con Lectura de Voz</h2>
        <p className="header-subtitle">
          Escucha las reseñas en su idioma original con voces naturales
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

        <div className="audio-info">
          <div className="info-badge">
            <span className="badge-icon">🎙️</span>
            <span>AWS Polly TTS</span>
          </div>
          <div className="info-badge">
            <span className="badge-icon">🌍</span>
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
            const audioState = audioStates[review.id] || {};
            const availableVoices = voicesByLanguage[review.language] || voicesByLanguage['es'];
            const progress = audioState.duration > 0 
              ? (audioState.currentTime / audioState.duration) * 100 
              : 0;

            return (
              <div key={review.id} className="review-card-speech">
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
                    <span className="flag">{getLanguageFlag(review.language)}</span>
                    <span className="lang-name">{getLanguageName(review.language)}</span>
                    <span className="word-count">• {review.wordCount} palabras</span>
                  </div>
                  <h4 className="review-title">{review.title}</h4>
                  <p className="review-text">{review.content}</p>
                </div>

                {/* Controles de audio */}
                <div className="audio-controls-section">
                  <div className="audio-player">
                    {/* Botones principales */}
                    <div className="player-buttons">
                      <button
                        className={`play-pause-btn ${audioState.isPlaying ? 'playing' : ''}`}
                        onClick={() => handlePlayPause(review.id)}
                        disabled={audioState.isLoading}
                        title={audioState.isPlaying ? 'Pausar' : 'Reproducir'}
                      >
                        {audioState.isLoading ? (
                          <div className="spinner-small"></div>
                        ) : audioState.isPlaying ? (
                          <span className="icon">⏸️</span>
                        ) : (
                          <span className="icon">▶️</span>
                        )}
                      </button>

                      <button
                        className="stop-btn"
                        onClick={() => handleStop(review.id)}
                        disabled={!audioState.audioUrl || audioState.isLoading}
                        title="Detener"
                      >
                        <span className="icon">⏹️</span>
                      </button>

                      {/* Tiempo */}
                      <div className="time-display">
                        <span className="current-time">
                          {formatTime(audioState.currentTime)}
                        </span>
                        <span className="time-separator">/</span>
                        <span className="total-time">
                          {formatTime(audioState.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="progress-section">
                      <input
                        type="range"
                        className="progress-bar"
                        min="0"
                        max={audioState.duration || 100}
                        value={audioState.currentTime || 0}
                        onChange={(e) => handleSeek(review.id, parseFloat(e.target.value))}
                        disabled={!audioState.audioUrl}
                      />
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Controles adicionales */}
                    <div className="additional-controls">
                      {/* Control de velocidad */}
                      <div className="speed-control">
                        <label>
                          <span className="control-icon">⚡</span>
                          <span>Velocidad:</span>
                        </label>
                        <select
                          value={speechSettings.rate}
                          onChange={(e) => handleSpeedChange(review.id, parseFloat(e.target.value))}
                        >
                          <option value="0.5">0.5x</option>
                          <option value="0.75">0.75x</option>
                          <option value="1.0">1.0x (Normal)</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2.0">2.0x</option>
                        </select>
                      </div>

                      {/* Selector de voz */}
                      <div className="voice-selector">
                        <label>
                          <span className="control-icon">🎤</span>
                          <span>Voz:</span>
                        </label>
                        <select
                          value={audioState.selectedVoice || ''}
                          onChange={(e) => handleVoiceChange(review.id, e.target.value)}
                          disabled={audioState.isPlaying}
                        >
                          {availableVoices.map(voice => (
                            <option key={voice.name} value={voice.name}>
                              {voice.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Botón de descarga */}
                      <button
                        className="download-audio-btn"
                        onClick={() => handleDownloadAudio(review.id)}
                        disabled={!audioState.audioUrl || audioState.isLoading}
                        title="Descargar audio"
                      >
                        <span className="icon">💾</span>
                        <span>Descargar</span>
                      </button>

                      {/* Botón de configuración */}
                      <button
                        className="settings-btn"
                        onClick={() => setShowSettingsFor(
                          showSettingsFor === review.id ? null : review.id
                        )}
                        title="Configuración"
                      >
                        <span className="icon">⚙️</span>
                      </button>
                    </div>

                    {/* Error message */}
                    {audioState.error && (
                      <div className="audio-error">
                        <span className="error-icon">⚠️</span>
                        <span>{audioState.error}</span>
                      </div>
                    )}
                  </div>

                  {/* Panel de configuración expandible */}
                  {showSettingsFor === review.id && (
                    <div className="settings-panel">
                      <h5>⚙️ Configuración de Audio</h5>
                      
                      <div className="setting-item">
                        <label>Voces disponibles:</label>
                        <div className="voice-options">
                          {availableVoices.map(voice => (
                            <button
                              key={voice.name}
                              className={`voice-option ${
                                audioState.selectedVoice === voice.name ? 'active' : ''
                              }`}
                              onClick={() => handleVoiceChange(review.id, voice.name)}
                              disabled={audioState.isPlaying}
                            >
                              <span className="voice-icon">
                                {voice.gender === 'Female' ? '👩' : '👨'}
                              </span>
                              <span>{voice.displayName}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="setting-item">
                        <label>Ajustes de reproducción:</label>
                        <div className="playback-settings">
                          <div className="setting-row">
                            <span>Velocidad: {speechSettings.rate}x</span>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.25"
                              value={speechSettings.rate}
                              onChange={(e) => handleSpeedChange(review.id, parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
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
          <h3>🎙️ Acerca de la lectura de reseñas</h3>
          <div className="info-content">
            <p>
              Utilizamos <strong>AWS Polly</strong> para convertir las reseñas 
              en audio de alta calidad. Cada idioma cuenta con voces naturales que hacen 
              la experiencia más accesible y agradable.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🌍</span>
                <span>Múltiples voces por idioma</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Ajuste de velocidad 0.5x - 2.0x</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💾</span>
                <span>Descarga el audio generado</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">♿</span>
                <span>Mejora la accesibilidad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default lecturaResenas;