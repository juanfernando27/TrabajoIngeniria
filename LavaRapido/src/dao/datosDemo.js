const Lavadero = require('../models/Lavadero');
const Servicio = require('../models/Servicio');
const Cliente = require('../models/Cliente');

const SECTORES = Object.freeze({
  Centro: { lat: 1.2136, lon: -77.2773 },
  Norte: { lat: 1.2340, lon: -77.2830 },
  Sur: { lat: 1.1974, lon: -77.2668 },
  Oriente: { lat: 1.2140, lon: -77.2564 },
  Occidente: { lat: 1.2219, lon: -77.2966 }
});

/**
 * Genera una copia independiente de los datos iniciales.
 * @returns {{lavaderos: Lavadero[], clientes: Cliente[]}} Establecimientos y perfiles ficticios.
 * @throws {never} Los registros se construyen con datos fijos.
 */
function crearDatosDemo() {
  const horarios = Object.fromEntries(
    Array.from({ length: 7 }, (_, dia) => [
      dia, dia === 0 ? null : { apertura: '08:00', cierre: dia === 6 ? '14:00' : '18:00' }
    ])
  );

  return {
    lavaderos: [
      new Lavadero('lav-centro', 'Brillo Centro', 'Carrera 25 #18-40, Pasto', '6027210101', 'APROBADO', null, {
        sector: 'Centro', ubicacion: SECTORES.Centro, horarios: structuredClone(horarios), capacidad: 2,
        servicios: [new Servicio('basico', 'Básico', 15000), new Servicio('completo', 'Completo', 45000)]
      }),
      new Lavadero('lav-norte', 'Aqua Norte', 'Calle 25 #39-18, Pasto', '6027210102', 'APROBADO', null, {
        sector: 'Norte', ubicacion: SECTORES.Norte, horarios: structuredClone(horarios), capacidad: 1,
        servicios: [new Servicio('basico', 'Básico', 17000), new Servicio('aspirado', 'Aspirado', 12000)]
      }),
      new Lavadero('lav-sur', 'Estación Agua Sur', 'Calle 12 #8-23, Pasto', '6027210103', 'PENDIENTE', null, {
        sector: 'Sur', ubicacion: SECTORES.Sur, horarios: structuredClone(horarios), capacidad: 1,
        servicios: [new Servicio('completo', 'Completo', 40000), new Servicio('encerado', 'Encerado', 30000)]
      })
    ],
    clientes: [
      new Cliente('ana', 'Ana Torres', 'ana@example.com'),
      new Cliente('mateo', 'Mateo Díaz', 'mateo@example.com'),
      new Cliente('lina', 'Lina López', 'lina@example.com')
    ]
  };
}

module.exports = { crearDatosDemo, SECTORES };
