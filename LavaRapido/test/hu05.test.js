const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const crearFachada = require('../src/controllers/LavaRapidoFacade');
const { crearApp } = require('../server');
const ahora = () => new Date('2030-01-07T12:00:00Z');
const datos = { lavaderoId: 'lav-norte', servicioId: 'basico', vehiculo: 'Carro', fecha: '2030-01-07', hora: '08:00' };

test('HU05 lista fecha y establecimiento, confirma, cancela, libera cupo y persiste', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'lavarapido-hu05-'));
  const archivo = path.join(dir, 'db.sqlite');
  let f = crearFachada(ahora, archivo);
  try {
    const reserva = f.reservar('ana', datos).reserva;
    assert.equal(f.listarTurnos('lav-norte').length, 1);
    assert.equal(f.listarTurnos('lav-centro', datos.fecha).length, 0);
    assert.equal(f.listarTurnos('lav-norte', '2030-01-08').length, 0);
    assert.throws(() => f.listarTurnos('lav-norte', '2030-02-30'), { estadoHttp: 400 });
    assert.throws(() => f.cambiarEstadoTurno('lav-centro', reserva.id, 'CANCELADO'), { estadoHttp: 404 });
    assert.throws(() => f.cambiarEstadoTurno('lav-norte', reserva.id, 'FINALIZADO'), { estadoHttp: 409 });
    assert.equal(f.cambiarEstadoTurno('lav-norte', reserva.id, 'CONFIRMADO').estado, 'CONFIRMADO');
    assert.equal(f.disponibilidad('lav-norte', datos.fecha).turnos[0].cupos, 0);
    assert.throws(() => f.cambiarEstadoTurno('lav-norte', reserva.id, 'CONFIRMADO'), { estadoHttp: 409 });
    f.cerrar(); f = crearFachada(ahora, archivo);
    assert.equal(f.listarTurnos('lav-norte')[0].estado, 'CONFIRMADO');
    assert.equal(f.cambiarEstadoTurno('lav-norte', reserva.id, 'CANCELADO').estado, 'CANCELADO');
    assert.equal(f.historial('ana').reservas[0].estado, 'CANCELADO');
    assert.equal(f.disponibilidad('lav-norte', datos.fecha).turnos[0].cupos, 1);
    assert.throws(() => f.cambiarEstadoTurno('lav-norte', reserva.id, 'CONFIRMADO'), { estadoHttp: 409 });
    assert.equal(f.reservar('mateo', datos).reserva.estado, 'RESERVADO');
  } finally { f.cerrar(); rmSync(dir, { recursive: true, force: true }); }
});

test('HU05 API exige rol de lavadero y rechaza cuerpos y establecimientos inválidos', async () => {
  const app = crearApp({ ahora, archivoDatos: ':memory:' });
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => servidor.once('listening', resolve));
  const url = 'http://127.0.0.1:' + servidor.address().port;
  const base = '/api/gestion/lavaderos/lav-norte/turnos';
  try {
    assert.equal((await fetch(url + base)).status, 403);
    const response = await fetch(url + '/api/reservas', { method: 'POST', headers: {
      'X-Rol-Demo': 'cliente', 'X-Cliente-Demo': 'ana', 'Content-Type': 'application/json'
    }, body: JSON.stringify(datos) });
    assert.equal(response.status, 201);
    const { reserva } = await response.json();
    const headers = { 'X-Rol-Demo': 'lavadero', 'Content-Type': 'application/json' };
    const lista = await fetch(url + base, { headers });
    assert.equal(lista.status, 200);
    assert.equal((await lista.json()).length, 1);
    const cambiar = (body) => fetch(url + base + '/' + reserva.id, { method: 'PATCH', headers, body: JSON.stringify(body) });
    assert.equal((await cambiar(null)).status, 400);
    assert.equal((await cambiar({ estado: 'CONFIRMADO' })).status, 200);
    assert.equal((await cambiar({ estado: 'CANCELADO' })).status, 200);
    assert.equal((await fetch(url + '/api/gestion/lavaderos/inexistente/turnos', { headers })).status, 404);
  } finally {
    await new Promise((resolve) => servidor.close(resolve));
    app.locals.cerrarDatos();
  }
});
