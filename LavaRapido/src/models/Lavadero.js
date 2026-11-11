class Lavadero {
  /**
   * Crea un registro de lavadero.
   * @param {string} id - Identificador.
   * @param {string} nombre - Nombre comercial.
   * @param {string} direccion - Dirección comercial.
   * @param {string} telefono - Teléfono de contacto.
   * @param {string} [estado='PENDIENTE'] - Estado de supervisión.
   * @param {string|null} [motivo=null] - Motivo registrado.
   * @param {object} [perfil={}] - Ubicación, catálogo y agenda.
   * @returns {Lavadero} Registro inicializado.
   * @throws {never} El constructor solo asigna datos.
   */
  constructor(id, nombre, direccion, telefono, estado = 'PENDIENTE', motivo = null, perfil = {}) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion;
    this.telefono = telefono;
    this.estado = estado;
    this.motivo = motivo;
    this.sector = perfil.sector;
    this.ubicacion = perfil.ubicacion;
    this.servicios = perfil.servicios ?? [];
    this.horarios = perfil.horarios ?? {};
    this.capacidad = perfil.capacidad ?? 1;
  }
}

module.exports = Lavadero;
