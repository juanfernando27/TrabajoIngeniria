# Pruebas manuales de LavaRápido

Abre una pestaña para **Lavadero**, otra para **Administrador de la plataforma** y dos para **Cliente**, con los perfiles **Ana** y **Mateo**. Usa un día futuro que coincida con el día de la semana que vas a configurar. Las pestañas comparten los datos del mismo servidor y mantienen su selección de rol por separado.

### HU01 · Registro de lavadero (5 SP)

| Criterio | Pasos y resultado esperado |
| --- | --- |
| 1. Campos obligatorios | En **Lavadero → Registrar**, intenta enviar con el teléfono vacío y luego con un teléfono como `123`. Completa los demás campos. El navegador bloquea el campo vacío y el servidor rechaza el teléfono corto. |
| 2. Servicios y agenda inicial | Escribe **Eco Lavado Sur**, una dirección, `3101234567` y elige **Sur**. Marca **Básico** y **Completo**, fija **45000** como precio de Completo y conserva la agenda inicial. Envía. El registro se guarda con los servicios elegidos y la agenda indicada. |
| 3. Estado pendiente y visibilidad | Comprueba el aviso **PENDIENTE**, el registro en **Administrador → Pendientes** y su ausencia en el buscador de Cliente. |

### HU02 · Disponibilidad y capacidad (5 SP)

| Criterio | Pasos y resultado esperado |
| --- | --- |
| 1. Horarios por día y capacidad | Con **Brillo Centro** en **Lavadero → Disponibilidad**, fija capacidad **1**, lunes **08:00–10:00**, sábado **08:00–14:00** y domingo cerrado. Guarda. En Cliente verifica los inicios del lunes (**08:00**, **09:00**), el último del sábado (**13:00**) y el mensaje de cierre del domingo. |
| 2. Validación de valores | Intenta guardar capacidad **0**. Corrige el número e intenta guardar con la apertura y el cierre del lunes en **08:00**. Ambas configuraciones son rechazadas. Recarga el panel y comprueba que se conserva la última agenda válida. |
| 3. Bloqueo al llenar cupos | Reserva con Ana uno de los turnos futuros de Brillo Centro. En la cuadrícula, la celda pasa a **Ocupado** y deja de ser seleccionable. Una hora diferente conserva su cupo. |

### HU03 · Reserva de turno (13 SP)

| Criterio | Pasos y resultado esperado |
| --- | --- |
| 1. Búsqueda por distancia y mapa | En Cliente revisa las tarjetas con direcciones, distancias y precios. Abre **Ver mapa esquemático** y compara los números con la lista. Busca **Norte** y comprueba que la lista y el mapa muestran el resultado filtrado. |
| 2. Selección y confirmación | En **Aqua Norte**, elige **Ver horarios**, un servicio, una moto y una fecha futura abierta. Selecciona una hora disponible y confirma. **Mis reservas** muestra el servicio, el vehículo, la fecha y hora elegidas, el estado **RESERVADO** y el pago simulado **APROBADO**. |
| 3. Protección del último cupo | Aqua Norte tiene un cupo por hora. En dos pestañas de Cliente, con Ana y Mateo, selecciona la misma hora futura que siga libre antes de confirmar. Confirma en ambas. Solo una solicitud crea una reserva. La otra recibe el error de cupo y su calendario se actualiza. |

### HU04 · Confirmación y código de reserva (5 SP)

| Criterio | Pasos y resultado esperado |
| --- | --- |
| 1. Código único | Con un perfil Cliente, reserva dos horas futuras distintas. En **Mis reservas** aparecen dos códigos de doce caracteres alfanuméricos. Cada uno empieza por `LR` y los dos son distintos. |
| 2. Aviso y registro | Tras una reserva, verifica el aviso con el código. Abre **Correos simulados** y comprueba que se registraron el destinatario, la fecha y hora del turno y el mismo código. |
| 3. Vigencia por fecha, hora y lavadero | En **Lavadero → Validar código**, selecciona el establecimiento de la reserva e ingresa el código. Debe ser inválido antes del inicio, válido durante la hora reservada e inválido desde el cierre de esa hora. Durante el turno, también debe resultar inválido si seleccionas otro lavadero. |

#### Verificación del código con un reloj fijo

En la carpeta del proyecto, detén el servidor normal con `Ctrl+C`. Ejecuta este bloque en PowerShell. La instancia inicia con datos de ejemplo y avanza de hora al escribir `durante` o `despues` en la misma terminal y presionar Enter.

```powershell
$demoReloj = @'
const { crearApp } = require('./server');
const { createInterface } = require('node:readline');

const horas = {
  antes: '2030-01-07T12:59:59Z',
  durante: '2030-01-07T13:00:00Z',
  despues: '2030-01-07T14:00:00Z'
};
let fase = 'antes';

crearApp({ ahora: () => new Date(horas[fase]), archivoDatos: ':memory:' }).listen(3000, '127.0.0.1', () => {
  console.log('Reloj de prueba en http://127.0.0.1:3000');
});
createInterface({ input: process.stdin }).on('line', (linea) => {
  const seleccion = linea.trim();
  if (Object.hasOwn(horas, seleccion)) {
    fase = seleccion;
    console.log(fase, horas[fase]);
  }
});
'@
node -e $demoReloj
```

Recarga la página. Como Cliente, reserva **Brillo Centro** para el **7 de enero de 2030 a las 08:00**. Valida el mismo código tres veces con la fase inicial `antes`, luego con `durante` y por último con `despues`. Debes obtener **inválido → válido → inválido**. Con `Ctrl+C` puedes cerrar la instancia y volver al reloj real con `node server.js`.

### HU08 · Supervisión de lavaderos (2 SP)

| Criterio | Pasos y resultado esperado |
| --- | --- |
| 1. Aprobar y publicar | Busca **Eco Lavado Sur** en **Administrador → Pendientes** y pulsa **Aprobar**. Aparece como **APROBADO** en Supervisión. Recarga la pestaña del cliente y comprueba que el catálogo lo muestra. |
| 2. Motivo obligatorio al rechazar | En **Estación Agua Sur**, pulsa **Rechazar** con el campo vacío. Repite con espacios y verifica el error. Escribe **Falta verificar el teléfono** y envía. El estado pasa a **RECHAZADO** y se muestra el motivo. |
| 3. Suspender y retirar | Con Eco Lavado Sur ya visible para el cliente, abre su calendario en una pestaña. Desde Administración, pulsa **Suspender**. En la pestaña ya abierta intenta confirmar una hora previamente elegida. La API rechaza la reserva. Al recargar el catálogo, el lavadero desaparece. |


## Persistencia SQLite

Registra y aprueba un lavadero. Crea una reserva y anota su código. Detén el servidor con Ctrl+C y vuelve a iniciarlo con node server.js. Entra con el mismo perfil y comprueba el establecimiento, el código y su correo. La base de uso normal permanece en data/lavarapido.sqlite.

## Presentación y movimiento

Prueba la portada y el panel del Cliente en un teléfono y en escritorio. Comprueba el menú, el servicio con precio COP y la selección de hora. Reproduce la presentación desde sus controles y activa los subtítulos. En el navegador, activa la preferencia de movimiento reducido y verifica que los botones conservan su respuesta visual y la confirmación aparece sin desplazamiento.
