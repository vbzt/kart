---
tags: [kart, módulo, availability, slots, horários]
---

# Availability

## Papel

Horário de funcionamento (BusinessHour), períodos bloqueados (BlockedPeriod) e cálculo de slots disponíveis por data/serviço (considerando capacidade de karts e duração do serviço).

## Localização

`src/modules/availability/`

## Controller

- `GET /availability` – slots disponíveis (query: date, serviceId)
- `GET /availability/business-hours` – listar horários de funcionamento
- `POST /availability/business-hours` – criar
- `PATCH /availability/business-hours` – atualizar
- `GET /availability/blocked-period` – listar períodos bloqueados
- `POST /availability/blocked-period` – criar
- `PATCH /availability/blocked-period/:id` – atualizar

## Arquivos

- `availability.controller.ts`
- `availability.service.ts`
- DTOs: `availability.dto.ts`, `create-business-hour.dto.ts`, `edit-business-hour.dto.ts`, `create-blocked-period.dto.ts`, `edit-blocked-period.dto.ts`, `read-slot.dto.ts`

## Lógica de slots

- Duração do slot: 15 minutos (fixo no serviço).
- Capacidade: total de karts (constante no serviço, ex.: 6).
- Considera reservas com status CONFIRMED e PENDING para ocupar capacidade.
- Usa `date-fns` e timezone local para evitar problemas de UTC.

## Dependências

- [[Prisma]], [[Service]]

## Exporta

- `AvailabilityService` – usado por [[Booking]] (validação de slot em `readSlot`).

## Ver também

- [[Kart - Visão Geral]]
- [[Booking]]
- [[00 - Índice (MOC)]]
