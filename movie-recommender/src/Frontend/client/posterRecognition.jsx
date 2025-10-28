import { useState, useRef } from 'react';
import './PosterRecognition.css';
import Navbar from './Navbar.jsx';

const PosterRecognition = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Estados para las acciones de película
  const [isAddingToWatched, setIsAddingToWatched] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no válido. Solo se permiten imágenes JPG y PNG.');
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    // Validar tamaño
    if (file.size > maxSizeInBytes) {
      setError(`El archivo es muy grande. El tamaño máximo es ${maxSizeInMB}MB.`);
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    // Archivo válido
    setError('');
    setSelectedImage(file);
    setRecognitionResult(null);
    setSuccessMessage('');

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      // Simular selección de archivo
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const recognizePoster = async () => {
    if (!selectedImage) {
      setError('Por favor, selecciona una imagen primero');
      return;
    }

    setIsProcessing(true);
    setError('');
    setRecognitionResult(null);

    try {
      // Convertir imagen a base64 (sin el prefijo data:image...)
      const imageBase64 = await fileToBase64(selectedImage);

      // Llamar al servicio de AWS Rekognition
      const response = await fetch('https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE/reconocer-caratula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imagenBase64: imageBase64
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la imagen con Rekognition');
      }

      const data = await response.json();

      if (data.textoDetectado && data.textoDetectado.length > 0) {
        // Procesar los resultados de Rekognition
        const detectedTexts = data.textoDetectado.map(item => item.texto);
        const averageConfidence = data.textoDetectado.reduce((sum, item) => sum + item.confianza, 0) / data.textoDetectado.length;

        // Buscar el título de la película (generalmente el texto con mayor confianza o el primero)
        const mainTitle = data.textoDetectado[0]?.texto || 'Película no identificada';

        // Crear resultado formateado
        const result = {
          success: true,
          confidence: averageConfidence.toFixed(1),
          processingTime: Date.now(), // Timestamp aproximado
          movie: {
            id: Math.random().toString(36).substr(2, 9), // ID temporal
            title: mainTitle,
            originalTitle: mainTitle,
            year: null, // Podrías intentar extraer el año del texto detectado
            director: 'Por determinar',
            genres: [],
            synopsis: 'Película identificada mediante reconocimiento de carátula. Los detalles completos se cargarán próximamente.',
            posterUrl: imagePreview,
            averageRating: 0,
            reviewCount: 0,
            duration: 0,
            cast: [],
            isInWatchlist: false,
            isInFavorites: false
          },
          detectedText: detectedTexts,
          rekognitionData: data.textoDetectado // Datos completos de Rekognition
        };

        setRecognitionResult(result);
      } else {
        setError('No se detectó texto en la imagen. Intenta con una imagen más clara de la carátula.');
      }

    } catch (error) {
      console.error('Error al reconocer carátula:', error);
      setError('Error al procesar la imagen. Por favor, intenta nuevamente o verifica tu conexión.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo "data:image/...;base64,"
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRecognitionResult(null);
    setError('');
    setSuccessMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddToWatched = async () => {
    if (!recognitionResult?.movie) return;

    setIsAddingToWatched(true);
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:7000/movies/watched', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          movieId: recognitionResult.movie.id
        })
      });

      if (response.ok) {
        setSuccessMessage('✅ Película agregada a tu lista de vistas');
        setRecognitionResult({
          ...recognitionResult,
          movie: {
            ...recognitionResult.movie,
            isInWatchlist: true
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al agregar a la lista de vistas');
    } finally {
      setIsAddingToWatched(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!recognitionResult?.movie) return;

    setIsAddingToFavorites(true);
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:7000/movies/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          movieId: recognitionResult.movie.id
        })
      });

      if (response.ok) {
        setSuccessMessage('✅ Película agregada a tus favoritos');
        setRecognitionResult({
          ...recognitionResult,
          movie: {
            ...recognitionResult.movie,
            isInFavorites: true
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al agregar a favoritos');
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  return (
    <>
    <Navbar />
    <div className="poster-recognition-container">
      <div className="recognition-header">
        <h1 className="page-title">🎬 Reconocimiento de Carátulas</h1>
        <p className="page-subtitle">
          Sube una foto de la carátula y descubre información completa de la película
        </p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <div
          className={`upload-zone ${selectedImage ? 'has-image' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !selectedImage && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {!imagePreview ? (
            <div className="upload-placeholder">
              <div className="upload-icon">📸</div>
              <h3>Arrastra una imagen aquí</h3>
              <p>o haz clic para seleccionar</p>
              <span className="upload-formats">
                Formatos: JPG, PNG • Tamaño máximo: {maxSizeInMB}MB
              </span>
            </div>
          ) : (
            <div className="image-preview-container">
              <img
                src={imagePreview}
                alt="Preview"
                className="uploaded-image"
              />
              <button
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message-box">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {selectedImage && !recognitionResult && (
          <button
            className="recognize-btn"
            onClick={recognizePoster}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                Analizando carátula...
              </>
            ) : (
              <>
                <span className="btn-icon">🔍</span>
                Reconocer Película
              </>
            )}
          </button>
        )}
      </div>

      {/* Recognition Results */}
      {recognitionResult && recognitionResult.movie && (
        <div className="results-section">
          {successMessage && (
            <div className="success-alert">
              <span>{successMessage}</span>
            </div>
          )}

          <div className="results-header">
            <div className="confidence-badge">
              <span className="confidence-icon">✓</span>
              <span>Confianza promedio: {recognitionResult.confidence}%</span>
            </div>
          </div>

          <div className="movie-details-card">
            <div className="movie-layout">
              <div className="movie-poster-large">
                <img
                  src={recognitionResult.movie.posterUrl}
                  alt={recognitionResult.movie.title}
                />
              </div>

              <div className="movie-details">
                <h2 className="movie-title">{recognitionResult.movie.title}</h2>
                {recognitionResult.movie.originalTitle !== recognitionResult.movie.title && (
                  <p className="original-title">{recognitionResult.movie.originalTitle}</p>
                )}

                <div className="movie-synopsis">
                  <h4>Información</h4>
                  <p>{recognitionResult.movie.synopsis}</p>
                </div>

                {recognitionResult.movie.genres && recognitionResult.movie.genres.length > 0 && (
                  <div className="movie-genres">
                    {recognitionResult.movie.genres.map((genre, index) => (
                      <span key={index} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                )}

                <div className="movie-actions">
                  <button
                    className={`action-btn watched-btn ${recognitionResult.movie.isInWatchlist ? 'added' : ''}`}
                    onClick={handleAddToWatched}
                    disabled={isAddingToWatched || recognitionResult.movie.isInWatchlist}
                  >
                    {isAddingToWatched ? (
                      <>
                        <span className="spinner-small"></span>
                        Agregando...
                      </>
                    ) : recognitionResult.movie.isInWatchlist ? (
                      <>
                        <span>✓</span>
                        Ya en tu lista
                      </>
                    ) : (
                      <>
                        <span>👁️</span>
                        Agregar a Vistas
                      </>
                    )}
                  </button>

                  <button
                    className={`action-btn favorites-btn ${recognitionResult.movie.isInFavorites ? 'added' : ''}`}
                    onClick={handleAddToFavorites}
                    disabled={isAddingToFavorites || recognitionResult.movie.isInFavorites}
                  >
                    {isAddingToFavorites ? (
                      <>
                        <span className="spinner-small"></span>
                        Agregando...
                      </>
                    ) : recognitionResult.movie.isInFavorites ? (
                      <>
                        <span>❤️</span>
                        En favoritos
                      </>
                    ) : (
                      <>
                        <span>❤️</span>
                        Agregar a Favoritos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Detection Info - Mostrando datos de Rekognition */}
            {recognitionResult.rekognitionData && (
              <div className="detection-info">
                <h4>Texto detectado por AWS Rekognition</h4>
                <div className="detected-items">
                  <div className="detected-section">
                    <h5>Textos identificados en la carátula:</h5>
                    <div className="text-list">
                      {recognitionResult.rekognitionData.map((item, index) => (
                        <div key={index} className="text-item">
                          <span className="text-tag">"{item.texto}"</span>
                          <span className="confidence-text">
                            Confianza: {item.confianza.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button className="try-another-btn" onClick={handleReset}>
              Probar con otra imagen
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <h3>ℹ️ ¿Cómo funciona?</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-number">1</span>
              <div className="info-content">
                <h4>Sube la imagen</h4>
                <p>Selecciona o arrastra una foto de la carátula de la película</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-number">2</span>
              <div className="info-content">
                <h4>Análisis automático</h4>
                <p>Amazon Rekognition detecta texto en la carátula</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-number">3</span>
              <div className="info-content">
                <h4>Identificación</h4>
                <p>El sistema identifica el título y detalles de la película</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-number">4</span>
              <div className="info-content">
                <h4>Agrega a tus listas</h4>
                <p>Guarda la película en tus vistas o favoritos con un clic</p>
              </div>
            </div>
          </div>

          <div className="tips-section">
            <h4>💡 Consejos para mejores resultados:</h4>
            <ul>
              <li>Usa imágenes claras y bien iluminadas</li>
              <li>Asegúrate de que la carátula esté completa en la foto</li>
              <li>Evita imágenes borrosas o con mucho reflejo</li>
              <li>Las carátulas oficiales funcionan mejor que capturas de pantalla</li>
              <li>El texto del título debe ser legible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>

  );
};

export default PosterRecognition;
