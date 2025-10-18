import React, { useState, useEffect, useMemo } from "react";
import { PlusIcon, TrashIcon, InformationCircleIcon, PencilSquareIcon, CheckIcon } from "@heroicons/react/24/solid";
import Input from "../components/form/Input";
import Button from "../components/form/Button";
import Tabla from "../components/Tabla";
import Modal from "../components/Modal";
import Select from "../components/form/Select";
import ConfirmacionModal from "../components/ConfirmacionModal";
import Notificacion from "../components/Notificacion";

function GastosPage() {
  // Estado para los gastos, ahora viene de la API
  const [gastos, setGastos] = useState([]);
  // La producción mensual se puede quedar en localStorage, ya que es una configuración del usuario
  const [produccionMensual, setProduccionMensual] = useState(() => localStorage.getItem("produccionMensual") || "1000");
  const [horasTrabajoMensuales, setHorasTrabajoMensuales] = useState(() => localStorage.getItem("horasTrabajoMensuales") || "160");
  
  // Estados para UI (modales, notificaciones, etc.)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [form, setForm] = useState({ descripcion: "", monto: "", categoria: "Overhead" });
  const [editData, setEditData] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Cargar gastos desde la API al montar el componente
  useEffect(() => {
    fetchGastos();
  }, []);

  // Guardar configuraciones en localStorage cuando cambien y recalcular
  useEffect(() => {
    localStorage.setItem("produccionMensual", produccionMensual);
    localStorage.setItem("horasTrabajoMensuales", horasTrabajoMensuales);
    recalcularCostos();
  }, [produccionMensual, horasTrabajoMensuales, gastos]);

  const categoriasGastos = ["Overhead", "Mano de Obra", "Marketing", "Otros"];

  const fetchGastos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gastos');
      if (!response.ok) throw new Error('No se pudieron cargar los gastos.');
      const data = await response.json();
      setGastos(data);
    } catch (error) {
      console.error("Error fetching gastos:", error);
      // Aquí podrías mostrar una notificación de error al usuario
      setError("Error al cargar los gastos: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const recalcularCostos = () => {
    const totalesPorCategoria = gastos.reduce((acc, gasto) => {
      const monto = parseFloat(gasto.monto) || 0;
      acc[gasto.categoria] = (acc[gasto.categoria] || 0) + monto;
      return acc;
    }, {});
    
    const produccion = parseFloat(produccionMensual);
    const horas = parseFloat(horasTrabajoMensuales);

    // Tasa de Overhead por Unidad
    if (produccion > 0) {
      const costoOverhead = (totalesPorCategoria['Overhead'] || 0) / produccion;
      localStorage.setItem("tasaOverheadPorUnidad", costoOverhead);
    } else {
      localStorage.setItem("tasaOverheadPorUnidad", 0);
    }

    // Tasa por Hora de Trabajo
    if (horas > 0) {
      const costoManoObra = (totalesPorCategoria['Mano de Obra'] || 0) / horas;
      localStorage.setItem("tasaPorHoraTrabajo", costoManoObra);
    } else {
      localStorage.setItem("tasaPorHoraTrabajo", 0);
    }
  };

  const costosCalculados = useMemo(() => {
    const totales = gastos.reduce((acc, gasto) => {
      const monto = parseFloat(gasto.monto) || 0;
      acc.total += monto;
      acc[gasto.categoria] = (acc[gasto.categoria] || 0) + monto;
      return acc;
    }, { total: 0 });

    const produccion = parseFloat(produccionMensual) || 0;
    const horas = parseFloat(horasTrabajoMensuales) || 0;

    const tasaOverhead = produccion > 0 ? (totales['Overhead'] || 0) / produccion : 0;
    const tasaManoObra = horas > 0 ? (totales['Mano de Obra'] || 0) / horas : 0;

    return {
      totalGeneral: totales.total,
      tasaOverheadPorUnidad: tasaOverhead,
      tasaPorHoraTrabajo: tasaManoObra,
    };
  }, [gastos, produccionMensual, horasTrabajoMensuales]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editData;
    const url = isEditing ? `/api/gastos/${editData.id}` : "/api/gastos";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(`Error al ${isEditing ? 'actualizar' : 'añadir'} el gasto.`);
      
      setActiveModal(null);
      setNotificacion({
        tipo: "success",
        texto: `Gasto ${isEditing ? 'actualizado' : 'guardado'} con éxito.`,
      });

      if (isEditing) {
        setTimeout(() => setEditData(null), 300);
      }
      setForm({ descripcion: "", monto: "", categoria: "Overhead" });
      fetchGastos();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error al enviar el formulario: " + error.message);
    }
  };

  const handleEdit = (gasto) => {
    setEditData(gasto);
    setForm({ descripcion: gasto.descripcion, monto: gasto.monto, categoria: gasto.categoria || "Overhead" });
    setActiveModal("addGasto");
  };

  const handleDelete = (gasto) => {
    setDeleteItem(gasto);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      const response = await fetch(`/api/gastos/${deleteItem.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el gasto.');
      
      setNotificacion({
        tipo: "success",
        texto: "Gasto eliminado con éxito.",
      });
      fetchGastos();
    } catch (error) {
      console.error("Error deleting gasto:", error);
      setError("Error al eliminar: " + error.message);
    } finally {
      setDeleteItem(null);
    }
  };

  const columnasGastos = [
    { header: "ID", accessor: "id" },
    { header: "Descripción", accessor: "descripcion" },
    { header: "Categoría", accessor: "categoria" },
    { 
      header: "Monto Mensual", 
      accessor: "monto",
      cell: (valor) => `$${(parseFloat(valor) || 0).toFixed(2)}`
    },
    {
      header: "",
      accessor: "acciones",
      cell: (valor, fila) => (
        <div className="flex justify-end space-x-2">
          <Button onClick={() => handleEdit(fila)} className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white">
            <PencilSquareIcon className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleDelete(fila)} className="p-2 bg-red-600 hover:bg-red-700 text-white">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <ConfirmacionModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el gasto "${deleteItem?.descripcion}"?`}
      />

      {notificacion && (
        <Notificacion notificacion={notificacion} onClear={() => setNotificacion(null)} />
      )}

      <Modal
        isOpen={activeModal === "addGasto"}
        onClose={() => {
          setActiveModal(null);
          setTimeout(() => setEditData(null), 300);
          setForm({ descripcion: "", monto: "", categoria: "Overhead" });
        }}
        title={editData ? "Editar Gasto" : "Añadir Gasto"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descripción:"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
          <Input
            label="Monto Mensual:"
            type="number"
            name="monto"
            step="any"
            value={form.monto}
            onChange={handleChange}
            required
          />
          <Select
            label="Categoría:"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            required
          >
            {categoriasGastos.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Button type="submit">
            {editData ? <><CheckIcon className="h-5 w-5 inline mr-2" /> Guardar Cambios</> : <><PlusIcon className="h-5 w-5 inline mr-2" /> Añadir Gasto</>}
          </Button>
        </form>
      </Modal>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Gastos Fijos</h1>

      {/* Panel de Resumen y Cálculo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-lg shadow">
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Gastos Fijos Mensuales</h2>
            <p className="text-3xl font-mono font-bold text-gray-800">
              ${costosCalculados.totalGeneral.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <Input
            label="Producción Mensual (Unidades)"
            type="number"
            value={produccionMensual}
            onChange={(e) => setProduccionMensual(e.target.value)}
            placeholder="Ej: 1000"
          />
          <Input
            label="Horas de Trabajo Mensuales"
            type="number"
            value={horasTrabajoMensuales}
            onChange={(e) => setHorasTrabajoMensuales(e.target.value)}
            placeholder="Ej: 160"
            className="mt-2"
          />
        </div>
        <div className="bg-blue-500 text-white p-4 rounded-lg text-center flex flex-col justify-center">
          <h2 className="text-lg font-semibold">Tasa Overhead / Unidad</h2>
          <p className="text-3xl font-mono font-bold">${costosCalculados.tasaOverheadPorUnidad.toFixed(4)}</p>
          <p className="text-xs opacity-80 mt-1">Para costos generales (alquiler, luz).</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg text-center flex flex-col justify-center">
          <h2 className="text-lg font-semibold">Tasa Mano de Obra / Hora</h2>
          <p className="text-3xl font-mono font-bold">${costosCalculados.tasaPorHoraTrabajo.toFixed(2)}</p>
          <p className="text-xs opacity-80 mt-1">Para costos de producción directa.</p>
        </div>
      </div>

      <Button onClick={() => setActiveModal("addGasto")} className="mb-4 bg-indigo-600 hover:bg-indigo-700 text-white">
        <PlusIcon className="h-5 w-5 inline-block mr-2" />
        Añadir Gasto
      </Button>

      <Tabla
        columnas={columnasGastos}
        data={gastos}
        isLoading={isLoading}
        error={error}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        rows={15}
      />
    </div>
  );
}

export default GastosPage;
