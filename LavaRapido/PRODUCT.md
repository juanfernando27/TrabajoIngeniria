# LavaRápido

Plataforma académica para Ingeniería de Software I de la Universidad Mariana. Permite reservar turnos de lavado de carros, motos y bicicletas en establecimientos de Pasto y organizar sus horarios y capacidad.

## Usuarios y tareas

El Cliente compara establecimientos y reserva. El Lavadero registra su negocio y configura su agenda. La Administración aprueba, rechaza o suspende la publicación. Empleado y Soporte tienen pantallas preparadas para las historias de extensión. La pasarela externa se representa con una aprobación simulada.

## Alcance actual

HU01, HU02, HU03, HU04 y HU08, con 30 puntos de historia. El acceso se simula mediante selección de rol. Las reservas, los establecimientos y los correos simulados se conservan en SQLite.

## Reglas operativas

Cada turno ocupa una hora en horario de Colombia. La capacidad se comparte entre los tipos de vehículo. La confirmación valida nuevamente la disponibilidad dentro de una transacción. El código se valida solo durante la hora y en el establecimiento reservado.

## Escena de uso

El cliente consulta principalmente desde un teléfono antes de salir de casa. Los administradores trabajan con formularios y listas en escritorio o móvil. Los precios se presentan en COP y los textos en español de Colombia. Los datos iniciales de establecimientos, direcciones y perfiles son ficticios. Las ubicaciones del mapa son aproximaciones por sector.
