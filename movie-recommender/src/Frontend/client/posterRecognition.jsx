import { useState, useRef } from 'react';
<<<<<<< HEAD
import './PosterRecognition.css';
import Navbar from './Navbar.jsx';
=======
import './posterRecognition.css';
>>>>>>> 5f4c5e07ff44252a7896b8a4672e821a3efa94d7

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
      // Convertir imagen a base64
      const imageBase64 = await fileToBase64(selectedImage);

      // Llamar al backend
      const response = await fetch('TU_API_URL/recognition/poster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          image: imageBase64,
          fileName: selectedImage.name,
          fileSize: selectedImage.size
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la imagen');
      }

      const data = await response.json();

      if (data.success && data.movie) {
        setRecognitionResult(data);
      } else {
        setError('No se pudo identificar la película. Intenta con una imagen más clara de la carátula.');
      }

    } catch (error) {
      console.error('Error:', error);
      // Simulación para desarrollo
      simulateRecognition();
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

  // Simulación de reconocimiento para desarrollo
  const simulateRecognition = () => {
    setTimeout(() => {
      const mockResult = {
        success: true,
        confidence: 92.5,
        processingTime: 1247,
        movie: {
          id: '123',
          title: 'Inception',
          originalTitle: 'Inception',
          year: 2010,
          director: 'Christopher Nolan',
          genres: ['Ciencia Ficción', 'Thriller', 'Acción'],
          synopsis: 'Un ladrón que roba secretos corporativos mediante el uso de tecnología de sueño compartido recibe la tarea inversa de plantar una idea en la mente de un CEO.',
          posterUrl: imagePreview,
          averageRating: 4.7,
          reviewCount: 15234,
          duration: 148,
          cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
          isInWatchlist: false,
          isInFavorites: false
        },
        detectedLabels: [
          { name: 'Movie Poster', confidence: 98.5 },
          { name: 'Text', confidence: 95.2 },
          { name: 'Person', confidence: 89.7 }
        ],
        detectedText: [
          'INCEPTION',
          'Leonardo DiCaprio',
          'July 16'
        ]
      };

      setRecognitionResult(mockResult);
      setIsProcessing(false);
    }, 2000);
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
      const response = await fetch('TU_API_URL/movies/watched', {
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
      const response = await fetch('TU_API_URL/movies/favorites', {
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
        setSuccessMessage('❤️ Película agregada a tus favoritos');
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
      <Navbar currentPage="Reconocimiento de Carátulas" />
    <div className="poster-recognition-container">
      <div className="recognition-header">
        <h1>🎬 Reconocimiento de Carátulas</h1>
        <p>Sube una imagen de la carátula de una película y la identificaremos automáticamente</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-card">
          {!imagePreview ? (
            <div
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📸</div>
              <h3>Arrastra una imagen aquí</h3>
              <p>o haz clic para seleccionar</p>
              <div className="upload-specs">
                <span>JPG o PNG</span>
                <span>•</span>
                <span>Máx. {maxSizeInMB}MB</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="image-preview-section">
              <div className="preview-header">
                <h3>Imagen seleccionada</h3>
                <button className="change-image-btn" onClick={handleReset}>
                  Cambiar imagen
                </button>
              </div>

              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>

              <div className="image-info">
                <span className="file-name">{selectedImage?.name}</span>
                <span className="file-size">
                  {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              {!recognitionResult && !isProcessing && (
                <button
                  className="recognize-btn"
                  onClick={recognizePoster}
                >
                  <span>🔍</span>
                  Identificar Película
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="processing-section">
          <div className="processing-card">
            <div className="spinner-large"></div>
            <h3>Analizando imagen...</h3>
            <p>Esto puede tomar unos segundos</p>
            <div className="processing-steps">
              <div className="step active">
                <span className="step-icon">📤</span>
                <span>Subiendo imagen</span>
              </div>
              <div className="step active">
                <span className="step-icon">🔍</span>
                <span>Analizando con Rekognition</span>
              </div>
              <div className="step">
                <span className="step-icon">🎬</span>
                <span>Identificando película</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <span>Confianza: {recognitionResult.confidence}%</span>
            </div>
            <span className="processing-time">
              Procesado en {recognitionResult.processingTime}ms
            </span>
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

                <div className="movie-meta-row">
                  <span className="meta-item">
                    <span className="meta-icon">📅</span>
                    {recognitionResult.movie.year}
                  </span>
                  <span className="meta-separator">•</span>
                  <span className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    {recognitionResult.movie.duration} min
                  </span>
                  <span className="meta-separator">•</span>
                  <span className="meta-item">
                    <span className="meta-icon">🎬</span>
                    {recognitionResult.movie.director}
                  </span>
                </div>

                <div className="movie-genres">
                  {recognitionResult.movie.genres.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre}</span>
                  ))}
                </div>

                <div className="movie-rating">
                  <div className="stars">
                    {renderStars(recognitionResult.movie.averageRating)}
                  </div>
                  <span className="rating-value">
                    {recognitionResult.movie.averageRating}
                  </span>
                  <span className="review-count">
                    ({recognitionResult.movie.reviewCount.toLocaleString()} reseñas)
                  </span>
                </div>

                <div className="movie-synopsis">
                  <h4>Sinopsis</h4>
                  <p>{recognitionResult.movie.synopsis}</p>
                </div>

                <div className="movie-cast">
                  <h4>Reparto Principal</h4>
                  <div className="cast-list">
                    {recognitionResult.movie.cast.map((actor, index) => (
                      <span key={index} className="cast-member">{actor}</span>
                    ))}
                  </div>
                </div>

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

                  <button className="action-btn details-btn">
                    <span>ℹ️</span>
                    Ver más detalles
                  </button>
                </div>
              </div>
            </div>

            {/* Detection Info */}
            {recognitionResult.detectedLabels && (
              <div className="detection-info">
                <h4>Información de detección</h4>
                <div className="detected-items">
                  <div className="detected-section">
                    <h5>Etiquetas detectadas:</h5>
                    <div className="labels-list">
                      {recognitionResult.detectedLabels.map((label, index) => (
                        <span key={index} className="label-tag">
                          {label.name} ({label.confidence.toFixed(1)}%)
                        </span>
                      ))}
                    </div>
                  </div>

                  {recognitionResult.detectedText && recognitionResult.detectedText.length > 0 && (
                    <div className="detected-section">
                      <h5>Texto detectado:</h5>
                      <div className="text-list">
                        {recognitionResult.detectedText.map((text, index) => (
                          <span key={index} className="text-tag">"{text}"</span>
                        ))}
                      </div>
                    </div>
                  )}
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
                <p>Amazon Rekognition detecta texto, etiquetas y características</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-number">3</span>
              <div className="info-content">
                <h4>Identificación</h4>
                <p>Nuestro algoritmo identifica la película en nuestra base de datos</p>
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
              <li>Evita imágenes borrosas o con mucho texto adicional</li>
              <li>Las carátulas oficiales funcionan mejor que capturas de pantalla</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>

  );
};

export default PosterRecognition;