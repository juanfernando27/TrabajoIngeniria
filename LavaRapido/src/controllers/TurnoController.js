const { ErrorApp, diaDeFecha, fechaColombia } = require('./reglas');

class TurnoController {
  /**
   * Inicializa la gestión de turnos del establecimiento.
   * @param {object} lavaderos - Controlador de lavaderos.
   * @param {object} reservaDAO - Repositorio de reservas.
   * @param {Function} ahora - Reloj inyectable.
   * @returns {TurnoController} Controlador inicializado.
   * @throws {never} Solo asigna dependencias.
   */
  constructor(lavaderos, reservaDAO, ahora) {
    Object.assign(this, { lavaderos, reservaDAO, ahora });
  }

  /**
   * Lista los turnos de un establecimiento y fecha de Colombia.
   * @param {string} lavaderoId - Identificador del establecimiento.
   * @param {string} [fecha] - Fecha local; por defecto hoy.
   * @returns {object[]} Turnos ordenados por hora y creación.
   * @throws {ErrorApp} Si la fecha o establecimiento son inválidos.
   * @throws {Error} Si falla la lectura SQL.
   */
  listar(lavaderoId, fecha = fechaColombia(this.ahora())) {
    this.lavaderos.obtener(lavaderoId);
    diaDeFecha(fecha);
    return this.reservaDAO.obtenerTodos()
      .filter((r) => r.lavaderoId === lavaderoId && r.fecha === fecha)
      .sort((a, b) => a.hora.localeCompare(b.hora) || a.creadoEn.localeCompare(b.creadoEn));
  }

  /**
   * Confirma o cancela un turno del establecimiento indicado.
   * @param {string} lavaderoId - Establecimiento que gestiona el turno.
   * @param {string} id - Identificador de reserva.
   * @param {string} estado - CONFIRMADO o CANCELADO.
   * @returns {object} Reserva actualizada.
   * @throws {ErrorApp} Si la reserva no pertenece al lavadero o la transición es inválida.
   * @throws {Error} Si falla SQLite.
   */
  cambiarEstado(lavaderoId, id, estado) {
    this.lavaderos.obtener(lavaderoId);
    const reserva = this.reservaDAO.obtenerTodos().find((r) => r.id === id && r.lavaderoId === lavaderoId);
    if (!reserva) throw new ErrorApp(404, 'No se encontró el turno en este establecimiento.');
    const permitidos = { RESERVADO: ['CONFIRMADO', 'CANCELADO'], CONFIRMADO: ['CANCELADO'] };
    if (!permitidos[reserva.estado]?.includes(estado)) {
      throw new ErrorApp(409, 'El estado solicitado no está permitido para este turno.');
    }
    this.reservaDAO.actualizarEstado(id, estado);
    return Object.assign(reserva, { estado });
  }
}

module.exports = TurnoController;
