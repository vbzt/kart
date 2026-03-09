---
tags: [kart, módulo, plans, assinatura]
---

# Plans

## Papel

Planos de assinatura e quais serviços cada plano inclui (PlanServiceAccess). CRUD de planos.

## Localização

`src/modules/plans/`

## Controller

- `GET /plans` – listar
- `GET /plans/:id` – buscar por id
- `POST /plans` – criar
- `PATCH /plans/:id` – atualizar
- `DELETE /plans/:id` – remover

(Todos com JWT.)

## Arquivos

- `plans.controller.ts`
- `plans.service.ts`
- DTOs: `create-plan.dto.ts`, `edit-plan.dto.ts`

## Dependências

- [[Prisma]], [[User]]

## Exporta

- `PlansService` – usado por [[Subscription]]

## Ver também

- [[Kart - Visão Geral]]
- [[Subscription]]
- [[00 - Índice (MOC)]]
