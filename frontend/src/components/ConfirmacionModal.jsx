import React from "react";
import Modal from "./Modal";
import Button from "./form/Button";

function ConfirmacionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Accion",
  message = "¿Estas seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) {
  return <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-gray-700">{message}</p>
    <div className="flex justify-end space-x-4 mt-6">
      <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
        {cancelText}
      </Button>
      <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
        {confirmText}
      </Button>
    </div>
  </Modal>;
}

export default ConfirmacionModal;
