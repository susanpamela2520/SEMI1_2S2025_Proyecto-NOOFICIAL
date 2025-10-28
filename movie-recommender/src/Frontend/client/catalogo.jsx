import { useState, useEffect } from 'react';
import './catalogo.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const moviesPerPage = 12;

  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedGenres: [],
    selectedYear: '',
    minRating: 0
  });

  // Opciones de filtros
  const genres = [
    'Acción',
    'Aventura',
    'Comedia',
    'Drama',
    'Terror',
    'Ciencia Ficción',
    'Romance',
    'Thriller',
    'Animación',
    'Documental',
    'Fantasía',
    'Crimen'
  ];

  const years = Array.from({ length: 50 }, (_, i) => 2024 - i);

  const ratings = [
    { label: 'Todas', value: 0 },
    { label: '1+ ⭐', value: 1 },
    { label: '2+ ⭐', value: 2 },
    { label: '3+ ⭐', value: 3 },
    { label: '4+ ⭐', value: 4 }
  ];

  // Cargar películas desde la API
  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, movies]);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      // Aquí se integrará con la API real
      const response = await fetch(
        `TU_API_URL/movies?page=${currentPage}&limit=${moviesPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar películas');
      }

      const data = await response.json();
      setMovies(data.movies);
      setTotalPages(data.totalPages);
      
    } catch (error) {
      console.error('Error:', error);
      // Datos de ejemplo para desarrollo
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Datos de ejemplo para desarrollo
  const loadMockData = () => {
    const mockMovies = Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      title: `Película ${i + 1}`,
      posterUrl: `https://picsum.photos/300/450?random=${i}`,
      year: 2020 + Math.floor(Math.random() * 5),
      genres: [genres[Math.floor(Math.random() * genres.length)]],
      averageRating: (Math.random() * 4 + 1).toFixed(1),
      reviewCount: Math.floor(Math.random() * 500) + 10
    }));
    
    setMovies(mockMovies);
    setTotalPages(Math.ceil(mockMovies.length / moviesPerPage));
  };

  const applyFilters = () => {
    let filtered = [...movies];

    // Filtro por búsqueda
    if (filters.searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por géneros
    if (filters.selectedGenres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genres.some(genre => filters.selectedGenres.includes(genre))
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

    setFilteredMovies(filtered);
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      searchTerm: e.target.value
    });
  };

  const handleGenreToggle = (genre) => {
    const newGenres = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter(g => g !== genre)
      : [...filters.selectedGenres, genre];

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

  const displayedMovies = filteredMovies.length > 0 ? filteredMovies : movies;
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const paginatedMovies = displayedMovies.slice(startIndex, endIndex);

  return (
    <div className="movies-container">
      {/* Header */}
      <div className="movies-header">
        <h1>Explora Películas</h1>
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
          <h3>Filtros</h3>
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
          <label>Calificación mínima</label>
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
          <label htmlFor="year-filter">Año de lanzamiento</label>
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
          <label>Géneros</label>
          <div className="genre-filters">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`genre-filter-btn ${filters.selectedGenres.includes(genre) ? 'active' : ''}`}
                onClick={() => handleGenreToggle(genre)}
              >
                {genre}
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
            Mostrando {paginatedMovies.length} de {displayedMovies.length} películas
          </span>
        )}
      </div>

      {/* Grid de películas */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Cargando películas...</p>
        </div>
      ) : paginatedMovies.length === 0 ? (
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
            {paginatedMovies.map((movie) => (
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
                      {movie.genres.join(', ')}
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
  );
};

export default Movies;