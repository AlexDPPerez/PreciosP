import React from "react";

function Button({ children, className, ...props }) {
  // Clases base que todos los botones tendrán
  const baseClasses =
    "p-2 text-sm rounded cursor-pointer transition-all";

  // Si no se pasa un className, se usan los estilos por defecto. Si se pasa, se combinan.
  const finalClasses = `${baseClasses} ${
    className || "text-white bg-indigo-600 hover:bg-indigo-700"
  }`;

  return (
    <button {...props} className={finalClasses}>
      {children}
    </button>
  );
}

export default Button;
