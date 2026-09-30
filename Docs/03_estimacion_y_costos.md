# Estimación Cuantitativa y Story Points — LavaRápido

## 3.1. Parámetros del Proyecto

- **Equipo:**
  - Juan Fernando Urbano — Desarrollador 
  - Cristian Camilo Lucero — Product Owner
  - Andrés Muñoz — Líder Técnico 
- **Historia Pivote Base:** HU08 - Aprobación y supervisión de lavaderos = 2 SP.
- **Factor de Conversión (Fc):** 8 Horas / SP.
- **Tarifa Profesional (Th):** $45.000 COP / Hora.

## 3.2. Desglose Matemático Detallado Historia por Historia

**Historia #1: HU01 - Registro de lavadero**
- Votación Planning Poker: 5 SP (formulario de registro + flujo de aprobación del administrador).
- Esfuerzo (E1): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C1): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #2: HU02 - Configuración de disponibilidad y capacidad**
- Votación Planning Poker: 5 SP (lógica de bloqueo automático por capacidad horaria).
- Esfuerzo (E2): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C2): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #3: HU03 - Reserva de turno**
- Votación Planning Poker: 13 SP (complejidad alta: calendario, disponibilidad en tiempo real y prevención de doble reserva).
- Esfuerzo (E3): 13 SP × 8 Horas/SP = 104 Horas
- Costo (C3): 104 Horas × 45.000 COP/Hora = 4.680.000 COP

**Historia #4: HU04 - Confirmación y código de reserva**
- Votación Planning Poker: 5 SP (generación de código único + notificación al cliente).
- Esfuerzo (E4): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C4): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #5: HU05 - Gestión de turnos para el lavadero**
- Votación Planning Poker: 5 SP (panel de control con listado y cambio de estados).
- Esfuerzo (E5): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C5): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #6: HU06 - Calificación del servicio**
- Votación Planning Poker: 2 SP (formulario simple de estrellas y comentario).
- Esfuerzo (E6): 2 SP × 8 Horas/SP = 16 Horas
- Costo (C6): 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #7: HU07 - Cancelación de reserva**
- Votación Planning Poker: 3 SP (validación de tiempo límite + liberación automática del turno).
- Esfuerzo (E7): 3 SP × 8 Horas/SP = 24 Horas
- Costo (C7): 24 Horas × 45.000 COP/Hora = 1.080.000 COP

**Historia #8: HU08 - Aprobación y supervisión de lavaderos**
- Votación Planning Poker: 2 SP ([Historia Pivote Base]: CRUD estándar de aprobación/suspensión).
- Esfuerzo (E8): 2 SP × 8 Horas/SP = 16 Horas
- Costo (C8): 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #9: HU09 - Actualización del estado del lavado**
- Votación Planning Poker: 3 SP (cambio de estado del turno + notificación al cliente).
- Esfuerzo (E9): 3 SP × 8 Horas/SP = 24 Horas
- Costo (C9): 24 Horas × 45.000 COP/Hora = 1.080.000 COP

**Historia #10: HU10 - Gestión de disputas y reembolsos**
- Votación Planning Poker: 5 SP (panel de reclamos con historial completo de la reserva).
- Esfuerzo (E10): 5 SP × 8 Horas/SP = 40 Horas
- Costo (C10): 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #11: HU11 - Consulta de catálogo de servicios y precios**
- Votación Planning Poker: 2 SP (listado simple de servicios y precios).
- Esfuerzo (E11): 2 SP × 8 Horas/SP = 16 Horas
- Costo (C11): 16 Horas × 45.000 COP/Hora = 720.000 COP

## 3.3. Cálculo de Sumatorias Totales

Total SP = 5+5+13+5+5+2+3+2+3+5+2 = 50 SP

E total = 40+40+104+40+40+16+24+16+24+40+16 = 400 Horas

C total = $1.800.000 + $1.800.000 + $4.680.000 + $1.800.000 + $1.800.000 + $720.000 + $1.080.000 + $720.000 + $1.080.000 + $1.800.000 + $720.000 = $18.000.000 COP

## Matriz Resumen Consolidada — LavaRápido

| ID Issue | Historia de Usuario | Categoría MoSCoW | Story Points (SP) | Factor (Fc) | Esfuerzo (Ei) | Tarifa (Th) | Costo Financiero (Ci) | Justificación Técnica |
|---|---|---|---|---|---|---|---|---|
| #1 | HU01 - Registro de lavadero | Must Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Formulario + flujo de aprobación. |
| #2 | HU02 - Configuración de disponibilidad y capacidad | Must Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Lógica de bloqueo por capacidad horaria. |
| #3 | HU03 - Reserva de turno | Must Have | 13 SP | 8 hrs/SP | 104 hrs | $45.000 COP | $4.680.000 COP | Calendario y disponibilidad en tiempo real, riesgo de doble reserva. |
| #4 | HU04 - Confirmación y código de reserva | Must Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Generación de código único + notificación. |
| #5 | HU05 - Gestión de turnos para el lavadero | Should Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Panel de control con cambio de estados. |
| #6 | HU06 - Calificación del servicio | Could Have | 2 SP | 8 hrs/SP | 16 hrs | $45.000 COP | $720.000 COP | Formulario simple de estrellas y comentario. |
| #7 | HU07 - Cancelación de reserva | Should Have | 3 SP | 8 hrs/SP | 24 hrs | $45.000 COP | $1.080.000 COP | Validación de tiempo límite + liberación automática. |
| #8 | HU08 - Aprobación y supervisión de lavaderos | Must Have | 2 SP | 8 hrs/SP | 16 hrs | $45.000 COP | $720.000 COP | [Pivote Base] CRUD estándar de aprobación. |
| #9 | HU09 - Actualización del estado del lavado | Should Have | 3 SP | 8 hrs/SP | 24 hrs | $45.000 COP | $1.080.000 COP | Cambio de estado + notificación al cliente. |
| #10 | HU10 - Gestión de disputas y reembolsos | Could Have | 5 SP | 8 hrs/SP | 40 hrs | $45.000 COP | $1.800.000 COP | Panel de reclamos con historial de la reserva. |
| #11 | HU11 - Consulta de catálogo de servicios y precios | Should Have | 2 SP | 8 hrs/SP | 16 hrs | $45.000 COP | $720.000 COP | Listado simple de servicios y precios. |
| **TOTAL** | **Backlog Completo** | -- | **50 SP** | -- | **400 hrs** | -- | **$18.000.000 COP** | Proyecto Completo Estimado |
