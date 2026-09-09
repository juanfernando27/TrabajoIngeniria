# LavaRápido

## Problema

En muchos barrios y conjuntos residenciales en las ciudades, no existe un sistema para el lavado de vehículos como carros, motos, bicicletas. Los propietarios deben buscar un lavadero disponible, esperar largas filas, no saben cuánto tiempo tomará el servicio y no pueden reservar un turno con anticipación. Por su parte, los lavaderos tienen dificultades para gestionar su capacidad, evitar tiempos muertos y organizar a sus empleados.

**LavaRápido** es una plataforma web que permite a los propietarios de vehículos reservar turnos en lavaderos cercanos, y a los lavaderos gestionar su agenda, empleados y servicios de manera eficiente.

## Actores del Sistema

| Actor | Descripción |
|---|---|
| **Cliente**  | Usuario que busca, reserva y paga un turno de lavado para su vehículo. |
| **Lavadero** | Gestiona los servicios, horarios, empleados y confirma las reservas de su negocio. |
| **Empleado del lavadero** | Personal operativo que ejecuta el lavado y marca el estado del turno (en proceso, finalizado) desde su cuenta. |
| **Administrador de la plataforma** | Supervisa los lavaderos registrados, aprueba nuevos registros, resuelve conflictos y gestiona el sistema general. |
| **Pasarela de Pagos** (Actor externo) | Sistema externo que procesa las transacciones de pago de las reservas de forma segura. |
| **Soporte al Cliente** | Encargado de atender reclamos, disputas de calificaciones y solicitudes de reembolso o cancelación. |

## Mapeo de Requisitos

| Problema Identificado | Necesidad de Software | Requisito Funcional |
|---|---|---|
| Los clientes llegan a los lavaderos y encuentran largas filas o tiempos de espera excesivos. | Permitir a los clientes reservar turnos con anticipación. | El sistema debe permitir a los clientes visualizar la disponibilidad de turnos en un lavadero y reservar una hora específica. |
| Los lavaderos no tienen control sobre su capacidad ni agenda de empleados. | Digitalizar la gestión de turnos y asignación de empleados. | El sistema debe permitir a los lavaderos configurar su capacidad por hora y asignar empleados a cada turno. |
| Los clientes no conocen la calidad del servicio ni los precios de diferentes lavaderos. | Ofrecer transparencia con catálogo de servicios, precios y calificaciones. | El sistema debe mostrar el catálogo de servicios (lavado básico, completo, encerado, etc.) con precios, y un sistema de calificación de 1 a 5 estrellas. |
