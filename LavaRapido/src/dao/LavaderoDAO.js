const Lavadero = require('../models/Lavadero');
const Servicio = require('../models/Servicio');

class LavaderoDAO {
  /**
   * Prepara el acceso a establecimientos y sus registros asociados.
   * @param {import('./BaseDatos')} baseDatos - Conexión compartida de la aplicación.
   * @returns {LavaderoDAO} Repositorio preparado.
   * @throws {Error} Si las tablas requeridas no están disponibles.
   */
  constructor(baseDatos) {
    this.db = baseDatos.conexion;
  }

  /**
   * Lista todos los establecimientos en orden de inserción.
   * @returns {Lavadero[]} Entidades independientes de la conexión.
   * @throws {Error} Si falla una consulta SQL.
   */
  obtenerTodos() {
    return this.db.prepare('SELECT * FROM lavaderos ORDER BY rowid').all().map((fila) => this.entidad(fila));
  }

  /**
   * Busca un establecimiento por su identificador.
   * @param {string} id - Identificador.
   * @returns {Lavadero|null} Entidad o nulo.
   * @throws {Error} Si falla una consulta SQL.
   */
  obtenerPorId(id) {
    if (typeof id !== 'string') return null;
    const fila = this.db.prepare('SELECT * FROM lavaderos WHERE id = ?').get(id);
    return fila ? this.entidad(fila) : null;
  }

  /**
   * Filtra establecimientos por el valor almacenado del estado.
   * @param {string} estado - Valor del estado.
   * @returns {Lavadero[]} Entidades coincidentes.
   * @throws {Error} Si falla una consulta SQL.
   */
  obtenerPorEstado(estado) {
    return this.db.prepare('SELECT * FROM lavaderos WHERE estado = ? ORDER BY rowid').all(estado)
      .map((fila) => this.entidad(fila));
  }

  /**
   * Inserta o actualiza el establecimiento, su catálogo y sus horarios.
   * @param {Lavadero} lavadero - Datos validados por el controlador.
   * @returns {Lavadero} Entidad guardada.
   * @throws {Error} Si falla una escritura. La fachada gestiona la transacción.
   */
  guardar(lavadero) {
    const { id, nombre, direccion, telefono, estado, motivo, sector, ubicacion, capacidad } = lavadero;
    this.db.prepare(`INSERT INTO lavaderos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre, direccion=excluded.direccion,
      telefono=excluded.telefono, estado=excluded.estado, motivo=excluded.motivo, sector=excluded.sector,
      latitud=excluded.latitud, longitud=excluded.longitud, capacidad=excluded.capacidad`)
      .run(id, nombre, direccion, telefono, estado, motivo, sector, ubicacion.lat, ubicacion.lon, capacidad);
    const servicioSQL = this.db.prepare(`INSERT INTO servicios VALUES (?, ?, ?, ?)
      ON CONFLICT(lavadero_id, id) DO UPDATE SET nombre=excluded.nombre, precio=excluded.precio`);
    for (const servicio of lavadero.servicios) servicioSQL.run(id, servicio.id, servicio.nombre, servicio.precio);
    const horarioSQL = this.db.prepare(`INSERT INTO horarios VALUES (?, ?, ?, ?)
      ON CONFLICT(lavadero_id, dia) DO UPDATE SET apertura=excluded.apertura, cierre=excluded.cierre`);
    for (const [dia, horario] of Object.entries(lavadero.horarios)) {
      horarioSQL.run(id, Number(dia), horario?.apertura ?? null, horario?.cierre ?? null);
    }
    return lavadero;
  }

  /**
   * Reúne las filas de un establecimiento en su entidad.
   * @private
   * @param {object} fila - Fila principal de SQLite.
   * @returns {Lavadero} Establecimiento con catálogo y semana de atención.
   * @throws {Error} Si falla la lectura de sus registros asociados.
   */
  entidad(fila) {
    const servicios = this.db.prepare('SELECT * FROM servicios WHERE lavadero_id = ? ORDER BY rowid').all(fila.id)
      .map((servicio) => new Servicio(servicio.id, servicio.nombre, servicio.precio));
    const horarios = Object.fromEntries(this.db.prepare('SELECT * FROM horarios WHERE lavadero_id = ?').all(fila.id)
      .map(({ dia, apertura, cierre }) => [dia, apertura ? { apertura, cierre } : null]));
    return new Lavadero(fila.id, fila.nombre, fila.direccion, fila.telefono, fila.estado, fila.motivo, {
      sector: fila.sector, ubicacion: { lat: fila.latitud, lon: fila.longitud },
      servicios, horarios, capacidad: fila.capacidad
    });
  }
}

module.exports = LavaderoDAO;
