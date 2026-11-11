const Base=require('./OperacionBase');
const {ErrorApp,texto}=require('./reglas');
const {randomUUID}=require('node:crypto');
class ReclamoController extends Base {
  /** @param {string} cliente - Perfil. @param {string} id - Reserva. @param {string} motivo - Reclamo. @returns {object} Reclamo abierto. @throws {ErrorApp} Propiedad o motivo inválidos. @throws {Error} Error SQL. */
  crear(cliente,id,motivo) {
    const r=this.propia(cliente,id);
    if(this.registros.listar('reclamos').some(c=>c.reservaId===id&&c.estado==='ABIERTO')) throw new ErrorApp(409,'Ya existe un reclamo abierto para esta reserva.');
    return this.registros.guardar('reclamos',{id:randomUUID(),reservaId:r.id,clienteId:cliente,motivo:texto(motivo,'El motivo',1000),estado:'ABIERTO',creadoEn:this.ahora().toISOString()});
  }
  /** @returns {object[]} Reclamos del más antiguo al más reciente con historial. @throws {Error} Error SQL. */
  listar() { return this.registros.listar('reclamos').sort((a,b)=>a.creadoEn.localeCompare(b.creadoEn)).map(c=>({...c,reserva:this.reserva(c.reservaId),historial:this.registros.listar('eventos').filter(e=>e.reservaId===c.reservaId)})); }
  /** @param {string} id - Reclamo. @param {object} datos - Tipo, motivo y monto. @returns {object} Resolución. @throws {ErrorApp} Resolución inválida o saldo insuficiente. @throws {Error} Error SQL. */
  resolver(id,datos={}) {
    const c=this.registros.listar('reclamos').find(c=>c.id===id);
    if(!c) throw new ErrorApp(404,'Reclamo no encontrado.');
    if(c.estado!=='ABIERTO') throw new ErrorApp(409,'El reclamo ya fue resuelto.');
    const {tipo,motivo,monto=0}=datos??{};
    if(!['REEMBOLSO','AJUSTE','RECHAZO'].includes(tipo)) throw new ErrorApp(400,'Selecciona una resolución válida.');
    const razon=texto(motivo,'La explicación',1000),r=this.reserva(c.reservaId);
    const devuelto=this.registros.listar('reclamos').filter(x=>x.reservaId===r.id&&x.estado==='RESUELTO').reduce((s,x)=>s+(x.monto||0),0);
    if(!Number.isInteger(monto)||monto<0||(tipo==='RECHAZO'?monto!==0:monto<1)||monto>r.servicio.precio-devuelto) throw new ErrorApp(400,'Monto inválido o superior al saldo del pago. El rechazo requiere monto cero.');
    const resultado={...c,estado:'RESUELTO',tipo,motivoResolucion:razon,monto,resueltoEn:this.ahora().toISOString(),referencia:tipo==='RECHAZO'?null:'SIM-'+randomUUID()};
    this.registros.guardar('reclamos',resultado);
    this.evento(r,'Reclamo resuelto: '+tipo+' · '+razon+' · $'+monto+' COP (simulado).');
    return resultado;
  }
}
module.exports=ReclamoController;
