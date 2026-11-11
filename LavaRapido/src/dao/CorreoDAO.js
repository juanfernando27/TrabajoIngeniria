class CorreoDAO {
  /**
   * Prepara el acceso al registro de avisos simulados.
   * @param {import('./BaseDatos')} baseDatos - Conexión compartida.
   * @returns {CorreoDAO} Repositorio preparado.
   * @throws {never} Solo asigna la dependencia.
   */
  constructor(baseDatos) {
    this.db = baseDatos.conexion;
  }

  /**
   * Obtiene los avisos guardados.
   * @returns {object[]} Registros de correo simulado.
   * @throws {Error} Si falla la consulta SQL.
   */
  obtenerTodos() {
    return this.db.prepare('SELECT * FROM correos ORDER BY rowid').all().map((fila) => ({
      id: fila.id, clienteId: fila.cliente_id, fechaEnvio: fila.fecha_envio, destino: fila.destino,
      asunto: fila.asunto, mensaje: fila.mensaje, estado: fila.estado
    }));
  }

  /**
   * Inserta un aviso asociado con una reserva existente.
   * @param {object} correo - Aviso construido por el controlador.
   * @returns {object} Aviso guardado.
   * @throws {Error} Si la reserva no existe o falla la escritura SQL.
   */
  guardar(correo) {
    this.db.prepare('INSERT INTO correos VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      correo.id, correo.clienteId, correo.fechaEnvio, correo.destino, correo.asunto, correo.mensaje, correo.estado
    );
    return correo;
  }
}

module.exports = CorreoDAO;
