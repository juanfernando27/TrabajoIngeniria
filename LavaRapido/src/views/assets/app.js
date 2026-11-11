'use strict';

const MENU = {
  inicio: [['Cómo funciona', '#como-funciona'], ['Ingresar', '#ingreso']],
  cliente: [['Buscar', '#buscar'], ['Mis reservas', '#mis-turnos'], ['Correos simulados', '#avisos']],
  lavadero: [['Disponibilidad', '#configuracion'], ['Registrar lavadero', '#registro'], ['Validar código', '#validacion']],
  admin: [['Pendientes', '#por-revisar'], ['Supervisión', '#supervision']],
  empleado: [['Asignaciones', '#asignaciones']],
  soporte: [['Reclamos', '#reclamos']]
};
const pantalla = document.body.dataset.pantalla;
const llaveSesion = 'lavarapido-demo';
const pesos = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const distancia = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fechaEnvio = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota'
});

/**
 * Crea un icono de la colección SVG local.
 * @param {string} nombre - Identificador interno de un símbolo.
 * @returns {SVGElement} Icono decorativo.
 * @throws {never} Con un identificador de la colección.
 */
function icono(nombre) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', '/assets/iconos.svg#' + nombre);
  svg.append(use);
  return svg;
}

/**
 * Busca un elemento de esta pantalla.
 * @param {string} id - Identificador HTML.
 * @returns {HTMLElement} Elemento correspondiente.
 * @throws {never} Solo consulta el DOM.
 */
function porId(id) {
  return document.getElementById(id);
}

/**
 * Construye un nodo y asigna texto plano.
 * @param {string} etiqueta - Nombre de etiqueta HTML.
 * @param {string} [texto=''] - Contenido.
 * @param {string} [clase=''] - Clases CSS.
 * @returns {HTMLElement} Nodo listo para insertar.
 * @throws {never} Con una etiqueta HTML válida.
 */
function nodo(etiqueta, texto = '', clase = '') {
  const elemento = document.createElement(etiqueta);
  elemento.textContent = texto;
  elemento.className = clase;
  return elemento;
}

/**
 * Agrega una opción a un campo de selección.
 * @param {HTMLSelectElement} campo - Lista de opciones.
 * @param {string} valor - Valor enviado.
 * @param {string} etiqueta - Texto visible.
 * @returns {void}
 * @throws {never} Con un elemento de selección válido.
 */
function opcion(campo, valor, etiqueta) {
  campo.add(new Option(etiqueta, valor));
}

/**
 * Anuncia el resultado de una operación.
 * @param {string} [mensaje=''] - Mensaje de éxito o error.
 * @param {boolean} [esError=false] - Usa el canal de alerta.
 * @returns {void}
 * @throws {never} Las dos regiones existen en cada vista.
 */
function mostrar(mensaje = '', esError = false) {
  porId('aviso').textContent = esError ? '' : mensaje;
  porId('error').textContent = esError ? mensaje : '';
}

/**
 * Ejecuta una operación HTTP y devuelve su contenido JSON.
 * @param {string} ruta - Ruta dentro de la API.
 * @param {{metodo?: string, datos?: object}} [opciones={}] - Método y cuerpo.
 * @returns {Promise<object>} Datos de respuesta.
 * @throws {Error} Si falla la red o la API informa un error.
 */
async function api(ruta, { metodo = 'GET', datos } = {}) {
  const headers = { 'X-Rol-Demo': pantalla };
  const perfil = sessionStorage.getItem(llaveSesion + '-perfil');
  if (perfil) headers['X-Cliente-Demo'] = perfil;
  if (datos !== undefined) headers['Content-Type'] = 'application/json';
  const respuesta = await fetch('/api' + ruta, { method: metodo, headers, body: JSON.stringify(datos) });
  const resultado = await respuesta.json();
  if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo completar la operación.');
  return resultado;
}

