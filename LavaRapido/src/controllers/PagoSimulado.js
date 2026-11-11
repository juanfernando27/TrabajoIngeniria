const { randomUUID } = require('node:crypto');

class PagoSimulado {
  /**
   * Simula una aprobación de la pasarela externa.
   * @param {number} monto - Total en COP.
   * @returns {object} Referencia, monto y estado de la operación ficticia.
   * @throws {Error} Si el generador de referencias del sistema no está disponible.
   */
  aprobar(monto) {
    return { referencia: randomUUID(), estado: 'APROBADO', monto, moneda: 'COP' };
  }
}

module.exports = PagoSimulado;
