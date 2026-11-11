const Reserva = require('../models/Reserva');

class ReservaDAO {
  /**
   * Prepara las consultas de turnos.
   * @param {import('./BaseDatos')} baseDatos - Conexión compartida.
   * @returns {ReservaDAO} Repositorio preparado.
   * @throws {never} Solo asigna la dependencia.
   */
  constructor(baseDatos) {
    this.db = baseDatos.conexion;
  }

  /**
   * Lista los turnos con la copia del precio acordado al reservar.
   * @returns {Reserva[]} Reservas almacenadas.
   * @throws {Error} Si falla la consulta SQL.
   */
  obtenerTodos() {
    return this.db.prepare(`SELECT reservas.*, lavaderos.nombre AS lavadero_nombre
      FROM reservas JOIN lavaderos ON lavaderos.id=reservas.lavadero_id ORDER BY reservas.rowid`).all()
      .map((fila) => new Reserva({
        id: fila.id, clienteId: fila.cliente_id, lavaderoId: fila.lavadero_id, lavaderoNombre: fila.lavadero_nombre,
        servicio: { id: fila.servicio_id, nombre: fila.servicio_nombre, precio: fila.servicio_precio },
        vehiculo: fila.vehiculo, fecha: fila.fecha, hora: fila.hora, estado: fila.estado,
        codigo: fila.codigo, creadoEn: fila.creado_en,
        pago: { referencia: fila.pago_referencia, estado: fila.pago_estado, monto: fila.servicio_precio, moneda: 'COP' }
      }));
  }

  /**
   * Inserta una reserva nueva.
   * @param {Reserva} reserva - Reserva validada por el controlador.
   * @returns {Reserva} Reserva guardada.
   * @throws {Error} Si falla la escritura o se repite un identificador.
   */
  guardar(reserva) {
    this.db.prepare('INSERT INTO reservas VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      reserva.id, reserva.clienteId, reserva.lavaderoId, reserva.servicio.id, reserva.servicio.nombre,
      reserva.servicio.precio, reserva.vehiculo, reserva.fecha, reserva.hora, reserva.estado,
      reserva.codigo, reserva.creadoEn, reserva.pago.referencia, reserva.pago.estado
    );
    return reserva;
  }
}

module.exports = ReservaDAO;
