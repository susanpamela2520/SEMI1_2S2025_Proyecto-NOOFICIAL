import { useState, useEffect } from 'react';
import './catalogo.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const moviesPerPage = 12;

  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedGenres: [],
    selectedYear: '',
    minRating: 0
  });

  const genres = [
    'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror',
    'Ciencia Ficción', 'Romance', 'Thriller', 'Animación',
    'Documental', 'Fantasía', 'Crimen'
  ];

  const years = Array.from({ length: 50 }, (_, i) => 2024 - i);

  const ratings = [
    { label: 'Todas', value: 0 },
    { label: '1+ ⭐', value: 1 },
    { label: '2+ ⭐', value: 2 },
    { label: '3+ ⭐', value: 3 },
    { label: '4+ ⭐', value: 4 }
  ];

  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [filters, movies]);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `TU_API_URL/movies?page=${currentPage}&limit=${moviesPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar películas');
      const data = await response.json();
      setMovies(data.movies);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

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
    if (filters.searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.selectedGenres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genres.some(genre => filters.selectedGenres.includes(genre))
      );
    }
    if (filters.selectedYear) {
      filtered = filtered.filter(movie =>
        movie.year === parseInt(filters.selectedYear)
      );
    }
    if (filters.minRating > 0) {
      filtered = filtered.filter(movie =>
        parseFloat(movie.averageRating) >= filters.minRating
      );
    }
    setFilteredMovies(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    navigate('/');
  };

  const handleSearchChange = (e) => setFilters({ ...filters, searchTerm: e.target.value });
  const handleGenreToggle = (genre) => {
    const newGenres = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter(g => g !== genre)
      : [...filters.selectedGenres, genre];
    setFilters({ ...filters, selectedGenres: newGenres });
  };
  const handleYearChange = (e) => setFilters({ ...filters, selectedYear: e.target.value });
  const handleRatingChange = (value) => setFilters({ ...filters, minRating: value });
  const clearFilters = () => setFilters({ searchTerm: '', selectedGenres: [], selectedYear: '', minRating: 0 });
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
      if (i < fullStars) stars.push(<span key={i} className="star full">★</span>);
      else if (i === fullStars && hasHalfStar) stars.push(<span key={i} className="star half">★</span>);
      else stars.push(<span key={i} className="star empty">☆</span>);
    }
    return stars;
  };

  const displayedMovies = filteredMovies.length > 0 ? filteredMovies : movies;
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const paginatedMovies = displayedMovies.slice(startIndex, endIndex);

  return (
    <div className="movies-container">

      {/* Barra de navegación */}
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">🎬 MovieApp</h2>
          <ul className="nav-links">
            <li>Catálogo</li>
            <li>Lectura Reseñas</li>
            <li>Perfil</li>
            <li>Reconocimiento Imagen</li>
            <li>Recomendación por ánimo</li>
            <li>Reseña Película</li>
            <li>Traducción de Reseñas</li>
          </ul>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
      </nav>

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
          <button className="clear-search" onClick={() => setFilters({ ...filters, searchTerm: '' })}>✕</button>
        )}
      </div>

      {/* Filtros */}
      {/* (Resto del código original sin cambios) */}

      {/* ... */}
    </div>
  );
};

export default Movies;
