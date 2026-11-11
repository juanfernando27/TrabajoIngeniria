const Cliente = require('../models/Cliente');

class ClienteDAO {
  /**
   * Prepara el acceso a perfiles de demostración.
   * @param {import('./BaseDatos')} baseDatos - Conexión compartida.
   * @returns {ClienteDAO} Repositorio preparado.
   * @throws {never} Solo asigna la dependencia.
   */
  constructor(baseDatos) {
    this.db = baseDatos.conexion;
  }

  /**
   * Obtiene los perfiles guardados.
   * @returns {Cliente[]} Perfiles disponibles.
   * @throws {Error} Si falla la consulta SQL.
   */
  obtenerTodos() {
    return this.db.prepare('SELECT * FROM clientes ORDER BY rowid').all()
      .map(({ id, nombre, correo }) => new Cliente(id, nombre, correo));
  }

  /**
   * Busca un perfil por identificador.
   * @param {string} id - Perfil seleccionado.
   * @returns {Cliente|null} Perfil o nulo.
   * @throws {Error} Si falla la consulta SQL.
   */
  obtenerPorId(id) {
    if (typeof id !== 'string') return null;
    const fila = this.db.prepare('SELECT * FROM clientes WHERE id=?').get(id);
    return fila ? new Cliente(fila.id, fila.nombre, fila.correo) : null;
  }

  /**
   * Inserta el perfil inicial si su identificador todavía no existe.
   * @param {Cliente} cliente - Registro inicial.
   * @returns {Cliente} Registro recibido.
   * @throws {Error} Si falla la escritura SQL.
   */
  guardar(cliente) {
    this.db.prepare('INSERT OR IGNORE INTO clientes VALUES (?, ?, ?)').run(cliente.id, cliente.nombre, cliente.correo);
    return cliente;
  }
}

module.exports = ClienteDAO;
