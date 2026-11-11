class Empleado {
  /**
   * Crea un registro para la futura asignación de turnos.
   * @param {string} id - Identificador.
   * @param {string} nombre - Nombre para mostrar.
   * @param {string} lavaderoId - Establecimiento al que pertenece.
   * @returns {Empleado} Registro inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(id, nombre, lavaderoId) {
    Object.assign(this, { id, nombre, lavaderoId });
  }
}

module.exports = Empleado;
