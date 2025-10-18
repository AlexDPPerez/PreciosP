import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDB = async () => {
  const db = await open({
    filename: "./src/database.db",
    driver: sqlite3.Database,
  });

  await db.exec(`

  
    CREATE TABLE IF NOT EXISTS medidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      simbolo TEXT,
      base_conversion REAL
    );

    CREATE TABLE IF NOT EXISTS ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      id_medida INTEGER,
      costo REAL,
      FOREIGN KEY (id_medida) REFERENCES medidas(id)
    );

    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      cantidad_lote REAL,
      cantidad_paquete REAL,
      costo_lote REAL,
      costo_unidad REAL,
      tiempo_produccion REAL
    );

    CREATE TABLE IF NOT EXISTS ingredientes_productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_producto INTEGER,
      id_ingrediente INTEGER,
      cantidad REAL,
      FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
      FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id)
    );

    CREATE TABLE IF NOT EXISTS gastos_fijos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT NOT NULL,
      monto REAL NOT NULL,
      categoria TEXT
    );
  `);

  return db;
};
