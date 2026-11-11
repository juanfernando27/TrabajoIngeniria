# HU07 — Cancelación de reserva (3 SP)

## Criterios de aceptación y comprobación

1. Ventana de dos horas. Como Cliente, crear una reserva a más de dos horas
   de distancia. En Mis reservas aparece Cancelar mi reserva y el límite en
   hora de Colombia. Se permite cancelar hasta exactamente dos horas antes;
   después el botón está deshabilitado y el servidor también rechaza la acción.
   Solo se cancelan reservas propias en RESERVADO o CONFIRMADO.
2. Liberación del cupo. Cancelar y comprobar CANCELADO en el historial y agenda.
   Consultar la disponibilidad como otro cliente y reservar el cupo liberado.
   Una segunda cancelación se rechaza; no duplica avisos ni libera cupos extra.
3. Notificación al lavadero. Entrar como Lavadero, seleccionar el establecimiento
   y consultar Avisos del lavadero. Pulsar Actualizar turnos si la pantalla ya
   estaba abierta. El aviso conserva código, fecha y hora de la reserva cancelada.
   Cambiar de establecimiento no muestra avisos de otros negocios. Reiniciar el
   servidor conserva tanto la cancelación como el aviso en SQLite.

## Decisiones simples

- El límite incluye exactamente las dos horas previas, usando el reloj del servidor.
- El aviso es simulado, persistente en la aplicación; no envía correo real.
- La actualización del panel es manual mediante Actualizar turnos o al cambiar
  de establecimiento; no se agrega una dependencia de comunicación en tiempo real.
- Cancelar no produce un reembolso automático. La resolución de reembolsos pertenece
  a HU10 y sigue pendiente.
- HU05 permite la cancelación operativa por el lavadero; la ventana de HU07 aplica
  al cliente y no altera ese flujo previo.
- Los perfiles siguen siendo simulados. La comprobación de pertenencia no sustituye
  la autenticación real de una aplicación de producción.

## Persistencia y despliegue

El arranque migra SQLite de esquema 1 a 2, agregando notificaciones sin borrar
reservas, servicios ni clientes. Detener el servidor y respaldar el archivo SQLite
antes de aplicar la actualización. No ejecutar simultáneamente la versión vieja
con la nueva sobre el mismo archivo.

## Pruebas

npm.cmd test desde LavaRapido: once pruebas aprobadas en la versión preparada.
Las cuatro nuevas verifican el límite exacto y +1ms, propiedad de la reserva,
estados, rol de la API, migración desde esquema 1, persistencia, último cupo y
reversión completa si falla el guardado de la notificación.

Interfaz comprobada en Chromium: cancelación, historial, visibilidad del aviso por
establecimiento y anchos 360, 768 y 1440 px sin desbordamiento horizontal.

## Trazabilidad

Rama: feature/issue-7-cancelacion-reserva

Commit: feat: [3 SP] implementa cancelacion de reserva de HU07 (#7)

PR: incluir Closes #7 después de aplicar y validar. La actualización no demuestra
velocidad histórica de las iteraciones registradas previamente.

Tras aplicar, probar y fusionar esta historia, el alcance acumulado implementado
es 38/50 SP. Siguen pendientes HU06, HU09, HU10 y HU11. El informe anterior conserva
su valor como corte previo y deberá complementarse con el nuevo incremento.
