import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Bars3Icon } from '@heroicons/react/24/solid';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen md:flex">
      {/* Navbar (Sidebar) */}
      <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Contenido Principal */}
      <div className="flex-1">
        {/* Botón para móvil y header */}
        <div className="bg-zinc-800 text-gray-100 flex justify-end md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-4 focus:outline-none focus:bg-gray-700"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className=" h-full p-4 sm:p-6 md:p-8 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;