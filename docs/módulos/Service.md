---
tags: [kart, módulo, service, serviços]
---

# Service

## Papel

Serviços agendáveis (ex.: sessão de kart). CRUD restrito a admin. Define preço, duração, capacidade e tipo de preço (INDIVIDUAL/GROUP).

## Localização

`src/modules/service/`

## Controller

- `GET /service` – listar
- `GET /service/:id` – buscar por id
- `POST /service` – criar
- `PATCH /service/:id` – atualizar
- `DELETE /service/:id` – remover

(JWT + AdminGuard.)

## Arquivos

- `service.controller.ts`
- `service.service.ts`
- DTOs: `create-service.dto.ts`, `edit-service.dto.ts`

## Exporta

- `ServiceService` – usado por [[Plans]], [[Availability]], [[Booking]]

## Ver também

- [[Kart - Visão Geral]]
- [[Availability]]
- [[Booking]]
- [[00 - Índice (MOC)]]
