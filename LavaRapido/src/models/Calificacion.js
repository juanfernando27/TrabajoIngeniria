class Calificacion {
  /**
   * Crea el registro de datos para la futura calificación.
   * @param {string} id - Identificador.
   * @param {string} reservaId - Reserva asociada.
   * @param {number} estrellas - Puntaje registrado.
   * @param {string} [comentario=''] - Comentario del cliente.
   * @returns {Calificacion} Registro inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(id, reservaId, estrellas, comentario = '') {
    Object.assign(this, { id, reservaId, estrellas, comentario });
  }
}

module.exports = Calificacion;
