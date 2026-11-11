const { randomUUID } = require('node:crypto');
const Lavadero = require('../models/Lavadero');
const Servicio = require('../models/Servicio');
const { SECTORES } = require('../dao/datosDemo');
const { ErrorApp, texto, normalizarAgenda } = require('./reglas');

const SERVICIOS = Object.freeze([
  { id: 'basico', nombre: 'Básico', precio: 15000 },
  { id: 'completo', nombre: 'Completo', precio: 45000 },
  { id: 'encerado', nombre: 'Encerado', precio: 30000 },
  { id: 'aspirado', nombre: 'Aspirado', precio: 12000 }
]);

class LavaderoController {
  /**
   * Inicializa las operaciones de registro, catálogo y supervisión.
   * @param {import('../dao/LavaderoDAO')} lavaderoDAO - Repositorio de establecimientos.
   * @returns {LavaderoController} Controlador inicializado.
   * @throws {never} El constructor solo asigna la dependencia.
   */
  constructor(lavaderoDAO) {
    this.lavaderoDAO = lavaderoDAO;
  }

  /**
   * Lista establecimientos por revisar.
   * @returns {Lavadero[]} Lavaderos en estado PENDIENTE.
   * @throws {never} Solo lee el repositorio.
   */
  listarPendientes() {
    return this.lavaderoDAO.obtenerPorEstado('PENDIENTE');
  }

  /**
   * Lista los registros de administración de la demostración.
   * @returns {Lavadero[]} Lavaderos de todos los estados.
   * @throws {never} Solo lee el repositorio.
   */
  listarTodos() {
    return this.lavaderoDAO.obtenerTodos();
  }

  /**
   * Obtiene un lavadero y, si corresponde, verifica su publicación.
   * @param {string} id - Identificador.
   * @param {boolean} [soloAprobado=false] - Requiere estado APROBADO.
   * @returns {Lavadero} Registro encontrado.
   * @throws {ErrorApp} Si el establecimiento no está disponible para la operación.
   */
  obtener(id, soloAprobado = false) {
    const lavadero = this.lavaderoDAO.obtenerPorId(id);
    if (!lavadero || (soloAprobado && lavadero.estado !== 'APROBADO')) {
      throw new ErrorApp(404, 'El lavadero no está disponible.');
    }
    return lavadero;
  }

  /**
   * Registra un establecimiento pendiente de aprobación.
   * @param {object} datos - Contacto, sector, servicios y agenda.
   * @returns {Lavadero} Registro creado.
   * @throws {ErrorApp} Si los datos obligatorios son inválidos.
   */
  registrar(datos = {}) {
    const entrada = datos ?? {};
    const nombre = texto(entrada.nombre, 'El nombre', 100);
    const direccion = texto(entrada.direccion, 'La dirección', 160);
    const telefono = texto(entrada.telefono, 'El teléfono', 25);
    if (!/^\+?[\d\s()-]+$/.test(telefono) || telefono.replace(/\D/g, '').length < 7) {
      throw new ErrorApp(400, 'Escribe un teléfono válido con al menos siete dígitos.');
    }
    const { sector, servicios } = entrada;
    if (typeof sector !== 'string' || !Object.hasOwn(SECTORES, sector)) {
      throw new ErrorApp(400, 'Selecciona un sector de Pasto.');
    }
    if (!Array.isArray(servicios) || servicios.length < 1 || servicios.length > SERVICIOS.length ||
      new Set(servicios.map((servicio) => servicio?.id)).size !== servicios.length) {
      throw new ErrorApp(400, 'Selecciona entre uno y cuatro servicios distintos.');
    }
    const catalogo = servicios.map((servicio) => {
      const opcion = SERVICIOS.find(({ id }) => id === servicio?.id);
      const precio = servicio?.precio;
      if (!opcion || !Number.isInteger(precio) || precio < 1 || precio > 1_000_000) {
        throw new ErrorApp(400, 'Cada servicio requiere un tipo válido y un precio entero entre $1 y $1.000.000.');
      }
      return new Servicio(opcion.id, opcion.nombre, precio);
    });
    const agenda = normalizarAgenda(entrada);
    return this.lavaderoDAO.guardar(new Lavadero(randomUUID(), nombre, direccion, telefono,
      'PENDIENTE', null, { sector, ubicacion: SECTORES[sector], servicios: catalogo, ...agenda }));
  }

