const HORA_MS = 3_600_000;
const HORA_ENTERA = /^(?:[01]\d|2[0-3]):00$/;
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

class ErrorApp extends Error {
  /**
   * Crea un error de negocio apto para la API.
   * @param {number} estadoHttp - Código HTTP.
   * @param {string} mensaje - Explicación para el usuario.
   * @returns {ErrorApp} Error inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(estadoHttp, mensaje) {
    super(mensaje);
    this.estadoHttp = estadoHttp;
  }
}

/**
 * Limpia un campo de texto requerido.
 * @param {unknown} valor - Valor recibido.
 * @param {string} campo - Nombre del campo.
 * @param {number} maximo - Límite de caracteres.
 * @returns {string} Texto sin espacios en los extremos.
 * @throws {ErrorApp} Si el valor está vacío o excede el límite.
 */
function texto(valor, campo, maximo) {
  const limpio = typeof valor === 'string' ? valor.trim() : '';
  if (!limpio || limpio.length > maximo) {
    throw new ErrorApp(400, `${campo} debe tener entre 1 y ${maximo} caracteres.`);
  }
  return limpio;
}

/**
 * Valida la capacidad y los siete horarios semanales.
 * @param {object} datos - Capacidad y horarios por índice de día.
 * @returns {object} Configuración normalizada.
 * @throws {ErrorApp} Si falta un día o algún valor es inválido.
 */
function normalizarAgenda(datos = {}) {
  const { capacidad, horarios } = datos ?? {};
  if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 100) {
    throw new ErrorApp(400, 'La capacidad debe ser un entero entre 1 y 100 vehículos por hora.');
  }
  const semana = {};
  for (const [dia, nombre] of DIAS.entries()) {
    const jornada = horarios?.[dia];
    if (jornada === null) {
      semana[dia] = null;
      continue;
    }
    if (!jornada || typeof jornada.apertura !== 'string' || typeof jornada.cierre !== 'string' ||
      !HORA_ENTERA.test(jornada.apertura) || !HORA_ENTERA.test(jornada.cierre) ||
      jornada.apertura >= jornada.cierre) {
      throw new ErrorApp(400, `${nombre}: selecciona horas en punto con cierre posterior a la apertura o marca cerrado.`);
    }
    semana[dia] = { apertura: jornada.apertura, cierre: jornada.cierre };
  }
  if (!Object.values(semana).some(Boolean)) {
    throw new ErrorApp(400, 'Configura al menos un día de atención.');
  }
  return { capacidad, horarios: semana };
}

/**
 * Valida una fecha ISO y obtiene el índice del día de la semana.
 * @param {string} fecha - Fecha en formato AAAA-MM-DD.
 * @returns {number} Índice entre 0 (domingo) y 6 (sábado).
 * @throws {ErrorApp} Si la fecha es inexistente o tiene un formato inválido.
 */
function diaDeFecha(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new ErrorApp(400, 'Selecciona una fecha válida.');
  }
  const calendario = new Date(`${fecha}T00:00:00Z`);
  if (!Number.isFinite(calendario.getTime()) || calendario.toISOString().slice(0, 10) !== fecha) {
    throw new ErrorApp(400, 'Selecciona una fecha válida.');
  }
  return calendario.getUTCDay();
}

/**
 * Convierte la fecha y hora de Colombia a un instante UTC.
 * @param {string} fecha - Fecha validada en formato AAAA-MM-DD.
 * @param {string} hora - Hora de Colombia en formato HH:MM.
 * @returns {number} Milisegundos desde la época Unix.
 * @throws {never} Con fecha y hora válidas.
 */
function inicioTurno(fecha, hora) {
  return Date.parse(`${fecha}T${hora}:00-05:00`);
}

/**
 * Obtiene el día actual en Colombia.
 * @param {Date} instante - Fecha y hora del servidor.
 * @returns {string} Fecha local en formato AAAA-MM-DD.
 * @throws {never} Con una fecha válida.
 */
function fechaColombia(instante) {
  return new Date(instante.getTime() - 5 * HORA_MS).toISOString().slice(0, 10);
}

/**
 * Comprueba si una jornada incluye el inicio de un turno.
 * @param {object|null|undefined} jornada - Apertura y cierre del día.
 * @param {string} hora - Inicio del turno en formato HH:MM.
 * @returns {boolean} Si la hora pertenece a la jornada.
 * @throws {never} Con una hora en formato HH:MM.
 */
function dentroDeJornada(jornada, hora) {
  return Boolean(jornada && hora >= jornada.apertura && hora < jornada.cierre);
}

module.exports = {
  ErrorApp, HORA_MS, HORA_ENTERA, DIAS, texto, normalizarAgenda, diaDeFecha,
  inicioTurno, fechaColombia, dentroDeJornada
};
