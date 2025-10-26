import { Productos } from "../models/Productos.js";

export const getProductos = async (req,res) => {
    const db = req.app.get('db');
    const productosModel = new Productos(db);
    try{
        const data = await productosModel.getAll();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los productos." });
    }
}

export const getProductoById = async (req, res) => {
    const db = req.app.get('db');
    const productosModel = new Productos(db);
    try {
        const { id } = req.params;
        const producto = await productosModel.getById(id);
        if (producto) {
            res.json(producto);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto." });
    }
};

export const addProducto = async (req, res) => {
    const db = req.app.get('db');
    const productosModel = new Productos(db);
    try{
        // Recibimos el objeto completo desde el frontend
        const { nombre, ingredientes, cantidad_lote, cantidad_paquete, tiempo_produccion } = req.body;

        // Validamos que los ingredientes existan
        if (!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
            return res.status(400).json({ error: "Se requiere al menos un ingrediente." });
        }

        const nuevoProducto = await productosModel.create(nombre, ingredientes, cantidad_lote, cantidad_paquete, tiempo_produccion);
        res.status(201).json({ message: "Producto agregado con éxito", producto: nuevoProducto });
    } catch (error) {
     
        console.error("Error al añadir producto:", error); // Esto mostrará el error detallado en la consola del backend
        res.status(500).json({ error: "Error interno del servidor al añadir el producto.", details: error.message }); // Enviamos el mensaje de error al frontend
    }
}

export const updateProducto = async (req, res) => {
    const db = req.app.get('db');
    const productosModel = new Productos(db);
    try {
        const { id } = req.params;
        const { nombre, ingredientes, cantidad_lote, cantidad_paquete, tiempo_produccion } = req.body;

        if (!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
            return res.status(400).json({ error: "Se requiere al menos un ingrediente." });
        }

        const productoActualizado = await productosModel.update(id, nombre, ingredientes, cantidad_lote, cantidad_paquete, tiempo_produccion);
        res.status(200).json({ message: "Producto actualizado con éxito", producto: productoActualizado });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: "Error interno del servidor al actualizar el producto." });
    }
};

export const deleteProducto = async (req, res) => {
    const db = req.app.get('db');
    const productosModel = new Productos(db);
    try {
        const { id } = req.params;
        await productosModel.delete(id);
        res.status(200).json({ message: "Producto eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "Error interno del servidor al eliminar el producto." });
    }
};