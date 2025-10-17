import { Productos } from "./Productos.js";

export class Ingredientes {
  constructor(db) {
    this.db = db;
    // Creamos una instancia del modelo de Productos para usar su método de recálculo
    this.productosModel = new Productos(db);
  }

  async getAll() {
    return await this.db.all(`
      SELECT i.id, i.nombre, i.costo, i.id_medida, m.nombre as nombre_medida, m.simbolo as simbolo_medida, m.base_conversion
      FROM ingredientes i
      JOIN medidas m ON i.id_medida = m.id
    `);
  }

  async create(nombre, id_medida, costo) {
    const result = await this.db.run(
      "INSERT INTO ingredientes (nombre, id_medida, costo) VALUES (?, ?, ?)",
      [nombre, id_medida, costo]
    );
    return { id: result.lastID, nombre, id_medida, costo };
  }

  async update(id, nombre, id_medida, costo) {
    try {
      await this.db.exec("BEGIN TRANSACTION");

      // 1. Actualizar el ingrediente
      await this.db.run(
        "UPDATE ingredientes SET nombre = ?, id_medida = ?, costo = ? WHERE id = ?",
        [nombre, id_medida, costo, id]
      );

      // 2. Encontrar todos los productos que usan este ingrediente
      const productosAfectados = await this.db.all(
        "SELECT id_producto FROM ingredientes_productos WHERE id_ingrediente = ?",
        [id]
      );

      // 3. Recalcular el costo para cada producto afectado
      for (const prod of productosAfectados) {
        await this.productosModel.recalculateAndUpdateCosts(prod.id_producto);
      }

      await this.db.exec("COMMIT");
    } catch (error) {
      await this.db.exec("ROLLBACK");
      throw error;
    }
  }

  async delete(id) {
    // Aquí también podrías añadir una lógica para advertir si el ingrediente está en uso.
    // Por ahora, lo dejamos simple.
    return await this.db.run("DELETE FROM ingredientes WHERE id = ?", [id]);
  }
}
