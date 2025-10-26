import React, { useEffect, useState } from "react";
import Input from "./form/Input";
import SearchableSelect from "./form/SearchableSelect";
import Button from "./form/Button";
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

function ProductosForm({ onClose, onProductAdded, productToEdit }) {
  const [ingrediente, setIngrediente] = useState({
    id: "",
    nombre: "",
  });
  // Estado para el nombre del producto y cantidad por lote
  const [productoInfo, setProductoInfo] = useState({
    nombre: "",
    cantidad_lote: "",
    cantidad_paquete: "",
    tiempo_produccion: "", // Nuevo campo
  });
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesData, setIngredientesData] = useState([]);
  const [costoLote, setCostoLote] = useState(0);
  const [costoUnidad, setCostoUnidad] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [costoPaquete, setCostoPaquete] = useState(0);
  const [cantidadPaquetes, setCantidadPaquetes] = useState(0);
  // Estado para manejar errores o estado de carga del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Definimos si estamos en modo edición en el scope del componente
  const isEditing = !!productToEdit;

  useEffect(() => {
    fetchIngredientes();
  }, []);

  // Efecto para poblar el formulario cuando estamos en modo edición
  useEffect(() => {
    if (productToEdit) {
      setProductoInfo({
        nombre: productToEdit.nombre,
        cantidad_lote: productToEdit.cantidad_lote,
        cantidad_paquete: productToEdit.cantidad_paquete || "",
        tiempo_produccion: productToEdit.tiempo_produccion || "",
      });
      setIngredientes(productToEdit.ingredientes || []);
    } else {
      // Limpiar el formulario si no hay producto para editar (modo creación)
      setProductoInfo({
        nombre: "",
        cantidad_lote: "",
        cantidad_paquete: "",
        tiempo_produccion: "",
      });
      setIngredientes([]);
    }
  }, [productToEdit]);

  const fetchIngredientes = async () => {
    try {
      const response = await fetch("/api/ingredientes");
      if (!response.ok) {
        throw new Error("La respuesta de la red no fue correcta");
      }
      const data = await response.json();
      console.log(data);
      setIngredientesData(data);
    } catch (error) {
      console.error("Error fetching ingredientes:", error);
    }
  };

  // Efecto para recalcular costos cuando los ingredientes o la cantidad del lote cambian
  useEffect(() => {
    const calcularCosto = () => {
      const costoTotal = ingredientes.reduce((total, ing) => {
        // 1. Obtenemos la cantidad ingresada por el usuario (ej: 50 para 50 Kg)
        const cantidadUsuario = parseFloat(ing.cantidad) || 0;
        // 2. Convertimos la cantidad a la unidad base (ej: 50 Kg -> 50 * 1000 = 50000 g)
        const cantidad = cantidadUsuario * (ing.base_conversion || 1);
        // 3. Multiplicamos la cantidad en la unidad base por el costo base
        return total + ing.costo * cantidad;
      }, 0);

      setCostoLote(costoTotal);

      const cantidadLote = parseFloat(productoInfo.cantidad_lote);
      if (cantidadLote > 0) {
        setCostoUnidad(costoTotal / cantidadLote);
      } else {
        setCostoUnidad(0);
      }

      const cantidadPaquete = parseFloat(productoInfo.cantidad_paquete);
      if (cantidadPaquete > 0) {
        setCantidadPaquetes(cantidadLote / cantidadPaquete);
        setCostoPaquete((costoTotal / cantidadLote) * cantidadPaquete);
      } else {
        setCostoPaquete(0);
      }
    };

    calcularCosto();
  }, [
    ingredientes,
    productoInfo.cantidad_lote,
    productoInfo.cantidad_paquete,
    productToEdit,
  ]);

  const addIngrediente = () => {
    if (
      !ingrediente.id ||
      ingredientes.some((ing) => ing.id === ingrediente.id)
    ) {
      // TODO: Mostrar una notificación al usuario
      console.warn("El campo está vacío o el ingrediente ya está incluido");
      return;
    }

    // Buscamos el ingrediente completo para tener todos sus datos
    const ingredienteCompleto = ingredientesData.find(
      (ingData) => ingData.id === ingrediente.id
    );
    if (!ingredienteCompleto) return;

    // Añadimos el ingrediente con una cantidad por defecto
    setIngredientes((prevIngredientes) => [
      ...prevIngredientes,
      {
        ...ingredienteCompleto, // Guardamos todos los datos: id, nombre, costo, simbolo, base_conversion
        cantidad: "", // La cantidad la introduce el usuario
      },
    ]);
    setIngrediente({ id: "", nombre: "" });
  };

  const handleAddIngrediente = (id) => {
    const ingredienteSeleccionado = ingredientesData.find(
      (ing) => ing.id == id
    );
    setIngrediente(ingredienteSeleccionado || { id: "", nombre: "" });
  };

  const handleChangeIngrediente = (index, cantidad) => {
    const nuevosIngredientes = [...ingredientes];
    nuevosIngredientes[index] = { ...nuevosIngredientes[index], cantidad };
    setIngredientes(nuevosIngredientes);
  };

  const handleDeleteIngrediente = (index) => {
    setIngredientes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeProducto = (e) => {
    const { name, value } = e.target;
    setProductoInfo({
      ...productoInfo,
      [name]: value,
    });
  };

  const nextStep = () => {
    // Validación para pasar al siguiente paso
    if (!productoInfo.nombre.trim() || !productoInfo.cantidad_lote) {
      setFormError("El nombre del producto y la cantidad por lote son obligatorios para continuar.");
      return;
    }
    setFormError(null);
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    // Validación básica
    if (!productoInfo.nombre.trim() || ingredientes.length === 0) {
      setFormError(
        "El nombre del producto y al menos un ingrediente son requeridos."
      );
      setIsSubmitting(false);
      return;
    }

    const url = isEditing
      ? `/api/productos/${productToEdit.id}`
      : "/api/productos";
    const method = isEditing ? "PUT" : "POST";

    const productoFinal = {
      nombre: productoInfo.nombre,
      // Convertimos a número antes de enviar
      cantidad_lote: parseFloat(productoInfo.cantidad_lote) || 0,
      costo_lote: costoLote,
      costo_unidad: costoUnidad,
      costo_paquete: costoPaquete,
      cantidad_paquete: parseFloat(productoInfo.cantidad_paquete) || 0,
      tiempo_produccion: parseFloat(productoInfo.tiempo_produccion) || 0,
      ingredientes: ingredientes.map(({ id, cantidad }) => ({
        id,
        cantidad: parseFloat(cantidad) || 0, // Convertimos a número aquí también
      })),
    };

    console.log(productoFinal);

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoFinal),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Error al ${isEditing ? "actualizar" : "crear"} el producto.`
        );
      }

      if (onProductAdded) {
        onProductAdded(); // Notificamos al padre que el producto fue añadido
      }
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 1. Usamos flexbox para la estructura principal y le damos una altura fija para que ocupe todo el modal.
    <form className="flex flex-col h-full" onSubmit={handleSubmit} noValidate>
      {/* Indicador de Pasos */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">Paso {currentStep} de 2</p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div className={`bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ${currentStep === 1 ? 'w-1/2' : 'w-full'}`}></div>
        </div>
      </div>

      {/* Contenedor principal que se expandirá */}
      <div className="flex-grow p-1 min-h-0 overflow-y-auto">
        {/* PASO 1: Datos del Producto */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <Input
              label="Nombre del Producto"
              name="nombre"
              value={productoInfo.nombre}
              onChange={handleChangeProducto}
              required
            />
            <Input
              label="Cantidad por Lote"
              name="cantidad_lote"
              type="number"
              value={productoInfo.cantidad_lote}
              onChange={handleChangeProducto}
              required
            />
            <Input
              label="Cantidad por Paquete"
              name="cantidad_paquete"
              type="number"
              value={productoInfo.cantidad_paquete}
              onChange={handleChangeProducto}
            />
            <Input
              label="Tiempo de Producción por Lote (horas)"
              name="tiempo_produccion"
              type="number"
              value={productoInfo.tiempo_produccion}
              onChange={handleChangeProducto}
            />
          </div>
        )}

        {/* PASO 2: Gestión de Ingredientes y Costos */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Columna Izquierda: Gestión de Ingredientes */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col min-h-0">
              <label htmlFor="nombre_ingrediente" className="text-sm font-semibold text-gray-700">
                Ingredientes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 items-center">
                <div className="sm:col-span-2">
                <SearchableSelect
                  value={ingrediente.id}
                  onChange={handleAddIngrediente}
                  placeholder="Busca un ingrediente..."
                  options={ingredientesData
                    .filter(
                      (ingData) => !ingredientes.some((ing) => ing.id === ingData.id)
                    )
                    .map((ing) => ({
                      value: ing.id,
                      label: ing.nombre,
                    }))}
                />
                </div>
                <Button
                  type="button"
                  onClick={addIngrediente}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white sm:col-span-1 w-full sm:w-auto p-2.5 flex justify-center items-center"
                  aria-label="Añadir ingrediente"
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-4 flex-grow min-h-0 overflow-y-auto pr-2 space-y-2">
                {ingredientes.map((ing, i) => (
                  <div key={ing.id + i} className="relative grid sm:grid-cols-3 gap-x-4 gap-y-2 items-center p-3 border border-gray-200 rounded-lg bg-white">
                    <div className="col-span-full text-gray-800 truncate font-medium">
                      {ing.nombre}
                    </div>
                    <div className="col-span-full sm:col-span-2 flex items-center space-x-2">
                      <input
                        type="number"
                        step="any"
                        onChange={(e) => handleChangeIngrediente(i, e.target.value)}
                        value={ing.cantidad || ""}
                        className="w-full max-w-[120px] border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Cant."
                      />
                      <span className="text-sm text-gray-500">{ing.nombre_medida}</span>
                    </div>
                    <div className="col-span-full text-xs text-gray-500 flex flex-wrap gap-x-2 items-center">
                      <span className="font-semibold">Costo Compra:</span>
                      <span>${(ing.costo_compra || 0).toFixed(2)} x {ing.cantidad_compra} {ing.simbolo_medida} |</span>
                      <span className="font-semibold">Costo Base:</span>
                      <span>${(ing.costo || 0).toFixed(4)} / {ing.simbolo_base} |</span>
                      <span className="font-semibold">Subtotal:</span>
                      <span className="font-bold text-gray-600">${((ing.costo || 0) * (ing.cantidad || 0) * (ing.base_conversion || 1)).toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteIngrediente(i)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      aria-label={`Eliminar ${ing.nombre}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Columna Derecha: Resumen de Costos */}
            <div className="bg-gray-100 p-4 rounded-lg space-y-3 flex flex-col">
              <h2 className="text-base lg:text-lg font-bold text-gray-800 border-b pb-2">Resumen de Costos</h2>
              <div className="flex-grow space-y-2 lg:space-y-4">
                <div>
                  <h3 className="text-sm lg:text-base font-semibold text-gray-600">Costo Total del Lote:</h3>
                  <p className="text-lg lg:text-xl font-mono text-gray-800">${(costoLote || 0).toFixed(2)}</p>
                </div>
                <div className="border-t pt-2 lg:pt-3">
                  <h3 className="text-base lg:text-lg font-bold text-gray-800">Costo por Unidad:</h3>
                  <p className="text-2xl lg:text-3xl font-mono font-bold text-indigo-600">${(costoUnidad || 0).toFixed(3)}</p>
                </div>
                <div className="border-t pt-2 lg:pt-3">
                  <h3 className="text-base lg:text-lg font-bold text-gray-800">Costo por Paquete:</h3>
                  <span className="text-gray-700">({cantidadPaquetes.toFixed(0)} Paquetes)</span>
                  <p className="text-2xl lg:text-3xl font-mono font-bold text-indigo-600">${(costoPaquete || 0).toFixed(3)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Muestra de errores del formulario */}
      {formError && (
        <div className="mt-2 text-center text-sm text-red-600">{formError}</div>
      )}

      {/* 3. Contenedor de botones: 'mt-auto' lo empuja al final del contenedor flex principal */}
      <div className="mt-auto pt-4 flex justify-between items-center">
        {/* Botón de Cancelar siempre visible a la izquierda */}
        <Button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
          <XMarkIcon className="h-5 w-5 inline mr-1" /> Cancelar
        </Button>

        {/* Botones de navegación y guardado a la derecha */}
        <div className="flex space-x-3">
          {currentStep === 2 && (
            <Button type="button" onClick={prevStep} className="bg-gray-500 hover:bg-gray-600 text-white">
              Atrás
            </Button>
          )}

          {currentStep === 1 && (
            <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Siguiente
            </Button>
          )}

          {currentStep === 2 && (
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                "Guardando..."
              ) : isEditing ? (
                <>
                  <CheckIcon className="h-5 w-5 inline mr-2" /> Guardar Cambios
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 inline mr-2" /> Añadir Producto
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
export default ProductosForm;
