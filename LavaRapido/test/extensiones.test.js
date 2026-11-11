const {test}=require('node:test');
const assert=require('node:assert/strict');
const crear=require('../src/controllers/LavaRapidoFacade');
const d={lavaderoId:'lav-norte',servicioId:'basico',vehiculo:'Carro',fecha:'2030-01-07',hora:'10:00'};
test('HU09 y HU06: pertenencia, estados, avisos, estrellas y promedio',()=>{
 const f=crear(()=>new Date('2030-01-07T12:00:00Z'),':memory:');
 try{
 const r=f.reservar('ana',d).reserva,e=f.empleados('lav-norte')[0].id,otro=f.empleados('lav-centro')[0].id;
 assert.throws(()=>f.calificar('ana',r.id,{estrellas:5}),{estadoHttp:409});
 assert.throws(()=>f.asignarEmpleado('lav-norte',r.id,otro),{estadoHttp:404});
 f.asignarEmpleado('lav-norte',r.id,e);
 assert.equal(f.turnosEmpleado(e).length,1);assert.equal(f.turnosEmpleado(otro).length,0);
 assert.throws(()=>f.estadoLavado(otro,r.id,'EN_PROCESO'),{estadoHttp:404});
 assert.throws(()=>f.estadoLavado(e,r.id,'FINALIZADO'),{estadoHttp:409});
 f.estadoLavado(e,r.id,'EN_PROCESO');f.estadoLavado(e,r.id,'FINALIZADO');
 assert.equal(f.historial('ana').eventos.length,2);
 assert.throws(()=>f.calificar('mateo',r.id,{estrellas:5}),{estadoHttp:404});
 for(const estrellas of [0,6,1.5])assert.throws(()=>f.calificar('ana',r.id,{estrellas}),{estadoHttp:400});
 f.calificar('ana',r.id,{estrellas:4,comentario:'Buen servicio'});
 assert.throws(()=>f.calificar('ana',r.id,{estrellas:5}),{estadoHttp:409});
 assert.equal(f.perfilLavadero('lav-norte').promedio,4);
 assert.equal(f.perfilLavadero('lav-norte').total,1);
 }finally{f.cerrar();}
});
test('HU11 actualiza catálogo público y futuras reservas, conserva precio contratado',()=>{
 const f=crear(()=>new Date('2030-01-07T12:00:00Z'),':memory:');
 try{const r=f.reservar('ana',d).reserva;
 f.precioServicio('lav-norte','basico',55000);
 assert.equal(f.listarCercanos().lavaderos.find(l=>l.id==='lav-norte').servicios.find(s=>s.id==='basico').precio,55000);
 assert.equal(f.historial('ana').reservas[0].servicio.precio,r.servicio.precio);
 assert.equal(f.reservar('mateo',{...d,hora:'11:00'}).reserva.servicio.precio,55000);
 assert.throws(()=>f.precioServicio('lav-norte','basico',-1),{estadoHttp:400});
 }finally{f.cerrar();}
});
test('HU10 reclamo, historial, resolución única y límite acumulado de devoluciones',()=>{
 const f=crear(()=>new Date('2030-01-07T12:00:00Z'),':memory:');
 try{const r=f.reservar('ana',d).reserva;
 assert.throws(()=>f.crearReclamo('mateo',r.id,'Motivo'),{estadoHttp:404});
 const c=f.crearReclamo('ana',r.id,'Problema con el servicio');
 assert.throws(()=>f.crearReclamo('ana',r.id,'Duplicado'),{estadoHttp:409});
 assert.throws(()=>f.resolverReclamo(c.id,{tipo:'REEMBOLSO',monto:r.servicio.precio+1,motivo:'Prueba'}),{estadoHttp:400});
 assert.throws(()=>f.resolverReclamo(c.id,{tipo:'RECHAZO',monto:0,motivo:''}),{estadoHttp:400});
 f.resolverReclamo(c.id,{tipo:'REEMBOLSO',monto:r.servicio.precio,motivo:'Devolución total'});
 assert.throws(()=>f.resolverReclamo(c.id,{tipo:'RECHAZO',monto:0,motivo:'Otra vez'}),{estadoHttp:409});
 const c2=f.crearReclamo('ana',r.id,'Segundo reclamo');
 assert.throws(()=>f.resolverReclamo(c2.id,{tipo:'AJUSTE',monto:1,motivo:'No hay saldo'}),{estadoHttp:400});
 f.resolverReclamo(c2.id,{tipo:'RECHAZO',monto:0,motivo:'Saldo ya devuelto'});
 assert.equal(f.listarReclamos().length,2);assert.equal(f.historial('ana').eventos.length,2);
 }finally{f.cerrar();}
});

test('extensiones conservan precios, empleados, estados, opiniones y resoluciones al reiniciar',()=>{
 const {mkdtempSync,rmSync}=require('node:fs'),path=require('node:path'),{tmpdir}=require('node:os');
 const dir=mkdtempSync(path.join(tmpdir(),'lr-completo-')),archivo=path.join(dir,'db.sqlite');
 const reloj=()=>new Date('2030-01-07T12:00:00Z');let f=crear(reloj,archivo);
 try{const r=f.reservar('ana',d).reserva,e=f.empleados('lav-norte')[0].id;
 f.asignarEmpleado('lav-norte',r.id,e);f.estadoLavado(e,r.id,'EN_PROCESO');f.estadoLavado(e,r.id,'FINALIZADO');
 f.calificar('ana',r.id,{estrellas:5});f.precioServicio('lav-norte','basico',40000);
 const c=f.crearReclamo('ana',r.id,'Diferencia de servicio');f.resolverReclamo(c.id,{tipo:'AJUSTE',monto:1000,motivo:'Ajuste aprobado'});
 f.cerrar();f=crear(reloj,archivo);
 assert.equal(f.turnosEmpleado(e)[0].estado,'FINALIZADO');assert.equal(f.perfilLavadero('lav-norte').promedio,5);
 assert.equal(f.listarReclamos()[0].monto,1000);assert.equal(f.historial('ana').eventos.length,3);
 assert.equal(f.listarCercanos().lavaderos.find(l=>l.id==='lav-norte').servicios.find(s=>s.id==='basico').precio,40000);
 }finally{f.cerrar();rmSync(dir,{recursive:true,force:true});}
});
