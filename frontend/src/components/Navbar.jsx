import React from "react";
import { Link, useLocation } from "react-router-dom"; // 1. Importar Link y useLocation

function Navbar() {
  //Diccionario con las rutas que se generaran
  const rutas = {
    Inicio: "/",
    Ingredientes: "/ingredientes",
    Productos: "/productos",
    Calcular: "/calculadora",
  };

  // 2. Obtenemos la ubicación actual con el hook useLocation
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-zinc-800 text-white shadow-lg flex flex-col ">
      <h1 className="font-bold m-10 text-center">PreciosP</h1>

      <nav>
        {Object.entries(rutas).map(([nombre, path]) => {
          // 3. Comprobamos si la ruta del enlace es la ruta actual
          const isActive = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              // 4. Aplicamos una clase diferente si el enlace está activo
              className={`text-sm block py-2.5 ml-2 mt-2 px-4 rounded-l-4xl transition-colors ${
                isActive ? "bg-gray-100 text-zinc-800" : "hover:bg-zinc-700"
              }`}
            >
              {nombre}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Navbar;
