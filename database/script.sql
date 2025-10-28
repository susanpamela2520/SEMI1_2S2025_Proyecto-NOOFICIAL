CREATE DATABASE cinematch;
USE cinematch;

CREATE TABLE genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  profile_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_favorite_genres (
  user_id INT,
  genre_id INT,
  PRIMARY KEY (user_id, genre_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (genre_id) REFERENCES genres(id)
);


CREATE TABLE movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  release_year INT,
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movie_genres (
  movie_id INT,
  genre_id INT,
  PRIMARY KEY (movie_id, genre_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (genre_id) REFERENCES genres(id)
);


CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  movie_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  sentiment VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE emotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE review_emotions (
  review_id INT,
  emotion_id INT,
  PRIMARY KEY (review_id, emotion_id),
  FOREIGN KEY (review_id) REFERENCES reviews(id),
  FOREIGN KEY (emotion_id) REFERENCES emotions(id)
);

CREATE TABLE favorites (
  user_id INT,
  movie_id INT,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE watched (
  user_id INT,
  movie_id INT,
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

INSERT INTO emotions (name) VALUES
('Emocionante'),
('Triste'),
('Inspiradora'),
('Divertida'),
('Romántica'),
('Tensa'),
('Reflexiva'),
('Aterradora'),
('Sorprendente'),
('Melancólica');


INSERT INTO genres (name) VALUES
('Acción'),
('Aventura'),
('Comedia'),
('Drama'),
('Fantasía'),
('Ciencia Ficción'),
('Terror'),
('Suspenso'),
('Romance'),
('Animación'),
('Documental'),
('Musical'),
('Crimen'),
('Misterio'),
('Histórico'),
('Deportes'),
('Guerra'),
('Western'),
('Superhéroes'),
('Familia');

