import { useState, useEffect } from 'react';
import './perfil.css';

const perfil = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados de datos del usuario
  const [userData, setUserData] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Estados de edición
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de confirmación de eliminación
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch datos del usuario
      const userResponse = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (userResponse.ok) {
        const user = await userResponse.json();
        setUserData(user);
        setEditForm({
          username: user.username || '',
          email: user.email || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || ''
        });
      }

      // Fetch películas vistas
      const watchedResponse = await fetch(`/api/users/${userId}/watched`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (watchedResponse.ok) {
        const watched = await watchedResponse.json();
        setWatchedMovies(watched.movies || []);
      }

      // Fetch películas favoritas
      const favoritesResponse = await fetch(`/api/users/${userId}/favorites`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        setFavoriteMovies(favorites.movies || []);
      }

      // Fetch reseñas
      const reviewsResponse = await fetch(`/api/users/${userId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (reviewsResponse.ok) {
        const reviews = await reviewsResponse.json();
        setUserReviews(reviews.reviews || []);
      }

      // Fetch listas
      const listsResponse = await fetch(`/api/users/${userId}/lists`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (listsResponse.ok) {
        const lists = await listsResponse.json();
        setUserLists(lists.lists || []);
      }

      // Fetch estadísticas
      const statsResponse = await fetch(`/api/users/${userId}/statistics`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setStatistics(stats);
      }

    } catch (error) {
      console.error('Error:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    setUserData({
      id: '1',
      username: 'cinephile_pro',
      email: 'user@example.com',
      bio: 'Amante del cine desde 1995. Crítico aficionado y coleccionista de películas clásicas.',
      location: 'Madrid, España',
      website: 'https://myblog.com',
      profilePhoto: 'https://i.pravatar.cc/300?img=15',
      coverPhoto: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      registeredAt: new Date('2020-01-15'),
      followersCount: 1234,
      followingCount: 567
    });

    setWatchedMovies([
      {
        id: '1',
        title: 'The Shawshank Redemption',
        posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        year: 1994,
        rating: 5,
        watchedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'The Godfather',
        posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        year: 1972,
        rating: 5,
        watchedAt: new Date('2024-01-10')
      }
    ]);

    setFavoriteMovies([
      {
        id: '1',
        title: 'Pulp Fiction',
        posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        year: 1994
      },
      {
        id: '2',
        title: 'Inception',
        posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        year: 2010
      }
    ]);

    setUserReviews([
      {
        id: '1',
        movieTitle: 'The Shawshank Redemption',
        moviePoster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        rating: 5,
        title: 'Una obra maestra atemporal',
        content: 'Una película que todos deberían ver al menos una vez en la vida...',
        createdAt: new Date('2024-01-15'),
        likes: 245
      },
      {
        id: '2',
        movieTitle: 'The Dark Knight',
        moviePoster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        rating: 5,
        title: 'El mejor Batman',
        content: 'Christopher Nolan redefinió el género de superhéroes...',
        createdAt: new Date('2024-01-12'),
        likes: 189
      }
    ]);

    setUserLists([
      {
        id: '1',
        name: 'Películas para ver en Halloween',
        description: 'Mi colección personal de terror',
        movieCount: 25,
        isPublic: true,
        isCollaborative: false,
        coverImage: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        createdAt: new Date('2023-10-01')
      },
      {
        id: '2',
        name: 'Clásicos del Cine Negro',
        description: 'Film noir imprescindibles',
        movieCount: 42,
        isPublic: true,
        isCollaborative: true,
        collaborators: 3,
        coverImage: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
        createdAt: new Date('2023-08-15')
      }
    ]);

    setStatistics({
      totalWatched: 387,
      totalReviews: 142,
      totalLists: 8,
      totalFavorites: 28,
      averageRating: 4.2,
      hoursWatched: 658,
      genresDistribution: [
        { genre: 'Drama', count: 125, percentage: 32 },
        { genre: 'Acción', count: 89, percentage: 23 },
        { genre: 'Comedia', count: 67, percentage: 17 },
        { genre: 'Thriller', count: 54, percentage: 14 },
        { genre: 'Sci-Fi', count: 52, percentage: 14 }
      ],
      watchedByYear: [
        { year: 2024, count: 45 },
        { year: 2023, count: 128 },
        { year: 2022, count: 98 },
        { year: 2021, count: 116 }
      ],
      topDirectors: [
        { name: 'Christopher Nolan', count: 12 },
        { name: 'Quentin Tarantino', count: 10 },
        { name: 'Martin Scorsese', count: 9 }
      ]
    });
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      // Resetear form al entrar en modo edición
      setEditForm({
        username: userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || ''
      });
      setSelectedFile(null);
      setPreviewImage(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 5MB.');
        return;
      }

      setSelectedFile(file);
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Subir imagen si hay una nueva
      let photoUrl = userData.profilePhoto;
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append('photo', selectedFile);

        const uploadResponse = await fetch('/api/users/upload-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoUrl = uploadData.photoUrl;
        }
      }

      // Actualizar perfil
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          ...editForm,
          profilePhoto: photoUrl
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        setIsEditMode(false);
        setSelectedFile(null);
        setPreviewImage(null);
        alert('Perfil actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR MI CUENTA') {
      alert('Por favor, escribe "ELIMINAR MI CUENTA" para confirmar');
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        alert('Cuenta eliminada exitosamente');
        // Limpiar auth y redirigir
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la cuenta');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMemberSince = (date) => {
    const years = Math.floor((new Date() - new Date(date)) / (365.25 * 24 * 60 * 60 * 1000));
    if (years > 0) return `${years} año${years > 1 ? 's' : ''}`;
    
    const months = Math.floor((new Date() - new Date(date)) / (30 * 24 * 60 * 60 * 1000));
    return `${months} mes${months > 1 ? 'es' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner-large"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      {/* Cover Photo & Profile Header */}
      <div className="profile-header">
        <div 
          className="cover-photo" 
          style={{ backgroundImage: `url(${userData.coverPhoto})` }}
        >
          <div className="cover-overlay"></div>
        </div>

        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            <img 
              src={previewImage || userData.profilePhoto} 
              alt={userData.username}
              className="profile-avatar"
            />
            {isEditMode && (
              <label className="avatar-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
                <span className="upload-icon">📷</span>
              </label>
            )}
          </div>

          <div className="profile-main-info">
            <div className="profile-name-section">
              <h1 className="profile-username">@{userData.username}</h1>
              <div className="profile-meta">
                <span className="meta-item">
                  <span className="meta-icon">📅</span>
                  Miembro desde hace {getMemberSince(userData.registeredAt)}
                </span>
                {userData.location && (
                  <span className="meta-item">
                    <span className="meta-icon">📍</span>
                    {userData.location}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-actions">
              {!isEditMode ? (
                <button className="edit-profile-btn" onClick={handleEditToggle}>
                  <span className="btn-icon">✏️</span>
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button 
                    className="save-profile-btn" 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="spinner-small"></span>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        Guardar
                      </>
                    )}
                  </button>
                  <button 
                    className="cancel-edit-btn" 
                    onClick={handleEditToggle}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="profile-stats-bar">
            <div className="stat-item">
              <span className="stat-value">{statistics?.totalWatched || 0}</span>
              <span className="stat-label">Películas vistas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics?.totalReviews || 0}</span>
              <span className="stat-label">Reseñas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics?.totalLists || 0}</span>
              <span className="stat-label">Listas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userData.followersCount || 0}</span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userData.followingCount || 0}</span>
              <span className="stat-label">Siguiendo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Form */}
      {isEditMode && (
        <div className="edit-profile-section">
          <h3>📝 Editar Información</h3>
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de usuario</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  placeholder="tu_username"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Biografía</label>
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleInputChange}
                placeholder="Cuéntanos sobre ti..."
                rows="3"
                maxLength="200"
              />
              <span className="char-count">{editForm.bio.length}/200</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleInputChange}
                  placeholder="Ciudad, País"
                />
              </div>

              <div className="form-group">
                <label>Sitio web</label>
                <input
                  type="url"
                  name="website"
                  value={editForm.website}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bio Section */}
      {!isEditMode && userData.bio && (
        <div className="profile-bio-section">
          <p className="profile-bio">{userData.bio}</p>
          {userData.website && (
            <a 
              href={userData.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="profile-website"
            >
              🔗 {userData.website}
            </a>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Vista General
        </button>
        <button
          className={`tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
          onClick={() => setActiveTab('watched')}
        >
          <span className="tab-icon">🎬</span>
          Películas Vistas ({watchedMovies.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <span className="tab-icon">⭐</span>
          Favoritas ({favoriteMovies.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <span className="tab-icon">✍️</span>
          Reseñas ({userReviews.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'lists' ? 'active' : ''}`}
          onClick={() => setActiveTab('lists')}
        >
          <span className="tab-icon">📋</span>
          Listas ({userLists.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="tab-icon">⚙️</span>
          Configuración
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && statistics && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>📈 Estadísticas Generales</h3>
                </div>
                <div className="stat-card-content">
                  <div className="stat-row">
                    <span className="stat-label">Total de películas vistas</span>
                    <span className="stat-value-large">{statistics.totalWatched}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Horas de cine</span>
                    <span className="stat-value-large">{statistics.hoursWatched}h</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Calificación promedio</span>
                    <span className="stat-value-large">
                      ⭐ {statistics.averageRating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>🎭 Géneros Más Vistos</h3>
                </div>
                <div className="stat-card-content">
                  {statistics.genresDistribution.map((genre, index) => (
                    <div key={index} className="genre-stat">
                      <div className="genre-info">
                        <span className="genre-name">{genre.genre}</span>
                        <span className="genre-count">{genre.count} películas</span>
                      </div>
                      <div className="genre-bar-container">
                        <div 
                          className="genre-bar"
                          style={{ width: `${genre.percentage}%` }}
                        />
                      </div>
                      <span className="genre-percentage">{genre.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>📅 Películas por Año</h3>
                </div>
                <div className="stat-card-content">
                  {statistics.watchedByYear.map((yearData, index) => (
                    <div key={index} className="year-stat">
                      <span className="year-label">{yearData.year}</span>
                      <div className="year-bar-container">
                        <div 
                          className="year-bar"
                          style={{ 
                            width: `${(yearData.count / Math.max(...statistics.watchedByYear.map(y => y.count))) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="year-count">{yearData.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>🎬 Directores Favoritos</h3>
                </div>
                <div className="stat-card-content">
                  {statistics.topDirectors.map((director, index) => (
                    <div key={index} className="director-stat">
                      <span className="director-rank">#{index + 1}</span>
                      <span className="director-name">{director.name}</span>
                      <span className="director-count">{director.count} películas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Watched Movies Tab */}
        {activeTab === 'watched' && (
          <div className="watched-tab">
            <div className="movies-grid">
              {watchedMovies.map(movie => (
                <div key={movie.id} className="movie-card">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <h4 className="movie-title">{movie.title}</h4>
                    <div className="movie-meta">
                      <span className="movie-year">{movie.year}</span>
                      <span className="movie-rating">
                        {'⭐'.repeat(movie.rating)}
                      </span>
                    </div>
                    <span className="watched-date">
                      Visto: {formatDate(movie.watchedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Movies Tab */}
        {activeTab === 'favorites' && (
          <div className="favorites-tab">
            <div className="movies-grid">
              {favoriteMovies.map(movie => (
                <div key={movie.id} className="movie-card favorite">
                  <div className="favorite-badge">❤️</div>
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <h4 className="movie-title">{movie.title}</h4>
                    <span className="movie-year">{movie.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            <div className="reviews-list">
              {userReviews.map(review => (
                <div key={review.id} className="review-card">
                  <img 
                    src={review.moviePoster} 
                    alt={review.movieTitle}
                    className="review-movie-poster"
                  />
                  <div className="review-content">
                    <h4 className="review-movie-title">{review.movieTitle}</h4>
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                    <h5 className="review-title">{review.title}</h5>
                    <p className="review-text">{review.content}</p>
                    <div className="review-meta">
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                      <span className="review-likes">👍 {review.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lists Tab */}
        {activeTab === 'lists' && (
          <div className="lists-tab">
            <div className="lists-grid">
              {userLists.map(list => (
                <div key={list.id} className="list-card">
                  <div 
                    className="list-cover"
                    style={{ backgroundImage: `url(${list.coverImage})` }}
                  >
                    <div className="list-overlay">
                      <span className="list-movie-count">
                        {list.movieCount} películas
                      </span>
                    </div>
                  </div>
                  <div className="list-info">
                    <div className="list-header">
                      <h4 className="list-name">{list.name}</h4>
                      <div className="list-badges">
                        {list.isPublic && (
                          <span className="list-badge public">🌍 Pública</span>
                        )}
                        {list.isCollaborative && (
                          <span className="list-badge collab">
                            👥 {list.collaborators} colaboradores
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="list-description">{list.description}</p>
                    <span className="list-date">
                      Creada: {formatDate(list.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="settings-section danger-zone">
              <h3>⚠️ Zona de Peligro</h3>
              <p className="danger-description">
                La eliminación de tu cuenta es permanente e irreversible. 
                Todos tus datos, reseñas, listas y preferencias se perderán.
              </p>
              <button 
                className="delete-account-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                <span className="btn-icon">🗑️</span>
                Eliminar Mi Cuenta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h3>⚠️ Eliminar Cuenta</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p className="delete-warning">
                Esta acción es <strong>permanente e irreversible</strong>.
              </p>
              <p>Se eliminarán:</p>
              <ul className="delete-list">
                <li>✗ Tu perfil y toda tu información personal</li>
                <li>✗ Todas tus reseñas ({statistics?.totalReviews})</li>
                <li>✗ Todas tus listas ({statistics?.totalLists})</li>
                <li>✗ Tu historial de películas vistas ({statistics?.totalWatched})</li>
                <li>✗ Tus películas favoritas</li>
              </ul>
              <div className="delete-confirm-input">
                <label>
                  Escribe <strong>"ELIMINAR MI CUENTA"</strong> para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="ELIMINAR MI CUENTA"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="modal-delete-btn"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'ELIMINAR MI CUENTA'}
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default perfil;