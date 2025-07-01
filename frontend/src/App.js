import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VotacionesDeAdministrador from './pages/VotacionesDeAdministrador';  
import CrearVotacion from './pages/CrearVotacion';
import AdministrarVotacion from './pages/AdministrarVotacion';
import Home from './pages/Home';
import Login from './pages/Login';
import VotacionesDeVotante from './pages/VotacionesDeVotante'; 
import VotacionDetalleVotante from './pages/VotacionDetalleVotante'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Ruta para la página home */}
        <Route path="/home" element={<Home />} />
        {/* Ruta para la página de mis votaciones como administrador */}
        <Route path="/votaciones-de-administrador" element={<VotacionesDeAdministrador />} />
        {/* Ruta para la página de crear votación */}
        <Route path="/crear-votacion" element={<CrearVotacion />} />
        {/* Ruta para la página de administrar votación */}
        <Route path="/administrar-votacion/:direccionContrato" element={<AdministrarVotacion />} />
        {/* Ruta para la página de mis votaciones como votante */}
        <Route path="/votaciones-de-votante" element={<VotacionesDeVotante />} />
        {/* Ruta para la página de votar y ver resultados */}
        <Route path="/votar/:direccionContrato" element={<VotacionDetalleVotante />} />
      </Routes>
    </Router>
  );
}

export default App;

