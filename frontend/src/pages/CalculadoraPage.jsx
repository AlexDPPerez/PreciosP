import React, { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Button from "../components/form/Button";
import Input from "../components/form/Input";

function CalculadoraPage() {
  // Estados para los datos
  const [productos, setProductos] = useState([]);

  // Estados para los parámetros de cálculo
  const [costoProduccionFijo, setCostoProduccionFijo] = useState("");
  const [costoEmpaquePorPaquete, setCostoEmpaquePorPaquete] = useState("");
  const [margenGanancia, setMargenGanancia] = useState(30);

  // Estados para la UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para cargar la lista de productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/productos");
        if (!response.ok) throw new Error("No se pudieron cargar los productos.");
        const data = await response.json();
        setProductos(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductos();
  }, []);

  // Lógica de cálculo
  const productosCalculados = useMemo(() => {
    // 2. Extraer valores de los inputs del usuario
    const costoFijo = parseFloat(costoProduccionFijo) || 0;
    const costoEmpaque = parseFloat(costoEmpaquePorPaquete) || 0;
    const margen = parseFloat(margenGanancia) || 0;

    return productos.map(producto => {
      // 1. Extraer valores base del producto
      const costoBaseLote = parseFloat(producto.costo_lote) || 0;
      const cantidadLote = parseFloat(producto.cantidad_lote) || 1;
      const cantidadPaquete = parseFloat(producto.cantidad_paquete) || 1;
      const cantidadPaquetesPorLote = cantidadLote > 0 && cantidadPaquete > 0 ? cantidadLote / cantidadPaquete : 0;
      const costoBasePaquete = producto.costo_unidad * cantidadPaquete;

      // 3. Calcular costos totales
      const costoTotalEmpaque = costoEmpaque * cantidadPaquetesPorLote;
      const costoTotalLote = costoBaseLote + costoFijo + costoTotalEmpaque;
      const costoTotalUnidad = cantidadLote > 0 ? costoTotalLote / cantidadLote : 0;
      const costoTotalPaquete = costoTotalUnidad * cantidadPaquete;

      // 4. Calcular precios de venta
      const precioVentaPaquete = costoTotalPaquete * (1 + margen / 100);

      return {
        ...producto,
        costoBasePaquete,
        costoTotalPaquete,
        precioVentaPaquete,
      };
    });
  }, [productos, costoProduccionFijo, costoEmpaquePorPaquete, margenGanancia]);

  const handleGeneratePdf = () => {
    // 1. Inicializar el documento PDF
    const doc = new jsPDF();

    // 2. Añadir título y fecha
    doc.setFontSize(18);
    doc.text("Reporte de Precios de Venta", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const date = new Date().toLocaleDateString("es-ES");
    doc.text(`Fecha de generación: ${date}`, 14, 30);

    // 3. Definir las columnas y filas para la tabla
    const tableColumn = ["Producto", "Costo Base (Paquete)", "Costo Total (Paquete)", "Precio Venta Sugerido"];
    const tableRows = [];

    productosCalculados.forEach(producto => {
      const productoData = [
        producto.nombre,
        `$${producto.costoBasePaquete.toFixed(2)}`,
        `$${producto.costoTotalPaquete.toFixed(2)}`,
        `$${producto.precioVentaPaquete.toFixed(2)}`
      ];
      tableRows.push(productoData);
    });

    // 4. Usar autoTable para dibujar la tabla
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35, // Posición inicial de la tabla
      headStyles: { fillColor: [75, 85, 99] }, // Color de cabecera (gris oscuro)
      styles: { font: "helvetica", fontSize: 10 },
      alternateRowStyles: { fillColor: [249, 250, 251] }, // Color de filas alternas
    });

    // 5. Guardar el PDF
    doc.save(`Reporte_Precios_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (isLoading) return <div className="p-4">Cargando productos...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Calculadora de Precios</h1>
        <Button onClick={handleGeneratePdf} className="bg-green-600 text-white">Generar PDF</Button>
      </div>

      {/* Panel de Parámetros Globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-lg shadow">
              <Input
                label="Costos Fijos de Producción (Gas, etc.)"
                type="number"
                step="any"
                value={costoProduccionFijo}
                onChange={(e) => setCostoProduccionFijo(e.target.value)}
                placeholder="Costo por lote de producción"
              />
              <Input
                label="Costo de Empaque (Bolsa, etiqueta, etc.)"
                type="number"
                step="any"
                value={costoEmpaquePorPaquete}
                onChange={(e) => setCostoEmpaquePorPaquete(e.target.value)}
                placeholder="Costo por cada paquete"
              />
              <Input
                label="Margen de Ganancia Deseado (%)"
                type="number"
                step="any"
                value={margenGanancia || 30}
                onChange={(e) => setMargenGanancia(e.target.value)}
                placeholder="Ej: 30 para 30%"
              />
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Base (Paquete)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Total (Paquete)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">Precio Venta Sugerido</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productosCalculados.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.costoBasePaquete.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">${p.costoTotalPaquete.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-green-700 bg-green-50">${p.precioVentaPaquete.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {productosCalculados.length === 0 && !isLoading && (
          <p className="text-center py-4 text-gray-500">No hay productos para mostrar.</p>
        )}
      </div>
    </div>
  );
}

export default CalculadoraPage;