  /**
   * Aprueba un lavadero pendiente.
   * @param {string} id - Identificador.
   * @returns {Lavadero} Lavadero aprobado.
   * @throws {ErrorApp} Si el lavadero no existe o no está pendiente.
   */
  aprobar(id) {
    return this.cambiarEstado(id, 'PENDIENTE', 'APROBADO');
  }

  /**
   * Rechaza un lavadero pendiente con un motivo.
   * @param {string} id - Identificador.
   * @param {string} motivo - Explicación requerida.
   * @returns {Lavadero} Lavadero rechazado.
   * @throws {ErrorApp} Si falta el motivo o la transición es inválida.
   */
  rechazar(id, motivo) {
    return this.cambiarEstado(id, 'PENDIENTE', 'RECHAZADO', texto(motivo, 'El motivo', 240));
  }

  /**
   * Suspende un lavadero aprobado.
   * @param {string} id - Identificador.
   * @returns {Lavadero} Lavadero suspendido.
   * @throws {ErrorApp} Si el lavadero no existe o no está aprobado.
   */
  suspender(id) {
    return this.cambiarEstado(id, 'APROBADO', 'SUSPENDIDO');
  }

  /**
   * Aplica una transición prevista por los métodos de supervisión.
   * @private
   * @param {string} id - Identificador.
   * @param {string} anterior - Estado previo requerido.
   * @param {string} siguiente - Estado que se guardará.
   * @param {string|null} [motivo=null] - Motivo de la transición.
   * @returns {Lavadero} Lavadero actualizado.
   * @throws {ErrorApp} Si el identificador o el estado previo es inválido.
   */
  cambiarEstado(id, anterior, siguiente, motivo = null) {
    const lavadero = this.obtener(id);
    if (lavadero.estado !== anterior) {
      throw new ErrorApp(409, `Esta acción requiere un lavadero en estado ${anterior}.`);
    }
    return this.lavaderoDAO.guardar(Object.assign(lavadero, { estado: siguiente, motivo }));
  }

  /**
   * Ordena lavaderos aprobados por distancia en línea recta.
   * @param {string|undefined} latitud - Latitud del origen.
   * @param {string|undefined} longitud - Longitud del origen.
   * @returns {object} Origen utilizado y tarjetas del catálogo público.
   * @throws {ErrorApp} Si se envían coordenadas incompletas o inválidas.
   */
  listarCercanos(latitud, longitud) {
    let origen = SECTORES.Centro;
    if (latitud !== undefined || longitud !== undefined) {
      const lat = typeof latitud === 'string' && latitud.trim() ? Number(latitud) : NaN;
      const lon = typeof longitud === 'string' && longitud.trim() ? Number(longitud) : NaN;
      if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180) {
        throw new ErrorApp(400, 'Las coordenadas del punto de partida son inválidas.');
      }
      origen = { lat, lon };
    }
    const lavaderos = this.lavaderoDAO.obtenerPorEstado('APROBADO').map((lavadero) => {
      const { id, nombre, direccion, telefono, ubicacion, servicios } = lavadero;
      return { id, nombre, direccion, telefono, ubicacion, servicios, distanciaKm: distanciaKm(origen, ubicacion) };
    }).sort((a, b) => a.distanciaKm - b.distanciaKm);
    return { origen, lavaderos };
  }
}

/**
 * Calcula la distancia de círculo máximo entre dos coordenadas.
 * @param {{lat: number, lon: number}} origen - Punto de partida.
 * @param {{lat: number, lon: number}} destino - Ubicación del lavadero.
 * @returns {number} Distancia en kilómetros.
 * @throws {never} Con dos ubicaciones válidas.
 */
function distanciaKm(origen, destino) {
  const rad = Math.PI / 180;
  const senoLat = Math.sin((destino.lat - origen.lat) * rad / 2);
  const senoLon = Math.sin((destino.lon - origen.lon) * rad / 2);
  const a = senoLat ** 2 + Math.cos(origen.lat * rad) * Math.cos(destino.lat * rad) * senoLon ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

module.exports = LavaderoController;
module.exports.SERVICIOS = SERVICIOS;
