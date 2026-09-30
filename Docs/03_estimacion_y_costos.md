# Estimación Cuantitativa y Story Points — LavaRápido

## 3.1. Parámetros del Proyecto

- **Equipo:**
  - Juan Fernando Urbano — Desarrollador
  - Cristian Camilo Lucero — Product Owner
  - Andrés Muñoz — Líder Técnico
- **Historia Pivote Base:** HU08 - Aprobación y supervisión de lavaderos = 2 SP.
- **Factor de Conversión :** 8 Horas / SP.
- **Tarifa Profesional :** $45.000 COP / Hora.

## 3.2. Desglose Matemático Detallado Historia por Historia

**Historia #1: HU01 - Registro de lavadero**
- Votación Planning Poker: 5 SP (registro del lavadero y proceso de aprobación por parte del administrador).
- Esfuerzo (E1): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C1): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #2: HU02 - Configuración de disponibilidad y capacidad**
- Votación Planning Poker: 5 SP (control de horarios y cantidad de vehículos que puede recibir el lavadero).
- Esfuerzo (E2): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C2): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #3: HU03 - Reserva de turno**
- Votación Planning Poker: 13 SP (manejo del calendario, horarios disponibles y control para evitar reservas duplicadas).
- Esfuerzo (E3): 13 SP × 8 Horas/SP = 104 Horas
- Costo (C3): 104 Horas × 45.000 COP/Hora = 4.680.000 COP

**Historia #4: HU04 - Confirmación y código de reserva**
- Votación Planning Poker: 5 SP (generación del código de reserva y confirmación del turno al cliente).
- Esfuerzo (E4): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C4): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #5: HU05 - Gestión de turnos para el lavadero**
- Votación Planning Poker: 5 SP (control de los turnos y actualización de su estado).
- Esfuerzo (E5): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C5): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #6: HU06 - Calificación del servicio**
- Votación Planning Poker: 2 SP (formulario sencillo para colocar una calificación y un comentario).
- Esfuerzo (E6): 2 SP × 8 Horas/SP = 16 Horas
- Costo (C6): 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #7: HU07 - Cancelación de reserva**
- Votación Planning Poker: 3 SP (revisión del tiempo permitido para cancelar y liberar nuevamente el turno).
- Esfuerzo (E7): 3 SP × 8 Horas/SP = 24 Horas
- Costo (C7): 24 Horas × 45.000 COP/Hora = 1.080.000 COP

**Historia #8: HU08 - Aprobación y supervisión de lavaderos**
- Votación Planning Poker: 2 SP ([Historia Pivote Base]: revisión, aprobación y suspensión de lavaderos).
- Esfuerzo (E8): 2 SP × 8 Horas/SP = 16 Horas
- Costo (C8): 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #9: HU09 - Actualización del estado del lavado**
- Votación Planning Poker: 3 SP (cambio del estado del servicio y aviso al cliente cuando sea necesario).
- Esfuerzo (E9): 3 SP × 8 Horas/SP = 24 Horas
- Costo (C9): 24 Horas × 45.000 COP/Hora = 1.080.000 COP

**Historia #10: HU10 - Gestión de disputas y reembolsos**
- Votación Planning Poker: 5 SP (manejo de reclamos y consulta del historial de las reservas).
- Esfuerzo (E10): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C10): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #11: HU11 - Consulta de catálogo de servicios y precios**
- Votación Planning Poker: 2 SP (consulta de los servicios disponibles y sus respectivos precios).
- Esfuerzo (E11): 2 SP × 8 Horas/SP = 16 Horas
- Costo (C11): 16 Horas × 45.000 COP/Hora = 720.000 COP

## 3.3. Cálculo de Sumatorias Totales

Total SP = 5+5+13+5+5+2+3+2+3+5+2 = 50 SP

E total = 40+40+104+40+40+16+24+16+24+40+16 = 400 Horas

C total = $1.800.000 + $1.800.000 + $4.680.000 + $1.800.000 + $1.800.000 + $720.000 + $1.080.000 + $720.000 + $1.080.000 + $1.800.000 + $720.000 = $18.000.000 COP

## Matriz Resumen Consolidada — LavaRápido

| ID Issue | Historia de Usuario | Categoría MoSCoW | Story Points (SP) | Factor (Fc) | Esfuerzo (Ei) | Tarifa (Th) | Costo Financiero (Ci) | Justificación Técnica |
|---|---|---|---|---|---|---|---|---|
| #1 | HU01 - Registro de lavadero | Must Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Registro y aprobación del lavadero. |
| #2 | HU02 - Configuración de disponibilidad y capacidad | Must Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Control de horarios y capacidad. |
| #3 | HU03 - Reserva de turno | Must Have | 13 SP | 8 hrs/SP | 104 hrs | $45.000 COP | $4.680.000 COP | Manejo de horarios y prevención de reservas duplicadas. |
| #4 | HU04 - Confirmación y código de reserva | Must Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Generación del código y confirmación del turno. |
| #5 | HU05 - Gestión de turnos para el lavadero | Should Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Control de turnos y cambio de estados. |
| #6 | HU06 - Calificación del servicio | Could Have | 2 SP | 8 hrs/SP | 16 hrs | $45.000 COP | $720.000 COP | Calificación y comentario del cliente. |
| #7 | HU07 - Cancelación de reserva | Should Have | 3 SP | 8 hrs/SP | 24 hrs | $45.000 COP | $1.080.000 COP | Validación de cancelación y liberación del turno. |
| #8 | HU08 - Aprobación y supervisión de lavaderos | Must Have | 2 SP | 8 hrs/SP | 16 hrs | $45.000 COP | $720.000 COP | [Pivote Base] Revisión y aprobación de lavaderos. |
| #9 | HU09 - Actualización del estado del lavado | Should Have | 3 SP | 8 hrs/SP | 24 hrs | $45.000 COP | $1.080.000 COP | Cambio de estado y aviso al cliente. |
| #10 | HU10 - Gestión de disputas y reembolsos | Could Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Manejo de reclamos e información de reservas. |
| #11 | HU11 - Consulta de catálogo de servicios y precios | Should Have | 2 SP | 8 hrs/SP | 16 hrs | $45.000 COP | $720.000 COP | Consulta de servicios y precios. |
| **TOTAL** | **Backlog Completo** | -- | **50 SP** | -- | **400 hrs** | -- | **$18.000.000 COP** | Proyecto Completo Estimado |

## 4. Consolidado Total del Proyecto

- **Puntos totales de la historia (`SPAGtotal`):** 50 SP.
- **Esfuerzo Total (`mitotal`):** 400 Horas.
- **Presupuesto Comercial Total (`dototal`):** $18.000.000 COP.

