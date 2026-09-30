# Plan de Proyecto y Modelo de Proceso — LavaRápido

## 1. Selección y Justificación del Modelo de Proceso

Se selecciona el marco **Scrum (Ágil)**.

**Justificación:** LavaRápido es una plataforma comercial que compite con la informalidad del sector. 
Se necesita lanzar un Producto Mínimo Viable (MVP) en el menor tiempo posible para validar que clientes y lavaderos realmente reservan 
y confirman turnos por la plataforma, antes de invertir en funcionalidades complementarias. 
En particular, historias como la calificación del servicio (HU06) o la gestión de disputas (HU10) aportan valor de confianza a mediano plazo,
pero no son indispensables para que ocurra la transacción central o reservar y validar un turno, por lo que se postergan a incrementos posteriores.
La naturaleza iterativa de Scrum permite entregar la reserva de turnos funcionando primero,
e ir sumando calidad de experiencia (cancelaciones, calificaciones, soporte) en sprints siguientes según la retroalimentación real de clientes y lavaderos.

## 2. Determinación de los Parámetros del Proyecto

- **Backlog Completo:** 50 SP (11 Historias de Usuario).
- **Historias del MVP (Prioridad Must Have):**
  - HU01 - Registro de lavadero: 5 SP
  - HU02 - Configuración de disponibilidad y capacidad: 5 SP
  - HU03 - Reserva de turno: 13 SP
  - HU04 - Confirmación y código de reserva: 5 SP
  - HU08 - Aprobación y supervisión de lavaderos: 2 SP
  - **Total SP del MVP:** 5+5+13+5+2 = **30 SP**
- **Historias del Backlog Extendido (Should Have / Could Have):**
  - HU05 - Gestión de turnos para el lavadero: 5 SP
  - HU06 - Calificación del servicio: 2 SP
  - HU07 - Cancelación de reserva: 3 SP
  - HU09 - Actualización del estado del lavado: 3 SP
  - HU10 - Gestión de disputas y reembolsos: 5 SP
  - HU11 - Consulta de catálogo de servicios y precios: 2 SP
  - **Total SP Extendido:** 5+2+3+3+5+2 = **20 SP**
- **Velocidad Acordada del Equipo LavaRápido (V):** 10 SP/Sprint (equipo de 3 personas: Product Owner, Líder Técnico y 1 Desarrollador).
- **Duración de Cada Sprint:** 2 Semanas.

## 3. Cálculos del Plan de Proyecto

**1. Cálculo de Sprints para el MVP:**

N Sprints = 30 SP (MVP) / 10 SP/Sprint = 3.0 → **3 Sprints**

**2. Cálculo del Tiempo de Desarrollo del MVP en Semanas:**

T semanas (MVP) = 3 Sprints × 2 Semanas/Sprint = **6 Semanas**

**3. Cálculo de Sprints para el Proyecto Completo (50 SP):**

N Sprints Total = 50 SP / 10 SP/Sprint = 5.0 → **5 Sprints (10 Semanas)**

## 4. Estructuración del Cronograma de Sprints

### Sprint 1 (Semanas 1 y 2) · Capacidad Máxima: 10 SP
- Historia Asignada: HU03 - Reserva de turno (Módulo base) (10 SP)
- Carga del Sprint: 10 SP (100% de la velocidad).
- Esfuerzo: 10 SP × 8 hrs/SP = 80 Horas/Hombre.
- Costo Sprint 1: 80 hrs × 45.000 COP/hr = **3.600.000 COP**.

### Sprint 2 (Semanas 3 y 4) · Capacidad Máxima: 10 SP
- Historias Asignadas:
  - HU03 - Reserva de turno (Módulo de cierre) (3 SP)
  - HU01 - Registro de lavadero (5 SP)
  - HU08 - Aprobación y supervisión de lavaderos (2 SP)
- Carga del Sprint: 3+5+2 = 10 SP (100% de la velocidad).
- Esfuerzo: 10 SP × 8 hrs/SP = 80 Horas/Hombre.
- Costo Sprint 2: 80 hrs × 45.000 COP/hr = **3.600.000 COP**.

### Sprint 3 (Semanas 5 y 6) · Capacidad Máxima: 10 SP
- Historias Asignadas:
  - HU02 - Configuración de disponibilidad y capacidad (5 SP)
  - HU04 - Confirmación y código de reserva (5 SP)
- Carga del Sprint: 5+5 = 10 SP (100% de la velocidad, cierre del MVP).
- Esfuerzo: 10 SP × 8 hrs/SP = 80 Horas/Hombre.
- Costo Sprint 3: 80 hrs × 45.000 COP/hr = **3.600.000 COP**.

### Sprint 4 (Semanas 7 y 8 - Extensión) · Capacidad Máxima: 10 SP
- Historias Asignadas:
  - HU05 - Gestión de turnos para el lavadero (5 SP)
  - HU07 - Cancelación de reserva (3 SP)
  - HU11 - Consulta de catálogo de servicios y precios (2 SP)
- Carga del Sprint: 5+3+2 = 10 SP.
- Esfuerzo: 10 SP × 8 hrs/SP = 80 Horas/Hombre.
- Costo Sprint 4: 80 hrs × 45.000 COP/hr = **3.600.000 COP**.

### Sprint 5 (Semanas 9 y 10 - Extensión) · Capacidad Máxima: 10 SP
- Historias Asignadas:
  - HU09 - Actualización del estado del lavado (3 SP)
  - HU10 - Gestión de disputas y reembolsos (5 SP)
  - HU06 - Calificación del servicio (2 SP)
- Carga del Sprint: 3+5+2 = 10 SP.
- Esfuerzo: 10 SP × 8 hrs/SP = 80 Horas/Hombre.
- Costo Sprint 5: 80 hrs × 45.000 COP/hr = **3.600.000 COP**.

## 5. Resumen Financiero y Cronograma Comercial

- **Costo Total del MVP (Sprints 1, 2 y 3):** 3.600.000 + 3.600.000 + 3.600.000 = **10.800.000 COP** (240 Horas, 6 Semanas).
- **Costo Total del Proyecto Completo (Sprints 1 a 5):** 10.800.000 + 3.600.000 + 3.600.000 = **18.000.000 COP** (400 Horas, 10 Semanas).
