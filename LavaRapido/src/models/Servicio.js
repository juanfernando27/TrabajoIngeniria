class Servicio {
  /**
   * Crea una opción del catálogo.
   * @param {string} id - Identificador del tipo de servicio.
   * @param {string} nombre - Nombre para mostrar.
   * @param {number} precio - Valor entero en COP.
   * @returns {Servicio} Registro inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(id, nombre, precio) {
    Object.assign(this, { id, nombre, precio });
  }
}

module.exports = Servicio;
