import React from "react"; // 1. Importamos useState

// Estilos inspirados en tu dashboard.ejs para mantener la consistencia
function DashboardPage() {

  return (
    <div>
      

      <div className="p-4 m-4 rounded-2xl bg-gray-200 ">
      <h2 className="font-extrabold text-3xl text-gray-900 mb-2">
        ¡Bienvenido a PreciosP!
    </h2>
    <p className="text-lg text-gray-700 mb-6">
        La herramienta esencial para fijar tus precios.
    </p>

    <p className="text-gray-700 mb-4">
        <span className="font-bold">¡Deja de adivinar el costo de tus productos!</span> En PreciosP, sabemos que
        dominar el precio de venta es la clave del éxito para cualquier
        negocio.
    </p>
    
    <p className="text-gray-700 mb-6">
        Hemos simplificado el proceso de fijación de precios para que puedas 
        calcular con precisión lo que realmente cuesta producir tu artículo y 
        determinar el margen de ganancia ideal.
    </p>
    
    {/* Contenedor para los beneficios, mejora la legibilidad */}
    <div className="mt-8">
        <h3 className="font-bold text-xl text-gray-800 mb-3">¿Qué puedes hacer en PreciosP?</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><span className="font-semibold">Calcula el Costo Real al Instante:</span> Ingresa todos tus ingredientes (o materiales) y sus respectivos costos.</li>
            <li><span className="font-semibold">Define tu Ganancia con Certeza:</span> Ingresa tu **porcentaje de ganancia deseado**, y te mostraremos el precio de venta final.</li>
            <li><span className="font-semibold">Maximiza tu Rentabilidad:</span> Toma decisiones inteligentes y asegura que cada venta te brinde el beneficio que mereces.</li>
        </ul>
    </div>
    
    <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
        Empieza a Calcular
    </button>
      </div>
    </div>
  );
}

export default DashboardPage;
