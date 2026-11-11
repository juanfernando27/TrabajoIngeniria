const { randomBytes, randomUUID } = require('node:crypto');
const Reserva = require('../models/Reserva');
const { ErrorApp, HORA_MS, inicioTurno } = require('./reglas');

const VEHICULOS = Object.freeze(['Carro', 'Moto', 'Bicicleta']);

class ReservaController {
  /**
   * Inicializa la reserva y sus notificaciones.
   * @param {object} dependencias - Controladores, repositorios, pasarela y reloj.
   * @returns {ReservaController} Controlador inicializado.
   * @throws {never} El constructor solo asigna dependencias.
   */
  constructor(dependencias) {
    Object.assign(this, dependencias);
  }

  /**
   * Confirma una reserva y registra su correo simulado en la misma operación síncrona.
   * @param {string} clienteId - Perfil de demostración.
   * @param {object} datos - Lavadero, servicio, vehículo, fecha y hora elegidos.
   * @returns {{reserva: Reserva, correo: object}} Reserva y registro del aviso.
   * @throws {ErrorApp} Si un dato es inválido, el lavadero no está aprobado o se agotó el cupo.
   * @throws {Error} Si falla la generación de identificadores.
   */
  reservar(clienteId, datos = {}) {
    const cliente = this.obtenerCliente(clienteId);
    const { lavaderoId, servicioId, vehiculo, fecha, hora } = datos ?? {};
    const lavadero = this.lavaderos.obtener(lavaderoId, true);
    const servicio = lavadero.servicios.find(({ id }) => id === servicioId);
    if (!servicio || !VEHICULOS.includes(vehiculo)) {
      throw new ErrorApp(400, 'Selecciona un servicio del catálogo y un tipo de vehículo.');
    }

    // Sin esperas entre la comprobación y el guardado en el proceso de Node.
    this.agenda.verificarCupo(lavadero, fecha, hora, cliente.id);
    const codigo = this.generarCodigo();
    const creadoEn = this.ahora().toISOString();
    const reserva = new Reserva({
      id: randomUUID(), clienteId, lavaderoId, lavaderoNombre: lavadero.nombre, servicio: { ...servicio },
      vehiculo, fecha, hora, estado: Reserva.ESTADOS.RESERVADO, codigo, creadoEn,
      pago: this.pasarela.aprobar(servicio.precio)
    });
    const correo = {
      id: reserva.id, clienteId, fechaEnvio: creadoEn, destino: cliente.correo,
      asunto: 'Confirmación de reserva LavaRápido',
      mensaje: `Turno en ${lavadero.nombre} el ${fecha} a las ${hora}. Código: ${codigo}.`,
      estado: 'CORREO ENVIADO (SIMULADO)'
    };
    this.reservaDAO.guardar(reserva);
    this.correoDAO.guardar(correo);
    return { reserva, correo };
  }

  /**
   * Lista las reservas y avisos de un perfil.
   * @param {string} clienteId - Perfil de demostración.
   * @returns {object} Historial del cliente.
   * @throws {ErrorApp} Si el perfil no existe.
   */
  historial(clienteId) {
    this.obtenerCliente(clienteId);
    return {
      reservas: this.reservaDAO.obtenerTodos().filter((reserva) => reserva.clienteId === clienteId).reverse(),
      correos: this.correoDAO.obtenerTodos().filter((correo) => correo.clienteId === clienteId).reverse()
    };
  }

  /**
   * Valida un código para el lavadero y la hora actual del servidor.
   * @param {string} lavaderoId - Establecimiento que recibe el vehículo.
   * @param {string} codigo - Código presentado por el cliente.
   * @returns {object} Validez y mensaje.
   * @throws {ErrorApp} Si el lavadero no existe o el formato del código es inválido.
   */
  validarCodigo(lavaderoId, codigo) {
    this.lavaderos.obtener(lavaderoId);
    const limpio = typeof codigo === 'string' ? codigo.trim().toUpperCase() : '';
    if (!/^LR[A-F0-9]{10}$/.test(limpio)) {
      throw new ErrorApp(400, 'Escribe el código alfanumérico de 12 caracteres.');
    }
    const reserva = this.reservaDAO.obtenerTodos().find((turno) =>
      turno.codigo === limpio && turno.lavaderoId === lavaderoId &&
      turno.estado !== Reserva.ESTADOS.CANCELADO);
    if (!reserva) return { valido: false, mensaje: 'Código no encontrado para este lavadero.' };

    const ahora = this.ahora().getTime();
    const inicio = inicioTurno(reserva.fecha, reserva.hora);
    const valido = ahora >= inicio && ahora < inicio + HORA_MS;
    return {
      valido,
      mensaje: valido ? 'Código válido para esta hora.'
        : `El código solo es válido durante el turno del ${reserva.fecha} a las ${reserva.hora}.`
    };
  }

  /**
   * Obtiene un perfil de demostración.
   * @private
   * @param {string} clienteId - Identificador del cliente.
   * @returns {import('../models/Cliente')} Cliente registrado.
   * @throws {ErrorApp} Si el perfil no existe.
   */
  obtenerCliente(clienteId) {
    const cliente = this.clienteDAO.obtenerPorId(clienteId);
    if (!cliente) throw new ErrorApp(400, 'Selecciona un perfil de cliente en el inicio de sesión.');
    return cliente;
  }

  /**
   * Genera un código que no se haya usado en otra reserva.
   * @private
   * @returns {string} Código alfanumérico de doce caracteres.
   * @throws {Error} Si el generador aleatorio no está disponible.
   */
  generarCodigo() {
    const usados = new Set(this.reservaDAO.obtenerTodos().map((reserva) => reserva.codigo));
    let codigo;
    do {
      codigo = 'LR' + randomBytes(5).toString('hex').toUpperCase();
    } while (usados.has(codigo));
    return codigo;
  }
}

module.exports = ReservaController;
module.exports.VEHICULOS = VEHICULOS;
