const { ErrorApp } = require('./reglas');
class OperacionBase {
  /** @param {object} dependencias - Repositorios y reloj. @returns {OperacionBase} Operación. @throws {never} Solo asigna. */
  constructor(dependencias) { Object.assign(this, dependencias); }
  /** @param {string} id - Reserva. @returns {object} Reserva existente. @throws {ErrorApp} No encontrada. @throws {Error} Error SQL. */
  reserva(id) {
    const r=this.reservaDAO.obtenerTodos().find(r=>r.id===id);
    if(!r) throw new ErrorApp(404,'Reserva no encontrada.');
    return r;
  }
  /** @param {string} cliente - Perfil. @param {string} id - Reserva. @returns {object} Reserva propia. @throws {ErrorApp} Perfil o reserva inválidos. @throws {Error} Error SQL. */
  propia(cliente,id) {
    if(!this.clienteDAO.obtenerPorId(cliente)) throw new ErrorApp(400,'Selecciona un cliente válido.');
    const r=this.reserva(id);
    if(r.clienteId!==cliente) throw new ErrorApp(404,'Reserva no encontrada en tu perfil.');
    return r;
  }
  /** @param {object} r - Reserva. @param {string} mensaje - Aviso. @returns {object} Evento persistido. @throws {Error} Error SQL. */
  evento(r,mensaje) {
    return this.registros.guardar('eventos',{id:require('node:crypto').randomUUID(),reservaId:r.id,clienteId:r.clienteId,creadoEn:this.ahora().toISOString(),mensaje});
  }
}
module.exports=OperacionBase;
