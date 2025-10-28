import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Frontend/login';
import Register from './Frontend/register';
import ResenasMovies from './Frontend/client/resenasMovie';
import RecomendacionEmocional from './Frontend/client/recomendacionEmocional';
import PosterRecognition from './Frontend/client/posterRecognition';
import Catalogo from './Frontend/client/catalogo';
import LecturaResenas from './Frontend/client/lecturaResenas';
import TraductorResenas from './Frontend/client/traductorResenas';
import Perfil from './Frontend/client/perfil';
import GestionUsuario from './Frontend/admin/GestionUsuario';
import ModeracionResena from './Frontend/admin/ModeracionResena';
import GestionPeliculas from './Frontend/admin/GestionPeliculas';


function App() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resenasMovie" element={<ResenasMovies />} />
        <Route path="/recomendacionEmocional" element={<RecomendacionEmocional />} />
        <Route path="/posterRecognition" element={<PosterRecognition />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/lecturaResenas" element={<LecturaResenas />} />
        <Route path="/traductorResenas" element={<TraductorResenas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/gestionUsuario" element={<GestionUsuario />} />
        <Route path="/moderacionResena" element={<ModeracionResena />} />
        <Route path="/gestionPeliculas" element={<GestionPeliculas />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;