/**
 * Vincula un formulario con una acción y maneja su botón mientras responde.
 * @param {HTMLFormElement} formulario - Formulario de la acción.
 * @param {Function} accion - Trabajo que se ejecuta al enviar.
 * @param {() => boolean} [habilitado] - Indica si el botón puede activarse al terminar.
 * @returns {void}
 * @throws {never} La acción reporta sus errores en la vista.
 */
function alEnviar(formulario, accion, habilitado = () => true) {
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const boton = evento.submitter || formulario.querySelector('button[type="submit"]');
    if (boton.disabled) return;
    boton.disabled = true;
    mostrar();
    try {
      await accion();
    } catch (error) {
      mostrar(error.message, true);
    } finally {
      boton.disabled = !habilitado();
    }
  });
}

/**
 * Muestra el menú correspondiente a la página.
 * @returns {void}
 * @throws {never} Todas las pantallas tienen un menú definido.
 */
function cargarMenu() {
  const enlaces = MENU[pantalla].map(([texto, href]) => {
    const enlace = nodo('a');
    const iconos = { '#buscar': 'buscar', '#mis-turnos': 'calendario', '#avisos': 'correo', '#registro': 'local', '#configuracion': 'calendario', '#validacion': 'turno', '#por-revisar': 'escudo', '#supervision': 'local', '#asignaciones': 'empleado', '#reclamos': 'soporte' };
    if (iconos[href]) enlace.append(icono(iconos[href]));
    enlace.append(nodo('span', texto));
    enlace.href = href;
    return enlace;
  });
  if (pantalla !== 'inicio') {
    const salida = nodo('a', 'Cambiar rol');
    salida.href = '/';
    salida.className = 'salida';
    salida.prepend(icono('salir'));
    salida.addEventListener('click', () => {
      sessionStorage.removeItem(llaveSesion);
      sessionStorage.removeItem(llaveSesion + '-perfil');
    });
    enlaces.push(salida);
  }
  porId('menu').replaceChildren(...enlaces);
  const marcar = () => {
    for (const enlace of enlaces) {
      if (enlace.hash === (window.location.hash || enlaces[0].hash)) enlace.setAttribute('aria-current', 'location');
      else enlace.removeAttribute('aria-current');
    }
  };
  window.addEventListener('hashchange', marcar);
  marcar();
}

/**
 * Habilita la selección de rol y perfil.
 * @param {object} metadatos - Perfiles públicos de la demostración.
 * @returns {void}
 * @throws {never} Con la vista de inicio cargada.
 */
function iniciarSesion(metadatos) {
  const formulario = porId('ingresar');
  const rol = porId('rol');
  const perfil = porId('perfil');
  for (const cliente of metadatos.clientes) opcion(perfil, cliente.id, cliente.nombre);
  const actualizar = () => {
    porId('perfiles').hidden = rol.value !== 'cliente';
    perfil.disabled = rol.value !== 'cliente';
    const descripciones = { cliente: 'Encuentra un lavadero y reserva tu próxima visita.', lavadero: 'Organiza los servicios, los horarios y los cupos de tu establecimiento.', admin: 'Revisa y supervisa la publicación de establecimientos.', empleado: 'Explora el espacio preparado para los turnos asignados.', soporte: 'Explora el espacio preparado para atender reclamos.' };
    porId('rol-descripcion').textContent = descripciones[rol.value];
  };
  rol.addEventListener('change', actualizar);
  actualizar();
  formulario.querySelector('button').disabled = false;
  alEnviar(formulario, () => {
    sessionStorage.setItem(llaveSesion, rol.value);
    if (rol.value === 'cliente') sessionStorage.setItem(llaveSesion + '-perfil', perfil.value);
    else sessionStorage.removeItem(llaveSesion + '-perfil');
    window.location.assign('/' + rol.value + '.html');
  });
}

