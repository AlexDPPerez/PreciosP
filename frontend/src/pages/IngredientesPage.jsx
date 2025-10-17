import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import Notificacion from "../components/Notificacion";
import Tabla from "../components/Tabla";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import Button from "../components/form/Button";
import ConfirmacionModal from "../components/ConfirmacionModal";

function IngredientesPage() {
  // lista de ingredientes y los datos del formulario
  const [medidas, setMedidas] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);

  // Estado para la carga de la tabla
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado para la carga

  const [error, setError] = useState(null);
  // Estado para el modal
  const [activeModal, setActiveModal] = useState(null);
  // Estado para las notificaciones
  const [notificacion, setNotificacion] = useState(null);

  // Estado con el contenido de el formulario
  const [form, setForm] = useState({
    nombre: "",
    id_medida: "1", // Valor por defecto
    costo: "", // Este será el costo final por unidad base (ej: por gramo)
  });

  // Estado para el helper de cálculo
  const [calculadora, setCalculadora] = useState({ costo_paquete: "", cantidad_paquete: "" });

  // Estado para alojar la informacion de el contenido a editar
  const [editData, setEditData] = useState(null);

  const [deleteItem, setDeleteItem] = useState(null);

  // ? EFECTO Se ejecuta cuando el componente se monta por primera vez
  // * Hace la peticion a la API para obtener los ingredientes
  useEffect(() => {
    fetchIngredientes();
    fetchMedidas();
  }, []);

  /**
   * ? @function OBTENER DATOS: Llama a nuestra API de backend
   */
  const fetchIngredientes = async () => {
    try {
      setIsLoading(true); // Empezamos a cargar
      // Usamos '/api/ingredientes' gracias al proxy que configuraremos
      const response = await fetch("/api/ingredientes");
      if (!response.ok) {
        throw new Error("La respuesta de la red no fue correcta");
      }
      const data = await response.json();
      setIngredientes(data);
    } catch (error) {
      setError("Error al cargar los ingredientes: " + error.message);
      console.error("Error fetching ingredientes:", error);
    } finally {
      setIsLoading(false); // Terminamos de cargar (con éxito o error)
    }
  };

  /**
   * ? @function OBTENER DATOS: Llama a nuestra API para las unidades de medida
   */
  const fetchMedidas = async () => {
    try {
      // Usamos '/api/medidas' gracias al proxy
      const response = await fetch("/api/medidas");
      if (!response.ok) {
        throw new Error("La respuesta de la red no fue correcta");
      }
      const data = await response.json();
      setMedidas(data);
    } catch (error) {
      setError("Error al cargar las medidas: " + error.message);
      console.error("Error fetching medidas:", error);
    }
  };

  /**
   * ? @function Maneja los cambios de el formulario
   * @param {HTMLElement} e Input de el formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'costo_paquete' || name === 'cantidad_paquete') {
      setCalculadora(prev => ({ ...prev, [name]: value }));
    } else {
      // Siempre actualizamos el estado 'form' para los campos del ingrediente
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * ? @function @async Envia los datos de el formulario
   * @param {HTMLElement} e Input de el formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Determinamos la URL y el método según si estamos editando o creando
    const isEditing = !!editData;
    const url = isEditing
      ? `/api/ingredientes/${editData.id}`
      : "/api/ingredientes";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Ahora siempre usamos los datos del estado 'form'
          nombre: form.nombre,
          id_medida: parseInt(form.id_medida),
          // Siempre enviamos el costo calculado por unidad base
          costo: parseFloat(form.costo) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error al ${isEditing ? "actualizar" : "añadir"} el ingrediente`
        );
      }

      setActiveModal(null);
      setNotificacion({
        tipo: "success",
        texto: `Ingrediente ${
          isEditing ? "actualizado" : "guardado"
        } con éxito.`,
      });

      // Limpiamos los estados y volvemos a cargar la lista actualizada
      if (isEditing) {
        // Limpiamos el estado de edición después de un pequeño delay para la animación del modal
        setTimeout(() => setEditData(null), 300);
      }
      setForm({ nombre: "", id_medida: "1", costo: "" }); // Limpiamos form
      setCalculadora({ costo_paquete: "", cantidad_paquete: "" }); // Limpiamos la calculadora
      fetchIngredientes();
    } catch (error) {
      setError("Error al enviar el formulario: " + error.message);
      console.error("Error submitting form:", error);
    }
  };

  // Cuando se hace clic en "Editar", poblamos 'editData' y abrimos el modal.
  const handleEdit = (e) => {
    // 1. Guardamos los datos completos del ingrediente a editar
    //    'editData' ahora solo contiene el objeto original para referencia (como el ID)
    setEditData(e); 

    // 2. Pre-poblamos el estado 'form' con TODOS los datos del ingrediente.
    //    'form' se convierte en la única fuente de verdad para el formulario.
    setForm({
      nombre: e.nombre,
      id_medida: e.id_medida,
      costo: e.costo,
    });

    // 3. Pre-poblamos la calculadora para que el usuario pueda ajustar el precio de compra.
    //    Buscamos la medida correspondiente de forma segura para obtener el 'base_conversion'.
    const medidaDelIngrediente = medidas.find(m => m.id == e.id_medida);
    const factorConversion = medidaDelIngrediente ? medidaDelIngrediente.base_conversion : 1;
    const costoDeCompra = (e.costo || 0) * factorConversion;

    setCalculadora({
      costo_paquete: costoDeCompra.toFixed(6), // Usamos más decimales para precisión
      cantidad_paquete: "1", // Asumimos una cantidad de 1 para la unidad de compra (1 Kg, 1 L)
    });

    setActiveModal("addIngredientes");
  };

  /**
   * Funcion para manejar el evento de eliminar
   * @param {*number} id ID de el elemento al eliminar
   */
  const handleDelete = (ingrediente) => {
    setDeleteItem(ingrediente);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch(`/api/ingredientes/${deleteItem.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el ingrediente");
      }

      setNotificacion({
        tipo: "success",
        texto: "Ingrediente eliminado con éxito.",
      });

      fetchIngredientes(); // Recargamos la lista de ingredientes
    } catch (error) {
      setError("Error al eliminar: " + error.message);
      console.error("Error deleting ingredient:", error);
    } finally {
      setDeleteItem(null); // Cierra el modal de confirmación
    }
  };

  // Efecto para calcular el costo por unidad base (ej: por gramo)
  useEffect(() => {
    const costoPaquete = parseFloat(calculadora.costo_paquete);
    const cantidadPaquete = parseFloat(calculadora.cantidad_paquete) || 1; // Default a 1 para evitar división por 0

    // 1. Encontrar la medida seleccionada de forma segura
    const medidaSeleccionada = medidas.find(
      (m) => m.id == form.id_medida // Usamos siempre form.id_medida
    );
    
    // 2. Salir si no tenemos todos los datos necesarios
    if (!medidaSeleccionada || isNaN(costoPaquete)) {
      // Si no hay datos en la calculadora, el costo final es el que esté en el form (o vacío si es nuevo)
      // No hacemos nada para no borrar el valor al editar.
      return;
    }

    // 3. Calcular el costo por la unidad de compra (ej: costo por Kilo)
    const costoPorUnidadCompra = costoPaquete / cantidadPaquete;
    
    // 4. Convertir al costo por unidad base (ej: costo por Gramo)
    const costoFinalPorUnidadBase = costoPorUnidadCompra / medidaSeleccionada.base_conversion;

    // 5. Actualizar el estado 'form' que contiene el costo final
    setForm(f => ({ ...f, costo: costoFinalPorUnidadBase.toFixed(6) })); // Usar más decimales para precisión
  }, [calculadora, form.id_medida, medidas]);

  const columnasIngredientes = [
    { header: "ID", accessor: "id" },
    {
      header: "Nombre",
      accessor: "nombre",
    },
    {
      header: "Medida",
      accessor: "nombre_medida",
    },
    {
      header: "Costo de Compra",
      accessor: "costo",
      // La función 'cell' recibe el valor y la fila completa
      cell: (valor, fila) => {
        // Calculamos el costo en la unidad de medida del ingrediente (ej. por Kg)
        const costoDisplay = (valor || 0) * (fila.base_conversion || 1);
        // Si el costo es muy bajo (menor a $0.01), usamos 4 decimales. Si no, 2.
        const costoFormateado = costoDisplay < 0.01 ? costoDisplay.toFixed(4) : costoDisplay.toFixed(2);
        return `$${costoFormateado} / ${fila.simbolo_medida}`;
      },
    },
    {
      header: "Costo Base (Normalizado)",
      accessor: "costo",
      cell: (valor, fila) => {
        const simboloBase = fila.simbolo_medida === 'Kg' ? 'g' : (fila.simbolo_medida === 'L' ? 'ml' : fila.simbolo_medida);
        return `$${(valor || 0).toFixed(4)} / ${simboloBase}`;
      }
    },
    {
      header: "",
      accessor: "acciones",
      // La función 'cell' ahora recibe la fila completa como segundo argumento
      cell: (valor, fila) => (
        <div className="flex space-x-2">
         
          <Button
            onClick={(e) => {
              e.stopPropagation(); // ¡Esta es la clave! Detiene el burbujeo del evento.
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

  // 6. RENDERIZADO: El HTML (JSX) que se mostrará en pantalla
  return (
    <div>
      <ConfirmacionModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el ingrediente "${deleteItem?.nombre}"?`}
        confirmText="Sí, Eliminar"
      />

      {/* Renderizamos la notificación solo cuando el estado 'notificacion' no es null */}
      {notificacion && (
        <Notificacion
          notificacion={notificacion}
          onClear={() => setNotificacion(null)}
        />
      )}

      <Modal
        isOpen={activeModal == "addIngredientes"}
        onClose={() => (
          setActiveModal(null), setTimeout(() => setEditData(null), 300)
        )}
        title={editData ? "Editar Ingrediente" : "Añadir Ingrediente"}
        className="max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto p-6 space-y-4"
        >
          <Input
            label="Nombre:"
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <Select
            label="Unidad de Medida:"
            name="id_medida"
            value={form.id_medida}
            onChange={handleChange}
            required
          >
            {/* Renderizamos las opciones dinámicamente */}
            {medidas.map((medida) => (
              <option key={medida.id} value={medida.id}>
                {medida.nombre} ({medida.simbolo})
              </option>
            ))}
          </Select>

          {/* Helper para calcular el costo */}
          
            <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-3">
              <p className="text-sm font-semibold text-gray-600">Calculadora de Costo</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Costo del Paquete"
                  type="number"
                  name="costo_paquete"
                  step="any"
                  value={calculadora.costo_paquete}
                  onChange={handleChange}
                  placeholder="$"
                />
                <Input
                  label={`Cantidad (${medidas.find(m => m.id == form.id_medida)?.nombre || ''})`}
                  type="number"
                  name="cantidad_paquete"
                  step="any"
                  value={calculadora.cantidad_paquete}
                  onChange={handleChange}
                  placeholder="Ej: 1.5"
                />
              </div>
            </div>

          <Input
            label={`Costo por ${medidas.find(m => m.id == form.id_medida)?.simbolo_base || 'unidad'}`}
            type="number"
            name="costo"
            step="any"
            value={form.costo || ""} // El valor siempre viene del estado 'form' que es actualizado por el useEffect
            onChange={handleChange} // El onChange aquí no hace nada si es readOnly
            readOnly // Este campo es siempre de solo lectura
            required
          />

          <Button type="submit">
            {editData ? "Guardar Cambios" : "Añadir Ingrediente"}
          </Button>
        </form>
      </Modal>

      <div className="p-4">
        <Button
          onClick={() => setActiveModal("addIngredientes")}
          className="mb-4 bg-amber-600 text-amber-50"
        >
          Añadir Ingrediente
        </Button>

        {/* Pasamos los nuevos estados a la tabla */}
        <Tabla
          columnas={columnasIngredientes}
          data={ingredientes} // Pasamos solo los items de la página actual
          isLoading={isLoading}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          error={error}
          rows={15}
        />
      </div>
    </div>
  );
}

export default IngredientesPage;
