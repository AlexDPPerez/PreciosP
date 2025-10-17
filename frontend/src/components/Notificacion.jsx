import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function Notificacion({ notificacion, onClear }) {
  // Estado para controlar la animación de entrada/salida
  const [isRendered, setIsRendered] = useState(false);

  const { tipo, texto } = notificacion;

  const tiposNotificaciones = {
    success: {
      Estilos: "bg-green-100 border-green-400 text-green-700",
      Icono: "✓", // Un ícono más estándar
    },
    error: {
      Estilos: "bg-red-100 border-red-400 text-red-700",
      Icono: "✕", // Un ícono más estándar
    },
  };

  const config = tiposNotificaciones[tipo] || tiposNotificaciones.error;
  const TIEMPO_VISIBLE = 3000; // 3 segundos

  useEffect(() => {
    // 1. Iniciar animación de entrada
    setIsRendered(true);

    // 2. Configurar el temporizador para cerrar automáticamente
    const autoCloseTimer = setTimeout(() => {
      setIsRendered(false); // Iniciar animación de salida
      setTimeout(onClear, 500); // Limpiar estado del padre después de la animación
    }, TIEMPO_VISIBLE);

    // 3. Limpiar el temporizador si el componente se desmonta antes
    return () => {
      clearTimeout(autoCloseTimer);
    };
  }, [notificacion, onClear]); // Se ejecuta cada vez que llega una nueva notificación

  const handleClose = () => {
    setIsRendered(false);
    setTimeout(onClear, 500);
  };

  return createPortal(
    <div
      className={`fixed top-5 right-5 max-w-sm p-4 border rounded-lg shadow-lg flex items-center transition-all duration-500 ${
        config.Estilos
      } ${
        isRendered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
      role="alert"
    >
      <span className="text-2xl mr-3 font-bold">{config.Icono}</span>
      <p className="flex-grow">{texto}</p>
      <button onClick={handleClose} className="ml-4 text-xl leading-none">&times;</button>
    </div>,
    document.body
  );
}

export default Notificacion;