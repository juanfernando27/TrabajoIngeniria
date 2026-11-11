# Incremento funcional completo — 50 SP

Este documento complementa el corte anterior de 30 SP. No modifica ni reconstruye
velocidades históricas. Describe código preparado después del PR #14; su aceptación
requiere aplicar el parche, ejecutar las pruebas y fusionar el nuevo PR.

| Historia | SP | Funcionalidad |
|---|---:|---|
| HU01 | 5 | Registro pendiente de aprobación |
| HU02 | 5 | Horarios y capacidad |
| HU03 | 13 | Disponibilidad y reserva transaccional |
| HU04 | 5 | Código único y correo simulado |
| HU05 | 5 | Agenda y confirmación/cancelación del lavadero |
| HU06 | 2 | Calificación y promedio público |
| HU07 | 3 | Cancelación del cliente y aviso |
| HU08 | 2 | Aprobación, rechazo y suspensión |
| HU09 | 3 | Asignación y estados del empleado |
| HU10 | 5 | Reclamos y resoluciones financieras simuladas |
| HU11 | 2 | Catálogo y edición de precios |
| Total | 50 | Alcance funcional preparado |

## Instalación y persistencia

Detener Node antes de instalar y respaldar la carpeta LavaRapido/data fuera del
repositorio. La migración del esquema SQLite 1 a 3 conserva las tablas y reservas
existentes y agrega almacenamiento de notificaciones y registros de extensión.
Estos registros JSON se almacenan dentro de SQLite mediante consultas parametrizadas;
no son almacenamiento temporal en memoria. No ejecutar una versión anterior del
servidor sobre la base migrada.

Desde LavaRapido: npm.cmd test y después node server.js. Se esperan 15 pruebas
aprobadas. Ngrok puede continuar apuntando al puerto 3000.

## HU06 — tres criterios

1. Finalizar un turno desde Empleado. Como Cliente propietario, en Gestión de
   servicios, calificar con entero de 1 a 5 y comentario opcional. Valores fuera
   del rango y servicios sin finalizar son rechazados también por API.
2. No se puede calificar una reserva ajena ni registrar dos opiniones para la misma.
3. Como Cliente, consultar los perfiles al final de Gestión de servicios: promedio,
   número de opiniones y comentarios visibles. Sin opiniones se informa ese estado.

## HU07 — tres criterios

1. Reservar a más de dos horas y cancelar desde Mis reservas. El límite usa hora
   Colombia del servidor e incluye exactamente dos horas antes. Después se rechaza.
2. El estado pasa a CANCELADO y otro cliente puede reservar el cupo liberado.
3. Como Lavadero, seleccionar el establecimiento y pulsar Actualizar turnos:
   aparece un aviso con código y horario. Persiste al reiniciar.

## HU09 — tres criterios

1. Como Lavadero, en Gestión de servicios, seleccionar una fecha por establecimiento,
   pulsar Consultar asignaciones y asignar un empleado a la reserva. Se ofrecen dos
   empleados ficticios por establecimiento; sus identificadores son estables.
2. Como Empleado, seleccionar el perfil demo abajo. Solo se muestran sus asignaciones;
   cambiar entre perfiles permite verificar el aislamiento de turnos asignados.
3. Marcar EN_PROCESO y luego FINALIZADO. No se permite saltar a finalizado ni alterar
   turnos de otro empleado. Como Cliente, Actualizar panel muestra los avisos de estado.

## HU10 — tres criterios

1. Como Cliente, presentar un reclamo con motivo desde una reserva propia. Como
   Soporte, consultar los reclamos ordenados por fecha, del más antiguo al reciente.
2. Cada reclamo muestra la reserva, pago original, estado y eventos del servicio.
   Los reclamos del cliente y las resoluciones se conservan en SQLite.
3. Resolver con REEMBOLSO, AJUSTE o RECHAZO y explicación obligatoria. Reembolso y
   ajuste requieren monto positivo hasta el saldo pagado; rechazo requiere cero.
   La resolución es única y las devoluciones acumuladas no superan el pago original.
   Actualizar panel del Cliente muestra resultado y aviso. No se mueve dinero real.

## HU11 — tres criterios

1. El Cliente consulta servicios y precios antes de reservar, en COP.
2. Como Lavadero, Gestión de servicios permite cambiar cada precio (entero entre
   1 y 1.000.000 COP). El cambio está disponible inmediatamente en la API.
3. El catálogo abierto del Cliente se sincroniza cada tres segundos; recargar refleja
   el precio inmediatamente. Las reservas nuevas usan el precio vigente y las
   anteriores conservan su precio contratado. No hay caché de API.

Los criterios y pasos de HU01, HU02, HU03, HU04, HU08 se conservan en
LavaRapido/PRUEBAS_MANUALES.md y los de HU05 en LavaRapido/HU05_GESTION_TURNOS.md.

## Evidencia y límites

15 pruebas automatizadas verifican reglas del MVP y extensiones, transacciones,
concurrencia, migraciones, saldo de devolución y persistencia tras reiniciar.
El recorrido Chromium verifica empleado, estados, opinión, promedio, reclamo y
resolución; la cancelación también se comprueba por navegador. No se añadieron
capturas funcionales porque la demostración se realizará en la exposición.

Los roles siguen siendo simulados. La cabecera del perfil no es autenticación real.
Los empleados ficticios se generan por establecimiento, sin CRUD adicional de personal.
Los avisos se consultan con Actualizar panel/Actualizar turnos: no son correos reales
ni notificaciones push. AJUSTE representa una devolución parcial simulada.
El inicio del lavado se permite a un empleado asignado sin esperar la hora reservada,
para simplificar la demostración académica; la validación del código conserva su ventana.

## Gestión ágil

Una vez verificado y fusionado este incremento, actualizar HU06, HU07, HU09, HU10 y
HU11 a Done. No declarar velocidad de 50 SP: los 50 SP son alcance acumulado.
El registro tardío del tablero, ausencia de revisión independiente y gráfico por
cantidad de historias siguen siendo limitaciones de proceso. Una implementación
funcional completa no transforma esas evidencias históricas.

Sugerencia de commit: feat: [15 SP] completa HU06 HU07 HU09 HU10 y HU11 (#6 #7 #9 #10 #11)

Descripción del PR: indicar funcionalidades y pruebas, y añadir en líneas separadas
Closes #6, Closes #7, Closes #9, Closes #10, Closes #11. No cerrar Issues hasta probar.
