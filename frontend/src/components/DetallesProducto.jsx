import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Button from "./form/Button";

function DetallesProducto({ product, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen'); // Estado para las pestañas en móvil

  useEffect(() => {
    if (!product?.id) return;

    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/productos/${product.id}`);
        if (!response.ok) {
          throw new Error("No se pudieron cargar los detalles del producto.");
        }
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product]);

  if (loading) {
    return <div className="p-6 text-center">Cargando detalles...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!details) {
    return null;
  }

  const totalPaquetes =
    details.cantidad_paquete > 0
      ? details.cantidad_lote / details.cantidad_paquete
      : 0;
  const costoPaquete = details.costo_unidad * details.cantidad_paquete;

  return (
    <div className="p-2">
      {/* Pestañas para la vista móvil */}
      <div className="block lg:hidden mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resumen'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('ingredientes')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ingredientes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ingredientes
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Resumen de Costos y Datos */}
        <div className={`bg-gray-100 p-4 rounded-lg space-y-4 ${activeTab === 'resumen' ? 'block' : 'hidden'} lg:block`}>
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
            Resumen del Producto
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Cantidad por Lote:</span>
              <span className="text-gray-800">{details.cantidad_lote}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Tiempo Producción:</span>
              <span className="text-gray-800">{details.tiempo_produccion || 0} hrs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Cantidad por Paquete:</span>
              <span className="text-gray-800">{details.cantidad_paquete || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total Paquetes:</span>
              <span className="text-gray-800">{totalPaquetes.toFixed(0)}</span>
            </div>
            
            <div className="border-t pt-3 mt-3 !space-y-1">
              <div className="flex justify-between items-baseline"><span className="font-semibold text-gray-600">Costo del Lote:</span><span className="font-mono text-gray-800">${(details.costo_lote || 0).toFixed(2)}</span></div>
              <div className="flex justify-between items-baseline"><span className="font-semibold text-gray-600">Costo por Unidad:</span><span className="font-mono font-bold text-indigo-600 text-lg">${(details.costo_unidad || 0).toFixed(3)}</span></div>
              <div className="flex justify-between items-baseline"><span className="font-semibold text-gray-600">Costo por Paquete:</span><span className="font-mono font-bold text-indigo-600 text-lg">${(costoPaquete || 0).toFixed(3)}</span></div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ingredientes */}
        <div className={`p-4 border border-gray-200 rounded-lg bg-gray-50 flex-col min-h-0 ${activeTab === 'ingredientes' ? 'flex' : 'hidden'} lg:flex`}>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Ingredientes</h3>
          <div className="flex-grow min-h-0 overflow-y-auto pr-2 space-y-2 max-h-[45vh]">
            {details.ingredientes.map((ing, i) => (
              <div key={ing.id + i} className="p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{ing.nombre}</span>
                  <span className="font-mono text-gray-700">
                    {ing.cantidad} {ing.nombre_medida}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Subtotal:{" "}
                  <span className="font-semibold">
                    ${((ing.costo || 0) * (ing.cantidad || 0) * (ing.base_conversion || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
             {details.ingredientes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Este producto no tiene ingredientes.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 text-right">
        <Button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
          <XMarkIcon className="h-5 w-5 inline mr-1" /> Cerrar
        </Button>
      </div>
    </div>
  );
}

export default DetallesProducto;