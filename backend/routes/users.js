import { Router } from "express";
import pool from "../db.js";
import md5 from "md5";
import { makeResponse } from "../utils/response.js";

const router = Router();

/**
 * Login de usuario
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return makeResponse(res, false, "username y password son requeridos");
    }

    const password_hash = md5(password);
    const [rows] = await pool.query(
      `SELECT id, username, email, profile_photo_url
       FROM users
       WHERE (username = ? OR email = ?) AND password_hash = ?`,
      [username, username, password_hash]
    );

    if (rows.length === 0) {
      return makeResponse(res, false, "Credenciales inválidas");
    }

    return makeResponse(res, true, "Usuario autenticado", { user: rows[0] });
  } catch (err) {
    return makeResponse(res, false, `Error en login: ${err.message}`, 500);
  }
});

/**
 * Registro de usuario
 */
router.post("/register", async (req, res) => {
  try {
    const { full_name, username, email, password, profile_photo_url, favorite_genres } = req.body;

    if (!full_name || !username || !email || !password) {
      return makeResponse(res, false, "Campos obligatorios: full_name, username, email, password");
    }

    // Verificar si el username o email ya existen
    const [existing] = await pool.query(
      `SELECT id FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );

    if (existing.length > 0) {
      return makeResponse(res, false, "El nombre de usuario o correo ya están registrados");
    }

    const password_hash = md5(password);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, username, email, password_hash, profile_photo_url)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, username, email, password_hash, profile_photo_url]
    );

    const user_id = result.insertId;

    if (Array.isArray(favorite_genres)) {
      const values = favorite_genres.map(genre_id => [user_id, genre_id]);
      await pool.query(`INSERT INTO user_favorite_genres (user_id, genre_id) VALUES ?`, [values]);
    }

    return makeResponse(res, true, "Usuario registrado exitosamente", { user_id });
  } catch (err) {
    return makeResponse(res, false, `Error al registrar usuario: ${err.message}`, 500);
  }
});


// Obtener Peliculas
router.get("/movies", async (req, res) => {
  try {
    const { release_year, title, rating_min, rating_max, genre_ids } = req.query;

    let query = `
      SELECT 
        m.id, 
        m.title, 
        m.release_year, 
        m.cover_url,
        ROUND(AVG(r.rating), 2) AS average_rating,
        COUNT(r.id) AS review_count,
        GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genres
      FROM movies m
      LEFT JOIN reviews r ON m.id = r.movie_id
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (release_year) {
      query += " AND m.release_year = ?";
      params.push(release_year);
    }

    if (title) {
      query += " AND m.title LIKE ?";
      params.push(`%${title}%`);
    }

    if (rating_min) {
      query += " AND (SELECT AVG(r2.rating) FROM reviews r2 WHERE r2.movie_id = m.id) >= ?";
      params.push(rating_min);
    }

    if (rating_max) {
      query += " AND (SELECT AVG(r2.rating) FROM reviews r2 WHERE r2.movie_id = m.id) <= ?";
      params.push(rating_max);
    }

    if (genre_ids) {
      const genreArray = Array.isArray(genre_ids) ? genre_ids : [genre_ids];
      const placeholders = genreArray.map(() => '?').join(',');
      query += ` AND m.id IN (
        SELECT movie_id FROM movie_genres WHERE genre_id IN (${placeholders})
        GROUP BY movie_id
        HAVING COUNT(DISTINCT genre_id) = ?
      )`;
      params.push(...genreArray, genreArray.length);
    }

    query += " GROUP BY m.id";

    const [rows] = await pool.query(query, params);
    return makeResponse(res, true, "Películas obtenidas", { movies: rows });
  } catch (err) {
    return makeResponse(res, false, `Error al obtener películas: ${err.message}`, 500);
  }
});

// Obtener una película por ID
router.get("/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener datos de la película
    const [movieRows] = await pool.query(`
      SELECT 
        m.id, 
        m.title, 
        m.release_year, 
        m.cover_url,
        ROUND(AVG(r.rating), 2) AS average_rating,
        COUNT(r.id) AS review_count
      FROM movies m
      LEFT JOIN reviews r ON m.id = r.movie_id
      WHERE m.id = ?
      GROUP BY m.id
    `, [id]);

    if (movieRows.length === 0) {
      return makeResponse(res, false, "Película no encontrada", {}, 404);
    }

    const movie = movieRows[0];

    // Obtener géneros como arreglo
    const [genreRows] = await pool.query(`
      SELECT g.id, g.name
      FROM movie_genres mg
      JOIN genres g ON mg.genre_id = g.id
      WHERE mg.movie_id = ?
    `, [id]);

    movie.genres = genreRows;

    return makeResponse(res, true, "Película obtenida", { movie });
  } catch (err) {
    return makeResponse(res, false, `Error al obtener película: ${err.message}`, 500);
  }
});


