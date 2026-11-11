const LavaderoDAO = require('../dao/LavaderoDAO');
const path = require('node:path');
const BaseDatos = require('../dao/BaseDatos');
const ReservaDAO = require('../dao/ReservaDAO');
const ClienteDAO = require('../dao/ClienteDAO');
const CorreoDAO = require('../dao/CorreoDAO');
const { crearDatosDemo, SECTORES } = require('../dao/datosDemo');
const LavaderoController = require('./LavaderoController');
const AgendaController = require('./AgendaController');
const ReservaController = require('./ReservaController');
const PagoSimulado = require('./PagoSimulado');
const { ErrorApp, DIAS, fechaColombia } = require('./reglas');

/**
 * Verifica el rol seleccionado para una operación de demostración.
 * @param {string} esperado - Rol de la operación.
 * @param {string|undefined} seleccionado - Rol elegido en el inicio simulado.
 * @returns {void} El rol coincide.
 * @throws {ErrorApp} Si el rol seleccionado no coincide.
 */
function autorizar(esperado, seleccionado) {
  if (esperado !== seleccionado) throw new ErrorApp(403, 'Selecciona el rol correspondiente para continuar.');
}

/**
 * Conecta los repositorios y expone las operaciones del MVP a la capa HTTP.
 * @param {() => Date} [ahora] - Reloj inyectable para verificar el prototipo.
 * @param {string} [archivoDatos] - Archivo SQLite o :memory: para pruebas.
 * @returns {object} Fachada de registro, supervisión, agenda y reservas.
 * @throws {Error} Si falla la apertura o migración de SQLite.
 */
function crearFachada(ahora = () => new Date(), archivoDatos = process.env.LAVARAPIDO_DB || path.join(__dirname, '../../data/lavarapido.sqlite')) {
  const baseDatos = new BaseDatos(archivoDatos);
  const lavaderoDAO = new LavaderoDAO(baseDatos);
  const reservaDAO = new ReservaDAO(baseDatos);
  const clienteDAO = new ClienteDAO(baseDatos);
  baseDatos.transaccion(() => {
    if (!baseDatos.conexion.prepare("SELECT valor FROM metadatos WHERE clave='semilla'").get()) {
      const datos = crearDatosDemo();
      for (const cliente of datos.clientes) clienteDAO.guardar(cliente);
      for (const lavadero of datos.lavaderos) lavaderoDAO.guardar(lavadero);
      baseDatos.conexion.prepare("INSERT INTO metadatos VALUES ('semilla', '1')").run();
    }
  });
  const lavaderos = new LavaderoController(lavaderoDAO);
  const agenda = new AgendaController(lavaderos, lavaderoDAO, reservaDAO, ahora);
  const reservas = new ReservaController({
    lavaderos, agenda, reservaDAO, clienteDAO, correoDAO: new CorreoDAO(baseDatos),
    pasarela: new PagoSimulado(), ahora
  });

  return {
    autorizar,
    cerrar: baseDatos.cerrar.bind(baseDatos),
    /**
     * Expone opciones de formulario y la fecha local.
     * @returns {object} Metadatos de los formularios de demostración.
     * @throws {never} Con un reloj válido.
     */
    opciones() {
      return {
        hoy: fechaColombia(ahora()), dias: DIAS, sectores: Object.keys(SECTORES),
        servicios: LavaderoController.SERVICIOS, vehiculos: ReservaController.VEHICULOS,
        clientes: clienteDAO.obtenerTodos().map(({ id, nombre }) => ({ id, nombre }))
      };
    },
    listarTodos: lavaderos.listarTodos.bind(lavaderos),
    listarPendientes: lavaderos.listarPendientes.bind(lavaderos),
    listarCercanos: lavaderos.listarCercanos.bind(lavaderos),
    /**
     * Registra el establecimiento dentro de una transacción.
     * @param {object} datos - Datos del nuevo establecimiento.
     * @returns {object} Resultado de la operación confirmada.
     * @throws {ErrorApp} Si una regla de negocio impide la operación.
     * @throws {Error} Si falla una escritura SQL, cuyos cambios se revierten.
     */
    registrar: (...args) => baseDatos.transaccion(() => lavaderos.registrar(...args)),
    /**
     * Aprueba y guarda la publicación de un establecimiento.
     * @param {string} id - Identificador del establecimiento.
     * @returns {object} Resultado de la operación confirmada.
     * @throws {ErrorApp} Si una regla de negocio impide la operación.
     * @throws {Error} Si falla una escritura SQL, cuyos cambios se revierten.
     */
    aprobar: (...args) => baseDatos.transaccion(() => lavaderos.aprobar(...args)),
    /**
     * Rechaza un registro pendiente y conserva su motivo.
     * @param {string} id - Identificador.
     * @param {string} motivo - Explicación del rechazo.
     * @returns {object} Resultado de la operación confirmada.
     * @throws {ErrorApp} Si una regla de negocio impide la operación.
     * @throws {Error} Si falla una escritura SQL, cuyos cambios se revierten.
     */
    rechazar: (...args) => baseDatos.transaccion(() => lavaderos.rechazar(...args)),
    /**
     * Suspende la publicación de un establecimiento aprobado.
     * @param {string} id - Identificador del establecimiento.
     * @returns {object} Resultado de la operación confirmada.
     * @throws {ErrorApp} Si una regla de negocio impide la operación.
     * @throws {Error} Si falla una escritura SQL, cuyos cambios se revierten.
     */
    suspender: (...args) => baseDatos.transaccion(() => lavaderos.suspender(...args)),
    /**
     * Guarda la agenda después de comprobar las reservas existentes.
     * @param {string} id - Identificador.
     * @param {object} datos - Capacidad y horarios semanales.
     * @returns {object} Resultado de la operación confirmada.
     * @throws {ErrorApp} Si una regla de negocio impide la operación.
     * @throws {Error} Si falla una escritura SQL, cuyos cambios se revierten.
     */
    configurar: (...args) => baseDatos.transaccion(() => agenda.configurar(...args)),
    disponibilidad: agenda.disponibilidad.bind(agenda),
    /**
     * Comprueba el cupo y guarda la reserva y su aviso como una unidad.
     * @param {string} clienteId - Perfil de demostración.
     * @param {object} datos - Datos del turno solicitado.
     * @returns {object} Resultado de la operación confirmada.
     * @throws {ErrorApp} Si una regla de negocio impide la operación.
     * @throws {Error} Si falla una escritura SQL, cuyos cambios se revierten.
     */
    reservar: (...args) => baseDatos.transaccion(() => reservas.reservar(...args)),
    historial: reservas.historial.bind(reservas),
    validarCodigo: reservas.validarCodigo.bind(reservas)
  };
}

module.exports = crearFachada;
