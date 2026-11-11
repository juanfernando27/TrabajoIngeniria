class NotificacionDAO {
  /**
   * Prepara el acceso a notificaciones persistentes.
   * @param {object} baseDatos - Conexión SQLite compartida.
   * @returns {NotificacionDAO} Repositorio inicializado.
   * @throws {never} Solo asigna la conexión.
   */
  constructor(baseDatos) { this.db = baseDatos.conexion; }

  /**
   * Inserta un aviso validado por el controlador.
   * @param {object} aviso - Identificadores, tipo, mensaje y fecha ISO.
   * @returns {object} Aviso persistido.
   * @throws {Error} Si falla la escritura SQL.
   */
  guardar(aviso) {
    this.db.prepare('INSERT INTO notificaciones VALUES (?, ?, ?, ?, ?, ?)').run(
      aviso.id, aviso.reservaId, aviso.lavaderoId, aviso.creadoEn, aviso.tipo, aviso.mensaje
    );
    return aviso;
  }

  /**
   * Consulta avisos de un establecimiento, del más reciente al más antiguo.
   * @param {string} lavaderoId - Identificador del establecimiento.
   * @returns {object[]} Avisos almacenados.
   * @throws {Error} Si falla la consulta SQL.
   */
  obtenerPorLavadero(lavaderoId) {
    return this.db.prepare('SELECT * FROM notificaciones WHERE lavadero_id=? ORDER BY creado_en DESC, rowid DESC')
      .all(lavaderoId).map((fila) => ({ id: fila.id, reservaId: fila.reserva_id,
        lavaderoId: fila.lavadero_id, creadoEn: fila.creado_en, tipo: fila.tipo, mensaje: fila.mensaje }));
  }
}
module.exports = NotificacionDAO;
