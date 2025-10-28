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
    const { genre_id, release_year, title } = req.query;

    let query = `
      SELECT m.id, m.title, m.release_year, m.cover_url,
        (SELECT AVG(rating) FROM reviews WHERE movie_id = m.id) AS average_rating,
        (SELECT COUNT(*) FROM reviews WHERE movie_id = m.id) AS review_count
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      WHERE 1=1
    `;
    const params = [];

    if (genre_id) {
      query += " AND mg.genre_id = ?";
      params.push(genre_id);
    }
    if (release_year) {
      query += " AND m.release_year = ?";
      params.push(release_year);
    }
    if (title) {
      query += " AND m.title LIKE ?";
      params.push(`%${title}%`);
    }

    const [rows] = await pool.query(query, params);
    return makeResponse(res, true, "Películas obtenidas", { movies: rows });
  } catch (err) {
    return makeResponse(res, false, `Error al obtener películas: ${err.message}`, 500);
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