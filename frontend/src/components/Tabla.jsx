import React, { useState } from "react";

function Tabla({ columnas, data, isLoading, handleEdit, handleDelete, error, rows }) {
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(rows); // Cantidad de elementos elegida por el usuario

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // "Cortamos" los datos para obtener solo los de la página actual
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  

  const handlePageChange = (pageNumber) => {
    // Nos aseguramos de no ir a páginas que no existen
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderContenido = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={columnas.length} className="text-center py-4">
            Cargando datos...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td
            colSpan={columnas.length}
            className="text-center py-4 text-red-500"
          >
            Error: {error}
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={columnas.length} className="text-center py-4">
            No hay datos para mostrar.
          </td>
        </tr>
      );
    }

    return currentItems.map((fila, index) => (
      <tr key={fila.id || index} className="border-b border-gray-200 md:hover:bg-gray-50">
        {columnas.map(col => (
          <td
            key={col.accessor}
            className="px-4 py-3 md:py-2 block md:table-cell relative md:before:content-none before:content-[attr(data-label)] before:absolute before:left-0 before:w-1/2 before:font-bold before:text-left text-right md:text-left"
            data-label={col.header}
            onClick={() => {
              // Permitir click para editar solo en modo tabla
              if (window.innerWidth > 768 && col.accessor !== 'acciones' && handleEdit) {
                handleEdit(fila);
              }
            }}
          >
            <span className="md:hidden" aria-hidden="true">{col.header === "" ? "" : ": "}</span>
            {col.cell
              ? col.cell(fila[col.accessor], fila, handleDelete)
              : fila[col.accessor]}
          </td>
        ))}
      </tr> 
    ));
  };

  const renderPaginacion = () => {
    if (isLoading || error) {
      return null;
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
        <div className="flex justify-between w-full items-center mt-4 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>

        {/* Cantidad de elementos */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
          <label htmlFor="" className="text-xs text-gray-500 text-center">Items por pagina</label>
          <input type="number" onChange={(e) => setItemsPerPage(e.target.value)} placeholder="15" className="border border-gray-500 rounded w-10" />
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto p-2 sm:p-4 bg-white rounded shadow">
      <table className="w-full border-collapse text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            {columnas.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 font-semibold text-gray-700 border-b border-gray-200"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderContenido()}</tbody>
      </table>
      {renderPaginacion()}
    </div>
  );
}

export default Tabla;