// Agregar nueva película
router.post("/movies", async (req, res) => {
  try {
    const { title, release_year, cover_url, genre_ids } = req.body;

    if (!title || !release_year) {
      return makeResponse(res, false, "Campos obligatorios: title y release_year");
    }

    const [result] = await pool.query(
      `INSERT INTO movies (title, release_year, cover_url)
       VALUES (?, ?, ?)`,
      [title, release_year, cover_url]
    );

    const movie_id = result.insertId;

    if (Array.isArray(genre_ids) && genre_ids.length > 0) {
      const values = genre_ids.map(genre_id => [movie_id, genre_id]);
      await pool.query(`INSERT INTO movie_genres (movie_id, genre_id) VALUES ?`, [values]);
    }

    return makeResponse(res, true, "Película registrada exitosamente", { movie_id });
  } catch (err) {
    return makeResponse(res, false, `Error al registrar película: ${err.message}`, 500);
  }
});


// Registrar reseña de película
router.post("/reviews", async (req, res) => {
  try {
    const { user_id, movie_id, rating, review_text, sentiment, emotion_ids } = req.body;

    const query = `
      INSERT INTO reviews (user_id, movie_id, rating, review_text, sentiment)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text), sentiment = VALUES(sentiment)
    `;
    await pool.query(query, [user_id, movie_id, rating, review_text, sentiment]);

    const [reviewRow] = await pool.query(`SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?`, [user_id, movie_id]);
    const review_id = reviewRow[0].id;

    if (Array.isArray(emotion_ids)) {
      await pool.query(`DELETE FROM review_emotions WHERE review_id = ?`, [review_id]);
      const values = emotion_ids.map(emotion_id => [review_id, emotion_id]);
      await pool.query(`INSERT INTO review_emotions (review_id, emotion_id) VALUES ?`, [values]);
    }

    return makeResponse(res, true, "Reseña guardada");
  } catch (err) {
    return makeResponse(res, false, `Error al guardar reseña: ${err.message}`, 500);
  }
});

// Registrar película como favorita
router.post("/favorites", async (req, res) => {
  try {
    const { user_id, movie_id } = req.body;
    await pool.query(`INSERT IGNORE INTO favorites (user_id, movie_id) VALUES (?, ?)`, [user_id, movie_id]);
    return makeResponse(res, true, "Película marcada como favorita");
  } catch (err) {
    return makeResponse(res, false, `Error al guardar favorito: ${err.message}`, 500);
  }
});

// Registrar película como vista
router.post("/watched", async (req, res) => {
  try {
    const { user_id, movie_id } = req.body;
    await pool.query(`INSERT IGNORE INTO watched (user_id, movie_id) VALUES (?, ?)`, [user_id, movie_id]);
    return makeResponse(res, true, "Película marcada como vista");
  } catch (err) {
    return makeResponse(res, false, `Error al guardar vista: ${err.message}`, 500);
  }
});

// Perfil de usuario
router.get("/profile/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [user] = await pool.query(`SELECT full_name, username, email, profile_photo_url, created_at FROM users WHERE id = ?`, [user_id]);
    const [favorites] = await pool.query(`SELECT movie_id FROM favorites WHERE user_id = ?`, [user_id]);
    const [watched] = await pool.query(`SELECT movie_id, watched_at FROM watched WHERE user_id = ?`, [user_id]);
    const [reviews] = await pool.query(`SELECT movie_id, rating, review_text FROM reviews WHERE user_id = ?`, [user_id]);

    return makeResponse(res, true, "Perfil obtenido", {
      user: user[0],
      favorites,
      watched,
      reviews
    });
  } catch (err) {
    return makeResponse(res, false, `Error al obtener perfil: ${err.message}`, 500);
  }
});

// Obtener lista de emociones
router.get("/emotions", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name FROM emotions ORDER BY name ASC`);
    return makeResponse(res, true, "Lista de emociones obtenida", { emotions: rows });
  } catch (err) {
    return makeResponse(res, false, `Error al obtener emociones: ${err.message}`, 500);
  }
});

// Obtener lista de géneros
router.get("/genres", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name FROM genres ORDER BY name ASC`);
    return makeResponse(res, true, "Lista de géneros obtenida", { genres: rows });
  } catch (err) {
    return makeResponse(res, false, `Error al obtener géneros: ${err.message}`, 500);
  }
});




export default router;