const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

class BaseDatos {
  /**
   * Abre SQLite y crea la primera versión del esquema cuando corresponde.
   * @param {string} archivo - Ruta del archivo o :memory: para una prueba aislada.
   * @returns {BaseDatos} Conexión preparada.
   * @throws {Error} Si no se puede abrir, migrar o escribir el archivo.
   */
  constructor(archivo) {
    if (archivo !== ':memory:') fs.mkdirSync(path.dirname(archivo), { recursive: true });
    this.conexion = new DatabaseSync(archivo);
    this.conexion.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;');
    const version = this.conexion.prepare('PRAGMA user_version').get().user_version;
    if (version > 1) {
      this.conexion.close();
      throw new Error('Esta base de datos pertenece a una versión más reciente de LavaRápido.');
    }
    if (version === 0) this.transaccion(() => this.conexion.exec(`
      CREATE TABLE IF NOT EXISTS metadatos (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS clientes (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, correo TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS lavaderos (
        id TEXT PRIMARY KEY, nombre TEXT NOT NULL, direccion TEXT NOT NULL, telefono TEXT NOT NULL,
        estado TEXT NOT NULL, motivo TEXT, sector TEXT NOT NULL,
        latitud REAL NOT NULL, longitud REAL NOT NULL, capacidad INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS servicios (
        lavadero_id TEXT NOT NULL REFERENCES lavaderos(id), id TEXT NOT NULL,
        nombre TEXT NOT NULL, precio INTEGER NOT NULL, PRIMARY KEY (lavadero_id, id)
      );
      CREATE TABLE IF NOT EXISTS horarios (
        lavadero_id TEXT NOT NULL REFERENCES lavaderos(id), dia INTEGER NOT NULL,
        apertura TEXT, cierre TEXT, PRIMARY KEY (lavadero_id, dia)
      );
      CREATE TABLE IF NOT EXISTS reservas (
        id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL REFERENCES clientes(id),
        lavadero_id TEXT NOT NULL REFERENCES lavaderos(id), servicio_id TEXT NOT NULL,
        servicio_nombre TEXT NOT NULL, servicio_precio INTEGER NOT NULL,
        vehiculo TEXT NOT NULL, fecha TEXT NOT NULL, hora TEXT NOT NULL, estado TEXT NOT NULL,
        codigo TEXT NOT NULL UNIQUE, creado_en TEXT NOT NULL,
        pago_referencia TEXT NOT NULL, pago_estado TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS reservas_agenda ON reservas(lavadero_id, fecha, hora, estado);
      CREATE INDEX IF NOT EXISTS reservas_cliente ON reservas(cliente_id, creado_en);
      CREATE TABLE IF NOT EXISTS correos (
        id TEXT PRIMARY KEY REFERENCES reservas(id), cliente_id TEXT NOT NULL REFERENCES clientes(id),
        fecha_envio TEXT NOT NULL, destino TEXT NOT NULL, asunto TEXT NOT NULL,
        mensaje TEXT NOT NULL, estado TEXT NOT NULL
      );
      PRAGMA user_version = 1;
    `));
  }

  /**
   * Ejecuta una unidad de trabajo síncrona con exclusión de escritores.
   * @param {Function} accion - Operación que consulta y modifica la conexión.
   * @returns {*} Resultado de la operación confirmada.
   * @throws {Error} Si falla la operación. Sus cambios se revierten juntos.
   */
  transaccion(accion) {
    this.conexion.exec('BEGIN IMMEDIATE');
    try {
      const resultado = accion();
      this.conexion.exec('COMMIT');
      return resultado;
    } catch (error) {
      this.conexion.exec('ROLLBACK');
      throw error;
    }
  }

  /**
   * Cierra la conexión a SQLite.
   * @returns {void}
   * @throws {Error} Si la conexión tiene una operación pendiente.
   */
  cerrar() {
    this.conexion.close();
  }
}

module.exports = BaseDatos;
