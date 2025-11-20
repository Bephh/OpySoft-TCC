import { Routes, Route } from 'react-router-dom';
import Inicio from './Inicio';
import SobreNos from './SobreNos';
import RegisterPage from './RegisterPage';
import './App.css';
import Login from './Login';
import Termo from './Termos';
import Privacidade from './Privacidade';
import DashBoard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
// Importa o componente Montados, necessário para o Dashboard carregar
import Montados from './pages/Montados';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sobreNos" element={<SobreNos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Termos" element={<Termo />} />
      <Route path="/Privacidade" element={<Privacidade />} />
      {/* Rotas Protegidas - DashBoard como container principal */}
      <Route path="/DashBoard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
      {/* Você pode adicionar rotas específicas se desejar no futuro, mas por enquanto, manteremos apenas o /DashBoard */}
    </Routes>
  );
}

export default App;