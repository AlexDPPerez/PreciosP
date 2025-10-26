export class Productos {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    return await this.db.all(`
            SELECT * FROM productos
          `);
  }

  async getById(id) {
    const producto = await this.db.get('SELECT * FROM productos WHERE id = ?', [id]);
    if (!producto) return null;

    const ingredientes = await this.db.all(`
      SELECT 
        i.id, 
        i.nombre, 
        ip.cantidad, 
        i.costo,
        m.nombre as nombre_medida,
        i.costo_compra,
        i.cantidad_compra,
        m.simbolo as simbolo_medida,
        m.base_conversion
      FROM ingredientes_productos ip
      JOIN ingredientes i ON ip.id_ingrediente = i.id
      JOIN medidas m ON i.id_medida = m.id 
      WHERE ip.id_producto = ?
    `, [id]);

    producto.ingredientes = ingredientes;
    return producto;
  }

  async create(nombre, ingredientes, cantidad_lote, cantidad_paquete, tiempo_produccion) {
    try {
      // Iniciar transacción
      await this.db.exec('BEGIN TRANSACTION');

      // 1. Insertar el producto en la tabla 'productos' (sin costos, se calcularán después)
      const productoResult = await this.db.run(
        "INSERT INTO productos (nombre, costo_lote, costo_unidad, cantidad_lote, cantidad_paquete, tiempo_produccion) VALUES (?, ?, ?, ?, ?, ?)",
        [nombre, 0, 0, cantidad_lote, cantidad_paquete, tiempo_produccion] // Inicia costos en 0
      );

      const id_producto = productoResult.lastID;

      // 2. Preparar la consulta para insertar los ingredientes
      const stmt = await this.db.prepare(
        "INSERT INTO ingredientes_productos (id_producto, id_ingrediente, cantidad) VALUES (?, ?, ?)"
      );

      // 3. Iterar y ejecutar la inserción para cada ingrediente
      for (const ingrediente of ingredientes) {
        await stmt.run(id_producto, ingrediente.id, ingrediente.cantidad);
      }

      await stmt.finalize();

      // 4. Recalcular y guardar los costos correctos
      await this.recalculateAndUpdateCosts(id_producto);

      // Si todo fue bien, confirmar la transacción
      await this.db.exec('COMMIT');

      return await this.getById(id_producto); // Devolver el producto completo con costos calculados
    } catch (error) {
      // Si algo falla, revertir todos los cambios
      await this.db.exec('ROLLBACK');
      throw error; // Propagar el error para que el controlador lo maneje
    }
  }

  async update(id, nombre, ingredientes, cantidad_lote, cantidad_paquete, tiempo_produccion) {
    try {
      await this.db.exec('BEGIN TRANSACTION');

      // 1. Actualizar el producto
      await this.db.run(
        'UPDATE productos SET nombre = ?, costo_lote = ?, costo_unidad = ?, cantidad_lote = ?, cantidad_paquete = ?, tiempo_produccion = ? WHERE id = ?',
        [nombre, 0, 0, cantidad_lote, cantidad_paquete, tiempo_produccion, id] // Resetea costos antes de recalcular
      );

      // 2. Eliminar los ingredientes antiguos de este producto
      await this.db.run('DELETE FROM ingredientes_productos WHERE id_producto = ?', [id]);

      // 3. Insertar los nuevos ingredientes
      const stmt = await this.db.prepare(
        "INSERT INTO ingredientes_productos (id_producto, id_ingrediente, cantidad) VALUES (?, ?, ?)"
      );
      for (const ingrediente of ingredientes) {
        await stmt.run(id, ingrediente.id, ingrediente.cantidad);
      }
      await stmt.finalize();

      // 4. Recalcular y guardar los costos correctos
      await this.recalculateAndUpdateCosts(id);

      await this.db.exec('COMMIT');
      return await this.getById(id); // Devolver el producto completo con costos calculados
    } catch (error) {
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }

  async delete(id) {
    // La FK con ON DELETE CASCADE se encargará de la tabla de unión
    return await this.db.run('DELETE FROM productos WHERE id = ?', [id]);
  }

  async recalculateAndUpdateCosts(id_producto) {
    // 1. En una sola consulta, obtenemos la cantidad por lote del producto y calculamos el nuevo costo del lote.
    //    Usamos LEFT JOIN para asegurarnos de obtener el producto incluso si no tiene ingredientes.
    const result = await this.db.get(`
      SELECT 
        p.cantidad_lote,
        COALESCE(SUM(ip.cantidad * m.base_conversion * i.costo), 0) as nuevo_costo_lote
      FROM productos p
      LEFT JOIN ingredientes_productos ip ON p.id = ip.id_producto
      LEFT JOIN ingredientes i ON ip.id_ingrediente = i.id
      LEFT JOIN medidas m ON i.id_medida = m.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id_producto]);

    if (!result) return; // El producto no existe, no hacemos nada.

    const nuevoCostoLote = result.nuevo_costo_lote;
    const cantidadLote = result.cantidad_lote || 1; // Evitar división por cero
    const nuevoCostoUnidad = cantidadLote > 0 ? nuevoCostoLote / cantidadLote : 0;

    // 2. Actualizar el producto con los nuevos costos.
    await this.db.run(
      'UPDATE productos SET costo_lote = ?, costo_unidad = ? WHERE id = ?',
      [nuevoCostoLote, nuevoCostoUnidad, id_producto]
    );
  }
}
