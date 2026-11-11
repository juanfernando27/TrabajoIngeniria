class Cliente {
  /**
   * Crea un perfil de cliente de demostración.
   * @param {string} id - Identificador.
   * @param {string} nombre - Nombre para mostrar.
   * @param {string} correo - Destino de los avisos simulados.
   * @returns {Cliente} Registro inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(id, nombre, correo) {
    Object.assign(this, { id, nombre, correo });
  }
}

module.exports = Cliente;
