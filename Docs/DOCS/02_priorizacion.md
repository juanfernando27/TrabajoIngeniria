# Priorización MoSCoW y Estimación Empírica — LavaRápido

## Matriz de Priorización y Estimación Empírica

| ID Issue | Historia de Usuario | Categoría MoSCoW | Criterio de Impacto (Valor de Negocio) | Justificación Estratégica | Estimación Empírica (Cualitativa) |
|---|---|---|---|---|---|
| #1 | HU01 - Registro de lavadero | Must Have | Impacto Operativo | Sin lavaderos registrados no existe oferta en la plataforma; es la base de todo el modelo. | Complejidad Media (formulario + flujo de aprobación). |
| #2 | HU02 - Configuración de disponibilidad y capacidad | Must Have | Impacto Operativo | Evita la sobreventa de turnos y el colapso de la agenda del lavadero. | Complejidad Media (lógica de bloqueo por capacidad). |
| #3 | HU03 - Reserva de turno | Must Have | Impacto Financiero | Es la funcionalidad central del negocio: sin reserva no hay transacción ni recaudo. | Complejidad Alta (calendario, disponibilidad en tiempo real). |
| #4 | HU04 - Confirmación y código de reserva | Must Have | Impacto Operativo | Sin un código de validación no se puede confirmar la identidad de la reserva en el lavadero. | Complejidad Media (generación de código + notificación). |
| #5 | HU05 - Gestión de turnos para el lavadero | Should Have | Impacto Operativo | Mejora la organización interna del lavadero, pero en la fase inicial puede resolverse con una lista simple sin gestión avanzada de estados. | Complejidad Media (panel de control de turnos). |
| #6 | HU06 - Calificación del servicio | Could Have | Impacto UX | Aporta confianza y transparencia, pero no es indispensable para que ocurra la transacción. | Complejidad Baja (formulario de estrellas + comentario). |
| #7 | HU07 - Cancelación de reserva | Should Have | Impacto UX / Operativo | Mejora la experiencia y reduce quejas, pero al inicio puede gestionarse manualmente vía soporte. | Complejidad Baja (actualización de estado de la reserva). |
| #8 | HU08 - Aprobación y supervisión de lavaderos | Must Have | Impacto Operativo y de Seguridad | Sin este control, cualquier negocio podría publicarse sin verificación, arriesgando la confianza de la plataforma. | Complejidad Baja (CRUD de aprobación/suspensión). |
| #9 | HU09 - Actualización del estado del lavado | Should Have | Impacto Operativo / UX | Da visibilidad en tiempo real del servicio, pero el negocio puede operar inicialmente sin este seguimiento detallado. | Complejidad Baja (cambio de estado + notificación). |
| #10 | HU10 - Gestión de disputas y reembolsos | Could Have | Impacto UX / Financiero | Resuelve conflictos puntuales, pero no bloquea la operación básica de reservas en el arranque. | Complejidad Media (panel de reclamos + historial). |
| #11 | HU11 - Consulta de catálogo de servicios y precios | Should Have | Impacto UX | Mejora la decisión informada del cliente, pero la reserva puede funcionar mostrando solo el nombre del servicio sin catálogo detallado. | Complejidad Baja (listado de servicios y precios). |

## Alcance del Producto Mínimo Viable (MVP)

El **MVP** de LavaRápido se compone únicamente de las historias clasificadas como **Must Have**: **HU01, HU02, HU03, HU04 y HU08**.

**Justificación de selección:** estas 5 historias cubren las tres dimensiones críticas del negocio: oferta disponible y verificada en la plataforma (HU01, HU08), control operativo de la capacidad (HU02) y la transacción central de reserva con su validación (HU03, HU04). Sin estas, la plataforma no puede operar en producción.

**Funcionalidades postergadas:**
- **HU05** (Gestión de turnos para el lavadero) — se pospone; en el MVP el lavadero verá los turnos como una lista simple sin funciones avanzadas de estado.
- **HU06** (Calificación del servicio) — se pospone; no afecta la operación básica de reservas.
- **HU07** (Cancelación de reserva) — se pospone; en el MVP las cancelaciones se gestionan manualmente a través de soporte.
- **HU09** (Actualización del estado del lavado) — se pospone; el seguimiento del servicio puede comunicarse informalmente al inicio.
- **HU10** (Gestión de disputas y reembolsos) — se pospone; los reclamos se atienden manualmente fuera de la plataforma en el arranque.
- **HU11** (Consulta de catálogo de servicios y precios) — se pospone; el precio puede mostrarse de forma básica dentro del flujo de reserva sin un catálogo dedicado.
