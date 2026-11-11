const { randomUUID } = require('node:crypto');
const { ErrorApp, HORA_MS, inicioTurno } = require('./reglas');

class CancelacionController {
  /**
   * Inicializa las reglas de cancelación y sus avisos.
   * @param {object} dependencias - Reservas, clientes, lavaderos, avisos y reloj.
   * @returns {CancelacionController} Controlador preparado.
   * @throws {never} Solo asigna dependencias.
   */
  constructor(dependencias) { Object.assign(this, dependencias); }

  /**
   * Calcula la ventana de cancelación con el reloj del servidor.
   * @param {object} reserva - Reserva almacenada.
   * @returns {object} Permiso y fecha límite ISO de cancelación.
   * @throws {ErrorApp} Si la fecha u hora almacenada no son válidas.
   */
  permiso(reserva) {
    const limite = inicioTurno(reserva.fecha, reserva.hora) - 2 * HORA_MS;
    return {
      puedeCancelar: ['RESERVADO', 'CONFIRMADO'].includes(reserva.estado) && this.ahora().getTime() <= limite,
      limiteCancelacion: new Date(limite).toISOString()
    };
  }

  /**
   * Cancela una reserva propia hasta exactamente dos horas antes.
   * @param {string} clienteId - Perfil de demostración seleccionado.
   * @param {string} id - Identificador de reserva.
   * @returns {object} Reserva cancelada y aviso registrado al lavadero.
   * @throws {ErrorApp} Si el perfil es inválido, la reserva es ajena o el plazo terminó.
   * @throws {Error} Si falla alguna escritura SQL.
   */
  cancelar(clienteId, id) {
    if (!this.clienteDAO.obtenerPorId(clienteId)) throw new ErrorApp(400, 'Selecciona un perfil de cliente válido.');
    const reserva = this.reservaDAO.obtenerTodos().find((r) => r.id === id && r.clienteId === clienteId);
    if (!reserva) throw new ErrorApp(404, 'No se encontró la reserva en tu perfil.');
    if (!['RESERVADO', 'CONFIRMADO'].includes(reserva.estado)) {
      throw new ErrorApp(409, 'Solo puedes cancelar reservas reservadas o confirmadas.');
    }
    if (!this.permiso(reserva).puedeCancelar) {
      throw new ErrorApp(409, 'La cancelación se permite hasta dos horas antes del turno. El plazo terminó.');
    }
    this.reservaDAO.actualizarEstado(id, 'CANCELADO');
    const aviso = this.notificacionDAO.guardar({
      id: randomUUID(), reservaId: id, lavaderoId: reserva.lavaderoId,
      creadoEn: this.ahora().toISOString(), tipo: 'CANCELACION_CLIENTE',
      mensaje: `El cliente canceló la reserva ${reserva.codigo} del ${reserva.fecha} a las ${reserva.hora}. El cupo quedó libre.`
    });
    return { reserva: Object.assign(reserva, { estado: 'CANCELADO' }), aviso };
  }

  /**
   * Obtiene los avisos simulados de un establecimiento.
   * @param {string} lavaderoId - Establecimiento seleccionado.
   * @returns {object[]} Notificaciones persistidas.
   * @throws {ErrorApp} Si no existe el establecimiento.
   * @throws {Error} Si falla SQLite.
   */
  avisos(lavaderoId) {
    this.lavaderos.obtener(lavaderoId);
    return this.notificacionDAO.obtenerPorLavadero(lavaderoId);
  }
}
module.exports = CancelacionController;
