# LavaRápido

Plataforma académica de reservas para lavaderos de vehículos. Proyecto de Ingeniería de Software I de la Universidad Mariana, con interfaces en español de Colombia, catálogo de servicios, horarios por día, supervisión de establecimientos y persistencia SQLite.

## Ejecutar en Windows

Instala Node.js 24 o superior. Extrae el paquete en una carpeta nueva y abre en VS Code la carpeta que contiene server.js. En PowerShell ejecuta los comandos siguientes.

```powershell
npm.cmd ci
node server.js
```

Abre [http://127.0.0.1:3000](http://127.0.0.1:3000). Detén el proceso con Ctrl+C. Si necesitas otro puerto, configura `$env:PORT = '3001'` antes de iniciar el servidor.

La base se crea automáticamente en `data/lavarapido.sqlite`. Los registros se conservan al cerrar y volver a abrir la aplicación. Para usar una ubicación diferente, define `$env:LAVARAPIDO_DB` con la ruta del archivo SQLite antes de iniciar el servidor. Guarda también los archivos auxiliares `-wal` y `-shm` junto con la base mientras el servidor esté abierto. Para una copia de respaldo sencilla, detén primero el servidor y copia el archivo SQLite.

## Probar el recorrido

1. Entra como **Lavadero**, registra un establecimiento con sus servicios y configura sus horarios y capacidad.
2. Cambia al rol **Administrador de la plataforma** y aprueba la solicitud pendiente.
3. Entra como **Cliente**, elige Ana, Mateo o Lina, busca el establecimiento y confirma un turno futuro.
4. Revisa el código y el correo simulado. Como Lavadero, valida el código durante la hora reservada.
5. Detén y vuelve a iniciar el servidor. La reserva y el establecimiento siguen disponibles.

Los establecimientos de ejemplo son **Brillo Centro** y **Aqua Norte**, aprobados, y **Estación Agua Sur**, pendiente. Los nombres, contactos y direcciones son ficticios. El mapa es esquemático y usa aproximaciones por sector de Pasto.

## Historias y actores

| Historia | SP | Implementación |
| --- | ---: | --- |
| HU01 | 5 | Registro de lavaderos con servicios y agenda inicial. |
| HU02 | 5 | Horarios por día y capacidad compartida por hora. |
| HU03 | 13 | Búsqueda, disponibilidad y reserva con comprobación transaccional. |
| HU04 | 5 | Código único y registro del correo simulado. |
| HU08 | 2 | Aprobación, rechazo con motivo y suspensión. |
| **Total MVP** | **30** | |

Cliente, Lavadero y Administrador cuentan con sus flujos del MVP. Empleado y Soporte tienen pantallas preparadas para HU09 y HU10. La pasarela es un módulo externo simulado que aprueba la operación. El acceso es una selección de rol de demostración.

## Arquitectura

| Capa | Archivos | Responsabilidad |
| --- | --- | --- |
| Presentación | `server.js`, `src/views/` | Rutas REST, páginas por rol y JavaScript del navegador. |
| Negocio | `src/controllers/` | Fachada, validaciones, agenda y reglas de reserva. |
| Datos | `src/models/`, `src/dao/` | Entidades, consultas parametrizadas y conexión SQLite. |

El backend usa CommonJS. `Lavadero`, `LavaderoDAO` y `LavaderoController` conservan los nombres de las operaciones de HU08. Los métodos `obtenerTodos`, `obtenerPorId`, `obtenerPorEstado`, `listarPendientes`, `aprobar`, `rechazar` y `suspender` forman parte de la implementación.

SQLite usa las tablas `lavaderos`, `servicios`, `horarios`, `clientes`, `reservas`, `correos` y `metadatos`. La fachada utiliza `BEGIN IMMEDIATE` para que la comprobación del cupo y las escrituras se confirmen juntas. Un fallo al guardar el correo revierte también la reserva. El esquema se versiona con `PRAGMA user_version`.

La conexión usa `node:sqlite`, incluido en Node.js. La instalación web requiere únicamente Express como dependencia directa. El archivo `MemoriaDAO.js` conserva el ejemplo de persistencia del MVP original como referencia de la interfaz anterior.

## Pruebas

```powershell
npm.cmd test
```

Las pruebas cubren el contrato de HU08, las reglas del MVP, la persistencia entre aperturas, la reversión de una escritura parcial y dos procesos que compiten por el último cupo. Usan archivos temporales o SQLite en memoria y dejan intacta la base de uso normal.

## Motion Graphics

La portada incluye un video de ocho segundos, 1280 × 720, 30 fps, generado con Remotion. Se entrega listo para reproducir, con controles y subtítulos en español. La composición editable está en `motion/src/Promo.jsx`.

Para editar o generar otro video, instala las dependencias de la carpeta motion.

```powershell
Set-Location motion
npm.cmd ci
npm.cmd run dev
```

Abre la dirección que imprime Studio, normalmente [http://localhost:3002](http://localhost:3002). Para actualizar el video y su imagen de portada ejecuta los comandos siguientes desde motion.

```powershell
npm.cmd run render
npm.cmd run poster
```

Remotion puede descargar su navegador de renderizado la primera vez. React, React DOM, Remotion y su CLI pertenecen a este subproyecto. El servidor web puede ejecutarse con el video incluido.

## Skills para Codex en Windows

`Configurar-Skills-Codex.ps1` inspecciona los tres ZIP originales, instala Impeccable mediante su instalador oficial para Codex y copia las skills compatibles de Emil Kowalski y Remotion a la carpeta global de usuario `~/.agents/skills`.

Con los archivos `impeccable-main.zip`, `skills-main.zip` y `remotion-main.zip` en Descargas, ejecuta el script desde PowerShell.

```powershell
.\Configurar-Skills-Codex.ps1 -ZipDirectory "$env:USERPROFILE\Downloads"
```

Si solo tienes `skills diseño.zip`, extráelo primero y apunta `-ZipDirectory` a la carpeta que contiene los tres ZIP internos. El instalador conserva las carpetas ya existentes, revisa ubicaciones anteriores de `.codex/skills` y escribe un informe con cada resultado. La skill `improve-animations` queda pendiente de revisión por el rechazo del escáner de seguridad de su importación personal. Un resultado `EXISTENTE_OTRA_RUTA_REVISAR` requiere comprobar esa ubicación en tu Codex local antes de darla por activa.

Abre una sesión nueva de Codex en VS Code y usa `/skills`. En el chat puedes invocar `$impeccable polish`, `$emil-design-eng`, `$animate` o `$remotion-create`. Para Impeccable, animate es un subcomando de `$impeccable`; `$animate` identifica la skill de Emil Kowalski.

La instalación se prepara con los hooks automáticos de Impeccable desactivados. El detector funciona mediante su CLI. Para activar un hook en un proyecto, utiliza el flujo oficial de Impeccable y revisa su autorización desde `/hooks` en Codex.

## Contexto de diseño

`PRODUCT.md` reúne el alcance y las reglas del producto. `DESIGN.md` documenta la identidad visual y el movimiento. `AGENTS.md` orienta el trabajo posterior de Codex. La tipografía Manrope se sirve localmente y su licencia se incluye en los recursos de la web.


## Extensiones implementadas

Esta versión agrega gestión de turnos, cancelaciones, asignación de empleados, estados, calificaciones, edición de precios y reclamos. Consulte [guía completa](../Docs/06_incremento_completo_50_SP.md). El alcance acumulado es 50 SP; las secciones originales del MVP documentan el corte anterior. npm.cmd test ejecuta 15 pruebas. Los avisos se actualizan con los botones del panel; los pagos y reembolsos son simulados.
