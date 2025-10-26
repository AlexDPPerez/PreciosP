import { Ingredientes } from "../models/Ingredientes.js";

export const getIngredientes = async (req, res) => {
    const db = req.app.get('db');
    const ingredientesModel = new Ingredientes(db);
    try {
        const data = await ingredientesModel.getAll();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los ingredientes." });
    }
};

export const addIngredientes = async (req, res) => {
    const db = req.app.get('db');
    const ingredientesModel = new Ingredientes(db);
    try {
        const { nombre, id_medida, costo, costo_compra, cantidad_compra } = req.body;
        const nuevoIngrediente = await ingredientesModel.create(nombre, id_medida, costo, costo_compra, cantidad_compra);
        res.status(201).json({ message: "Ingrediente agregado con éxito", ingrediente: nuevoIngrediente });
    } catch (error) {
        console.error("Error al añadir ingrediente:", error);
        res.status(500).json({ error: "Error interno del servidor al añadir el ingrediente." });
    }
};

export const updateIngredientes = async (req, res) => {
    const db = req.app.get('db');
    const ingredientesModel = new Ingredientes(db);
    try {
        const { id } = req.params;
        const { nombre, id_medida, costo, costo_compra, cantidad_compra } = req.body;
        await ingredientesModel.update(id, nombre, id_medida, costo, costo_compra, cantidad_compra);
        res.status(200).json({ message: "Ingrediente actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar ingrediente:", error);
        res.status(500).json({ error: "Error interno del servidor al actualizar el ingrediente." });
    }
};

export const deleteIngredientes = async (req, res) => {
    const db = req.app.get('db');
    const ingredientesModel = new Ingredientes(db);
    try {
        const { id } = req.params;

        // Verificación de uso antes de eliminar
        const productosAfectados = await db.all(
            'SELECT id_producto FROM ingredientes_productos WHERE id_ingrediente = ?', [id]
        );

        if (productosAfectados.length > 0) {
            return res.status(409).json({ error: `No se puede eliminar. El ingrediente está en uso en ${productosAfectados.length} producto(s).` });
        }

        await ingredientesModel.delete(id);
        res.status(200).json({ message: "Ingrediente eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar ingrediente:", error);
        res.status(500).json({ error: "Error interno del servidor al eliminar el ingrediente." });
    }
};