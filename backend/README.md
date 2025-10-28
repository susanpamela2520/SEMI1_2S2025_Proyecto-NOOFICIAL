### Iniciar proyecto por primera vez (backend)
 ```bash
npm init -y
npm install express dotenv mysql2 md5 cors

En aws
sudo apt install -y nodejs npm
sudo npm install -g pm2
pm2 start app.js


# Configuració de  PM2 para que se inicie automáticamente al reiniciar el servidor:

Bash

pm2 save
pm2 startup systemd
 ```

### Instalar dependencias (Sí eres frontend)
```bash
npm i | npm install
```

### Iniciar API
```bash
node index.js
```


# Rutas
El atributo `success` determina si la ejecucion fue correcta (true) o fallida (false).
El atributo `message` da una descripcion breve del resultado de la peticion
El atributo `data` incluye un json o arreglo de jsons con los resultados a utilizar en el frontend.

# Direccion Load Balancer: 
## http://load-balancer-g4-1377475087.us-east-2.elb.amazonaws.com

# Endpoints - API

## 1. Login - POST
`/users/login` 
```json
// api Recibie

{
  "username": "cmendez",
  "password": "segura123"
}

// api devuelve
// En caso de exito
{
  "success": true,
  "message": "Usuario autenticado",
  "data": {
    "user": {
      "id": 42,
      "username": "cmendez",
      "email": "carlos@example.com",
      "profile_photo_url": "https://example.com/foto.jpg"
    }
  }
}


// En caso de fallo
{
  "success": false,
  "message": "Credenciales inválidas",
  "data": {}
}

```
## 2. Registro de usuarios - POST
`/users/register`
```json
// api recibe
{
  "full_name": "Carlos Méndez",
  "username": "cmendez",
  "email": "carlos@example.com",
  "password": "segura123",
  "profile_photo_url": "https://example.com/foto.jpg",
  "favorite_genres": [1, 3, 7]
}



// api - devuelve
// En caso de exito
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user_id": 42
  }
}


// En caso de fallo
{
  "success": false,
  "message": "El nombre de usuario o correo ya está en uso",
  "data": {}
}
```
## 3. Obtener datos de peliculas - GET
`/users/movies`
`/users/movies?genre_id=3`
`/users/movies?genre_id=3&release_year=2022`
`/users/movies?genre_id=3&release_year=2022&title=Matrix`
```json
// api devuelve
{
  "success": true,
  "message": "Películas obtenidas",
  "data": {
    "movies": [
      {
        "id": 12,
        "title": "Matrix Resurrections",
        "release_year": 2022,
        "cover_url": "https://example.com/matrix.jpg",
        "average_rating": 4.2,
        "review_count": 87
      }
    ]
  }
}

```
## 3. Publicar reseña - POST
``/users/reviews`
```json
// api recibe
{
  "user_id": 42,
  "movie_id": 12,
  "rating": 5,
  "review_text": "Me mantuvo en suspenso todo el tiempo",
  "sentiment": "positivo",
  "emotion_ids": [1, 6]
}

// api devuelve
{
  "success": true,
  "message": "Reseña guardada",
  "data": {}
}
```
## 4. Agregar a favoritos - POST
`/users/favorites`
```json
// api recibe
{
  "user_id": 42,
  "movie_id": 12
}

// api devuelve
{
  "success": true,
  "message": "Película marcada como favorita",
  "data": {}
}

```
## 4. Agregar pelicula vista - POST
`/users/watched`
```json
// api recibe
{
  "user_id": 42,
  "movie_id": 12
}

// api devuelve
{
  "success": true,
  "message": "Película marcada como vista",
  "data": {}
}

```
## 5. Perfil de usuario - GET
``/users/profile/:id`
Ejemplo 
``/users/profile/42`
```json
// api devuelve
{
  "success": true,
  "message": "Perfil obtenido",
  "data": {
    "user": {
      "full_name": "Carlos Méndez",
      "username": "cmendez",
      "email": "carlos@example.com",
      "profile_photo_url": "https://example.com/foto.jpg",
      "created_at": "2025-10-27T18:00:00.000Z"
    },
    "favorites": [
      { "movie_id": 12 }
    ],
    "watched": [
      { "movie_id": 12, "watched_at": "2025-10-27T19:00:00.000Z" }
    ],
    "reviews": [
      {
        "movie_id": 12,
        "rating": 5,
        "review_text": "Me mantuvo en suspenso todo el tiempo"
      }
    ]
  }
}

```
## 6. Listar emociones (para rellenar dropdowns) - GET
`/users/emotions`
```json
// api devuelve
{
  "success": true,
  "message": "Lista de emociones obtenida",
  "data": {
    "emotions": [
      { "id": 1, "name": "Emocionante" },
      { "id": 2, "name": "Triste" },
      { "id": 3, "name": "Inspiradora" }
    ]
  }
}
```
## 7. Listar Generos (para rellenar dropdowns) - GET
`/users/genres`
```json
// api devuelve
{
  "success": true,
  "message": "Lista de géneros obtenida",
  "data": {
    "genres": [
      { "id": 1, "name": "Acción" },
      { "id": 2, "name": "Aventura" },
      { "id": 3, "name": "Comedia" }
    ]
  }
}

```
## 8. Registrar una nueva pelicula - POST
`/users/movies`
```json
// api recibe
{
  "title": "Interstellar",
  "release_year": 2014,
  "cover_url": "https://example.com/interstellar.jpg",
  "genre_ids": [5, 6, 14]
}

// api devuelve
{
  "success": true,
  "message": "Película registrada exitosamente",
  "data": {
    "movie_id": 101
  }
}

```