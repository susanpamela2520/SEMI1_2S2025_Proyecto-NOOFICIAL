import { useState } from 'react';
import './register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
    favoriteGenres: []
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const movieGenres = [
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

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.profilePhoto) {
      newErrors.profilePhoto = 'La foto de perfil es requerida';
    }

    if (formData.favoriteGenres.length === 0) {
      newErrors.favoriteGenres = 'Selecciona al menos un género favorito';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          profilePhoto: 'Solo se permiten archivos JPG, PNG o WEBP'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          profilePhoto: 'La imagen no debe superar los 5MB'
        });
        return;
      }

      setFormData({
        ...formData,
        profilePhoto: file
      });

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error
      if (errors.profilePhoto) {
        setErrors({
          ...errors,
          profilePhoto: ''
        });
      }
    }
  };

  const handleGenreToggle = (genre) => {
    const currentGenres = [...formData.favoriteGenres];
    const index = currentGenres.indexOf(genre);

    if (index > -1) {
      currentGenres.splice(index, 1);
    } else {
      currentGenres.push(genre);
    }

    setFormData({
      ...formData,
      favoriteGenres: currentGenres
    });

    // Limpiar error
    if (errors.favoriteGenres && currentGenres.length > 0) {
      setErrors({
        ...errors,
        favoriteGenres: ''
      });
    }
  };

  const uploadImageToCloudinary = async (file) => {
    // Subir la imagen a Cloudinary (o cualquier servicio de almacenamiento)
    // Por ahora devolvemos una URL de ejemplo
    // En producción, deberías implementar la subida real a S3, Cloudinary, etc.
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tu_upload_preset'); // Configura esto en Cloudinary
    
    try {
      // Ejemplo con Cloudinary - ajusta según tu servicio
      const response = await fetch('https://api.cloudinary.com/v1_1/tu_cloud_name/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      // Por ahora devolvemos el preview local como fallback
      return photoPreview;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Subir la foto de perfil primero (si implementas Cloudinary/S3)
      // let profilePhotoUrl = await uploadImageToCloudinary(formData.profilePhoto);
      
      // Por ahora usamos el preview como URL temporal
      let profilePhotoUrl = photoPreview;

      // Conectar con tu endpoint de registro
      // Ajusta la URL base según tu configuración
      const response = await fetch('http://localhost:7000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.fullName,           // Tu API espera full_name
          username: formData.username,
          email: formData.email,
          password: formData.password,             // El backend lo encriptará con bcrypt
          profile_photo_url: profilePhotoUrl,      // URL de la foto
          favorite_genres: formData.favoriteGenres // Array de géneros
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Mostrar el error que devuelve tu API
        setErrors({
          general: data.error || 'Error al registrar usuario. Por favor, intenta nuevamente.'
        });
        return;
      }

      // Registro exitoso
      // Tu API devuelve: { userId: result.rows[0].id }
      console.log('Registro exitoso:', data);
      
      // Guardar el userId en localStorage
      localStorage.setItem('userId', data.userId);
      
      // Limpiar errores
      setErrors({});
      
      // Mostrar mensaje de éxito
      alert('¡Registro exitoso! Redirigiendo al login...');
      
      // Redirigir al login
      // Si usas React Router:
      // navigate('/login');
      
      // Si usas window.location:
      window.location.href = '/login';

    } catch (error) {
      console.error('Error en el registro:', error);
      setErrors({
        general: 'Error al conectar con el servidor. Por favor, intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>Únete a nuestra comunidad cinéfila</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Error general */}
          {errors.general && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Nombre Completo */}
          <div className="form-group">
            <label htmlFor="fullName">Nombre Completo *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Juan Pérez"
              disabled={isLoading}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          {/* Nombre de Usuario */}
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? 'error' : ''}
              placeholder="juanperez123"
              disabled={isLoading}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {/* Correo Electrónico */}
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="correo@ejemplo.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Mínimo 8 caracteres"
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Repite tu contraseña"
              disabled={isLoading}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Foto de Perfil */}
          <div className="form-group">
            <label htmlFor="profilePhoto">Foto de Perfil *</label>
            <div className="photo-upload">
              <input
                type="file"
                id="profilePhoto"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handlePhotoChange}
                className="file-input"
                disabled={isLoading}
              />
              <label htmlFor="profilePhoto" className="file-label">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Seleccionar imagen</span>
                  </div>
                )}
              </label>
            </div>
            {errors.profilePhoto && <span className="error-message">{errors.profilePhoto}</span>}
          </div>

          {/* Géneros Favoritos */}
          <div className="form-group">
            <label>Géneros Cinematográficos Favoritos *</label>
            <div className="genres-grid">
              {movieGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  className={`genre-btn ${formData.favoriteGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => handleGenreToggle(genre)}
                  disabled={isLoading}
                >
                  {genre}
                </button>
              ))}
            </div>
            {errors.favoriteGenres && <span className="error-message">{errors.favoriteGenres}</span>}
          </div>

          {/* Botón de Submit */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="login-link">
            ¿Ya tienes cuenta? <a href="#" onClick={() => navigate("/")}>Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;