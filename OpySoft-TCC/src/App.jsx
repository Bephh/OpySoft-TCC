// App.jsx
import { Routes, Route } from 'react-router-dom';
import Inicio from './inicio';
import  SobreNos  from './SobreNos';
import RegisterPage from './RegisterPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sobreNos" element={<SobreNos/>} />
      {/* Você pode adicionar mais rotas aqui, como login, etc. */}
    </Routes>
  );
}

export default App;
