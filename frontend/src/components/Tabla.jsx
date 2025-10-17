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
      <tr
        key={fila.id || index}
        className="border-b border-gray-300 hover:bg-gray-200 cursor-pointer"
      >
        {columnas.map((col) => (
          <td key={col.accessor} className="px-4 py-2" onClick={() => col.accessor !== 'acciones' && handleEdit(fila)}>
            {/* Pasamos handleDelete a la celda de acciones */}
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
      <div className="flex justify-evenly">
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
        <div className="flex flex-col justify-end items-center gap-1 m-2"> 
          <label htmlFor="" className="text-xs text-gray-500 text-center">Items por pagina</label>
          <input type="number" onChange={(e) => setItemsPerPage(e.target.value)} placeholder="15" className="border border-gray-500 rounded w-10" />
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border border-gray-200 text-sm text-left">
        <thead className="bg-gray-200">
          <tr>
            {columnas.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 font-semibold text-gray-700 border-b border-gray-400"
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
