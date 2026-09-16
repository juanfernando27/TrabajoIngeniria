# Reporte de Priorisación MoSCoW, Valor de Negocio y Estimacion Empírica

## 1. Matriz de Priorización y Análisis de Valor

| ID Issue | Historia de Usuario | Categoría MoSCoW | Criterio de Impacto (Valor de Negocio) | Justificación Estratégica | Estimación Empírica (Cualitativa) |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **#1** | HU01 - Registro de Lavadero | **Must Have** | Impacto Financiero | Habilita la oferta comercial de la plataforma: sin lavaderos registrados con sus servicios y datos, no existe nada que el cliente pueda reservar. | Complejidad Baja (formulario de registro con aprobación posterior del admin). |
| **#2** | HU02 - Configuración de Disponibilidad y Capacidad | **Must Have** | Impacto Operativo | Evita la sobrecarga de empleados y garantiza que el sistema respete limites reales de atención por hora, protegiendo la calidad del servicio. | Complejidad Media (reglas de bloqueo automático al alcanzar la capacidad máxima). |
| **#3** | HU03 - Reserva de Turno | **Must Have** | Impacto Operativo | Es el núcleo funcional del producto: sin esta historia no existe la propuesta de valor de "reservar sin hacer fila". | Complejidad Alta (gestión de concurrencia entre múltiples clientes solicitando el mismo horario). |
| **#4** | HU04 - Confirmación y Código de Reserva | **Must Have** | Impacto Financiero y Seguridad | Evita fraudes o confusión en la validación del turno, asegurando que solo la reserva confirmada y vigente sea aceptada en el lavadero. | Complejidad Media (generación de código único con validez restringida a fecha/hora). |
| **#5** | HU05 - Gestión de Turnos para el Lavadero | **Should Have** | Impacto Operativo | Mejora la organización interna del lavadero (ver agenda del día, confirmar o marcar inasistencias), pero el negocio puede operar en el lanzamiento inicial revisando las reservas de forma manual. | Complejidad Media (sincronización en tiempo real entre el estado del turno y la capacidad disponible). |
| **#6** | HU06 - Calificación del Servicio | **Must Have** | Impacto UX | Genera la confianza mínima necesaria para que un cliente elija un lavadero sobre otro; está etiquetada como Must Have en el repositorio. | Complejidad Baja-Media (formulario de calificación 1-5 estrellas y cálculo de promedio). |
| **#7** | HU07 - Cancelación de Reserva | **Should Have** | Impacto UX | Mejora la experiencia y flexibilidad del cliente, pero el negocio puede lanzarse sin cancelación automática (gestionándose manualmente vía soporte) sin detener la operación. | Complejidad Media (ventana de tiempo límite para cancelar y liberación automática del cupo). |
| **#8** | HU08 - Aprobación y Supervisión de Lavaderos Registrados | **Must Have** | Impacto Operativo | Controla la calidad y confiabilidad de la oferta: sin este filtro, cualquier negocio no verificado podría operar en la plataforma, afectando la reputación general del servicio. | Complejidad Baja-Media (flujo de aprobación/rechazo y suspensión desde el panel del administrador). |

*Nota: el Issue #9 del repositorio es un duplicado exacto de HU08 (#8) — mismo título y misma descripción. Se recomienda cerrarlo antes de la revisión cruzada entre grupos para no duplicar el conteo de historias.*

---

## 2. Alcance del Producto Mínimo Viable (MVP)

El **Producto Mínimo Viable (MVP)** para el lanzamiento de **LavaRápido** se compondrá únicamente de las historias clasificadas como **Must Have** (`#1`, `#2`, `#3`, `#4`, `#6` y `#8`).

* **Justificación de Selección:** Se cubren las tres dimensiones críticas del negocio:
  * **Impacto Operativo** → HU02 (capacidad), HU03 (reserva) y HU08 (control de calidad de los lavaderos activos).
  * **Impacto Financiero** → HU01 (registro y catálogo del lavadero) y HU04 (confirmación y validación del turno).
  * **Impacto UX mínimo indispensable** → HU06 (calificaciones, necesarias para generar confianza de compra).
* **Funcionalidades Postergadas:** Las historias `#5` (**Gestión de Turnos para el Lavadero**) y `#7` (**Cancelación de Reserva**) se posponen para el siguiente ciclo de desarrollo. En el lanzamiento inicial, la confirmación de asistencia y las cancelaciones pueden gestionarse manualmente por el lavadero o vía soporte, sin bloquear la operación del MVP.
