// frontend/src/App.jsx
import React, { useEffect } from 'react';
import CarruselJuegos from './components/CarruselJuegos';
import './styles/App.css'; // Aquí ya actúa el CSS que pusiste antes

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme && savedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);
  return (
    <div className="app-container">
      <CarruselJuegos />
    </div>
  );
}

export default App;