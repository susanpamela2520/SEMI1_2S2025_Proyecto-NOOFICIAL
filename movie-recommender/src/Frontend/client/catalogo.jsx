import { useState, useEffect } from 'react';
import './catalogo.css';
import Navbar from './Navbar';

const Catalogo = () => {
  const [catalogo, setCatalogo] = useState([]);
  const [filteredCatalogo, setFilteredCatalogo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const catalogoPerPage = 12;
  const [genres, setGenres] = useState([]);

  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedGenres: [],
    selectedYear: '',
    minRating: 0
  });

  // Estados del formulario de nueva película
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    release_year: '',
    cover_url: '',
    genre_ids: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // Opciones de filtros
  const years = Array.from({ length: 50 }, (_, i) => 2024 - i);

  const ratings = [
    { label: 'Todas', value: 0 },
    { label: '1+ ⭐', value: 1 },
    { label: '2+ ⭐', value: 2 },
    { label: '3+ ⭐', value: 3 },
    { label: '4+ ⭐', value: 4 }
  ];

  // Cargar géneros al montar el componente
  useEffect(() => {
    fetchGenres();
  }, []);

  // Cargar películas desde la API
  useEffect(() => {
    fetchCatalogo();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, catalogo]);

  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:7000/users/genres', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar géneros');
      }

      const data = await response.json();
      
      if (data.success && data.data.genres) {
        setGenres(data.data.genres);
      }
    } catch (error) {
      console.error('Error al cargar géneros:', error);
      // Géneros por defecto si falla la API
      setGenres([
        { id: 1, name: 'Acción' },
        { id: 2, name: 'Aventura' },
        { id: 3, name: 'Comedia' },
        { id: 4, name: 'Drama' },
        { id: 5, name: 'Terror' },
        { id: 6, name: 'Ciencia Ficción' },
        { id: 7, name: 'Romance' },
        { id: 8, name: 'Thriller' },
        { id: 9, name: 'Animación' },
        { id: 10, name: 'Documental' },
        { id: 11, name: 'Fantasía' },
        { id: 12, name: 'Crimen' }
      ]);
    }
  };

  const fetchCatalogo = async () => {
    setIsLoading(true);
    try {
      // Cargar todas las películas (sin filtros, se aplicarán en el frontend)
      const url = `http://localhost:7000/users/movies`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar películas');
      }

      const data = await response.json();
      
      if (data.success && data.data.movies) {
        // Mapear los datos de la API al formato esperado por el componente
        const formattedMovies = data.data.movies.map(movie => ({
          id: movie.id,
          title: movie.title,
          posterUrl: movie.cover_url || `https://picsum.photos/300/450?random=${movie.id}`,
          year: movie.release_year,
          genreIds: [], // Se llenará después
          genreNames: '', // Se llenará después
          averageRating: parseFloat(movie.average_rating || 0).toFixed(1),
          reviewCount: parseInt(movie.review_count || 0)
        }));

        setCatalogo(formattedMovies);
        setTotalPages(Math.ceil(formattedMovies.length / catalogoPerPage));
        
        // Cargar géneros de películas después de tener la lista de géneros
        if (genres.length > 0) {
          fetchAllMovieGenres(formattedMovies);
        }
      } else {
        throw new Error('Formato de respuesta inválido');
      }
      
    } catch (error) {
      console.error('Error al cargar películas:', error);
      // Datos de ejemplo para desarrollo si falla la API
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllMovieGenres = async (movies) => {
    try {
      // Para cada género, obtener las películas que pertenecen a ese género
      const genreMovieMap = {};
      
      for (const genre of genres) {
        try {
          const response = await fetch(
            `http://localhost:7000/users/movies?genre_id=${genre.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.movies) {
              // Guardar qué películas pertenecen a este género
              data.data.movies.forEach(movie => {
                if (!genreMovieMap[movie.id]) {
                  genreMovieMap[movie.id] = [];
                }
                genreMovieMap[movie.id].push({
                  id: genre.id,
                  name: genre.name
                });
              });
            }
          }
        } catch (err) {
          console.error(`Error obteniendo películas del género ${genre.name}:`, err);
        }
      }

      // Actualizar las películas con sus géneros
      const moviesWithGenres = movies.map(movie => ({
        ...movie,
        genreIds: genreMovieMap[movie.id] ? genreMovieMap[movie.id].map(g => g.id) : [],
        genreNames: genreMovieMap[movie.id] ? genreMovieMap[movie.id].map(g => g.name).join(', ') : 'Sin género'
      }));

      setCatalogo(moviesWithGenres);
      setTotalPages(Math.ceil(moviesWithGenres.length / catalogoPerPage));
    } catch (error) {
      console.error('Error al cargar géneros de películas:', error);
    }
  };

  // Cargar géneros cuando el componente tiene tanto las películas como los géneros
  useEffect(() => {
    if (catalogo.length > 0 && genres.length > 0 && !catalogo[0].genreNames) {
      fetchAllMovieGenres(catalogo);
    }
  }, [catalogo, genres]);

  // Datos de ejemplo para desarrollo
  const loadMockData = () => {
    const mockCatalogo = Array.from({ length: 24 }, (_, i) => {
      const randomGenreIds = genres.length > 0 
        ? [genres[Math.floor(Math.random() * genres.length)].id] 
        : [];
      const randomGenreNames = randomGenreIds
        .map(id => {
          const genre = genres.find(g => g.id === id);
          return genre ? genre.name : '';
        })
        .filter(name => name)
        .join(', ');

      return {
        id: i + 1,
        title: `Película ${i + 1}`,
        posterUrl: `https://picsum.photos/300/450?random=${i}`,
        year: 2020 + Math.floor(Math.random() * 5),
        genreIds: randomGenreIds,
        genreNames: randomGenreNames || 'Sin género',
        averageRating: (Math.random() * 4 + 1).toFixed(1),
        reviewCount: Math.floor(Math.random() * 500) + 10
      };
    });
    
    setCatalogo(mockCatalogo);
    setTotalPages(Math.ceil(mockCatalogo.length / catalogoPerPage));
  };

  const applyFilters = () => {
    let filtered = [...catalogo];

    // Filtro por búsqueda
    if (filters.searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por géneros (usando genreIds)
    if (filters.selectedGenres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genreIds && movie.genreIds.some(genreId => filters.selectedGenres.includes(genreId))
      );
    }

    // Filtro por año
    if (filters.selectedYear) {
      filtered = filtered.filter(movie =>
        movie.year === parseInt(filters.selectedYear)
      );
    }

    // Filtro por calificación mínima
    if (filters.minRating > 0) {
      filtered = filtered.filter(movie =>
        parseFloat(movie.averageRating) >= filters.minRating
      );
    }

    setFilteredCatalogo(filtered);
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      searchTerm: e.target.value
    });
  };

  const handleGenreToggle = (genreId) => {
    const newGenres = filters.selectedGenres.includes(genreId)
      ? filters.selectedGenres.filter(g => g !== genreId)
      : [...filters.selectedGenres, genreId];

    setFilters({
      ...filters,
      selectedGenres: newGenres
    });
  };

  const handleYearChange = (e) => {
    setFilters({
      ...filters,
      selectedYear: e.target.value
    });
  };

  const handleRatingChange = (value) => {
    setFilters({
      ...filters,
      minRating: value
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedGenres: [],
      selectedYear: '',
      minRating: 0
    });
  };

  // Funciones para el formulario de nueva película
  const handleOpenAddMovie = () => {
    setShowAddMovieModal(true);
    setNewMovie({
      title: '',
      release_year: '',
      cover_url: '',
      genre_ids: []
    });
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  const handleCloseAddMovie = () => {
    setShowAddMovieModal(false);
    setNewMovie({
      title: '',
      release_year: '',
      cover_url: '',
      genre_ids: []
    });
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  const handleMovieInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovie({
      ...newMovie,
      [name]: value
    });
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleGenreSelection = (genreId) => {
    const isSelected = newMovie.genre_ids.includes(genreId);
    if (isSelected) {
      setNewMovie({
        ...newMovie,
        genre_ids: newMovie.genre_ids.filter(id => id !== genreId)
      });
    } else {
      setNewMovie({
        ...newMovie,
        genre_ids: [...newMovie.genre_ids, genreId]
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newMovie.title.trim()) {
      errors.title = 'El título es obligatorio';
    }
    
    if (!newMovie.release_year) {
      errors.release_year = 'El año de lanzamiento es obligatorio';
    } else {
      const year = parseInt(newMovie.release_year);
      const currentYear = new Date().getFullYear();
      if (year < 1888 || year > currentYear + 5) {
        errors.release_year = `El año debe estar entre 1888 y ${currentYear + 5}`;
      }
    }

    if (newMovie.cover_url && !isValidUrl(newMovie.cover_url)) {
      errors.cover_url = 'La URL de la portada no es válida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmitMovie = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:7000/users/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newMovie.title.trim(),
          release_year: parseInt(newMovie.release_year),
          cover_url: newMovie.cover_url.trim() || null,
          genre_ids: newMovie.genre_ids
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({ 
          type: 'success', 
          text: '¡Película registrada exitosamente!' 
        });
        
        // Recargar el catálogo después de 1.5 segundos
        setTimeout(() => {
          fetchCatalogo();
          handleCloseAddMovie();
        }, 1500);
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: data.message || 'Error al registrar la película' 
        });
      }
    } catch (error) {
      console.error('Error al registrar película:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: 'Error de conexión. Verifica que el servidor esté funcionando.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const displayedCatalogo = filteredCatalogo.length > 0 ? filteredCatalogo : catalogo;
  const startIndex = (currentPage - 1) * catalogoPerPage;
  const endIndex = startIndex + catalogoPerPage;
  const paginatedCatalogo = displayedCatalogo.slice(startIndex, endIndex);

  return (
    <>
      <Navbar currentPage="Catálogo" />
      <div className="movies-container">
      {/* Header */}
      <div className="movies-header">
        <h1>🎬 Explora Películas</h1>
        <p>Descubre tu próxima película favorita</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar películas por título..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {filters.searchTerm && (
          <button
            className="clear-search"
            onClick={() => setFilters({ ...filters, searchTerm: '' })}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>🎯 Filtros</h3>
          {(filters.selectedGenres.length > 0 || 
            filters.selectedYear || 
            filters.minRating > 0) && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Filtro por Calificación */}
        <div className="filter-group">
          <label>⭐ Calificación mínima</label>
          <div className="rating-filters">
            {ratings.map((rating) => (
              <button
                key={rating.value}
                className={`rating-btn ${filters.minRating === rating.value ? 'active' : ''}`}
                onClick={() => handleRatingChange(rating.value)}
              >
                {rating.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Año */}
        <div className="filter-group">
          <label htmlFor="year-filter">📅 Año de lanzamiento</label>
          <select
            id="year-filter"
            value={filters.selectedYear}
            onChange={handleYearChange}
            className="year-select"
          >
            <option value="">Todos los años</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Género */}
        <div className="filter-group">
          <label>🎭 Géneros</label>
          <div className="genre-filters">
            {genres.map((genre) => (
              <button
                key={genre.id}
                className={`genre-filter-btn ${filters.selectedGenres.includes(genre.id) ? 'active' : ''}`}
                onClick={() => handleGenreToggle(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="results-count">
        {isLoading ? (
          <span>Cargando películas...</span>
        ) : (
          <span>
            📊 Mostrando {paginatedCatalogo.length} de {displayedCatalogo.length} películas
          </span>
        )}
      </div>

      {/* Grid de películas */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Cargando películas...</p>
        </div>
      ) : paginatedCatalogo.length === 0 ? (
        <div className="no-results">
          <span className="no-results-icon">🎬</span>
          <h3>No se encontraron películas</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="movies-grid">
            {paginatedCatalogo.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    loading="lazy"
                  />
                  <div className="movie-overlay">
                    <button className="view-details-btn">
                      Ver detalles
                    </button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title" title={movie.title}>
                    {movie.title}
                  </h3>
                  <div className="movie-meta">
                    <span className="movie-year">{movie.year}</span>
                    <span className="separator">•</span>
                    <span className="movie-genre">
                      {movie.genreNames}
                    </span>
                  </div>
                  <div className="movie-rating">
                    <div className="stars">
                      {renderStars(parseFloat(movie.averageRating))}
                    </div>
                    <span className="rating-value">
                      {movie.averageRating}
                    </span>
                  </div>
                  <div className="movie-reviews">
                    <span className="review-icon">💬</span>
                    <span>{movie.reviewCount} reseñas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>

    {/* Botón Flotante para Agregar Película */}
    <button 
      className="fab-add-movie" 
      onClick={handleOpenAddMovie}
      title="Agregar nueva película"
    >
      <span className="fab-icon">+</span>
    </button>

    {/* Modal de Agregar Película */}
    {showAddMovieModal && (
      <div className="modal-overlay" onClick={handleCloseAddMovie}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">🎬 Agregar Nueva Película</h2>
            <button className="modal-close-btn" onClick={handleCloseAddMovie}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitMovie} className="movie-form">
            {/* Mensaje de éxito/error */}
            {submitMessage.text && (
              <div className={`form-alert ${submitMessage.type}`}>
                {submitMessage.type === 'success' ? '✅' : '❌'} {submitMessage.text}
              </div>
            )}

            {/* Campo: Título */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Título <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newMovie.title}
                onChange={handleMovieInputChange}
                className={`form-input ${formErrors.title ? 'error' : ''}`}
                placeholder="Ej: Inception"
                disabled={isSubmitting}
              />
              {formErrors.title && (
                <span className="form-error">{formErrors.title}</span>
              )}
            </div>

            {/* Campo: Año de Lanzamiento */}
            <div className="form-group">
              <label htmlFor="release_year" className="form-label">
                Año de Lanzamiento <span className="required">*</span>
              </label>
              <input
                type="number"
                id="release_year"
                name="release_year"
                value={newMovie.release_year}
                onChange={handleMovieInputChange}
                className={`form-input ${formErrors.release_year ? 'error' : ''}`}
                placeholder="Ej: 2024"
                min="1888"
                max={new Date().getFullYear() + 5}
                disabled={isSubmitting}
              />
              {formErrors.release_year && (
                <span className="form-error">{formErrors.release_year}</span>
              )}
            </div>

            {/* Campo: URL de Portada */}
            <div className="form-group">
              <label htmlFor="cover_url" className="form-label">
                URL de Portada (Opcional)
              </label>
              <input
                type="url"
                id="cover_url"
                name="cover_url"
                value={newMovie.cover_url}
                onChange={handleMovieInputChange}
                className={`form-input ${formErrors.cover_url ? 'error' : ''}`}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={isSubmitting}
              />
              {formErrors.cover_url && (
                <span className="form-error">{formErrors.cover_url}</span>
              )}
              <span className="form-hint">
                Si no proporcionas una URL, se usará una imagen por defecto
              </span>
            </div>

            {/* Selección de Géneros */}
            <div className="form-group">
              <label className="form-label">
                Géneros (Opcional)
              </label>
              <div className="genre-selection">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    className={`genre-tag ${newMovie.genre_ids.includes(genre.id) ? 'selected' : ''}`}
                    onClick={() => handleGenreSelection(genre.id)}
                    disabled={isSubmitting}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
              <span className="form-hint">
                Selecciona uno o más géneros para la película
              </span>
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCloseAddMovie}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-small"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Guardar Película
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default Catalogo;