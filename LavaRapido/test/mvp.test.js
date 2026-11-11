const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { crearApp } = require('../server');
const Lavadero = require('../src/models/Lavadero');
const LavaderoDAO = require('../src/dao/LavaderoDAO');
const LavaderoController = require('../src/controllers/LavaderoController');

test('HU08 conserva los nombres y constructor base de los componentes', () => {
  const lavadero = new Lavadero('prueba', 'Ejemplo', 'Dirección', '1234567');
  const BaseDatos = require('../src/dao/BaseDatos');
  const db = new BaseDatos(':memory:');
  lavadero.sector = 'Centro';
  lavadero.ubicacion = { lat: 1.2, lon: -77.2 };
  const dao = new LavaderoDAO(db);
  db.transaccion(() => dao.guardar(lavadero));
  const controlador = new LavaderoController(dao);
  assert.equal(dao.obtenerTodos().length, 1);
  assert.deepEqual(dao.obtenerPorId('prueba'), lavadero);
  assert.deepEqual(dao.obtenerPorEstado('PENDIENTE')[0], lavadero);
  assert.deepEqual(controlador.listarPendientes()[0], lavadero);
  assert.equal(controlador.aprobar('prueba').estado, 'APROBADO');
  assert.equal(controlador.suspender('prueba').estado, 'SUSPENDIDO');
  db.cerrar();
});

