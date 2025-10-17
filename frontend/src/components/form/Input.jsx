import React from "react";

function Input({ label, name, error, ...props }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-gray-600 font-medium mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default Input;