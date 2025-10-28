import { useState } from 'react';

function MovieManagement() {
  const [movies, setMovies] = useState([
    {
      id: 1,
      title: 'Inception',
      director: 'Christopher Nolan',
      year: 2010,
      genre: 'Ciencia Ficción',
      duration: 148,
      rating: 8.8,
      poster: 'https://via.placeholder.com/200x300/667eea/ffffff?text=Inception',
      synopsis: 'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños.',
      status: 'Activa',
      reviews: 245
    },
    {
      id: 2,
      title: 'The Matrix',
      director: 'Lana Wachowski, Lilly Wachowski',
      year: 1999,
      genre: 'Ciencia Ficción',
      duration: 136,
      rating: 8.7,
      poster: 'https://via.placeholder.com/200x300/764ba2/ffffff?text=Matrix',
      synopsis: 'Un hacker descubre la verdadera naturaleza de su realidad y su papel en la guerra contra sus controladores.',
      status: 'Activa',
      reviews: 312
    },
    {
      id: 3,
      title: 'The Dark Knight',
      director: 'Christopher Nolan',
      year: 2008,
      genre: 'Acción',
      duration: 152,
      rating: 9.0,
      poster: 'https://via.placeholder.com/200x300/f093fb/ffffff?text=Batman',
      synopsis: 'Batman enfrenta al Joker, un criminal maestro que quiere sumir a Ciudad Gótica en la anarquía.',
      status: 'Activa',
      reviews: 428
    },
    {
      id: 4,
      title: 'Pulp Fiction',
      director: 'Quentin Tarantino',
      year: 1994,
      genre: 'Crimen',
      duration: 154,
      rating: 8.9,
      poster: 'https://via.placeholder.com/200x300/4facfe/ffffff?text=Pulp',
      synopsis: 'Las vidas de dos sicarios, un boxeador y una pareja de ladrones se entrelazan en cuatro historias.',
      status: 'Activa',
      reviews: 389
    },
    {
      id: 5,
      title: 'Interstellar',
      director: 'Christopher Nolan',
      year: 2014,
      genre: 'Ciencia Ficción',
      duration: 169,
      rating: 8.6,
      poster: 'https://via.placeholder.com/200x300/fa709a/ffffff?text=Interstellar',
      synopsis: 'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio para asegurar la supervivencia de la humanidad.',
      status: 'Inactiva',
      reviews: 198
    },
    {
      id: 6,
      title: 'Parasite',
      director: 'Bong Joon-ho',
      year: 2019,
      genre: 'Drama',
      duration: 132,
      rating: 8.5,
      poster: 'https://via.placeholder.com/200x300/667eea/ffffff?text=Parasite',
      synopsis: 'Una familia pobre se infiltra en la vida de una familia rica con consecuencias inesperadas.',
      status: 'Activa',
      reviews: 276
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentMovie, setCurrentMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  const [formData, setFormData] = useState({
    title: '',
    director: '',
    year: new Date().getFullYear(),
    genre: 'Acción',
    duration: 0,
    rating: 0,
    poster: '',
    synopsis: '',
    status: 'Activa',
  });

  const genres = ['Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción', 'Romance', 'Thriller', 'Aventura', 'Animación', 'Crimen'];

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      director: '',
      year: new Date().getFullYear(),
      genre: 'Acción',
      duration: 0,
      rating: 0,
      poster: '',
      synopsis: '',
      status: 'Activa',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (movie) => {
    setModalMode('edit');
    setCurrentMovie(movie);
    setFormData({
      title: movie.title,
      director: movie.director,
      year: movie.year,
      genre: movie.genre,
      duration: movie.duration,
      rating: movie.rating,
      poster: movie.poster,
      synopsis: movie.synopsis,
      status: movie.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentMovie(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newMovie = {
        id: movies.length + 1,
        ...formData,
        reviews: 0,
      };
      setMovies([...movies, newMovie]);
    } else {
      setMovies(movies.map(movie =>
        movie.id === currentMovie.id ? { ...movie, ...formData } : movie
      ));
    }
    handleCloseModal();
  };

  const handleDelete = (movieId) => {
    if (window.confirm('¿Estás seguro de eliminar esta película?')) {
      setMovies(movies.filter(movie => movie.id !== movieId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          movie.director.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || movie.genre === filterGenre;
    const matchesStatus = filterStatus === 'all' || movie.status === filterStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'year') {
      return b.year - a.year;
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'reviews') {
      return b.reviews - a.reviews;
    }
    return 0;
  });

  const totalMovies = movies.length;
  const activeMovies = movies.filter(m => m.status === 'Activa').length;

  return (
    <div className="movie-management">
      <div className="header">
        <div className="header-content">
          <h1>🎬 Gestión de Películas</h1>
          <div className="header-actions">
            <div className="stats-inline">
              <div className="stat-item">
                <span className="stat-number">{totalMovies}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{activeMovies}</span>
                <span className="stat-label">Activas</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              + Nueva Película
            </button>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por título o director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
            <option value="all">Todos los géneros</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title">Ordenar por título</option>
            <option value="year">Ordenar por año</option>
            <option value="rating">Ordenar por calificación</option>
            <option value="reviews">Ordenar por reseñas</option>
          </select>
        </div>
      </div>

      <div className="movies-grid">
        {sortedMovies.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron películas</p>
          </div>
        ) : (
          sortedMovies.map(movie => (
            <div key={movie.id} className={`movie-card ${movie.status.toLowerCase()}`}>
              <div className="movie-poster-container">
                <img src={movie.poster} alt={movie.title} className="movie-poster" />
                <span className={`status-badge badge-${movie.status.toLowerCase()}`}>
                  {movie.status}
                </span>
              </div>
              
              <div className="movie-details">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-director">🎬 {movie.director}</p>
                
                <div className="movie-info">
                  <span className="info-item">📅 {movie.year}</span>
                  <span className="info-item">⏱️ {movie.duration} min</span>
                  <span className="info-item genre-badge">{movie.genre}</span>
                </div>

                <div className="movie-rating">
                  <span className="rating-score">⭐ {movie.rating}</span>
                  <span className="reviews-count">💬 {movie.reviews} reseñas</span>
                </div>

                <p className="movie-synopsis">{movie.synopsis.substring(0, 100)}...</p>

                <div className="movie-actions">
                  <button 
                    className="btn btn-small btn-edit"
                    onClick={() => handleOpenEditModal(movie)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn btn-small btn-delete"
                    onClick={() => handleDelete(movie.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? '🎬 Nueva Película' : '✏️ Editar Película'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Título *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="director">Director *</label>
                    <input
                      type="text"
                      id="director"
                      name="director"
                      value={formData.director}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year">Año *</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="genre">Género *</label>
                    <select
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      required
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="duration">Duración (min) *</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="rating">Calificación (0-10) *</label>
                    <input
                      type="number"
                      id="rating"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Estado *</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Activa">Activa</option>
                      <option value="Inactiva">Inactiva</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="poster">URL del Poster</label>
                  <input
                    type="url"
                    id="poster"
                    name="poster"
                    value={formData.poster}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/poster.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="synopsis">Sinopsis *</label>
                  <textarea
                    id="synopsis"
                    name="synopsis"
                    value={formData.synopsis}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Crear Película' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieManagement;