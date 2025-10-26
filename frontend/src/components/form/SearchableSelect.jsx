import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';

function SearchableSelect({ options, value, onChange, placeholder = "Selecciona una opción" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return options;
    }
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Hook para cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelectOption = (optionValue) => {
    onChange(optionValue);
    setSearchTerm('');
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={toggleOpen}
        className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
      >
        <span className="block truncate">{selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-0 bg-gray-100 px-3 py-1.5 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                className="relative cursor-default select-none py-2 px-4 text-gray-900 hover:bg-indigo-600 hover:text-white"
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
              No se encontraron resultados.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;

