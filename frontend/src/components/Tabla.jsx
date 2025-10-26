import React, { useState, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Input from "./form/Input"; // Importamos el componente Input
import Button from "./form/Button";

function Tabla({
  columnas,
  data,
  isLoading,
  error,
  rows = 10,
  onRowClick, // Nueva prop para manejar el clic en la fila
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filtrar los datos según el término de búsqueda
  const filteredData = useMemo(() => {
    // Si no hay término de búsqueda, devolvemos todos los datos
    if (!searchTerm.trim()) {
      return data;
    }
    // Filtramos los datos. Para cada fila (item), comprobamos si alguno de sus valores
    // (convertido a string y a minúsculas) incluye el término de búsqueda.
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Efecto para resetear la página a 1 cuando la búsqueda cambia
  // Usamos un useMemo para recalcular y un useEffect para el efecto secundario
  React.useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // 2. Paginar sobre los datos ya filtrados
  const totalPages = Math.ceil(filteredData.length / rows);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rows;
    const endIndex = startIndex + rows;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rows]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-center p-4">Cargando datos...</div>;
  }

  if (data.length === 0 && !isLoading) {
    return <div className="text-center p-4 text-gray-500">No hay datos para mostrar.</div>;
  }

  return (
    <div className="overflow-x-auto">
      {/* Campo de Búsqueda */}
      <div className="mb-4 max-w-xs">
        <Input
          type="text"
          placeholder="Buscar en la tabla..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Vista de Tabla para Escritorio (md y superior) */}
      <table className="min-w-full bg-white hidden md:table">
        <thead className="bg-gray-50">
          <tr>
            {columnas.map((col) => (
              <th
                key={col.header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedData.map((fila, index) => (
            <tr
              key={fila.id || index}
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (onRowClick) onRowClick(fila);
              }}
            >
              {columnas.map((col) => (
                <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.cell ? col.cell(fila[col.accessor], fila) : fila[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Vista de Tarjetas para Móvil (hasta md) */}
      <div className="block md:hidden space-y-4">
        {paginatedData.map((fila, index) => (
          <div
            key={fila.id || index}
            className="bg-white p-4 rounded-lg shadow border border-gray-200"
            onClick={() => {
              if (onRowClick) onRowClick(fila);
            }}
          >
            {columnas.map((col) => {
              // No mostrar la columna de acciones como un campo más, se maneja por separado
              if (col.accessor === 'acciones') return null;
              
              return (
                <div key={col.accessor} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                  <span className="font-semibold text-sm text-gray-600">{col.header}</span>
                  <span className="text-sm text-gray-800 text-right">
                    {col.cell ? col.cell(fila[col.accessor], fila) : fila[col.accessor]}
                  </span>
                </div>
              );
            })}
            {/* Renderizar las acciones al final de la tarjeta */}
            {columnas.find(c => c.accessor === 'acciones') && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                {columnas.find(c => c.accessor === 'acciones').cell(null, fila)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje si la búsqueda no arroja resultados */}
      {filteredData.length === 0 && searchTerm && (
        <div className="text-center p-4 text-gray-500">No se encontraron resultados para "{searchTerm}".</div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Tabla;