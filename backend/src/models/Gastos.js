export class Gastos {
    constructor(db) {
      this.db = db;
    }
  
    async getAll() {
      return await this.db.all('SELECT * FROM gastos_fijos ORDER BY id DESC');
    }
  
    async create(descripcion, monto, categoria) {
      const result = await this.db.run(
        'INSERT INTO gastos_fijos (descripcion, monto, categoria) VALUES (?, ?, ?)',
        [descripcion, monto, categoria]
      );
      return { id: result.lastID, descripcion, monto, categoria };
    }
  
    async delete(id) {
      return await this.db.run('DELETE FROM gastos_fijos WHERE id = ?', [id]);
    }

    async update(id, descripcion, monto, categoria) {
        return await this.db.run(
          'UPDATE gastos_fijos SET descripcion = ?, monto = ?, categoria = ? WHERE id = ?',
          [descripcion, monto, categoria, id]
        );
      }
  }

 
  