/**
 * Coloca el origen y los lavaderos de la lista en un plano de coordenadas.
 * @param {object} origen - Latitud y longitud del punto de partida.
 * @param {object[]} lavaderos - Lista visible de establecimientos.
 * @returns {void}
 * @throws {never} Con coordenadas válidas.
 */
function dibujarMapa(origen, lavaderos) {
  const puntos = [
    { ...origen, etiqueta: 'O', titulo: 'Punto de partida' },
    ...lavaderos.map((lavadero, i) => ({
      ...lavadero.ubicacion, etiqueta: String(i + 1), titulo: lavadero.nombre
    }))
  ];
  const latitudes = puntos.map((punto) => punto.lat);
  const longitudes = puntos.map((punto) => punto.lon);
  const ancho = Math.max(0.003, Math.max(...longitudes) - Math.min(...longitudes));
  const alto = Math.max(0.003, Math.max(...latitudes) - Math.min(...latitudes));
  const lonMedia = (Math.max(...longitudes) + Math.min(...longitudes)) / 2;
  const latMedia = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
  const grupos = new Map();
  for (const punto of puntos) {
    const clave = punto.lat + ',' + punto.lon;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(punto);
  }
  const marcas = Array.from(grupos.values(), (grupo) => {
    const { lat, lon } = grupo[0];
    const etiquetas = grupo.map((punto) => punto.etiqueta);
    const resumen = etiquetas.length <= 3 ? etiquetas.join(' · ') : etiquetas.slice(0, 2).join(' · ') + ' +' + (etiquetas.length - 2);
    const marca = nodo('span', resumen, etiquetas.includes('O') ? 'punto origen' : 'punto');
    marca.title = grupo.map((punto) => punto.etiqueta + ' ' + punto.titulo).join(' | ');
    marca.style.left = (50 + 75 * (lon - lonMedia) / ancho) + '%';
    marca.style.top = (50 - 75 * (lat - latMedia) / alto) + '%';
    return marca;
  });
  porId('mapa').replaceChildren(...marcas);
}

/**
 * Carga el catálogo, el calendario, el historial y los eventos del cliente.
 * @param {object} metadatos - Fecha, vehículos y perfiles de demostración.
 * @returns {Promise<void>}
 * @throws {Error} Si no se pueden cargar los datos iniciales.
 */
