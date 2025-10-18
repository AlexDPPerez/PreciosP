import {
  ScaleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  HomeIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";
import React from "react";
import { Link, useLocation } from "react-router-dom"; // 1. Importar Link y useLocation

function Navbar({ isOpen, setIsOpen }) {
  // Diccionario con las rutas que se generaran
  const rutas = {
    Inicio: { path: "/", icon: HomeIcon },
    Ingredientes: { path: "/ingredientes", icon: ShoppingCartIcon },
    Productos: { path: "/productos", icon: ShoppingBagIcon },
    Gastos: {
      name: "Gastos Fijos mensuales",
      path: "/gastos",
      icon: ArchiveBoxIcon,
    },
    Calcular: { path: "/calculadora", icon: ScaleIcon },
  };

  // 2. Obtenemos la ubicación actual con el hook useLocation
  const location = useLocation();

  return (
    <>
      {/* Overlay para cerrar el menú en móvil */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      <aside
        className={`bg-zinc-800 text-white w-64 space-y-6 py-7 px-2 fixed md:relative inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
      >
        <h1
          className="font-bold text-2xl text-center"
          onClick={() => setIsOpen(false)}
        >
          PreciosP
        </h1>
        <nav>
          {Object.entries(rutas).map(([nombre, info]) => {
            // 3. Comprobamos si la ruta del enlace es la ruta actual
            const isActive = location.pathname === info.path;

            return (
              <Link
                key={info.path}
                to={info.path}
                onClick={() => setIsOpen(false)}
                // 4. Aplicamos una clase diferente si el enlace está activo
                className={`text-sm block py-2.5 px-4 rounded-l-full transition-colors duration-200 ${
                  isActive ? "bg-gray-100 text-zinc-800" : "hover:bg-zinc-700"
                }`}
              >
                <info.icon className="h-5 w-5 inline-block mr-2 mb-1" />
                { info.name ? info.name : nombre}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Navbar;
