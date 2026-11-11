class MemoriaDAO {
  /**
   * Abre una colección en memoria.
   * @param {object[]} [registros=[]] - Datos iniciales con identificador.
   * @returns {MemoriaDAO} Colección inicializada.
   * @throws {never} Con una lista de registros válida.
   */
  constructor(registros = []) {
    this.registros = new Map(registros.map((registro) => [registro.id, registro]));
  }

  /**
   * Devuelve todos los registros.
   * @returns {object[]} Copia de la lista de referencias almacenadas.
   * @throws {never} Solo lee la colección.
   */
  obtenerTodos() {
    return Array.from(this.registros.values());
  }

  /**
   * Busca un registro por su identificador.
   * @param {string} id - Identificador.
   * @returns {object|null} Registro encontrado o nulo.
   * @throws {never} Solo lee la colección.
   */
  obtenerPorId(id) {
    return this.registros.get(id) ?? null;
  }

  /**
   * Inserta o reemplaza un registro por su identificador.
   * @param {object} registro - Datos del registro con la propiedad id.
   * @returns {object} Registro almacenado.
   * @throws {never} Con un registro válido.
   */
  guardar(registro) {
    this.registros.set(registro.id, registro);
    return registro;
  }
}

module.exports = MemoriaDAO;