async function iniciarCliente(metadatos) {
  const perfil = metadatos.clientes.find(({ id }) => id === sessionStorage.getItem(llaveSesion + '-perfil'));
  if (!perfil) {
    window.location.replace('/');
    return;
  }
  porId('saludo').textContent = 'Hola, ' + perfil.nombre + '. Compara opciones y consulta tus reservas.';
  const formulario = porId('reservar');
  const confirmar = formulario.querySelector('button');
  const fecha = porId('fecha');
  const servicio = porId('servicio');
  const vehiculo = porId('vehiculo');
  for (const tipo of metadatos.vehiculos) opcion(vehiculo, tipo, tipo);
  fecha.min = metadatos.hoy;
  fecha.value = metadatos.hoy;

  let catalogo;
  let elegido;
  let consulta = 0;
  let enviando = false;
  let origenPersonal = false;
  const horaMarcada = () => formulario.querySelector('input[name="hora"]:checked');
  const puedeConfirmar = () => Boolean(horaMarcada()) && !enviando;

  const mostrarHistorial = async () => {
    const historial = await api('/mis-reservas');
    const reservas = historial.reservas.map((reserva) => {
      const tarjeta = nodo('article', '', 'tarjeta');
      tarjeta.append(
        nodo('h3', reserva.lavaderoNombre),
        nodo('p', reserva.fecha + ' · ' + reserva.hora + ' · ' + reserva.vehiculo),
        nodo('p', reserva.servicio.nombre + ' · $' + pesos.format(reserva.servicio.precio)),
        nodo('p', 'Código ' + reserva.codigo, 'estado codigo-reserva'),
        nodo('p', 'Estado ' + reserva.estado + ' · Pago simulado ' + reserva.pago.estado)
      );
      tarjeta.dataset.reserva = reserva.id;
      tarjeta.querySelector('.estado').dataset.estado = reserva.estado;
      return tarjeta;
    });
    const correos = historial.correos.map((correo) => {
      const tarjeta = nodo('article', '', 'tarjeta');
      tarjeta.append(
        nodo('h3', correo.asunto),
        nodo('p', correo.estado, 'estado'),
        nodo('p', 'Para ' + correo.destino + ' · ' + fechaEnvio.format(new Date(correo.fechaEnvio)), 'nota'),
        nodo('p', correo.mensaje)
      );
      return tarjeta;
    });
    porId('reservas').replaceChildren(...(reservas.length ? reservas : [nodo('p', 'Todavía no tienes reservas.')]));
    porId('correos').replaceChildren(...(correos.length ? correos : [nodo('p', 'Todavía no hay correos registrados.')]));
  };

  const consultarHoras = async () => {
    const actual = ++consulta;
    const horas = porId('horas');
    const estado = porId('estado-calendario');
    horas.replaceChildren();
    confirmar.disabled = true;
    if (!fecha.value || !fecha.validity.valid) {
      estado.textContent = 'Selecciona una fecha válida.';
      return;
    }
    estado.textContent = 'Consultando horarios…';
    try {
      const ruta = '/lavaderos/' + encodeURIComponent(elegido.id) + '/disponibilidad?fecha=' + fecha.value;
      const calendario = await api(ruta);
      if (actual !== consulta) return;
      estado.textContent = calendario.cerrado ? 'El lavadero está cerrado ese día.' : 'Selecciona una hora disponible.';
      for (const turno of calendario.turnos) {
        const habilitado = turno.estado === 'DISPONIBLE';
        const radio = nodo('input');
        radio.type = 'radio';
        radio.name = 'hora';
        radio.value = turno.hora;
        radio.disabled = !habilitado;
        radio.required = habilitado;
        const detalle = habilitado ? turno.cupos + (turno.cupos === 1 ? ' cupo' : ' cupos')
          : turno.estado === 'OCUPADO' ? 'Ocupado' : 'Pasado';
        const etiqueta = nodo('label', '', 'hora');
        etiqueta.append(radio, nodo('span', turno.hora + ' · ' + detalle));
        horas.append(etiqueta);
      }
    } catch (error) {
      if (actual === consulta) estado.textContent = error.message;
    }
  };

  const abrirReserva = (lavadero) => {
    mostrar();
    elegido = lavadero;
    porId('nombre-lavadero').textContent = 'Reservar en ' + lavadero.nombre;
    servicio.replaceChildren();
    for (const item of lavadero.servicios) opcion(servicio, item.id, item.nombre + ' · $' + pesos.format(item.precio));
    porId('reserva').hidden = false;
    porId('reserva-vacia').hidden = true;
    porId('reserva-contenido').hidden = false;
    porId('reserva').scrollIntoView({ block: 'start' });
    servicio.focus({ preventScroll: true });
    consultarHoras();
  };

  const mostrarCatalogo = () => {
    const consultaTexto = porId('busqueda').value.trim().toLocaleLowerCase('es-CO');
    const filtrados = catalogo.lavaderos.filter(({ nombre, direccion }) =>
      (nombre + ' ' + direccion).toLocaleLowerCase('es-CO').includes(consultaTexto));
    porId('referencia').textContent = origenPersonal
      ? 'Distancia aproximada en línea recta desde tu ubicación.'
      : 'Distancia aproximada en línea recta desde la Plaza de Nariño.';
    dibujarMapa(catalogo.origen, filtrados);
    porId('total-lavaderos').textContent = filtrados.length + (filtrados.length === 1 ? ' lavadero' : ' lavaderos');
    const tarjetas = filtrados.map((lavadero, i) => {
      const tarjeta = nodo('article', '', 'tarjeta');
      const lista = nodo('ul');
      for (const item of lavadero.servicios) {
        const fila = nodo('li', '', 'servicio-item');
        fila.append(nodo('span', item.nombre), nodo('strong', '$' + pesos.format(item.precio)));
        lista.append(fila);
      }
      const reservar = nodo('button', 'Ver horarios');
      reservar.type = 'button';
      reservar.setAttribute('aria-label', 'Ver horarios de ' + lavadero.nombre);
      reservar.addEventListener('click', () => abrirReserva(lavadero));
      const cabecera = nodo('div', '', 'lavadero-cabecera');
      const identificador = nodo('span', '', 'local-icono');
      identificador.append(icono('local'));
      cabecera.append(identificador, nodo('h3', (i + 1) + '. ' + lavadero.nombre));
      tarjeta.append(
        cabecera,
        nodo('p', lavadero.direccion),
        nodo('p', distancia.format(lavadero.distanciaKm) + ' km de distancia', 'estado distancia'),
        lista,
        reservar
      );
      return tarjeta;
    });
    porId('catalogo').replaceChildren(...(tarjetas.length ? tarjetas : [nodo('p', 'No hay lavaderos para esta búsqueda.')]));
  };

  fecha.addEventListener('change', consultarHoras);
  porId('horas').addEventListener('change', () => { confirmar.disabled = !puedeConfirmar(); });
  alEnviar(formulario, async () => {
    const datos = {
      lavaderoId: elegido.id, servicioId: servicio.value, vehiculo: vehiculo.value,
      fecha: fecha.value, hora: horaMarcada().value
    };
    enviando = true;
    try {
      const { reserva } = await api('/reservas', { metodo: 'POST', datos });
      mostrar('Reserva confirmada. Código ' + reserva.codigo + '. Correo enviado (simulado).');
      await mostrarHistorial();
      const comprobante = Array.from(porId('reservas').children).find((tarjeta) => tarjeta.dataset.reserva === reserva.id);
      if (comprobante && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        comprobante.animate([{ opacity: .55, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'cubic-bezier(.23, 1, .32, 1)' });
      }
    } finally {
      enviando = false;
      await consultarHoras();
    }
  }, puedeConfirmar);

  const botonUbicacion = porId('ubicacion');
  botonUbicacion.disabled = true;
  botonUbicacion.addEventListener('click', async () => {
    mostrar();
    botonUbicacion.disabled = true;
    try {
      if (!navigator.geolocation) throw new Error('Tu navegador no ofrece acceso a la ubicación.');
      const { coords } = await new Promise((resolver, rechazar) =>
        navigator.geolocation.getCurrentPosition(resolver, rechazar, { timeout: 8000 }));
      const parametros = new URLSearchParams({ lat: coords.latitude, lon: coords.longitude });
      catalogo = await api('/lavaderos?' + parametros);
      origenPersonal = true;
      mostrarCatalogo();
    } catch {
      mostrar('No fue posible actualizar la ubicación. Se conserva el punto de partida actual.', true);
    } finally {
      botonUbicacion.disabled = false;
    }
  });
  catalogo = await api('/lavaderos');
  mostrarCatalogo();
  porId('busqueda').addEventListener('input', mostrarCatalogo);
  botonUbicacion.disabled = false;
  await mostrarHistorial();
}

/**
 * Dibuja los siete días y la capacidad de un formulario de agenda.
 * @param {HTMLElement} contenedor - Lugar donde se insertan los campos.
 * @param {string[]} dias - Nombres de los días comenzando por domingo.
 * @param {object} [agenda={}] - Configuración existente.
 * @returns {void}
 * @throws {never} Con metadatos y agenda válidos.
 */
function dibujarAgenda(contenedor, dias, agenda = {}) {
  const capacidadId = contenedor.id + '-capacidad';
  const capacidad = nodo('input');
  Object.assign(capacidad, { id: capacidadId, type: 'number', min: 1, max: 100, required: true, value: agenda.capacidad ?? 1 });
  capacidad.dataset.capacidad = '';
  const etiquetaCapacidad = nodo('label', 'Vehículos por hora');
  etiquetaCapacidad.htmlFor = capacidadId;
  contenedor.replaceChildren(etiquetaCapacidad, capacidad);

  for (const dia of [1, 2, 3, 4, 5, 6, 0]) {
    const jornada = agenda.horarios ? agenda.horarios[dia]
      : dia === 0 ? null : { apertura: '08:00', cierre: dia === 6 ? '14:00' : '18:00' };
    const fila = nodo('div', '', 'dia');
    fila.dataset.dia = dia;
    const abierto = nodo('input');
    abierto.type = 'checkbox';
    abierto.checked = Boolean(jornada);
    const etiquetaDia = nodo('label');
    etiquetaDia.append(abierto, dias[dia] + ' abierto');
    fila.append(etiquetaDia);
    for (const [campo, titulo, inicial] of [['apertura', 'Apertura', '08:00'], ['cierre', 'Cierre', '18:00']]) {
      const etiquetaHora = nodo('label', titulo);
      const selector = nodo('select');
      selector.setAttribute('aria-label', dias[dia] + ' ' + titulo.toLowerCase());
      selector.dataset[campo] = '';
      for (let h = 0; h < 24; h += 1) {
        const hora = String(h).padStart(2, '0') + ':00';
        opcion(selector, hora, hora);
      }
      selector.value = jornada?.[campo] ?? inicial;
      selector.disabled = !abierto.checked;
      abierto.addEventListener('change', () => { selector.disabled = !abierto.checked; });
      etiquetaHora.append(selector);
      fila.append(etiquetaHora);
    }
    contenedor.append(fila);
  }
}

/**
 * Lee una agenda desde los campos de su formulario.
 * @param {HTMLElement} contenedor - Campos de capacidad y días.
 * @returns {object} Capacidad numérica y horarios por índice de día.
 * @throws {never} Con una agenda generada por la vista.
 */
function leerAgenda(contenedor) {
  const horarios = {};
  for (const fila of contenedor.querySelectorAll('[data-dia]')) {
    horarios[fila.dataset.dia] = fila.querySelector('input').checked
      ? { apertura: fila.querySelector('[data-apertura]').value, cierre: fila.querySelector('[data-cierre]').value }
      : null;
  }
  return { capacidad: contenedor.querySelector('[data-capacidad]').valueAsNumber, horarios };
}

/**
 * Habilita el registro, la edición de agenda y la validación de códigos.
 * @param {object} metadatos - Sectores, servicios y nombres de los días.
 * @returns {Promise<void>}
 * @throws {Error} Si no se puede consultar la lista de lavaderos.
 */
async function iniciarLavadero(metadatos) {
  const selector = porId('lavadero');
  const inicial = porId('agenda-inicial');
  const agenda = porId('agenda');
  const formulario = porId('registrar');
  const configurar = porId('configurar');
  const validar = porId('validar');
  const servicios = porId('servicios');
  let lavaderos = [];

  for (const sector of metadatos.sectores) opcion(porId('sector'), sector, sector);
  dibujarAgenda(inicial, metadatos.dias);
  for (const servicio of metadatos.servicios) {
    const tarjeta = nodo('div', '', 'tarjeta');
    tarjeta.dataset.servicio = servicio.id;
    const elegir = nodo('input');
    elegir.type = 'checkbox';
    const etiqueta = nodo('label');
    etiqueta.append(elegir, servicio.nombre);
    const precio = nodo('input');
    Object.assign(precio, {
      id: 'precio-' + servicio.id, type: 'number', min: 1, max: 1000000, value: servicio.precio,
      required: true, disabled: true
    });
    const etiquetaPrecio = nodo('label', 'Precio en COP');
    etiquetaPrecio.htmlFor = precio.id;
    elegir.addEventListener('change', () => { precio.disabled = !elegir.checked; });
    tarjeta.append(etiqueta, etiquetaPrecio, precio);
    servicios.append(tarjeta);
  }

  const mostrarElegido = () => {
    const lavadero = lavaderos.find(({ id }) => id === selector.value);
    porId('resultado-codigo').textContent = '';
    porId('estado-lavadero').textContent = lavadero
      ? lavadero.estado + (lavadero.motivo ? ' · ' + lavadero.motivo : '')
      : 'Registra un lavadero para configurar su agenda.';
    configurar.querySelector('button').disabled = !lavadero;
    validar.querySelector('button').disabled = !lavadero;
    if (lavadero) dibujarAgenda(agenda, metadatos.dias, lavadero);
    else agenda.replaceChildren();
  };

  const recargar = async (id = selector.value) => {
    lavaderos = await api('/gestion/lavaderos');
    selector.replaceChildren();
    for (const lavadero of lavaderos) opcion(selector, lavadero.id, lavadero.nombre);
    if (lavaderos.some((lavadero) => lavadero.id === id)) selector.value = id;
    mostrarElegido();
  };

  selector.addEventListener('change', mostrarElegido);
  alEnviar(formulario, async () => {
    const catalogo = Array.from(servicios.children)
      .filter((tarjeta) => tarjeta.querySelector('input[type="checkbox"]').checked)
      .map((tarjeta) => ({ id: tarjeta.dataset.servicio, precio: tarjeta.querySelector('input[type="number"]').valueAsNumber }));
    const datos = {
      nombre: porId('nombre').value, direccion: porId('direccion').value, telefono: porId('telefono').value,
      sector: porId('sector').value, servicios: catalogo, ...leerAgenda(inicial)
    };
    const lavadero = await api('/gestion/lavaderos', { metodo: 'POST', datos });
    mostrar(lavadero.nombre + ' quedó PENDIENTE de aprobación.');
    formulario.reset();
    for (const campo of servicios.querySelectorAll('input[type="number"]')) campo.disabled = true;
    dibujarAgenda(inicial, metadatos.dias);
    await recargar(lavadero.id);
  });
  alEnviar(configurar, async () => {
    const id = selector.value;
    const datos = leerAgenda(agenda);
    const actualizado = await api('/gestion/lavaderos/' + encodeURIComponent(id) + '/agenda', { metodo: 'PUT', datos });
    lavaderos = lavaderos.map((lavadero) => lavadero.id === id ? actualizado : lavadero);
    mostrar('Disponibilidad guardada para ' + actualizado.nombre + '.');
  }, () => Boolean(selector.value));
  alEnviar(validar, async () => {
    const ruta = '/gestion/lavaderos/' + encodeURIComponent(selector.value) +
      '/codigos/' + encodeURIComponent(porId('codigo').value.trim());
    const resultado = await api(ruta);
    porId('resultado-codigo').textContent = resultado.mensaje;
  }, () => Boolean(selector.value));

  await recargar();
  formulario.querySelector('button').disabled = false;
}

/**
 * Carga la supervisión y vincula las acciones de administración.
 * @returns {Promise<void>}
 * @throws {Error} Si la API no devuelve los establecimientos.
 */
async function iniciarAdmin() {
  let revision = 0;
  const refrescar = async () => {
    const actual = ++revision;
    const [pendientes, todos] = await Promise.all([
      api('/admin/lavaderos/pendientes'), api('/admin/lavaderos')
    ]);
    if (actual !== revision) return;
    const tarjetaDe = (lavadero) => {
      const tarjeta = nodo('article', '', 'tarjeta');
      tarjeta.append(
        nodo('h3', lavadero.nombre), nodo('p', lavadero.direccion),
        nodo('p', lavadero.telefono), nodo('p', lavadero.estado, 'estado')
      );
      tarjeta.querySelector('.estado').dataset.estado = lavadero.estado;
      if (lavadero.motivo) tarjeta.append(nodo('p', 'Motivo: ' + lavadero.motivo));
      const base = '/admin/lavaderos/' + encodeURIComponent(lavadero.id) + '/';
      const accion = (clave, titulo, clase = '') => {
        const formulario = nodo('form');
        const boton = nodo('button', titulo, clase);
        boton.type = 'submit';
        const datos = {};
        if (clave === 'rechazar') {
          const motivo = nodo('input');
          Object.assign(motivo, { id: 'motivo-' + lavadero.id, required: true, maxLength: 240 });
          const etiqueta = nodo('label', 'Motivo del rechazo');
          etiqueta.htmlFor = motivo.id;
          formulario.append(etiqueta, motivo);
          motivo.addEventListener('input', () => { datos.motivo = motivo.value; });
        }
        formulario.append(boton);
        alEnviar(formulario, async () => {
          const resultado = await api(base + clave, { metodo: 'PATCH', datos });
          mostrar(resultado.nombre + ' · ' + resultado.estado + '.');
          await refrescar();
        });
        return formulario;
      };
      if (lavadero.estado === 'PENDIENTE') {
        tarjeta.append(accion('aprobar', 'Aprobar'), accion('rechazar', 'Rechazar', 'riesgo'));
      }
      if (lavadero.estado === 'APROBADO') tarjeta.append(accion('suspender', 'Suspender', 'riesgo'));
      return tarjeta;
    };
    porId('total-pendientes').textContent = pendientes.length + (pendientes.length === 1 ? ' solicitud' : ' solicitudes');
    const revisados = todos.filter(({ estado }) => estado !== 'PENDIENTE');
    porId('pendientes').replaceChildren(...(pendientes.length
      ? pendientes.map(tarjetaDe) : [nodo('p', 'No hay solicitudes pendientes.')]));
    porId('revisados').replaceChildren(...(revisados.length
      ? revisados.map(tarjetaDe) : [nodo('p', 'No hay establecimientos revisados.')]));
  };
  await refrescar();
}

/**
 * Integra la animación de portada y respeta la preferencia de movimiento.
 * @returns {void}
 * @throws {never} La reproducción bloqueada conserva la imagen de portada.
 */
function iniciarAnimacionPortada() {
  const video = document.querySelector('.video-portada video');
  const boton = porId('pausar-portada');
  const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)');
  video.muted = true;
  const actualizar = () => {
    const texto = video.paused ? 'Activar movimiento' : 'Pausar movimiento';
    boton.textContent = texto;
    boton.setAttribute('aria-label', texto + ' de la portada');
  };
  const reproducir = () => { video.play().catch(actualizar); };
  const aplicarPreferencia = () => {
    video.autoplay = !preferencia.matches;
    if (preferencia.matches) video.pause();
    else reproducir();
    actualizar();
  };
  video.addEventListener('play', actualizar);
  video.addEventListener('pause', actualizar);
  preferencia.addEventListener('change', aplicarPreferencia);
  boton.addEventListener('click', () => { if (video.paused) reproducir(); else video.pause(); });
  aplicarPreferencia();
}

/**
 * Inicializa el menú y la pantalla habilitada para el rol elegido.
 * @returns {Promise<void>}
 * @throws {Error} Si no se pueden cargar los metadatos o el panel.
 */
async function iniciar() {
  if (pantalla !== 'inicio' && sessionStorage.getItem(llaveSesion) !== pantalla) {
    window.location.replace('/');
    return;
  }
  cargarMenu();
  if (pantalla === 'admin') await iniciarAdmin();
  if (pantalla === 'inicio') {
    iniciarAnimacionPortada();
    iniciarSesion(await api('/opciones'));
  }
  if (pantalla === 'cliente') await iniciarCliente(await api('/opciones'));
  if (pantalla === 'lavadero') await iniciarLavadero(await api('/opciones'));
}

iniciar().catch((error) => mostrar(error.message, true));
