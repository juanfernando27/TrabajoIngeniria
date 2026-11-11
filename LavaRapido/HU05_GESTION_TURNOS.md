# HU05 — Gestión de turnos del lavadero (5 SP)

Implementación posterior a la entrega inicial del MVP. No modifica el informe
histórico del corte anterior ni implica revisión independiente.

## Criterios y comprobación manual

1. Listado por fecha y establecimiento. Crear una reserva como Cliente, entrar
   como Lavadero y seleccionar el mismo establecimiento. En Turnos se abre hoy
   en Colombia. Consultar la fecha reservada: aparecen hora, servicio, cliente,
   vehículo, código, precio y estado. Cambiar de fecha o establecimiento filtra
   correctamente; una agenda vacía muestra un mensaje.
2. Gestión de estados. Una reserva RESERVADO puede pasar a CONFIRMADO o CANCELADO;
   una CONFIRMADO puede pasar a CANCELADO. No se permite reactivar un cancelado,
   finalizar por este panel ni modificar el turno de otro establecimiento.
   La cancelación libera capacidad; el historial del cliente refleja el cambio.
3. Capacidad actualizada. En Disponibilidad cambiar vehículos por hora y guardar.
   La disponibilidad pública utiliza la nueva capacidad. La operación rechaza
   reducciones que dejarían reservas futuras sin cupo. No crea sobreventa.

Las operaciones conservan SQLite, los datos existentes y las transacciones.
No se requiere una migración de esquema. La ventana de cancelación del cliente
(HU07) es independiente de la gestión del establecimiento de esta historia.
Los roles siguen siendo de demostración y no autentican usuarios reales.

## Verificación

Ejecutar npm.cmd test desde LavaRapido: siete pruebas, incluidas dos nuevas para
HU05. Cubren filtros, pertenencia, transiciones inválidas, autorización por rol,
persistencia tras reapertura y liberación del cupo. Las pruebas originales
mantienen la cobertura de cambios de agenda y concurrencia.

La interfaz se comprobó en Chromium con confirmación, cancelación, recarga,
fecha vacía y anchos 360, 768 y 1440 px sin desbordamiento horizontal.

## Trazabilidad sugerida

- Rama: feature/issue-5-gestion-turnos
- Commit: feat: [5 SP] implementa gestion de turnos de HU05 (#5)
- PR: describir comportamiento y pruebas; incluir Closes #5 solo al dar por
  terminada esta historia y antes de fusionar.
- Tras aplicar, probar y fusionar: HU05 puede pasar a Done. Alcance implementado:
  35/50 SP. Es alcance acumulado; no equivale a velocidad histórica de sprint.

Continúan pendientes HU06, HU07, HU09, HU10 y HU11.
