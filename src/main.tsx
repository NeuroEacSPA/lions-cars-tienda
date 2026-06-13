import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { carService } from './services/api';
import './index.css';

// ─────────────────────────────────────────────────────────────
// Componente puente para la ruta VIEJA /vehiculo/:id
// Busca el slug del auto y redirige a /autos/:slug
// Mantiene compatibilidad con links anteriores que ya circulan
// ─────────────────────────────────────────────────────────────
function RedirectById() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) { navigate('/', { replace: true }); return; }

    carService.getById(Number(id))
      .then(car => {
        if (car?.slug) {
          // Redirigir permanentemente a la URL con slug (SEO)
          navigate(`/autos/${car.slug}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      })
      .catch(() => navigate('/', { replace: true }));
  }, [id, navigate]);

  // Pantalla de carga mientras redirige
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#E8B923] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#E8B923] font-bold text-sm animate-pulse">Redirigiendo...</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RUTAS
//
//  /                    → catálogo principal
//  /autos/:slug         → ficha de vehículo por slug (SEO, la nueva)
//  /vehiculo/:id        → redirige a /autos/:slug (compatibilidad)
// ─────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Catálogo */}
          <Route path="/" element={<App />} />

          {/* Ficha por slug — la que Google va a indexar */}
          <Route path="/autos/:slug" element={<App />} />

          {/* Fallback para links viejos — redirige al slug */}
          <Route path="/vehiculo/:id" element={<RedirectById />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);