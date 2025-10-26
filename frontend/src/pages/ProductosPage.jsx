import React, { useEffect, useState } from "react";
import Tabla from "../components/Tabla";
import Button from "../components/form/Button";
import Modal from "../components/Modal";
import ProductosForm from "../components/ProductosForm";
import Notificacion from "../components/Notificacion";
import ConfirmacionModal from "../components/ConfirmacionModal";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import DetallesProducto from "../components/detallesProducto";

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  const [editProductData, setEditProductData] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [productoParaDetalles, setProductoParaDetalles] = useState(null); // Nuevo estado para el modal de detalles
  const [notificacion, setNotificacion] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/productos");
      if (!response.ok) {
        throw new Error("La respuesta de la red no fue correcta");
      }
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      setError("Error al cargar los productos: " + error.message);
      console.error("Error fetching productos:", error);
    } finally {
      setIsLoading(false); // Terminamos de cargar (con éxito o error)
    }
  };

  const handleEdit = async (producto) => {
    try {
      // 1. Fetch de los detalles completos del producto, incluyendo ingredientes
      const response = await fetch(`/api/productos/${producto.id}`);
      if (!response.ok) {
        throw new Error(
          "No se pudieron cargar los detalles del producto para editar."
        );
      }
      const productDetails = await response.json();

      // 2. Guardar los datos para la edición
      setEditProductData(productDetails);

      // 3. Abrir el modal
      setActiveModal("addProducto");
    } catch (error) {
      setError("Error al preparar la edición: " + error.message);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setTimeout(() => setEditProductData(null), 300);
  };

  // Funciones para el modal de detalles
  const handleVerDetalles = (producto) => {
    setProductoParaDetalles(producto);
  };

  const handleCerrarDetalles = () => {
    setProductoParaDetalles(null);
  };

  const handleDelete = (producto) => {
    setDeleteItem(producto);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch(`/api/productos/${deleteItem.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      setNotificacion({
        tipo: "success",
        texto: "Producto eliminado con éxito.",
      });
      fetchProductos();
    } catch (error) {
      setError("Error al eliminar: " + error.message);
    } finally {
      setDeleteItem(null);
    }
  };

  const columnasProductos = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "nombre" },
    {
      header: "Cantidad Lote",
      accessor: "cantidad_lote",
      cell: (valor) => `${(valor || 0).toFixed(0)}`,
    },
    {
      header: "Costo Lote",
      accessor: "costo_lote",
      cell: (valor) => `$${(valor || 0).toFixed(2)}`,
    },
    {
      header: "Costo Unidad (base)",
      accessor: "costo_unidad",
      cell: (valor) => `$${(valor || 0).toFixed(2)}`,
    },
    {
      header: "Cantidad por Paquete",
      accessor: "cantidad_paquete",
      cell: (valor) => (valor || 0).toFixed(0),
    },
    {
      header: "Total Paquetes",
      accessor: "total_paquetes",
      cell: (valor, fila) => {
        const cantidadLote = fila.cantidad_lote || 0;
        const cantidadPaquete = fila.cantidad_paquete || 1;
        const cantidadPaquetes =
          cantidadPaquete > 0 ? cantidadLote / cantidadPaquete : 0;
        return cantidadPaquetes.toFixed(0);
      }
    },
    {
      header: "Costo Paquete (base)",
      accessor: "costo_paquete",
      cell: (valor, fila) => {
        const costoUnidad = fila.costo_unidad || 0;
        const cantidadPaquete = fila.cantidad_paquete || 0;
        return `$${(costoUnidad * cantidadPaquete).toFixed(2)}`;
      },
    },
    {
      header: "Tiempo Producción (hrs)",
      accessor: "tiempo_produccion",
      cell: (valor) => (valor || 0).toFixed(0) + " hrs", 
    },
    {
      header: "Acciones",
      accessor: "acciones",
      cell: (valor, fila) => (
        <div className="flex space-x-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(fila);
            }}
            className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white"
            aria-label="Editar"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(fila);
            }}
            className="p-2 bg-red-600 hover:bg-red-700 text-white"
            aria-label="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ConfirmacionModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el producto "${deleteItem?.nombre}"?`}
      />
      {/* Renderizamos la notificación solo cuando el estado 'notificacion' no es null */}
      {notificacion && (
        <Notificacion
          notificacion={notificacion}
          onClear={() => setNotificacion(null)}
        />
      )}

      <Modal
        title={editProductData ? "Editar Producto" : "Añadir Producto"}
        isOpen={activeModal == "addProducto"}
        onClose={handleCloseModal}
        className="max-w-4xl h-screen-90"
      >
        {/* Pasamos la función para cerrar el modal al formulario */}
        <ProductosForm
          onClose={handleCloseModal}
          onProductAdded={() => {
            fetchProductos();
            handleCloseModal();
          }}
          productToEdit={editProductData}
        />
      </Modal>

      <Modal
        title={`Detalles de: ${productoParaDetalles?.nombre}`}
        isOpen={!!productoParaDetalles}
        onClose={handleCerrarDetalles}
      >
        <DetallesProducto product={productoParaDetalles} onClose={handleCerrarDetalles} />
      </Modal>

      <div className="p-4 sm:p-6 md:p-8">
        <Button
          onClick={() => setActiveModal("addProducto")}
          className="mb-4 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <PlusIcon className="h-5 w-5 inline-block mr-2" />
          Añadir producto
        </Button>
        <Tabla
          columnas={columnasProductos}
          data={productos}
          error={error}
          isLoading={isLoading}
          onRowClick={handleVerDetalles} // Pasamos la nueva función a la tabla
          rows={15}
        />
      </div>
    </div>
  );
}

export default ProductosPage;
