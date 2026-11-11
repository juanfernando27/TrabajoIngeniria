# Trabajo en LavaRápido

Lee PRODUCT.md y DESIGN.md antes de modificar la interfaz. Conserva el español de Colombia, los precios COP y los identificadores usados por los formularios y por las pruebas.

El servidor usa Node.js 24, Express y CommonJS. Las vistas son HTML, CSS y JavaScript directo. La persistencia usa node:sqlite y la base se crea en data/lavarapido.sqlite. Las reglas de disponibilidad y supervisión pertenecen a los controladores. La fachada delimita las transacciones y los DAO ejecutan consultas parametrizadas.

Ejecuta npm test para validar el MVP, la persistencia, la reversión ante un fallo y la concurrencia entre procesos. Usa una base temporal para las pruebas. Preserva los archivos SQLite y las configuraciones del usuario.

Las dependencias de React y Remotion se instalan exclusivamente en motion. El proyecto web funciona con npm ci y node server.js. Para editar el video, usa npm ci y npm run dev desde motion. Para actualizar el archivo integrado en la portada, ejecuta npm run render desde esa carpeta.

Usa Impeccable para revisar jerarquía, formularios y accesibilidad. Usa las skills de Emil Kowalski para justificar y revisar microinteracciones. Usa las skills de Remotion en motion. Mantén el alcance HU01, HU02, HU03, HU04 y HU08 mientras el usuario no solicite las historias de extensión.
