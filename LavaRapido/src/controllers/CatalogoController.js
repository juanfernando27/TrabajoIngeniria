const { ErrorApp }=require('./reglas');
class CatalogoController {
  /** @param {object} lavaderos - Controlador. @param {object} dao - DAO. @returns {CatalogoController} Controlador. @throws {never} Solo asigna. */
  constructor(lavaderos,dao) { Object.assign(this,{lavaderos,dao}); }
  /** @param {string} id - Lavadero. @param {string} servicioId - Servicio. @param {number} precio - COP. @returns {object} Catálogo actualizado. @throws {ErrorApp} Datos inválidos. @throws {Error} Error SQL. */
  precio(id,servicioId,precio) {
    const l=this.lavaderos.obtener(id);
    const s=l.servicios.find(s=>s.id===servicioId);
    if(!s || !Number.isInteger(precio) || precio<1 || precio>1000000) throw new ErrorApp(400,'Servicio válido y precio entero entre $1 y $1.000.000 requeridos.');
    s.precio=precio;
    return this.dao.guardar(l);
  }
}
module.exports=CatalogoController;
