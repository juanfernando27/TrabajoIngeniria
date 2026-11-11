class RegistroDAO {
  /** @param {object} base - Conexión. @returns {RegistroDAO} Repositorio. @throws {never} Solo asigna. */
  constructor(base) { this.db = base.conexion; }
  /** @param {string} tipo - Colección. @returns {object[]} Registros. @throws {Error} Error SQL. */
  listar(tipo) { return this.db.prepare('SELECT datos FROM extension_registros WHERE tipo=? ORDER BY rowid').all(tipo).map(r => JSON.parse(r.datos)); }
  /** @param {string} tipo - Colección. @param {object} dato - Registro. @returns {object} Registro guardado. @throws {Error} Error SQL. */
  guardar(tipo, dato) {
    this.db.prepare('INSERT INTO extension_registros VALUES (?,?,?) ON CONFLICT(tipo,id) DO UPDATE SET datos=excluded.datos').run(tipo,dato.id,JSON.stringify(dato));
    return dato;
  }
}
module.exports = RegistroDAO;
