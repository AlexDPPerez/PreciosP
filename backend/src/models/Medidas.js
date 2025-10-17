export class Medidas {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    return await this.db.all("SELECT * FROM medidas");
  }

  async seed() {
    // 1. Verificar si la tabla ya tiene datos para evitar duplicados.
    const existing = await this.db.get("SELECT COUNT(*) as count FROM medidas");
    if (existing.count > 0) {
      console.log("La tabla 'medidas' ya contiene datos. No se requiere seeding.");
      return; // No hacemos nada si ya hay datos.
    }

    // 2. Usar consultas preparadas para insertar los datos de forma segura.
    const stmt = await this.db.prepare(
      "INSERT INTO medidas (nombre, simbolo, base_conversion) VALUES (?, ?, ?)"
    );

    const medidasData = [
      ["Gramos", "G", 1],
      ["Kilogramos", "Kg", 1000],
      ["Mililitros", "Ml", 1],
      ["Litros", "L", 1000],
      ["Unidades", "U", 1],
    ];

    for (const medida of medidasData) {
      await stmt.run(medida);
    }

    await stmt.finalize();
    console.log("Seeding de la tabla 'medidas' completado.");
  }
}
