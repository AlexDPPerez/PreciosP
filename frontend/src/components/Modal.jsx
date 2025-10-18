import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, title, children, className = "" }) {
  // isMounted controla si el modal está en el DOM.
  // isRendered controla la animación de entrada/salida.
  const [isMounted, setIsMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Duración de la animación en milisegundos. Debe coincidir con el CSS.
  const ANIMATION_DURATION = 300;

  // Este useEffect gestiona el ciclo de vida de montaje y animación del modal
  useEffect(() => {
    if (isOpen) {
      // 1. Montar el componente en el DOM
      setIsMounted(true);
      // 2. Iniciar la animación de entrada después de un breve instante
      const renderTimer = setTimeout(() => {
        setIsRendered(true);
      }, 10); // Pequeño delay para que la transición de opacidad funcione

      return () => {
        clearTimeout(renderTimer);
      };
    } else {
      // Si el padre cierra el modal, iniciamos la animación de salida
      setIsRendered(false);
      // 3. Desmontar el componente del DOM después de que termine la animación
      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
      }, ANIMATION_DURATION);

      return () => {
        clearTimeout(unmountTimer);
      };
    }
  }, [isOpen]);

  // No renderizamos nada si el componente no está montado en el DOM
  if (!isMounted) {
    return null;
  }

  return createPortal(
    <>
      <div
        onClick={onClose} // Ahora llamamos a onClose directamente, el useEffect se encargará de la animación
        className={`fixed inset-0 bg-black/50 z-40 flex justify-center items-center transition-opacity duration-300 ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Contenedor del Modal: Usamos 'relative' y evitamos que el click se propague al overlay */}
        <div
          onClick={(e) => e.stopPropagation()} 
          className={`relative bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl p-4 sm:p-6 transition-all duration-300 flex flex-col ${className} ${
            isRendered ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <header className="flex justify-between items-center border-b pb-3">
            <h2 id="modal-title" className="text-xl font-bold text-gray-800">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            >
              &times;
            </button>
          </header>
          {/* Contenido principal del modal */}
          <main className="mt-4 flex-grow min-h-0 overflow-y-auto">{children}</main>
        </div>
      </div>
    </>,
    document.body // El modal se renderizará como un hijo directo del <body>
  );
}

export default Modal;
