class Reclamo {
  /**
   * Crea el registro de datos para la futura atención de reclamos.
   * @param {string} id - Identificador.
   * @param {string} reservaId - Reserva asociada.
   * @param {string} detalle - Descripción del caso.
   * @param {string} fecha - Fecha de radicación.
   * @returns {Reclamo} Registro inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(id, reservaId, detalle, fecha) {
    Object.assign(this, { id, reservaId, detalle, fecha });
  }
}

module.exports = Reclamo;
