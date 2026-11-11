const Reserva = require('../models/Reserva');
const {
  ErrorApp, HORA_ENTERA, normalizarAgenda, diaDeFecha, inicioTurno, fechaColombia, dentroDeJornada
} = require('./reglas');

class AgendaController {
  /**
   * Inicializa las operaciones de agenda.
   * @param {import('./LavaderoController')} lavaderos - Controlador de establecimientos.
   * @param {import('../dao/LavaderoDAO')} lavaderoDAO - Repositorio de establecimientos.
   * @param {import('../dao/MemoriaDAO')} reservaDAO - Repositorio de turnos.
   * @param {() => Date} ahora - Reloj de la aplicación.
   * @returns {AgendaController} Controlador inicializado.
   * @throws {never} El constructor solo asigna dependencias.
   */
  constructor(lavaderos, lavaderoDAO, reservaDAO, ahora) {
    Object.assign(this, { lavaderos, lavaderoDAO, reservaDAO, ahora });
  }

  /**
   * Guarda una agenda que conserva los turnos futuros existentes.
   * @param {string} lavaderoId - Identificador del establecimiento.
   * @param {object} datos - Capacidad y semana de atención.
   * @returns {object} Lavadero con la agenda actualizada.
   * @throws {ErrorApp} Si la agenda es inválida o deja reservas sin cupo.
   */
  configurar(lavaderoId, datos) {
    const lavadero = this.lavaderos.obtener(lavaderoId);
    const agenda = normalizarAgenda(datos);
    const ahora = this.ahora().getTime();
    const ocupaciones = new Map();
    for (const reserva of this.reservasActivas(lavaderoId)) {
      const { fecha, hora } = reserva;
      if (inicioTurno(fecha, hora) <= ahora) continue;
      const clave = `${fecha}T${hora}`;
      const total = (ocupaciones.get(clave) ?? 0) + 1;
      ocupaciones.set(clave, total);
      if (!dentroDeJornada(agenda.horarios[diaDeFecha(fecha)], hora) || total > agenda.capacidad) {
        throw new ErrorApp(409, `El cambio dejaría reservas sin cupo el ${fecha} a las ${hora}.`);
      }
    }
    return this.lavaderoDAO.guardar(Object.assign(lavadero, agenda));
  }

  /**
   * Calcula los turnos de una fecha para un lavadero publicado.
   * @param {string} lavaderoId - Identificador del establecimiento.
   * @param {string} fecha - Fecha en formato AAAA-MM-DD.
   * @returns {object} Día consultado, indicador de cierre y turnos con cupos.
   * @throws {ErrorApp} Si la fecha es inválida, pasada o el lavadero no está publicado.
   */
  disponibilidad(lavaderoId, fecha) {
    const lavadero = this.lavaderos.obtener(lavaderoId, true);
    const dia = diaDeFecha(fecha);
    const ahora = this.ahora();
    if (fecha < fechaColombia(ahora)) {
      throw new ErrorApp(400, 'Selecciona hoy o una fecha futura.');
    }
    const jornada = lavadero.horarios[dia];
    const turnos = [];
    if (jornada) {
      for (let h = Number(jornada.apertura.slice(0, 2)); h < Number(jornada.cierre.slice(0, 2)); h += 1) {
        const hora = `${String(h).padStart(2, '0')}:00`;
        const cupos = Math.max(0, lavadero.capacidad - this.ocupacion(lavaderoId, fecha, hora));
        const estado = inicioTurno(fecha, hora) <= ahora.getTime() ? 'PASADO'
          : cupos === 0 ? 'OCUPADO' : 'DISPONIBLE';
        turnos.push({ hora, cupos, estado });
      }
    }
    return { fecha, cerrado: !jornada, turnos };
  }

  /**
   * Comprueba si una reserva puede ocupar el horario solicitado.
   * @param {object} lavadero - Lavadero aprobado.
   * @param {string} fecha - Fecha en formato AAAA-MM-DD.
   * @param {string} hora - Hora en punto.
   * @param {string} clienteId - Perfil que realiza la solicitud.
   * @returns {void} La solicitud puede ocupar un cupo.
   * @throws {ErrorApp} Si la hora es inválida, duplicada o está llena.
   */
  verificarCupo(lavadero, fecha, hora, clienteId) {
    const jornada = lavadero.horarios[diaDeFecha(fecha)];
    if (typeof hora !== 'string' || !HORA_ENTERA.test(hora) ||
      !dentroDeJornada(jornada, hora) || inicioTurno(fecha, hora) <= this.ahora().getTime()) {
      throw new ErrorApp(400, 'Selecciona una hora futura dentro del horario del lavadero.');
    }
    const reservas = this.reservasActivas(lavadero.id)
      .filter((reserva) => reserva.fecha === fecha && reserva.hora === hora);
    if (reservas.some((reserva) => reserva.clienteId === clienteId)) {
      throw new ErrorApp(409, 'Ya tienes una reserva en este lavadero para esa fecha y hora.');
    }
    if (reservas.length >= lavadero.capacidad) {
      throw new ErrorApp(409, 'El turno se acaba de llenar. Selecciona otra hora.');
    }
  }

  /**
   * Obtiene los registros que consumen cupo para un lavadero.
   * @param {string} lavaderoId - Identificador del establecimiento.
   * @returns {Reserva[]} Reservas que cuentan para la capacidad.
   * @throws {never} Solo lee el repositorio.
   */
  reservasActivas(lavaderoId) {
    return this.reservaDAO.obtenerTodos().filter((reserva) =>
      reserva.lavaderoId === lavaderoId && reserva.estado !== Reserva.ESTADOS.CANCELADO);
  }

  /**
   * Cuenta las reservas que consumen cupo en un horario.
   * @param {string} lavaderoId - Identificador del establecimiento.
   * @param {string} fecha - Fecha local.
   * @param {string} hora - Inicio del turno.
   * @returns {number} Cupos consumidos.
   * @throws {never} Solo lee el repositorio.
   */
  ocupacion(lavaderoId, fecha, hora) {
    return this.reservasActivas(lavaderoId)
      .filter((reserva) => reserva.fecha === fecha && reserva.hora === hora).length;
  }
}

module.exports = AgendaController;