test('API MVP: registro, agenda, simultaneidad, correo, código y supervisión', async () => {
  let instante = '2030-01-07T12:00:00Z';
  const app = crearApp({ ahora: () => new Date(instante), archivoDatos: ':memory:' });
  const servidor = app.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  const url = 'http://127.0.0.1:' + servidor.address().port + '/api';
  async function api(ruta, estado, { rol, cliente, datos, metodo } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (rol) headers['X-Rol-Demo'] = rol;
    if (cliente) headers['X-Cliente-Demo'] = cliente;
    const respuesta = await fetch(url + ruta, { headers, method: metodo, body: JSON.stringify(datos) });
    const json = await respuesta.json();
    if (estado !== null) assert.equal(respuesta.status, estado, ruta + ' ' + JSON.stringify(json));
    return { estado: respuesta.status, json };
  }
  const fecha = '2030-01-07';
  const agenda = { capacidad: 1, horarios: { 0: null, 1: { apertura: '08:00', cierre: '10:00' }, 2: null, 3: null, 4: null, 5: null, 6: { apertura: '08:00', cierre: '14:00' } } };
  const registro = { rol: 'lavadero', metodo: 'POST', datos: {
    nombre: 'Eco Sur', direccion: 'Calle 16 #8-10', telefono: '3000000000', sector: 'Sur',
    servicios: [{ id: 'basico', precio: 13000 }, { id: 'completo', precio: 45000 }], ...agenda
  } };
  try {
    await api('/gestion/lavaderos', 400, { ...registro, datos: { ...registro.datos, nombre: '   ' } });
    await api('/gestion/lavaderos', 400, { ...registro, datos: { ...registro.datos, servicios: [] } });
    await api('/gestion/lavaderos', 400, { ...registro, datos: { ...registro.datos, capacidad: 0 } });
    const { json: nuevo } = await api('/gestion/lavaderos', 201, registro);
    assert.equal(nuevo.estado, 'PENDIENTE');
    assert.equal(nuevo.servicios[1].precio, 45000);
    const admin = { rol: 'admin' };
    const patch = { ...admin, metodo: 'PATCH' };
    assert((await api('/admin/lavaderos/pendientes', 200, admin)).json.some(({ id }) => id === nuevo.id));
    assert(!(await api('/lavaderos', 200)).json.lavaderos.some(({ id }) => id === nuevo.id));
    await api('/admin/lavaderos/' + nuevo.id + '/aprobar', 403, { rol: 'cliente', metodo: 'PATCH' });
    await api('/admin/lavaderos/lav-sur/rechazar', 400, { ...patch, datos: { motivo: ' ' } });
    assert.equal((await api('/admin/lavaderos/lav-sur/rechazar', 200, { ...patch, datos: { motivo: 'Documentación incompleta' } })).json.motivo, 'Documentación incompleta');
    assert.equal((await api('/admin/lavaderos/' + nuevo.id + '/aprobar', 200, patch)).json.estado, 'APROBADO');
    assert((await api('/lavaderos', 200)).json.lavaderos.some(({ id, distanciaKm }) => id === nuevo.id && distanciaKm > 0));
    await api('/lavaderos?lat=1.2', 400);
    await api('/lavaderos?lat=1.2&lon=-77.2', 200);
    const disponibilidad = '/lavaderos/' + nuevo.id + '/disponibilidad?fecha=';
    await api(disponibilidad + '2030-02-31', 400);
    await api(disponibilidad + '2030-01-06', 400);
    assert((await api(disponibilidad + '2030-01-13', 200)).json.cerrado);
    assert.deepEqual((await api(disponibilidad + fecha, 200)).json.turnos.map(({ hora, cupos }) => [hora, cupos]),
      [['08:00', 1], ['09:00', 1]]);
    const datos = { lavaderoId: nuevo.id, fecha, hora: '08:00', vehiculo: 'Carro', servicioId: 'completo' };
    const reservar = (cliente, datosTurno, estado) => api('/reservas', estado,
      { metodo: 'POST', rol: 'cliente', cliente, datos: datosTurno });
    await reservar('ana', { ...datos, hora: '10:00' }, 400);
    await reservar('ana', { ...datos, servicioId: 'otro' }, 400);
    const resultados = await Promise.all([
      reservar('ana', datos, null), reservar('mateo', { ...datos, vehiculo: 'Moto' }, null)
    ]);
    assert.deepEqual(resultados.map(({ estado }) => estado).sort(), [201, 409]);
    const { reserva, correo } = resultados.find(({ estado }) => estado === 201).json;
    assert.equal(reserva.estado, 'RESERVADO');
    assert.equal(reserva.pago.estado, 'APROBADO');
    assert.equal(reserva.pago.monto, 45000);
    assert.match(reserva.codigo, /^LR[A-F0-9]{10}$/);
    assert(correo.mensaje.includes(reserva.codigo));
    assert.equal(correo.estado, 'CORREO ENVIADO (SIMULADO)');
    const historial = (await api('/mis-reservas', 200, { rol: 'cliente', cliente: reserva.clienteId })).json;
    assert.equal(historial.reservas.length, 1);
    assert.equal(historial.correos.length, 1);
    assert.equal((await api(disponibilidad + fecha, 200)).json.turnos[0].estado, 'OCUPADO');
    const rutaAgenda = '/gestion/lavaderos/' + nuevo.id + '/agenda';
    const configurar = (datos, estado) => api(rutaAgenda, estado, { rol: 'lavadero', metodo: 'PUT', datos });
    await configurar({ capacidad: 2, horarios: { ...agenda.horarios, 1: null } }, 409);
    await configurar({ capacidad: 2, horarios: agenda.horarios }, 200);
    await reservar(reserva.clienteId, datos, 409);
    const otra = (await reservar('lina', { ...datos, vehiculo: 'Bicicleta' }, 201)).json.reserva;
    assert.notEqual(reserva.codigo, otra.codigo);
    await configurar(agenda, 409);
    const comprobarCodigo = async (id, codigo = reserva.codigo) =>
      (await api('/gestion/lavaderos/' + id + '/codigos/' + codigo, 200, { rol: 'lavadero' })).json.valido;
    assert.equal(await comprobarCodigo(nuevo.id), false);
    instante = '2030-01-07T13:00:00Z';
    assert.equal(await comprobarCodigo(nuevo.id), true);
    assert.equal(await comprobarCodigo('lav-centro'), false);
    await reservar('lina', { ...datos, hora: '08:00' }, 400);
    instante = '2030-01-07T13:59:59Z';
    assert.equal(await comprobarCodigo(nuevo.id), true);
    instante = '2030-01-07T14:00:00Z';
    assert.equal(await comprobarCodigo(nuevo.id), false);
    assert.equal((await api('/admin/lavaderos/' + nuevo.id + '/suspender', 200, patch)).json.estado, 'SUSPENDIDO');
    assert(!(await api('/lavaderos', 200)).json.lavaderos.some(({ id }) => id === nuevo.id));
    await api(disponibilidad + fecha, 404);
    await reservar('lina', { ...datos, fecha: '2030-01-12' }, 404);
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
    app.locals.cerrarDatos();
  }
});
