class Reserva {
  /**
   * Crea el registro de un turno.
   * @param {object} datos - Identificadores, fecha, hora, estado, código y copia del servicio.
   * @returns {Reserva} Registro inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(datos) {
    Object.assign(this, datos);
  }
}

Reserva.ESTADOS = Object.freeze({
  RESERVADO: 'RESERVADO',
  CONFIRMADO: 'CONFIRMADO',
  EN_PROCESO: 'EN_PROCESO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO'
});

module.exports = Reserva;
