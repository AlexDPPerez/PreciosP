import React, { useEffect, useState } from "react";
import Tabla from "../components/Tabla";
import Button from "../components/form/Button";
import Modal from "../components/Modal";
import ProductosForm from "../components/ProductosForm";
import Notificacion from "../components/Notificacion";
import ConfirmacionModal from "../components/ConfirmacionModal";

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
 
  const [editProductData, setEditProductData] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
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
        throw new Error("No se pudieron cargar los detalles del producto para editar.");
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
    // Limpiamos los datos de edición al cerrar para que la próxima vez sea un formulario de creación
    // El timeout espera a que la animación del modal termine.
    setTimeout(() => setEditProductData(null), 300);
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
      header: "Costo Lote",
      accessor: "costo_lote",
      cell: (valor) => `$${(valor || 0).toFixed(2)}`,
    },
    {
      header: "Costo Unidad",
      accessor: "costo_unidad",
      cell: (valor) => `$${(valor || 0).toFixed(2)}`,
    },
    {
      header: "Acciones",
      accessor: "acciones",
      cell: (valor, fila) => (
        <div className="flex space-x-2">
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(fila);
            }}
            className="font-black text-gray-800 bg-gray-200 hover:bg-red-600 hover:text-gray-100"
          >
            X
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
        className="max-w-4xl h-[80vh]" // <-- Añadimos una altura del 80% del viewport height
      >
        {/* Pasamos la función para cerrar el modal al formulario */}
        <ProductosForm 
          onClose={handleCloseModal} 
          onProductAdded={() => { fetchProductos(); handleCloseModal(); }}
          productToEdit={editProductData}
        />
      </Modal>

      <div className="p-4">
        <Button
          onClick={() => setActiveModal("addProducto")}
          className="mb-4 bg-amber-600 text-amber-50"
        >
          Añadir producto
        </Button>
        <Tabla
          columnas={columnasProductos}
          data={productos}
          error={error}
          isLoading={isLoading}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          rows={15}
        />
      </div>
    </div>
  );
}

export default ProductosPage;
