const Base=require('./OperacionBase');
const {ErrorApp}=require('./reglas');
class EmpleadoController extends Base {
  /** @param {string} id - Lavadero opcional. @returns {object[]} Empleados demo. @throws {Error} Error SQL. */
  empleados(id) { return this.lavaderoDAO.obtenerTodos().filter(l=>!id||l.id===id).flatMap(l=>[1,2].map(n=>({id:l.id+'-empleado-'+n,nombre:'Empleado '+n+' · '+l.nombre,lavaderoId:l.id}))); }
  /** @param {string} lavaderoId - Lavadero. @param {string} id - Reserva. @param {string} empleadoId - Empleado. @returns {object} Asignación. @throws {ErrorApp} Estado o pertenencia inválidos. @throws {Error} Error SQL. */
  asignar(lavaderoId,id,empleadoId) {
    const r=this.reserva(id);
    if(r.lavaderoId!==lavaderoId||!this.empleados(lavaderoId).some(e=>e.id===empleadoId)) throw new ErrorApp(404,'Empleado o turno ajeno al establecimiento.');
    if(!['RESERVADO','CONFIRMADO'].includes(r.estado)) throw new ErrorApp(409,'El turno ya no admite asignación.');
    return this.registros.guardar('asignaciones',{id,empleadoId});
  }
  /** @param {string} empleadoId - Perfil demo. @returns {object[]} Solo turnos asignados. @throws {ErrorApp} Empleado inválido. @throws {Error} Error SQL. */
  turnos(empleadoId) {
    if(!this.empleados().some(e=>e.id===empleadoId)) throw new ErrorApp(400,'Selecciona tu perfil de empleado.');
    const ids=new Set(this.registros.listar('asignaciones').filter(a=>a.empleadoId===empleadoId).map(a=>a.id));
    return this.reservaDAO.obtenerTodos().filter(r=>ids.has(r.id));
  }
  /** @param {string} empleadoId - Perfil. @param {string} id - Reserva. @param {string} estado - Estado. @returns {object} Turno actualizado. @throws {ErrorApp} Transición o pertenencia inválidas. @throws {Error} Error SQL. */
  estado(empleadoId,id,estado) {
    const r=this.turnos(empleadoId).find(r=>r.id===id);
    if(!r) throw new ErrorApp(404,'Este turno no está asignado a tu perfil.');
    const valido=(['RESERVADO','CONFIRMADO'].includes(r.estado)&&estado==='EN_PROCESO')||(r.estado==='EN_PROCESO'&&estado==='FINALIZADO');
    if(!valido) throw new ErrorApp(409,'Transición de lavado no permitida.');
    this.reservaDAO.actualizarEstado(id,estado);
    this.evento(r,'Tu lavado cambió a '+estado+'.');
    return {...r,estado};
  }
}
module.exports=EmpleadoController;
