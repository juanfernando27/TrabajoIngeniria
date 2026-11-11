const path = require('node:path');
const express = require('express');
const crearFachada = require('./src/controllers/LavaRapidoFacade');
const { ErrorApp } = require('./src/controllers/reglas');

/**
 * Crea el servidor HTTP sin abrir un puerto.
 * @param {{ahora?: () => Date, archivoDatos?: string}} [opciones={}] - Reloj y archivo de datos opcionales.
 * @returns {import('express').Express} Aplicación con las rutas REST y las vistas.
 * @throws {Error} Si falla la inicialización de Express o de SQLite.
 */
function crearApp({ ahora, archivoDatos } = {}) {
  const app = express();
  const fachada = crearFachada(ahora, archivoDatos);
  app.locals.cerrarDatos = fachada.cerrar;
  app.disable('x-powered-by');
  app.use('/api', express.json({ limit: '32kb' }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  /**
   * Adapta una operación de la fachada a una respuesta JSON.
   * @param {string|null} rol - Rol de demostración requerido.
   * @param {Function} accion - Operación que recibe la solicitud HTTP.
   * @param {number} [estado=200] - Código HTTP de éxito.
   * @returns {import('express').RequestHandler} Manejador de la ruta.
   * @throws {never} Los errores de la operación los recibe Express.
   */
  function servir(rol, accion, estado = 200) {
    return (req, res) => {
      if (rol) fachada.autorizar(rol, req.get('X-Rol-Demo'));
      res.status(estado).json(accion(req));
    };
  }

  app.get('/api/opciones', servir(null, () => fachada.opciones()));
  app.get('/api/lavaderos', servir(null, (req) => fachada.listarCercanos(req.query.lat, req.query.lon)));
  app.get('/api/lavaderos/:id/disponibilidad',
    servir(null, (req) => fachada.disponibilidad(req.params.id, req.query.fecha)));
  app.get('/api/mis-reservas',
    servir('cliente', (req) => fachada.historial(req.get('X-Cliente-Demo'))));
  app.post('/api/reservas',
    servir('cliente', (req) => fachada.reservar(req.get('X-Cliente-Demo'), req.body), 201));

  app.get('/api/gestion/lavaderos', servir('lavadero', () => fachada.listarTodos()));
  app.post('/api/gestion/lavaderos', servir('lavadero', (req) => fachada.registrar(req.body), 201));
  app.put('/api/gestion/lavaderos/:id/agenda',
    servir('lavadero', (req) => fachada.configurar(req.params.id, req.body)));
  app.get('/api/gestion/lavaderos/:id/codigos/:codigo',
    servir('lavadero', (req) => fachada.validarCodigo(req.params.id, req.params.codigo)));

  app.get('/api/gestion/lavaderos/:id/turnos',
    servir('lavadero', (req) => fachada.listarTurnos(req.params.id, req.query.fecha)));
  app.patch('/api/gestion/lavaderos/:id/turnos/:turnoId',
    servir('lavadero', (req) => fachada.cambiarEstadoTurno(req.params.id, req.params.turnoId, req.body?.estado)));

  app.get('/api/admin/lavaderos', servir('admin', () => fachada.listarTodos()));
  app.get('/api/admin/lavaderos/pendientes', servir('admin', () => fachada.listarPendientes()));
  app.patch('/api/admin/lavaderos/:id/aprobar',
    servir('admin', (req) => fachada.aprobar(req.params.id)));
  app.patch('/api/admin/lavaderos/:id/rechazar',
    servir('admin', (req) => fachada.rechazar(req.params.id, req.body?.motivo)));
  app.patch('/api/admin/lavaderos/:id/suspender',
    servir('admin', (req) => fachada.suspender(req.params.id)));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta de la API no encontrada.' }));
  app.use(express.static(path.join(__dirname, 'src', 'views')));
  app.use((error, _req, res, _next) => {
    if (error instanceof ErrorApp) return res.status(error.estadoHttp).json({ error: error.message });
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'El contenido JSON no es válido.' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'La solicitud supera el tamaño permitido.' });
    }
    if (error.code === 'ERR_SQLITE_ERROR' && /locked|busy/i.test(error.message)) {
      return res.status(503).json({ error: 'La agenda está ocupada. Vuelve a intentar la operación.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud.' });
  });
  return app;
}

if (require.main === module) {
  const puerto = process.env.PORT || 3000;
  const app = crearApp();
  const servidor = app.listen(Number(puerto), '127.0.0.1', () => {
    console.log(`LavaRápido disponible en http://127.0.0.1:${puerto}`);
  });
  servidor.on('close', app.locals.cerrarDatos);
  process.once('SIGINT', () => servidor.close());
  process.once('SIGTERM', () => servidor.close());
}

module.exports = { crearApp };
