import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    //</div> 1. Convertimos el contenedor principal en un flexbox
    <div className="flex min-h-screen">
      <Navbar />

      {/* 2. El contenido principal ahora crece para llenar el espacio restante */}
      <main className="flex-grow  bg-gray-100">
        {/* El contenido de cada página (Dashboard, Ingredientes, etc.) se renderizará aquí */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;