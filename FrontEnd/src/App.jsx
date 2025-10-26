// App.jsx
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sobreNos" element={<SobreNos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Termos" element={<Termo />} />
      <Route path="/Privacidade" element={<Privacidade />} />
      <Route path="/DashBoard"element={<ProtectedRoute><DashBoard /></ProtectedRoute>}/>

    </Routes>
  );
}

export default App;
