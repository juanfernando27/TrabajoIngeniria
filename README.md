# LavaRápido

Proyecto académico de Ingeniería de Software I de la Universidad Mariana.
Plataforma de reservas para lavaderos con arquitectura en tres capas y SQLite.

## Ejecutar en Windows

Requiere Node.js 24 o superior.

Desde la raíz del repositorio, ejecutar estos comandos por separado:

    cd LavaRapido
    npm.cmd ci
    node server.js

Abrir http://127.0.0.1:3000.
Detener el servidor con Ctrl+C.

Para ejecutar las pruebas desde LavaRapido:

    npm.cmd test

La base SQLite se crea automáticamente en LavaRapido/data/lavarapido.sqlite.
No requiere instalar un servidor de base de datos.

## Alcance

MVP implementado: HU01, HU02, HU03, HU04 y HU08, equivalentes a 30 SP.
Incluye registro, disponibilidad, reservas, confirmación y supervisión.

Pendientes de completar: HU05, HU06, HU07, HU09, HU10 y HU11.
El backlog completo suma 50 SP.

El acceso por roles, los pagos y los correos son simulados.
Empleado y Soporte tienen pantallas preparadas para las extensiones.
No existe autenticación real.

## Arquitectura

Dentro de LavaRapido:

- src/views: presentación.
- src/controllers: reglas de negocio y fachada.
- src/dao: acceso a datos.
- src/models: entidades.
- server.js: rutas REST y servidor Express.

El backend utiliza CommonJS y contratos JSDoc.
SQLite sustituye la persistencia en memoria del ejemplo de la guía.

## Validación y seguimiento

Cinco pruebas automatizadas aprobadas y cero fallidas.
La demostración funcional se realizará durante la exposición.

El tablero se organizó al cierre de la entrega.
No hay evidencia suficiente para calcular velocidad histórica por sprint.
El gráfico incluido cuenta historias, no Story Points.

## Documentación

- [Requisitos](Docs/01_requisitos.md)
- [Priorización](Docs/02_priorizacion.md)
- [Estimación y costos](Docs/03_estimacion_y_costos.md)
- [Plan del proyecto](Docs/04_plan_de_proyecto_y_modelos.md)
- [Informe de gestión](Docs/05_informe_gestion_y_productividad.md)
- [Manual técnico](LavaRapido/README.md)
- [Pruebas manuales](LavaRapido/PRUEBAS_MANUALES.md)

## Equipo y roles definidos

- Juan Fernando Urbano: Desarrollador.
- Cristian Camilo Lucero: Product Owner.
- Andrés Muñoz: Líder Técnico.

Las contribuciones registradas se consultan en commits y Pull Requests.