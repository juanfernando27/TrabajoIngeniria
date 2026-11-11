const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');
const crearFachada = require('../src/controllers/LavaRapidoFacade');

const ahora = () => new Date('2030-01-07T12:00:00Z');
const datos = { lavaderoId: 'lav-norte', servicioId: 'basico', vehiculo: 'Carro', fecha: '2030-01-07', hora: '08:00' };

test('conserva reservas, servicios y avisos al cerrar y volver a abrir SQLite', () => {
  const directorio = mkdtempSync(path.join(tmpdir(), 'lavarapido-persistencia-'));
  const archivo = path.join(directorio, 'prueba.sqlite');
  let f;
  try {
    f = crearFachada(ahora, archivo);
    const codigo = f.reservar('ana', datos).reserva.codigo;
    f.cerrar();
    f = crearFachada(ahora, archivo);
    assert.equal(f.historial('ana').reservas[0].codigo, codigo);
    assert.equal(f.historial('ana').correos.length, 1);
    assert.equal(f.listarTodos().length, 3);
    assert.equal(f.disponibilidad('lav-norte', datos.fecha).turnos[0].cupos, 0);
  } finally {
    f?.cerrar();
    rmSync(directorio, { recursive: true, force: true });
  }
});

test('revierte el turno si falla la escritura del correo y conserva el cupo', () => {
  const directorio = mkdtempSync(path.join(tmpdir(), 'lavarapido-atomicidad-'));
  const archivo = path.join(directorio, 'prueba.sqlite');
  const f = crearFachada(ahora, archivo);
  const externa = new DatabaseSync(archivo);
  try {
    externa.exec("CREATE TRIGGER simular_fallo BEFORE INSERT ON correos BEGIN SELECT RAISE(ABORT, 'fallo simulado'); END;");
    assert.throws(() => f.reservar('ana', datos), /fallo simulado/);
    assert.equal(f.historial('ana').reservas.length, 0);
    assert.equal(f.historial('ana').correos.length, 0);
    assert.equal(f.disponibilidad('lav-norte', datos.fecha).turnos[0].cupos, 1);
    externa.exec('DROP TRIGGER simular_fallo');
    assert.equal(f.reservar('ana', datos).reserva.estado, 'RESERVADO');
  } finally {
    externa.close();
    f.cerrar();
    rmSync(directorio, { recursive: true, force: true });
  }
});

test('dos procesos con la misma base de datos compiten por un único cupo', async () => {
  const directorio = mkdtempSync(path.join(tmpdir(), 'lavarapido-concurrencia-'));
  const archivo = path.join(directorio, 'prueba.sqlite');
  const f = crearFachada(ahora, archivo);
  f.cerrar();
  const codigo = `
    const crearFachada = require(process.argv[1]);
    const f = crearFachada(() => new Date('2030-01-07T12:00:00Z'), process.argv[2]);
    try {
      f.reservar(process.argv[3], JSON.parse(process.argv[4]));
      console.log('201');
    } catch (error) {
      if (error.estadoHttp !== 409) { console.error(error); process.exitCode = 1; }
      console.log(String(error.estadoHttp));
    } finally { f.cerrar(); }
  `;
  const ejecutar = (cliente) => new Promise((resolver, rechazar) => {
    const hijo = spawn(process.execPath, ['-e', codigo, path.resolve(__dirname, '../src/controllers/LavaRapidoFacade.js'), archivo, cliente, JSON.stringify(datos)]);
    let salida = '';
    let error = '';
    hijo.stdout.on('data', (fragmento) => { salida += fragmento; });
    hijo.stderr.on('data', (fragmento) => { error += fragmento; });
    hijo.on('error', rechazar);
    hijo.on('close', (estado) => estado === 0 ? resolver(salida.trim()) : rechazar(new Error(error)));
  });
  try {
    const resultados = await Promise.all([ejecutar('ana'), ejecutar('mateo')]);
    assert.deepEqual(resultados.sort(), ['201', '409']);
    const comprobacion = crearFachada(ahora, archivo);
    assert.equal(comprobacion.disponibilidad('lav-norte', datos.fecha).turnos[0].cupos, 0);
    comprobacion.cerrar();
  } finally {
    rmSync(directorio, { recursive: true, force: true });
  }
});
