import { Gastos } from '../models/Gastos.js';

export const getGastos = async (req, res) => {
    try {
        const gastosModel = new Gastos(req.app.get('db'));
        const gastos = await gastosModel.getAll();
        res.json(gastos);
    } catch (error) {
        console.error("Error en getGastos:", error);
        res.status(500).json({ error: 'Error interno del servidor al obtener los gastos.' });
    }
};

export const addGasto = async (req, res) => {
    const { descripcion, monto, categoria } = req.body;
    if (!descripcion || monto == null) {
        return res.status(400).json({ error: 'Descripción y monto son requeridos.' });
    }
    try {
        const gastosModel = new Gastos(req.app.get('db'));
        const nuevoGasto = await gastosModel.create(descripcion, parseFloat(monto), categoria);
        res.status(201).json(nuevoGasto);
    } catch (error) {
        console.error("Error en addGasto:", error);
        res.status(500).json({ error: 'Error interno del servidor al crear el gasto.' });
    }
};

export const deleteGasto = async (req, res) => {
    const { id } = req.params;
    try {
        const gastosModel = new Gastos(req.app.get('db'));
        const result = await gastosModel.delete(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado.' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error("Error en deleteGasto:", error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el gasto.' });
    }
};

export const updateGasto = async (req, res) => {
    const { id } = req.params;
    const { descripcion, monto, categoria } = req.body;

    if (!descripcion || monto == null) {
        return res.status(400).json({ error: 'Descripción y monto son requeridos.' });
    }

    try {
        const gastosModel = new Gastos(req.app.get('db'));
        const result = await gastosModel.update(id, descripcion, parseFloat(monto), categoria);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado.' });
        }
        res.json({ id, descripcion, monto, categoria });
    } catch (error) {
        console.error("Error en updateGasto:", error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el gasto.' });
    }
};