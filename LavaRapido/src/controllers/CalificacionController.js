const Base=require('./OperacionBase');
const {ErrorApp}=require('./reglas');
class CalificacionController extends Base {
  /** @param {string} cliente - Perfil. @param {string} id - Reserva. @param {object} datos - Estrellas y comentario. @returns {object} Calificación. @throws {ErrorApp} Datos, propietario o estado inválidos. @throws {Error} Error SQL. */
  calificar(cliente,id,datos={}) {
    const r=this.propia(cliente,id);
    const {estrellas,comentario=''}=datos??{};
    if(r.estado!=='FINALIZADO') throw new ErrorApp(409,'Solo puedes calificar servicios finalizados.');
    if(!Number.isInteger(estrellas)||estrellas<1||estrellas>5||typeof comentario!=='string'||comentario.length>500) throw new ErrorApp(400,'Selecciona de 1 a 5 estrellas; comentario máximo de 500 caracteres.');
    if(this.registros.listar('calificaciones').some(c=>c.id===id)) throw new ErrorApp(409,'Esta reserva ya fue calificada.');
    return this.registros.guardar('calificaciones',{id,clienteId:cliente,lavaderoId:r.lavaderoId,estrellas,comentario:comentario.trim(),creadoEn:this.ahora().toISOString()});
  }
  /** @param {string} id - Lavadero. @returns {object} Promedio y comentarios. @throws {ErrorApp} Lavadero inválido. @throws {Error} Error SQL. */
  perfil(id) {
    this.lavaderos.obtener(id,true);
    const opiniones=this.registros.listar('calificaciones').filter(c=>c.lavaderoId===id);
    return {opiniones,total:opiniones.length,promedio:opiniones.length?opiniones.reduce((s,c)=>s+c.estrellas,0)/opiniones.length:null};
  }
}
module.exports=CalificacionController;
