const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const crearFachada = require('../src/controllers/LavaRapidoFacade');
const { crearApp } = require('../server');
const datos = { lavaderoId: 'lav-norte', servicioId: 'basico', vehiculo: 'Carro', fecha: '2030-01-07', hora: '10:00' };

test('HU07 permite hasta exactamente 2h antes y rechaza 1ms después sin liberar cupo', () => {
  for (const [instante, permitido] of [['2030-01-07T12:59:59.999Z', true], ['2030-01-07T13:00:00Z', true], ['2030-01-07T13:00:00.001Z', false]]) {
    let reloj = new Date('2030-01-07T12:00:00Z');
    const f = crearFachada(() => reloj, ':memory:');
    try {
      const { reserva } = f.reservar('ana', datos);
      reloj = new Date(instante);
      assert.equal(f.historial('ana').reservas[0].puedeCancelar, permitido);
      if (permitido) {
        f.cambiarEstadoTurno('lav-norte', reserva.id, 'CONFIRMADO');
        assert.equal(f.cancelarReserva('ana', reserva.id).reserva.estado, 'CANCELADO');
        assert.equal(f.disponibilidad('lav-norte', datos.fecha).turnos.find(t => t.hora === '10:00').cupos, 1);
        assert.equal(f.listarAvisosLavadero('lav-norte').length, 1);
        assert.throws(() => f.cancelarReserva('ana', reserva.id), { estadoHttp: 409 });
        assert.equal(f.listarAvisosLavadero('lav-norte').length, 1);
        assert.equal(f.reservar('mateo', datos).reserva.estado, 'RESERVADO');
      } else {
        assert.throws(() => f.cancelarReserva('ana', reserva.id), { estadoHttp: 409 });
        assert.equal(f.historial('ana').reservas[0].estado, 'RESERVADO');
        assert.equal(f.listarAvisosLavadero('lav-norte').length, 0);
        assert.equal(f.disponibilidad('lav-norte', datos.fecha).turnos.find(t => t.hora === '10:00').cupos, 0);
      }
    } finally { f.cerrar(); }
  }
});

test('HU07 migración v1 preserva reservas, estado y avisos al reabrir', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'lavarapido-hu07-'));
  const archivo = path.join(dir, 'prueba.sqlite');
  const ahora = () => new Date('2030-01-07T12:00:00Z');
  let f = crearFachada(ahora, archivo);
  let abierto = true;
  try {
    const { reserva } = f.reservar('ana', datos);
    f.cerrar(); abierto = false;
    const antigua = new DatabaseSync(archivo);
    antigua.exec('DROP TABLE notificaciones; PRAGMA user_version=1;'); antigua.close();
    f = crearFachada(ahora, archivo); abierto = true;
    assert.equal(f.historial('ana').reservas[0].id, reserva.id);
    assert.throws(() => f.cancelarReserva('mateo', reserva.id), { estadoHttp: 404 });
    assert.throws(() => f.cancelarReserva('inexistente', reserva.id), { estadoHttp: 400 });
    f.cancelarReserva('ana', reserva.id);
    f.cerrar(); abierto = false;
    f = crearFachada(ahora, archivo); abierto = true;
    assert.equal(f.historial('ana').reservas[0].estado, 'CANCELADO');
    const avisos = f.listarAvisosLavadero('lav-norte');
    assert.equal(avisos.length, 1); assert.equal(avisos[0].reservaId, reserva.id);
    assert.match(avisos[0].mensaje, new RegExp(reserva.codigo));
    assert.equal(f.listarAvisosLavadero('lav-centro').length, 0);
    assert.throws(() => f.listarAvisosLavadero('inexistente'), { estadoHttp: 404 });
  } finally { if (abierto) f.cerrar(); rmSync(dir, { recursive: true, force: true }); }
});

test('HU07 fallo del aviso revierte cancelación y no libera capacidad', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'lavarapido-hu07-atomicidad-'));
  const archivo = path.join(dir, 'prueba.sqlite');
  const f = crearFachada(() => new Date('2030-01-07T12:00:00Z'), archivo);
  const db = new DatabaseSync(archivo);
  try {
    const { reserva } = f.reservar('ana', datos);
    db.exec("CREATE TRIGGER fallo_aviso BEFORE INSERT ON notificaciones BEGIN SELECT RAISE(ABORT, 'aviso fallido'); END;");
    assert.throws(() => f.cancelarReserva('ana', reserva.id), /aviso fallido/);
    assert.equal(f.historial('ana').reservas[0].estado, 'RESERVADO');
    assert.equal(f.listarAvisosLavadero('lav-norte').length, 0);
    assert.equal(f.disponibilidad('lav-norte', datos.fecha).turnos.find(t => t.hora === '10:00').cupos, 0);
    db.exec('DROP TRIGGER fallo_aviso');
    assert.equal(f.cancelarReserva('ana', reserva.id).reserva.estado, 'CANCELADO');
  } finally { db.close(); f.cerrar(); rmSync(dir, { recursive: true, force: true }); }
});

test('HU07 API valida rol y propietario, cancela una vez y publica aviso del lavadero', async () => {
  const app = crearApp({ ahora: () => new Date('2030-01-07T12:00:00Z'), archivoDatos: ':memory:' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(r => server.once('listening', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const headers = { 'X-Rol-Demo': 'cliente', 'X-Cliente-Demo': 'ana', 'Content-Type': 'application/json' };
  try {
    const response = await fetch(base + '/api/reservas', { method: 'POST', headers, body: JSON.stringify(datos) });
    const { reserva } = await response.json();
    const ruta = base + '/api/reservas/' + reserva.id + '/cancelar';
    assert.equal((await fetch(ruta, { method: 'PATCH' })).status, 403);
    assert.equal((await fetch(ruta, { method: 'PATCH', headers: { ...headers, 'X-Cliente-Demo': 'mateo' } })).status, 404);
    assert.equal((await fetch(ruta, { method: 'PATCH', headers })).status, 200);
    assert.equal((await fetch(ruta, { method: 'PATCH', headers })).status, 409);
    const avisos = base + '/api/gestion/lavaderos/lav-norte/avisos';
    assert.equal((await fetch(avisos, { headers })).status, 403);
    const respuesta = await fetch(avisos, { headers: { 'X-Rol-Demo': 'lavadero' } });
    assert.equal((await respuesta.json()).length, 1);
  } finally { await new Promise(r => server.close(r)); app.locals.cerrarDatos(); }
});
